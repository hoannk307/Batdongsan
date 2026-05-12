/**
 * Trang danh sách bất động sản.
 * Tự động gọi POST /search (nếu có bộ lọc) hoặc GET /list (mặc định),
 * rồi truyền kết quả vào GridView qua prop `value`.
 */
"use client";
import React, { Fragment, useEffect, useState } from "react";
import FooterThree from "@/layout/footers/FooterThree";
import NavbarThree from "@/layout/headers/NavbarThree";
import Breadcrumb from "@/layout/Breadcrumb/Breadcrumb";
import GridView from "@/components/listing/gridView/grid/GridView";

import { useSearchParams } from "next/navigation";
import NavbarFour from "@/layout/headers/NavbarFour";

/** Các filter params mà InputForm có thể push lên URL */
/** Mapping từ URL param → filterBody key + hàm transform tương ứng */
const PARAM_MAP = [
  { param: "property_type", key: "propertyTypes", transform: (v) => [v] },
  { param: "min_baths", key: "minBaths", transform: Number },
  { param: "min_beds", key: "minBeds", transform: Number },
  { param: "min_area", key: "minArea", transform: Number },
  { param: "max_area", key: "maxArea", transform: Number },
  { param: "min_price", key: "minPrice", transform: Number },
  { param: "max_price", key: "maxPrice", transform: Number },
];

/** Các filter params mà InputForm có thể push lên URL */
const FILTER_PARAMS = PARAM_MAP.map((p) => p.param);

const isDev = process.env.NODE_ENV === "development";

const LeftSidebar = () => {
  const [value, setValue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const propertyStatus = searchParams.get("property_status") || "FOR_SALE";

  useEffect(() => {
    // AbortController để hủy request cũ khi searchParams thay đổi (tránh race condition)
    const controller = new AbortController();
    const { signal } = controller;

    // Kiểm tra có bộ lọc nào không (ngoài property_status)
    const hasFilter = FILTER_PARAMS.some((key) => searchParams.get(key));

    setIsLoading(true);

    if (hasFilter) {
      // ── Có bộ lọc → gọi POST /api/batdongsan/search ──────────────────────
      const filterBody = { propertyStatus };

      // Build filterBody theo PARAM_MAP, tránh lặp code
      PARAM_MAP.forEach(({ param, key, transform }) => {
        const val = searchParams.get(param);
        if (val) filterBody[key] = transform(val);
      });

      if (isDev) console.log("[page.js] Gọi search với filterBody:", filterBody);

      fetch("/api/batdongsan/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filterBody),
        signal,
      })
        .then((res) => res.json())
        .then((result) => {
          // search/route.js trả về { data: { LatestPropertyData, pagination } }
          setValue(result?.data?.LatestPropertyData ?? []);
          if (isDev) console.log("[page.js] Kết quả search:", result?.data?.LatestPropertyData?.length, "mục");
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error("[page.js] Lỗi search:", err);
        })
        .finally(() => setIsLoading(false));
    } else {
      // ── Không có bộ lọc → gọi GET /api/batdongsan/list ────────────────────
      if (isDev) console.log("[page.js] Gọi list với property_status:", propertyStatus);

      fetch(`/api/batdongsan/list?property_status=${propertyStatus}&page=1&limit=50`, { signal })
        .then((res) => res.json())
        .then((res) => {
          // list/route.js trả về { data: { data: PropertyCard[], pagination } }
          setValue(res?.data ?? []);
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error("[page.js] Lỗi list:", err);
        })
        .finally(() => setIsLoading(false));
    }

    // Cleanup: hủy request đang bay nếu effect chạy lại
    return () => controller.abort();
  }, [searchParams, propertyStatus]); // re-run mỗi khi URL params thay đổi

  return (
    <Fragment>
      <NavbarFour />
      <Breadcrumb />
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

export default LeftSidebar;
