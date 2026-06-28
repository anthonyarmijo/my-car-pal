import { requireCurrentUser } from "@/lib/auth-session";
import { ContactMessageForm } from "@/components/contact-message-form";
import { Badge, Card } from "@my-car-pal/ui";

export default async function ContactPage() {
  await requireCurrentUser();

  return (
    <Card as="section" className="section-card contact-page-section" style={{ maxWidth: "46rem" }}>
      <Badge>Contact Us</Badge>
      <h2 className="section-title">We would love your feedback</h2>
      <p className="section-subtitle">
        Questions, feature requests, and bug reports are all welcome as we continue shaping My Car Pal.
      </p>
      <Card className="subsection-card" style={{ marginTop: "1rem" }}>
        <h3 className="section-title">Send a message to our team</h3>
        <div style={{ marginTop: "0.8rem" }}>
          <ContactMessageForm />
        </div>
      </Card>
      <div className="contact-email-block">
        <p className="contact-email-note">Or you can reach us via email:</p>
        <ul className="list-reset contact-email-list">
          <li>
            Support: <a href="mailto:support@mycarpal.app">support@mycarpal.app</a>
          </li>
          <li>
            Product feedback: <a href="mailto:product@mycarpal.app">product@mycarpal.app</a>
          </li>
          <li>Typical response time: 1-2 business days</li>
        </ul>
      </div>
    </Card>
  );
}
