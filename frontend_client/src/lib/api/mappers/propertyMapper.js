/**
 * @file propertyMapper.js
 * Các hàm chuyển đổi dữ liệu property từ backend sang định dạng frontend.
 */

const FALLBACK_IMAGE = "/assets/images/property/12.jpg";

/**
 * Trích xuất mảng đường dẫn ảnh từ file_attach của backend.
 *
 * @param {any} p - Property object từ backend
 * @returns {string[]}
 */
export function extractImages(p) {
  return Array.isArray(p?.file_attach) && p.file_attach.length > 0
    ? p.file_attach.map((f) => f?.path).filter(Boolean)
    : [FALLBACK_IMAGE];
}

/**
 * Map một property từ backend sang định dạng danh sách (listing card).
 * Dùng cho: danh sách, tìm kiếm, filter.
 *
 * @param {any} p - Property object từ backend
 * @returns {object}
 */
export function mapPropertyToCard(p) {
  return {
    id: String(p?.id ?? ""),
    img: extractImages(p),
    propertyStatus: p?.property_status || "",
    propertyType: p?.property_type || "Property",
    label: [],
    title: p?.property_type || "Property",
    price: Number(p?.price || 0),
    beds: p?.beds ?? 0,
    baths: p?.baths ?? 0,
    area: Number(p?.area || 0),
    rooms: (p?.beds ?? 0) + (p?.baths ?? 0),
    country: p?.any_city || "",
    home: p?.any_city || "",
    // details: p?.landmark || p?.any_ward || p?.any_city || "",
    // any_city: p?.any_city || "",
    // any_ward: p?.any_ward || "",
    // landmark: p?.landmark || "",
    date: p?.created_at ? (() => { const d = new Date(p.created_at); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; })() : "",
    price_string: p?.price_string || "",
    created_at: p?.created_at || null,
    address: p?.address || "",
  };
}

/**
 * Map một property từ backend sang định dạng chi tiết (detail page).
 * Giữ nguyên tên field theo Prisma schema.
 *
 * @param {any} p - Property object từ backend
 * @returns {object}
 */
export function mapPropertyToDetail(p) {
  return {
    view_count: p?.view_count ?? 0,
    img: extractImages(p),
    file_attach: p?.file_attach || [],
    id: p?.id ?? null,
    property_type: p?.property_type || "",
    property_status: p?.property_status || "",
    beds: p?.beds ?? 0,
    baths: p?.baths ?? 0,
    area: Number(p?.area || 0),
    price: Number(p?.price || 0),
    description: p?.description || "",
    any_city: p?.any_city || "",
    any_ward: p?.any_ward || "",
    landmark: p?.landmark || "",
    created_at: p?.created_at || null,
    updated_at: p?.updated_at || null,
    user_id: p?.user_id || null,
  };
}

/**
 * Lọc mảng static property data khi backend không khả dụng.
 * Hỗ trợ cả 2 cú pháp filter:
 *  - snake_case (từ GET query params: property_status, area_min, ...)
 *  - camelCase  (từ POST body: propertyStatus, minBeds, ...)
 *
 * @param {any[]} items - Mảng property tĩnh
 * @param {object} filters - Bộ lọc
 * @returns {any[]}
 */
export function applyStaticFilters(items, filters = {}) {
  return items.filter((p) => {
    // --- property_status / propertyStatus ---
    const statusFilter = filters.property_status || filters.propertyStatus;
    if (statusFilter && (p.propertyStatus || p.property_status) !== statusFilter) return false;

    // --- property_type / propertyTypes (array) ---
    if (filters.property_type) {
      const pType = p.propertyType || p.property_type || p.title || "";
      if (pType !== filters.property_type) return false;
    }
    if (Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0) {
      const pType = p.propertyType || p.property_type || p.title || "";
      if (!filters.propertyTypes.includes(pType)) return false;
    }

    // --- beds ---
    const minBeds = filters.beds ?? filters.minBeds;
    if (minBeds && (p.bed ?? p.beds ?? 0) < Number(minBeds)) return false;

    // --- baths ---
    const minBaths = filters.baths ?? filters.minBaths;
    if (minBaths && (p.bath ?? p.baths ?? 0) < Number(minBaths)) return false;

    // --- area ---
    const areaMin = filters.area_min ?? filters.minArea;
    const areaMax = filters.area_max ?? filters.maxArea;
    if (areaMin && (p.area || 0) < Number(areaMin)) return false;
    if (areaMax && (p.area || 0) > Number(areaMax)) return false;

    // --- price ---
    const priceMin = filters.price_min ?? filters.minPrice;
    const priceMax = filters.price_max ?? filters.maxPrice;
    if (priceMin && (p.price || 0) < Number(priceMin)) return false;
    if (priceMax && (p.price || 0) > Number(priceMax)) return false;

    // --- city: any_city (string) hoặc cities (array) ---
    if (filters.any_city) {
      if (!String(p.country || p.home || "").toLowerCase().includes(filters.any_city.toLowerCase()))
        return false;
    }
    if (Array.isArray(filters.cities) && filters.cities.length > 0) {
      const city = String(p.country || p.home || "").toLowerCase();
      if (!filters.cities.some((c) => city.includes(c.toLowerCase()))) return false;
    }

    return true;
  });
}
