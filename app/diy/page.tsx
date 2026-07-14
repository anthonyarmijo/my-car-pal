import { requireCurrentUser } from "@/lib/auth-session";
import { DIY_ARTICLES, DIY_SAFETY_TIPS, DIY_TOOLS } from "@/lib/diy-content";
import { DiyArticleBrowser } from "@/components/diy-article-browser";
import { DiyComingSoon } from "@/components/diy-coming-soon";
import { PageHeader } from "@/components/ui/page-header";
import { isDiyFeatureEnabled } from "@/lib/feature-flags";

export default async function DiyPage() {
  await requireCurrentUser();
  const diyEnabled = isDiyFeatureEnabled();

  if (!diyEnabled) {
    return (
      <>
        <PageHeader
          eyebrow="Learning workspace"
          title="DIY"
          subtitle="A safety-first learning center for practical vehicle care."
          actions={<span className="page-header-meta">Coming soon</span>}
        />
        <DiyComingSoon />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Learning workspace"
        title="DIY"
        subtitle="Learn practical, beginner-friendly auto maintenance with clear guides so you can save money, build confidence, and care for your vehicle on your schedule."
      />

      <section className="section-card diy-hero-card">
        <p className="badge">Learn + Save</p>
        <h2 className="section-title diy-section-title">Why DIY maintenance?</h2>
        <ul className="list-reset diy-benefits-list">
          <li>Lower service costs on common maintenance tasks.</li>
          <li>Better understanding of your vehicle condition.</li>
          <li>More confidence when discussing repairs with a shop.</li>
          <li>Cleaner maintenance history with your own documented work.</li>
        </ul>
      </section>

      <section className="section-card">
        <div className="diy-top-panels">
          <section className="subsection-card diy-compact-card">
            <h2 className="section-title diy-section-title">Safety First</h2>
            <p className="section-subtitle diy-compact-subtitle">Key habits for safer DIY work.</p>
            <ul className="list-reset diy-check-list diy-mini-list">
              {DIY_SAFETY_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="subsection-card diy-compact-card">
            <h2 className="section-title diy-section-title">Common DIY Tools</h2>
            <p className="section-subtitle diy-compact-subtitle">Starter kit for most jobs.</p>
            <ul className="list-reset diy-check-list diy-mini-list">
              {DIY_TOOLS.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title diy-section-title">How-To Articles</h2>
        <p className="section-subtitle">Pick a guide, filter by category, and learn at your pace.</p>
        <DiyArticleBrowser articles={DIY_ARTICLES} />
      </section>

      <section className="section-card">
        <h2 className="section-title diy-section-title">Helpful Learning Resources</h2>
        <p className="section-subtitle">Explore popular references for step-by-step visuals and deeper reading.</p>
        <ul className="list-reset diy-resource-list">
          <li>
            <a href="https://www.wikihow.com/Category:Car-Maintenance-and-Repair" target="_blank" rel="noreferrer">
              wikiHow: Car Maintenance and Repair
            </a>
          </li>
          <li>
            <a href="https://www.popularmechanics.com/cars/how-to/" target="_blank" rel="noreferrer">
              Popular Mechanics: How-To Guides
            </a>
          </li>
          <li>
            <a href="https://www.nhtsa.gov/road-safety/vehicle-safety" target="_blank" rel="noreferrer">
              NHTSA: Vehicle Safety Resources
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
