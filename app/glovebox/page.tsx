import { DocumentCategory } from "@prisma/client";
import {
  deleteGloveboxDocumentAction,
  deleteInsurancePolicyDocumentAction,
  deleteReceiptDocumentAction,
  deleteVehicleRegistrationDocAction,
} from "@/app/glovebox/actions";
import { ActivationStepPrompt } from "@/components/activation-setup";
import { AddGloveboxDocumentForm } from "@/components/add-glovebox-document-form";
import {
  GloveboxRegistrationCarousel,
  type GloveboxRegistrationCarouselItem,
} from "@/components/glovebox-registration-carousel";
import { InsurancePolicyForm } from "@/components/insurance-policy-form";
import { getActivationState } from "@/lib/activation";
import { requireCurrentUser } from "@/lib/auth-session";
import { formatDateOnlyForInput, formatDateOnlyLabel } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@/lib/storage";
import { formatVehicleLabel } from "@/lib/vehicle-display";
import { Button, Card, EmptyState } from "@my-car-pal/ui";
import { PageHeader } from "@/components/ui/page-header";
import {
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
} from "@/components/ui/section-header";

function formatUploadedLabel(date: Date | null): string {
  if (!date) {
    return "Upload date unavailable";
  }
  return `Uploaded ${date.toLocaleDateString()}`;
}

