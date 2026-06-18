import { Fragment } from "react";
import FooterTwo from "@/layout/footers/FooterTwo";
import BodyContent from "@/components/home/parallax-image";
import NavbarFour from "@/layout/headers/NavbarFour";
import ThemeSetter from "@/components/ThemeSetter";
import { fetchWithTimeout, getBackendBaseUrl } from "@/lib/api/fetchBackend";
import { mapPropertyToCard } from "@/lib/api/mappers/propertyMapper";
import { mapNewsToBlogItem } from "@/lib/api/mappers/newsMapper";

const ParallaxImage = async () => {
  const backendApiBaseUrl = getBackendBaseUrl();

  let value1 = [];
  let value2 = [];
  let featuredProperties = [];
  let latestBlogInCorporate = [];
  let tinTucDuAn = [];
  let bdsQuangCao = null;

  try {
    // 1. Fetch properties (limit 14)
    const resProp = await fetchWithTimeout(`${backendApiBaseUrl}/properties?page=1&limit=14`, { cache: "no-store" }).catch(() => null);
    if (resProp?.ok) {
      const payload = await resProp.json().catch(() => null);
      if (payload?.data) {
        const mapped = payload.data.map(mapPropertyToCard);
        value1 = mapped.slice(0, 6);
        value2 = mapped.slice(6, 14);
      }
    }

    // 2. Fetch featured properties
    const resFeat = await fetchWithTimeout(`${backendApiBaseUrl}/properties/featured?page=1&limit=10`, { cache: "no-store" }).catch(() => null);
    if (resFeat?.ok) {
      const payload = await resFeat.json().catch(() => null);
      if (payload?.data) {
        featuredProperties = payload.data.map(mapPropertyToCard);
      }
    }

    // 3. Fetch news category 1 (Corporate blog)
    const resCat1 = await fetchWithTimeout(`${backendApiBaseUrl}/news/category/1?page=1&limit=6&status=PUBLISHED`, { cache: "no-store" }).catch(() => null);
    if (resCat1?.ok) {
      const payload = await resCat1.json().catch(() => null);
      if (payload?.data) {
        latestBlogInCorporate = payload.data.map(mapNewsToBlogItem);
      }
    }

    // 4. Fetch news category 3 (Tin tức dự án)
    const resCat3 = await fetchWithTimeout(`${backendApiBaseUrl}/news/category/3?page=1&limit=6&status=PUBLISHED`, { cache: "no-store" }).catch(() => null);
    if (resCat3?.ok) {
      const payload = await resCat3.json().catch(() => null);
      if (payload?.data) {
        tinTucDuAn = payload.data.map(mapNewsToBlogItem);
      }
    }

    // 5. Fetch news category 0 (Quảng cáo)
    const resCat0 = await fetchWithTimeout(`${backendApiBaseUrl}/news/category/0?page=1&limit=6&status=PUBLISHED`, { cache: "no-store" }).catch(() => null);
    if (resCat0?.ok) {
      const payload = await resCat0.json().catch(() => null);
      if (payload?.data && payload.data.length > 0) {
        bdsQuangCao = mapNewsToBlogItem(payload.data[0]);
      }
    }
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <Fragment>
      <ThemeSetter />
      <NavbarFour />
      <BodyContent 
        value1={value1}
        value2={value2}
        featuredProperties={featuredProperties}
        latestBlogInCorporate={latestBlogInCorporate}
        tinTucDuAn={tinTucDuAn}
        bdsQuangCao={bdsQuangCao}
      />
      <FooterTwo />
    </Fragment>
  );
};

export default ParallaxImage;
