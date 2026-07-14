import { PublicInfoPage, PublicInfoSection } from "@/components/public-info-page";

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
    <PublicInfoPage eyebrow="Terms" title="Terms of Service" intro="These terms describe the basic expectations for using My Car Pal.">
      {termsSections.map((section) => (
        <PublicInfoSection key={section.title} title={section.title}>
          <p>{section.body}</p>
        </PublicInfoSection>
      ))}
    </PublicInfoPage>
  );
}
