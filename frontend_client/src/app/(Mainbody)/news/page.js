import { Fragment } from "react";
import BodyContent from "@/components/pages/blogPage/ListSidebar";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarFour from "@/layout/headers/NavbarFour";
import { fetchWithTimeout, getBackendBaseUrl } from "@/lib/api/fetchBackend";
import { mapNewsToBlogItem } from "@/lib/api/mappers/newsMapper";
import HomeBannerSection from "@/components/home/corporate/HomeBanner";

const ListNew = async ({ searchParams }) => {
  const params = await searchParams;
  const id = params?.id || "";
  const type = params?.type || "";
  const backendApiBaseUrl = getBackendBaseUrl();

  // Fetch categories
  let categories = [];
  let bdsQuangCao = [];
  // Fetch bdsQuangCao (ads) regardless of filters so the banner doesn't disappear
  try {
    const resBds = await fetchWithTimeout(`${backendApiBaseUrl}/news/category/0?page=1&limit=6&status=PUBLISHED`, { cache: "no-store" });
    const payloadBds = await resBds.json().catch(() => null);
    if (resBds.ok && Array.isArray(payloadBds?.data)) {
      bdsQuangCao = payloadBds.data.map(mapNewsToBlogItem);
    }
  } catch (error) {
    console.error("[BatdongsanPage] Error fetching ads:", error);
  }
  try {
    const resCat = await fetchWithTimeout(`${backendApiBaseUrl}/news/categories`, { cache: "no-store" });
    const payloadCat = await resCat.json().catch(() => null);
    // Backend trả về array thẳng (không có wrapper { data: [...] })
    if (resCat.ok && Array.isArray(payloadCat)) {
      categories = payloadCat;
      console.log('[news/page.js] categories fetched:', categories.length, categories);
    } else if (resCat.ok && Array.isArray(payloadCat?.data)) {
      // Fallback nếu backend đổi sang wrapper object
      categories = payloadCat.data;
      console.log('[news/page.js] categories fetched (wrapped):', categories.length, categories);
    } else {
      console.warn('[news/page.js] Unexpected categories response:', resCat.status, payloadCat);
    }
  } catch (e) {
    console.error("[news/page.js] Error fetching categories:", e);
  }

  // Fetch initial news list (fetch up to 50 items for client-side pagination)
  let initialNews = [];
  try {
    let targetUrl = `${backendApiBaseUrl}/news?page=1&limit=50&status=PUBLISHED`;
    if (type === "tag" && id) {
      targetUrl = `${backendApiBaseUrl}/news/tags/${encodeURIComponent(id)}?page=1&limit=50&status=PUBLISHED`;
    } else if (type === "category" && id) {
      targetUrl = `${backendApiBaseUrl}/news/category/${encodeURIComponent(id)}?page=1&limit=50&status=PUBLISHED`;
    }
    const resNews = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payloadNews = await resNews.json().catch(() => null);
    if (resNews.ok && Array.isArray(payloadNews?.data)) {
      initialNews = payloadNews.data.map(mapNewsToBlogItem);
    }
  } catch (e) {
    console.error("[news/page.js] Error fetching news list:", e);
  }

  return (
    <Fragment>
      <NavbarFour />
      <HomeBannerSection value={bdsQuangCao} />
      <BodyContent side={"left"} tagId={id} filterType={type} initialCategories={categories} initialNews={initialNews} />
      <FooterThree />
    </Fragment>
  );
};

export default ListNew;
