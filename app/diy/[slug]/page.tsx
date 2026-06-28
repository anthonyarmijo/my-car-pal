import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth-session";
import { DIY_ARTICLES, getDiyArticle } from "@/lib/diy-content";

type DiyArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return DIY_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function DiyArticlePage({ params }: DiyArticlePageProps) {
  await requireCurrentUser();
  const { slug } = await params;
  const article = getDiyArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <section className="page-header-block">
        <p className="badge">DIY Guide</p>
        <h1 className="page-title">{article.title}</h1>
        <p className="page-subtitle">{article.summary}</p>
        <p className="section-subtitle" style={{ marginTop: "0.55rem" }}>
          Category: <strong>{article.category}</strong>
        </p>
      </section>

      <section className="section-card diy-guide-meta-card">
        <h2 className="section-title diy-section-title">Guide Details</h2>
        <ul className="list-reset diy-meta-list">
          <li>
            <strong>Estimated read time:</strong> {article.readTime}
          </li>
          <li>
            <strong>Difficulty:</strong> {article.difficulty}
          </li>
          <li>
            <strong>Estimated DIY service time:</strong> {article.serviceTime}
          </li>
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title diy-section-title">Tools Required</h2>
        <ul className="list-reset diy-check-list">
          {article.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </section>

      <section className="section-card">
        <h2 className="section-title diy-section-title">Step-by-Step</h2>
        <ol className="diy-step-list">
          {article.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="section-card">
        <h2 className="section-title diy-section-title">More Resources</h2>
        <p className="section-subtitle">Read more from trusted how-to references and safety sources.</p>
        <ul className="list-reset diy-resource-list">
          {article.resources.map((resource) => (
            <li key={resource.href}>
              <a href={resource.href} target="_blank" rel="noreferrer">
                {resource.label}
              </a>
            </li>
          ))}
        </ul>
        <Link className="button-chip button-chip-strong" href="/diy">
          Back to DIY hub
        </Link>
      </section>
    </>
  );
}
