import BodyContent from "@/components/pages/blogDetailPages";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Img from "@/utils/BackgroundImageRatio";
import { Fragment } from "react";
import BlogDetailSeoJsonLd from "@/components/pages/blogDetailPages/BlogDetailSeoJsonLd";
import { fetchNewsItemById, getSiteUrl, toAbsoluteUrl } from "@/utils/newsSeo";

const SITE_NAME = "Sheltos - Real Estate Next 15";

function getCanonicalUrl({ siteUrl, id }) {
  const basePath = "/pages/blog-detail-pages/no-sidebar";
  return id ? `${siteUrl}${basePath}?id=${encodeURIComponent(id)}` : `${siteUrl}${basePath}`;
}

export async function generateMetadata({ searchParams }) {
  const siteUrl = getSiteUrl();
  const id = (await searchParams)?.id;
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

const NoSidebar = async ({ searchParams }) => {
  const id = (await searchParams)?.id;
  const siteUrl = getSiteUrl();
  const canonicalUrl = getCanonicalUrl({ siteUrl, id });
  const news = await fetchNewsItemById(id);

  return (
    <Fragment>
      <NavbarThree />
      <Breadcrumb />
      <BodyContent side={false} id={id} initialNews={news}>
        <div className="blog-detail-image">
          <Img src="/assets/images/parallax/4.jpg" className="bg-img img-fluid" alt="" />
        </div>
      </BodyContent>
      <BlogDetailSeoJsonLd news={news} canonicalUrl={canonicalUrl} siteUrl={siteUrl} />
      <FooterThree />
    </Fragment>
  );
};
export default NoSidebar;
