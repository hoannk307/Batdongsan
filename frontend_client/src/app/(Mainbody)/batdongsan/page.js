import { Fragment } from "react";
import FooterThree from "@/layout/footers/FooterThree";
import GridView from "@/components/listing/gridView/grid/GridView";
import NavbarFour from "@/layout/headers/NavbarFour";
import HomeBannerSection from "@/components/home/corporate/HomeBanner";
import { fetchWithTimeout, getBackendBaseUrl } from "@/lib/api/fetchBackend";
import { mapNewsToBlogItem } from "@/lib/api/mappers/newsMapper";
import { mapPropertyToCard } from "@/lib/api/mappers/propertyMapper";

// Helper parameters mapping
const PARAM_MAP = [
  { param: "property_type", key: "propertyTypes", transform: (v) => [v] },
  { param: "min_baths", key: "minBaths", transform: Number },
  { param: "min_beds", key: "minBeds", transform: Number },
  { param: "min_area", key: "minArea", transform: Number },
  { param: "max_area", key: "maxArea", transform: Number },
  { param: "min_price", key: "minPrice", transform: Number },
  { param: "max_price", key: "maxPrice", transform: Number },
];
const FILTER_PARAMS = PARAM_MAP.map((p) => p.param);

const BatdongsanPage = async ({ searchParams }) => {
  const params = await searchParams;
  const propertyStatus = params?.property_status || "FOR_SALE";
  const backendApiBaseUrl = getBackendBaseUrl();
  
  let value = [];
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

  // Check if there are any filters applied
  const hasFilter = FILTER_PARAMS.some((key) => params?.[key]);

  try {
    if (hasFilter) {
      // Build filterBody
      const filterBody = { propertyStatus };
      PARAM_MAP.forEach(({ param, key, transform }) => {
        const val = params?.[param];
        if (val) filterBody[key] = transform(val);
      });

      const res = await fetchWithTimeout(`${backendApiBaseUrl}/properties/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filterBody),
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && Array.isArray(payload?.data)) {
        value = payload.data.map(mapPropertyToCard);
      }
    } else {
      // Default list
      const res = await fetchWithTimeout(`${backendApiBaseUrl}/properties/filter?property_status=${propertyStatus}&page=1&limit=50`, { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      if (res.ok && Array.isArray(payload?.data)) {
        value = payload.data.map(mapPropertyToCard);
      }
    }
  } catch (error) {
    console.error("[BatdongsanPage] Error fetching data:", error);
  }

  return (
    <Fragment>
      <NavbarFour />
      <HomeBannerSection value={bdsQuangCao} />
      <GridView
        value={value}
        propertyStatus={propertyStatus}
        side={"left"}
        size={2}
        gridType={"list-view"}
        gridBar={true}
      />
      <FooterThree />
    </Fragment>
  );
};

export default BatdongsanPage;
