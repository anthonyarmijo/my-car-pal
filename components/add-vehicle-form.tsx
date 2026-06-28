"use client";

import Link from "next/link";
import type { Route } from "next";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addVehicleAction } from "@/app/garage/actions";
import { initialAddVehicleFormState } from "@/app/garage/state";
import { IMAGE_FILE_ACCEPT } from "@/lib/upload-constants";
import { COMMON_MAKES_BY_KIND, VEHICLE_CATALOGS } from "@/lib/vehicle-catalog";
import { VEHICLE_KIND_LABELS, VehicleKindValue } from "@/lib/vehicle-kind";
import { toVehicleTitleCase } from "@/lib/vehicle-display";
import { Button, Card, FormMessage, getButtonClassName } from "@my-car-pal/ui";
import { Field, FieldGrid, Fieldset, FormStack } from "@/components/ui/field";

type DecodeStatus = {
  status: "idle" | "loading" | "error" | "success";
  message: string;
};

type DecodedVinPreview = {
  vin: string;
  kind: VehicleKindValue;
  year: number;
  make: string;
  model: string;
  drivetrain: string | null;
  trimOptions: string[];
  preferredTrim: string | null;
};

type AddVehicleFormProps = {
  allowsMotorcycles: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add vehicle"}
    </Button>
  );
}

