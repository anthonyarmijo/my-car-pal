"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DiyArticle, DiyCategory } from "@/lib/diy-content";

type DiyArticleBrowserProps = {
  articles: DiyArticle[];
};

const ALL_FILTER = "All";
const MOST_POPULAR_FILTER = "Most popular";

export function DiyArticleBrowser({ articles }: DiyArticleBrowserProps) {
  const categories = useMemo(() => {
    return Array.from(new Set(articles.map((article) => article.category)));
  }, [articles]);
  const [selectedCategory, setSelectedCategory] = useState<typeof ALL_FILTER | typeof MOST_POPULAR_FILTER | DiyCategory>(ALL_FILTER);

  const filtered = useMemo(() => {
    if (selectedCategory === ALL_FILTER) {
      return articles;
    }
    if (selectedCategory === MOST_POPULAR_FILTER) {
      return articles.filter((article) => article.popular);
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  const grouped = useMemo(() => {
    const groupedMap = new Map<DiyCategory, DiyArticle[]>();
    for (const article of filtered) {
      const current = groupedMap.get(article.category) ?? [];
      current.push(article);
      groupedMap.set(article.category, current);
    }
    return groupedMap;
  }, [filtered]);

  return (
    <div className="form-stack" style={{ marginTop: "0.85rem" }}>
      <div className="diy-filter-row">
        <button
          type="button"
          className={`button-chip ${selectedCategory === ALL_FILTER ? "button-chip-strong" : ""}`}
          onClick={() => setSelectedCategory(ALL_FILTER)}
        >
          All categories
        </button>
        <button
          type="button"
          className={`button-chip ${selectedCategory === MOST_POPULAR_FILTER ? "button-chip-strong" : ""}`}
          onClick={() => setSelectedCategory(MOST_POPULAR_FILTER)}
        >
          Most popular
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`button-chip ${selectedCategory === category ? "button-chip-strong" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {Array.from(grouped.entries()).map(([category, categoryArticles]) => (
        <section key={category} className="diy-category-block">
          <h3 className="section-title diy-category-title">{category}</h3>
          <div className="diy-article-grid">
            {categoryArticles.map((article) => (
              <article key={article.slug} className="diy-article-card">
                <h4 className="section-title">
                  <Link href={`/diy/${article.slug}`}>{article.title}</Link>
                </h4>
                <p className="section-subtitle">{article.summary}</p>
                <ul className="list-reset diy-meta-list">
                  <li>
                    <strong>Read:</strong> {article.readTime}
                  </li>
                  <li>
                    <strong>Difficulty:</strong> {article.difficulty}
                  </li>
                  <li>
                    <strong>DIY service time:</strong> {article.serviceTime}
                  </li>
                </ul>
                <Link className="button-chip button-chip-strong" href={`/diy/${article.slug}`}>
                  Open guide
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
