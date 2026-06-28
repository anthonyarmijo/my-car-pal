import { Badge, Card } from "@my-car-pal/ui";

const termsSections = [
  {
    title: "Service scope",
    body:
      "My Car Pal helps you organize vehicle records, reminders, and related documents. It is an informational record-keeping product, not a mechanic, insurer, or legal advisor.",
  },
  {
    title: "Account responsibility",
    body:
      "You are responsible for the accuracy of the information you enter, for protecting your login credentials, and for deciding how you use reminders and maintenance guidance.",
  },
  {
    title: "Uploads and content",
    body:
      "You retain responsibility for the files and content you upload. Do not upload material you do not have permission to store or share.",
  },
  {
    title: "Availability",
    body:
      "Features, limits, and availability may vary by deployment. Paid billing is not part of the public self-hosted core.",
  },
  {
    title: "Contact",
    body:
      "Questions about these terms can be sent through the Contact page.",
  },
];

export default function TermsPage() {
  return (
    <Card as="section" className="section-card" style={{ maxWidth: "54rem" }}>
      <Badge>Terms</Badge>
      <h1 className="section-title" style={{ marginTop: "0.6rem" }}>
        Terms of Service
      </h1>
      <p className="section-subtitle" style={{ marginTop: "0.65rem" }}>
        These terms describe the basic expectations for using My Car Pal.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
        {termsSections.map((section) => (
          <Card as="article" key={section.title} className="section-card" style={{ boxShadow: "none" }}>
            <h2 className="section-title">{section.title}</h2>
            <p className="section-subtitle" style={{ marginTop: "0.55rem" }}>
              {section.body}
            </p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