export default async function GloveboxPage() {
  const user = await requireCurrentUser();

  const [rawVehicles, rawDocs, rawReceipts, rawInsurancePolicies, activation] =
    await Promise.all([
      prisma.vehicle.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          registrationExpiresAt: true,
          registrationDocUrl: true,
          registrationDocUploadedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.gloveboxDocument.findMany({
        where: { userId: user.id },
        include: {
          vehicle: {
            select: { year: true, make: true, model: true, trim: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.maintenance.findMany({
        where: { receiptUrl: { not: null }, vehicle: { userId: user.id } },
        include: {
          vehicle: {
            select: { year: true, make: true, model: true, trim: true },
          },
        },
        orderBy: { serviceDate: "desc" },
        take: 80,
      }),
      prisma.insurancePolicy.findMany({
        where: { userId: user.id },
        include: {
          vehicles: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  year: true,
                  make: true,
                  model: true,
                  trim: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      getActivationState(user.id),
    ]);

  const [vehicles, docs, receipts, insurancePolicies] = await Promise.all([
    Promise.all(
      rawVehicles.map(async (v) => ({
        ...v,
        registrationDocUrl: v.registrationDocUrl
          ? await getSignedUrl(v.registrationDocUrl)
          : null,
      })),
    ),
    Promise.all(
      rawDocs.map(async (doc) => ({
        ...doc,
        fileUrl: await getSignedUrl(doc.fileUrl),
      })),
    ),
    Promise.all(
      rawReceipts.map(async (entry) => ({
        ...entry,
        receiptUrl: entry.receiptUrl
          ? await getSignedUrl(entry.receiptUrl)
          : null,
      })),
    ),
    Promise.all(
      rawInsurancePolicies.map(async (policy) => ({
        ...policy,
        documentUrl: policy.documentUrl
          ? await getSignedUrl(policy.documentUrl)
          : null,
      })),
    ),
  ]);

  const vehicleOptions = vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: formatVehicleLabel(vehicle),
  }));

  const serviceManuals = docs.filter(
    (doc) => doc.category === DocumentCategory.SERVICE_MANUAL,
  );
  const warrantyDocs = docs.filter(
    (doc) => doc.category === DocumentCategory.WARRANTY,
  );
  const inspectionDocs = docs.filter(
    (doc) => doc.category === DocumentCategory.INSPECTION_REPORT,
  );
  const purchaseFinanceDocs = docs.filter(
    (doc) => doc.category === DocumentCategory.PURCHASE_FINANCE,
  );
  const miscDocs = docs.filter((doc) => doc.category === DocumentCategory.MISC);
  const archivedRegistrationDocs = docs.filter(
    (doc) => doc.category === DocumentCategory.REGISTRATION_ARCHIVE,
  );
  const registrationVehicles: GloveboxRegistrationCarouselItem[] = vehicles.map(
    (vehicle) => ({
      vehicleId: vehicle.id,
      label: formatVehicleLabel(vehicle),
      registrationExpiresAt: formatDateOnlyForInput(
        vehicle.registrationExpiresAt,
      ),
      registrationDocUrl: vehicle.registrationDocUrl,
      archivedDocs: archivedRegistrationDocs
        .filter((doc) => doc.vehicleId === vehicle.id)
        .map((doc) => ({
          id: doc.id,
          title: doc.title,
          fileUrl: doc.fileUrl,
          createdAtLabel: doc.createdAt.toLocaleDateString(),
        })),
    }),
  );

  const now = Date.now();
  const currentInsurancePolicy =
    [...insurancePolicies].sort((a, b) => {
      const aActive = !a.expiresAt || a.expiresAt.getTime() >= now;
      const bActive = !b.expiresAt || b.expiresAt.getTime() >= now;
      if (aActive !== bActive) {
        return aActive ? -1 : 1;
      }
      const aTime = a.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })[0] ?? null;

  function vehicleLabelOrGeneric(
    vehicle: {
      year: number;
      make: string;
      model: string;
      trim: string | null;
    } | null,
  ) {
    if (!vehicle) {
      return "Not vehicle specific";
    }

    return formatVehicleLabel(vehicle);
  }

  return (
    <>
      <PageHeader
        eyebrow="Document workspace"
        title="Glovebox"
        subtitle="Centralize registration, insurance, manuals, receipts, and other important files in one secure hub."
      />

      <ActivationStepPrompt
        state={activation}
        stepIds={["documents"]}
        badge="Setup"
        title="Make the glovebox useful early"
        body="One registration date or insurance policy is enough to start renewal tracking and keep key paperwork close by."
      />

      <Card as="section" className="section-card">
        <SectionHeader
          title="Highlights"
          subtitle="Quick snapshot for insurance and registration renewal timing."
        />
        <div
          className="glovebox-highlights-grid"
          style={{ marginTop: "0.85rem" }}
        >
          <Card as="article" variant="muted" className="subsection-card">
            <SectionTitle as="h3">Current Insurance</SectionTitle>
            {currentInsurancePolicy ? (
              <SectionSubtitle style={{ marginTop: "0.45rem" }}>
                <strong>
                  {currentInsurancePolicy.providerName?.trim() ||
                    "Provider not set"}
                </strong>
                <br />
                Policy: {currentInsurancePolicy.policyId}
                <br />
                Expiration:{" "}
                {formatDateOnlyLabel(currentInsurancePolicy.expiresAt)}
                <br />
                Vehicles:{" "}
                {currentInsurancePolicy.appliesToAll
                  ? "All vehicles"
                  : currentInsurancePolicy.vehicles.length > 0
                    ? currentInsurancePolicy.vehicles
                        .map((link) => formatVehicleLabel(link.vehicle))
                        .join(", ")
                    : "No vehicles selected"}
              </SectionSubtitle>
            ) : (
              <SectionSubtitle style={{ marginTop: "0.45rem" }}>
                No insurance policy added yet.
              </SectionSubtitle>
            )}
          </Card>

          <Card as="article" variant="muted" className="subsection-card">
            <SectionTitle as="h3">Registration Renewal</SectionTitle>
            {vehicles.length > 0 ? (
              <ul className="list-reset kv" style={{ marginTop: "0.45rem" }}>
                {vehicles.map((vehicle) => (
                  <li key={`highlight-${vehicle.id}`} className="kv-row">
                    <span>{formatVehicleLabel(vehicle)}</span>
                    <small style={{ color: "var(--muted)" }}>
                      {formatDateOnlyLabel(vehicle.registrationExpiresAt)}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionSubtitle style={{ marginTop: "0.45rem" }}>
                No vehicles yet.
              </SectionSubtitle>
            )}
          </Card>
        </div>
      </Card>

      <Card as="section" className="section-card" id="setup-docs">
        <details className="collapsible-panel">
          <summary className="collapsible-summary">
            <SectionTitle as="span" className="collapsible-title">
              Registration
            </SectionTitle>
            <SectionSubtitle as="span">Tap to expand</SectionSubtitle>
          </summary>
          {vehicles.length === 0 ? (
            <EmptyState
              title="Add a vehicle before documents"
              description="Registration and insurance details attach best once your first vehicle is already in the Garage."
              style={{ marginTop: "1rem" }}
            />
          ) : (
            <GloveboxRegistrationCarousel vehicles={registrationVehicles} />
          )}
        </details>
      </Card>

      <Card as="section" className="section-card">
        <details className="collapsible-panel">
          <summary className="collapsible-summary">
            <SectionTitle as="span" className="collapsible-title">
              Insurance
            </SectionTitle>
            <SectionSubtitle as="span">Tap to expand</SectionSubtitle>
          </summary>
          <SectionSubtitle style={{ marginTop: "0.75rem" }}>
            Add one or more insurance policies and choose whether each applies
            to all vehicles or one vehicle.
          </SectionSubtitle>
          {vehicles.length > 0 && insurancePolicies.length === 0 ? (
            <EmptyState
              title="Start with one active policy"
              description="You do not need to organize everything today. One current policy is enough to start renewal reminders."
              style={{ marginTop: "0.9rem" }}
            />
          ) : null}
          <div style={{ marginTop: "0.9rem" }}>
            <InsurancePolicyForm vehicles={vehicleOptions} />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <SectionTitle as="h3">Saved Policies</SectionTitle>
            {insurancePolicies.length === 0 ? (
              <SectionSubtitle>
                No insurance policies added yet.
              </SectionSubtitle>
            ) : (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {insurancePolicies.map((policy) => (
                  <li key={policy.id} className="kv-row uploaded-doc-row">
                    <span>
                      <strong>
                        {policy.providerName?.trim() || "Provider not set"}
                      </strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        Policy ID: {policy.policyId}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        Expires {formatDateOnlyLabel(policy.expiresAt)}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        Applies to:{" "}
                        {policy.appliesToAll
                          ? "All vehicles"
                          : policy.vehicles.length > 0
                            ? policy.vehicles
                                .map((link) => formatVehicleLabel(link.vehicle))
                                .join(", ")
                            : "No vehicles selected"}
                      </small>
                    </span>
                    {policy.documentUrl ? (
                      <a
                        href={policy.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>No doc</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      </Card>

      <Card as="section" className="section-card">
        <SectionHeader title="All Uploaded Documents" />
        <details className="collapsible-panel" style={{ marginTop: "0.75rem" }}>
          <summary className="collapsible-summary">
            <SectionTitle as="span" className="collapsible-title">
              Add Glovebox Document
            </SectionTitle>
            <SectionSubtitle as="span">Tap to expand</SectionSubtitle>
          </summary>
          <SectionSubtitle style={{ marginTop: "0.75rem" }}>
            Service manuals, warranty docs, inspections, purchase docs, and misc
            files.
          </SectionSubtitle>
          <div style={{ marginTop: "0.8rem" }}>
            <AddGloveboxDocumentForm vehicles={vehicleOptions} />
          </div>
        </details>

        <div className="glovebox-grid">
          <div>
            <SectionTitle as="h3">Registration</SectionTitle>
            {vehicles.some((vehicle) => vehicle.registrationDocUrl) ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {vehicles
                  .filter((vehicle) => vehicle.registrationDocUrl)
                  .map((vehicle) => (
                    <li
                      key={`${vehicle.id}-registration`}
                      className="kv-row uploaded-doc-row"
                    >
                      <span>
                        {formatVehicleLabel(vehicle)}
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          {formatUploadedLabel(
                            vehicle.registrationDocUploadedAt,
                          )}
                        </small>
                      </span>
                      <span className="inline-links">
                        <a
                          href={vehicle.registrationDocUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                        <form action={deleteVehicleRegistrationDocAction}>
                          <input
                            type="hidden"
                            name="vehicleId"
                            value={vehicle.id}
                          />
                          <Button variant="danger" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <SectionSubtitle>
                No registration docs uploaded yet.
              </SectionSubtitle>
            )}
          </div>

          <div>
            <SectionTitle as="h3">Insurance</SectionTitle>
            {insurancePolicies.some((policy) => policy.documentUrl) ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {insurancePolicies
                  .filter((policy) => policy.documentUrl)
                  .map((policy) => (
                    <li key={policy.id} className="kv-row uploaded-doc-row">
                      <span>
                        <strong>
                          {policy.providerName?.trim() || "Provider not set"}
                        </strong>
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          Policy {policy.policyId}
                        </small>
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          {policy.appliesToAll
                            ? "All vehicles"
                            : policy.vehicles.length > 0
                              ? policy.vehicles
                                  .map((link) =>
                                    formatVehicleLabel(link.vehicle),
                                  )
                                  .join(", ")
                              : "No vehicles selected"}
                        </small>
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          {formatUploadedLabel(policy.createdAt)}
                        </small>
                      </span>
                      <span className="inline-links">
                        <a
                          href={policy.documentUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                        <form action={deleteInsurancePolicyDocumentAction}>
                          <input
                            type="hidden"
                            name="policyId"
                            value={policy.id}
                          />
                          <Button variant="danger" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <SectionSubtitle>No insurance docs uploaded yet.</SectionSubtitle>
            )}
          </div>

          <div>
            <SectionTitle as="h3">Service Manuals</SectionTitle>
            {serviceManuals.length > 0 ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {serviceManuals.map((doc) => (
                  <li key={doc.id} className="kv-row uploaded-doc-row">
                    <span>
                      <strong>{doc.title}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {vehicleLabelOrGeneric(doc.vehicle)}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {formatUploadedLabel(doc.createdAt)}
                      </small>
                    </span>
                    <span className="inline-links">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                      <form action={deleteGloveboxDocumentAction}>
                        <input type="hidden" name="documentId" value={doc.id} />
                        <Button variant="danger" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionSubtitle>
                No service manuals uploaded yet.
              </SectionSubtitle>
            )}
          </div>

          <div>
            <SectionTitle as="h3">Warranty & Coverage</SectionTitle>
            {warrantyDocs.length > 0 ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {warrantyDocs.map((doc) => (
                  <li key={doc.id} className="kv-row uploaded-doc-row">
                    <span>
                      <strong>{doc.title}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {vehicleLabelOrGeneric(doc.vehicle)}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {formatUploadedLabel(doc.createdAt)}
                      </small>
                    </span>
                    <span className="inline-links">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                      <form action={deleteGloveboxDocumentAction}>
                        <input type="hidden" name="documentId" value={doc.id} />
                        <Button variant="danger" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionSubtitle>No warranty docs uploaded yet.</SectionSubtitle>
            )}
          </div>

          <div>
            <SectionTitle as="h3">Inspection & Emissions</SectionTitle>
            {inspectionDocs.length > 0 ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {inspectionDocs.map((doc) => (
                  <li key={doc.id} className="kv-row uploaded-doc-row">
                    <span>
                      <strong>{doc.title}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {vehicleLabelOrGeneric(doc.vehicle)}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {formatUploadedLabel(doc.createdAt)}
                      </small>
                    </span>
                    <span className="inline-links">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                      <form action={deleteGloveboxDocumentAction}>
                        <input type="hidden" name="documentId" value={doc.id} />
                        <Button variant="danger" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionSubtitle>
                No inspection docs uploaded yet.
              </SectionSubtitle>
            )}
          </div>

          <div>
            <SectionTitle as="h3">Purchase & Finance</SectionTitle>
            {purchaseFinanceDocs.length > 0 ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {purchaseFinanceDocs.map((doc) => (
                  <li key={doc.id} className="kv-row uploaded-doc-row">
                    <span>
                      <strong>{doc.title}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {vehicleLabelOrGeneric(doc.vehicle)}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {formatUploadedLabel(doc.createdAt)}
                      </small>
                    </span>
                    <span className="inline-links">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                      <form action={deleteGloveboxDocumentAction}>
                        <input type="hidden" name="documentId" value={doc.id} />
                        <Button variant="danger" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionSubtitle>
                No purchase/finance docs uploaded yet.
              </SectionSubtitle>
            )}
          </div>

          <div>
            <SectionTitle as="h3">Miscellaneous</SectionTitle>
            {miscDocs.length > 0 ? (
              <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
                {miscDocs.map((doc) => (
                  <li key={doc.id} className="kv-row uploaded-doc-row">
                    <span>
                      <strong>{doc.title}</strong>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {vehicleLabelOrGeneric(doc.vehicle)}
                      </small>
                      <br />
                      <small style={{ color: "var(--muted)" }}>
                        {formatUploadedLabel(doc.createdAt)}
                      </small>
                    </span>
                    <span className="inline-links">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                      <form action={deleteGloveboxDocumentAction}>
                        <input type="hidden" name="documentId" value={doc.id} />
                        <Button variant="danger" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionSubtitle>No misc documents uploaded yet.</SectionSubtitle>
            )}
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <SectionTitle as="h3">Service Receipts</SectionTitle>
          {receipts.length > 0 ? (
            <ul className="list-reset kv" style={{ marginTop: "0.7rem" }}>
              {receipts.map((entry) => (
                <li key={entry.id} className="kv-row uploaded-doc-row">
                  <span>
                    <strong>{entry.title}</strong>
                    <br />
                    <small style={{ color: "var(--muted)" }}>
                      {formatVehicleLabel(entry.vehicle)} •{" "}
                      {formatDateOnlyLabel(entry.serviceDate)}
                    </small>
                    <br />
                    <small style={{ color: "var(--muted)" }}>
                      {formatUploadedLabel(entry.createdAt)}
                    </small>
                  </span>
                  <span className="inline-links">
                    <a
                      href={entry.receiptUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                    <form action={deleteReceiptDocumentAction}>
                      <input
                        type="hidden"
                        name="maintenanceId"
                        value={entry.id}
                      />
                      <Button variant="danger" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <SectionSubtitle>No service receipts uploaded yet.</SectionSubtitle>
          )}
        </div>
      </Card>
    </>
  );
}
