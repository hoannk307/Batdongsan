import React from "react";
import { SITE_URL } from "@/config/env";

// Server-friendly JSON-LD component.
const BlogDetailSeoJsonLd = ({ news, canonicalUrl, siteUrl }) => {
  if (!news) return null;

  const site = siteUrl || SITE_URL;
  const absoluteImg = news?.img ? news.img : undefined;
  const imgUrl =
    absoluteImg && (absoluteImg.startsWith("http://") || absoluteImg.startsWith("https://"))
      ? absoluteImg
      : absoluteImg
        ? `${site}${absoluteImg.startsWith("/") ? "" : "/"}${absoluteImg}`
        : undefined;

  const tags = Array.isArray(news?.tags) ? news.tags : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news?.title || "Untitled",
    description: news?.summary || news?.detail || "",
    datePublished: news?.publishedAt || undefined,
    dateModified: news?.publishedAt || undefined,
    author: news?.author
      ? {
          "@type": "Person",
          name: news.author,
        }
      : undefined,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    image: imgUrl ? [imgUrl] : undefined,
    mainEntityOfPage: canonicalUrl ? { "@type": "WebPage", "@id": canonicalUrl } : undefined,
    url: canonicalUrl || undefined,
  };

  return (
    <script
      type='application/ld+json'
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default BlogDetailSeoJsonLd;

