import { requireCurrentUser } from "@/lib/auth-session";
import { ContactMessageForm } from "@/components/contact-message-form";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, Card } from "@my-car-pal/ui";

export default async function ContactPage() {
  await requireCurrentUser();

  return (
    <div className="focused-page-layout">
      <PageHeader
        eyebrow="Support and feedback"
        title="Talk with the My Car Pal team"
        subtitle="Questions, feature requests, and bug reports are welcome as we continue shaping the product."
      />

      <Card as="section" className="section-card contact-page-section">
        <Badge>Contact us</Badge>
        <h2 className="section-title">Send a message</h2>
        <div className="contact-page-grid">
          <Card className="subsection-card contact-form-card">
            <ContactMessageForm />
          </Card>
          <div className="contact-email-block">
            <p className="contact-email-note">Prefer email?</p>
            <ul className="list-reset contact-email-list">
              <li>
                <strong>Support</strong>
                <a href="mailto:support@mycarpal.app">support@mycarpal.app</a>
              </li>
              <li>
                <strong>Product feedback</strong>
                <a href="mailto:product@mycarpal.app">product@mycarpal.app</a>
              </li>
              <li>
                <strong>Response time</strong>
                <span>Typically 1-2 business days</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
