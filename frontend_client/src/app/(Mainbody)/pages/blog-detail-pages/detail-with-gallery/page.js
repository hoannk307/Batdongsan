import { Fragment } from "react";
import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import BlogDetailSeoJsonLd from "@/components/pages/blogDetailPages/BlogDetailSeoJsonLd";
import DetailWithGalleryClient from "@/components/pages/blogDetailPages/DetailWithGalleryClient";
import { fetchNewsItemById, getSiteUrl, toAbsoluteUrl } from "@/utils/newsSeo";

const SITE_NAME = "Sheltos - Real Estate Next 15";

function getCanonicalUrl({ siteUrl, id }) {
  const basePath = "/pages/blog-detail-pages/detail-with-gallery";
  return id ? `${siteUrl}${basePath}?id=${encodeURIComponent(id)}` : `${siteUrl}${basePath}`;
}

export async function generateMetadata({ searchParams }) {
  const siteUrl = getSiteUrl();
  const id = searchParams?.id;
  const news = await fetchNewsItemById(id);
  const canonicalUrl = getCanonicalUrl({ siteUrl, id });

  const title = news?.title ? `${news.title} | Sheltos` : `Blog - ${SITE_NAME}`;
  const description = news?.summary || news?.detail || "";
  const keywords = Array.isArray(news?.tags) ? news.tags.join(", ") : undefined;
  const imageUrl = toAbsoluteUrl(news?.img, siteUrl);

  return {
    title,
    description,
    keywords,
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

const DetailWithGallery = async ({ searchParams }) => {
  const id = searchParams?.id;
  const siteUrl = getSiteUrl();
  const canonicalUrl = getCanonicalUrl({ siteUrl, id });
  const news = await fetchNewsItemById(id);

  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <BodyContent side={"left"} id={id} initialNews={news}>
        <DetailWithGalleryClient />
      </BodyContent>
      <BlogDetailSeoJsonLd news={news} canonicalUrl={canonicalUrl} siteUrl={siteUrl} />
      <FooterThree />
    </Fragment>
  );
};

export default DetailWithGallery;