export function AddVehicleForm({ allowsMotorcycles }: AddVehicleFormProps) {
  const [state, formAction] = useActionState(addVehicleAction, initialAddVehicleFormState);
  const [selectedKind, setSelectedKind] = useState<VehicleKindValue>("CAR");
  const [vin, setVin] = useState("");
  const [decodeStatus, setDecodeStatus] = useState<DecodeStatus>({ status: "idle", message: "" });
  const [decodedVin, setDecodedVin] = useState<DecodedVinPreview | null>(null);
  const [selectedTrim, setSelectedTrim] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const vinProvided = vin.trim().length > 0;
  const models = useMemo(
    () => (selectedMake ? VEHICLE_CATALOGS[selectedKind][selectedMake] ?? [] : []),
    [selectedKind, selectedMake],
  );

  useEffect(() => {
    if (!selectedMake) {
      setSelectedModel("");
      return;
    }

    if (selectedModel && !models.includes(selectedModel)) {
      setSelectedModel("");
    }
  }, [models, selectedMake, selectedModel]);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setSelectedKind("CAR");
      setVin("");
      setDecodeStatus({ status: "idle", message: "" });
      setDecodedVin(null);
      setSelectedTrim("");
      setSelectedMake("");
      setSelectedModel("");
      setImageFileName("");
    }
  }, [state.status]);

  useEffect(() => {
    setSelectedMake("");
    setSelectedModel("");
  }, [selectedKind]);

  async function decodeVin() {
    const normalized = vin.trim().toUpperCase();
    if (!normalized) {
      setDecodeStatus({ status: "error", message: "Enter a VIN to decode." });
      return;
    }

    setDecodeStatus({ status: "loading", message: "Decoding VIN..." });

    try {
      const response = await fetch("/api/vin/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: normalized }),
      });

      const payload = (await response.json()) as
        | { message: string }
        | DecodedVinPreview;

      if (!response.ok || !("vin" in payload)) {
        setDecodedVin(null);
        setDecodeStatus({
          status: "error",
          message: "message" in payload ? payload.message : "VIN decode failed.",
        });
        return;
      }

      setDecodedVin(payload);
      setSelectedKind(payload.kind === "MOTORCYCLE" && !allowsMotorcycles ? "CAR" : payload.kind);
      setSelectedTrim(payload.preferredTrim ?? "");
      setDecodeStatus({
        status: "success",
        message: `VIN decoded: ${VEHICLE_KIND_LABELS[payload.kind]} • ${payload.year} ${toVehicleTitleCase(payload.make)} ${toVehicleTitleCase(payload.model)}`,
      });
    } catch {
      setDecodedVin(null);
      setDecodeStatus({
        status: "error",
        message: "Could not reach VIN service. You can still add manually below.",
      });
    }
  }

  return (
    <FormStack ref={formRef} action={formAction}>
      <Fieldset>
        <Card as="section" variant="muted" className="subsection-card">
          <FieldGrid columns={2}>
            <Field>
              <span>Vehicle type</span>
              <select
                name="kind"
                value={selectedKind}
                onChange={(event) => setSelectedKind(event.target.value === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR")}
              >
                <option value="CAR">Car or truck</option>
                <option value="MOTORCYCLE" disabled={!allowsMotorcycles}>
                  Motorcycle or scooter
                </option>
              </select>
            </Field>

            <Field as="div">
              <span>Access</span>
              <p className="section-subtitle" style={{ marginTop: "0.35rem" }}>
                {allowsMotorcycles
                  ? "Cars, motorcycles, and scooters are enabled in this install."
                  : "This install is currently configured for cars and trucks."}
              </p>
            </Field>
          </FieldGrid>
        </Card>

        <Card as="section" variant="muted" className="subsection-card">
          <p className="section-subtitle" style={{ marginTop: 0 }}>
            Recommended: add by VIN for the most accurate vehicle details when a 17-character VIN is available.
          </p>
          <FieldGrid columns={2} style={{ marginTop: "0.6rem" }}>
            <Field>
              <span>VIN (recommended)</span>
              <input
                name="vin"
                type="text"
                maxLength={17}
                value={vin}
                onChange={(event) => {
                  setVin(event.target.value.toUpperCase());
                  setDecodeStatus({ status: "idle", message: "" });
                  setDecodedVin(null);
                  setSelectedTrim("");
                }}
                placeholder="1HGCM82633A123456"
                style={{ textTransform: "uppercase" }}
              />
            </Field>

            <Field as="div">
              <span>VIN lookup</span>
              <Button
                variant="secondary"
                type="button"
                onClick={decodeVin}
                disabled={decodeStatus.status === "loading"}
              >
                {decodeStatus.status === "loading" ? "Decoding..." : "Decode VIN"}
              </Button>
            </Field>
          </FieldGrid>

          {decodeStatus.message ? (
            <FormMessage tone={decodeStatus.status === "error" ? "error" : "success"}>
              {decodeStatus.message}
            </FormMessage>
          ) : null}

          {decodedVin ? (
            <div className="vin-decode-preview">
              <p className="section-subtitle" style={{ marginTop: 0 }}>
                Auto-detected: <strong>{VEHICLE_KIND_LABELS[decodedVin.kind]}</strong> • <strong>{decodedVin.year}</strong>{" "}
                <strong>{toVehicleTitleCase(decodedVin.make)}</strong> <strong>{toVehicleTitleCase(decodedVin.model)}</strong>
              </p>
            </div>
          ) : null}

          <Field>
            <span>Trim (optional)</span>
            {decodedVin && decodedVin.trimOptions.length > 0 ? (
              <select name="trim" value={selectedTrim} onChange={(event) => setSelectedTrim(event.target.value)}>
                <option value="">--Trim--</option>
                {decodedVin.trimOptions.map((trim) => (
                  <option key={trim} value={trim}>
                    {trim}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="trim"
                type="text"
                value={selectedTrim}
                onChange={(event) => setSelectedTrim(event.target.value)}
                placeholder="XLE, Touring, Limited..."
              />
            )}
          </Field>
        </Card>

        <Card as="section" variant="muted" className="subsection-card">
          <details className="manual-toggle">
            <summary className="manual-toggle-summary">
              <span className="section-title">Add Vehicle Manually</span>
              <span className="help-bubble" data-tip="Use this if there are issues with VIN lookup.">
                ?
              </span>
            </summary>
            <FieldGrid style={{ marginTop: "0.6rem" }}>
              <Field>
                <span>Year</span>
                <input name="year" type="number" min="1900" max="2100" required={!vinProvided} />
              </Field>

              <Field>
                <span>Make</span>
                <select
                  name="make"
                  required={!vinProvided}
                  value={selectedMake}
                  onChange={(event) => {
                    const make = event.target.value;
                    setSelectedMake(make);
                    setSelectedModel("");
                  }}
                >
                  <option value="">--Make--</option>
                  {COMMON_MAKES_BY_KIND[selectedKind].map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <span>Model</span>
                <select
                  name="model"
                  required={!vinProvided}
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  disabled={!selectedMake}
                >
                  <option value="">--Model--</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldGrid>
          </details>
        </Card>

        <Field>
          <span>Vehicle image (optional)</span>
          <input
            name="image"
            type="file"
            accept={IMAGE_FILE_ACCEPT}
            onChange={(event) => setImageFileName(event.target.files?.[0]?.name ?? "")}
          />
          {imageFileName ? (
            <span className="upload-check">
              <svg suppressHydrationWarning viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9.55 17.05 4.8 12.3l1.4-1.4 3.35 3.34 8.25-8.24 1.4 1.4z" />
              </svg>
              {imageFileName}
            </span>
          ) : null}
        </Field>

        <SubmitButton />
      </Fieldset>

      {state.message ? (
        <FormMessage as="div" tone={state.status === "error" ? "error" : "success"}>
          <p style={{ margin: 0 }}>{state.message}</p>
          {state.status === "success" && state.nextAction ? (
            <div className="activation-form-followup">
              <span>{state.nextAction.description}</span>
              <Link href={state.nextAction.href as Route} className={getButtonClassName({ variant: "secondary" })}>
                {state.nextAction.label}
              </Link>
            </div>
          ) : null}
        </FormMessage>
      ) : null}
    </FormStack>
  );
}
