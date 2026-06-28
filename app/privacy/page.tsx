import { Badge, Card } from "@my-car-pal/ui";

const privacySections = [
  {
    title: "What we collect",
    body:
      "We collect the account, vehicle, maintenance, reminder, and document information you add so My Car Pal can provide the features you expect.",
  },
  {
    title: "How we use it",
    body:
      "We use your data to power your garage, maintenance tracking, reminders, document access, and account management. We do not use it for dealership lead generation or ad targeting.",
  },
  {
    title: "Uploads and ownership",
    body:
      "Uploaded documents and profile assets are treated as user-owned data. Access is checked against the signed-in account before private files are served.",
  },
  {
    title: "Data selling",
    body:
      "My Car Pal does not position itself as a data-selling product. The product goal is owner-first record keeping and reminders, not monetizing personal automotive data.",
  },
  {
    title: "Contact",
    body:
      "Questions about privacy can be sent through the in-app contact flow or by email using the contact information listed on the Contact page.",
  },
];

export default function PrivacyPage() {
  return (
    <Card as="section" className="section-card" style={{ maxWidth: "54rem" }}>
      <Badge>Privacy</Badge>
      <h1 className="section-title" style={{ marginTop: "0.6rem" }}>
        Privacy Policy
      </h1>
      <p className="section-subtitle" style={{ marginTop: "0.65rem" }}>
        My Car Pal is built to help owners organize maintenance records, reminders, and documents with a privacy-forward posture.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
        {privacySections.map((section) => (
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
