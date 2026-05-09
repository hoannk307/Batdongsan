/**
 * It takes in a label, lg, and sm, and returns a row with a dropdown input field, a range input field,
 * and a button
 * @returns an object with the key of the property and the value of the property.
 */

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { getData } from "@/utils/getData";
import { Field, Form, Formik } from "formik";
// InputForm chỉ build URL params và push router;
// page.js đọc params và tự quyết định gọi search API.
import { ReactstrapSelect } from "@/utils/ReactstrapInputsValidation";
import {
  ROOMS_OPTIONS,
  BATH_OPTIONS,
  BED_OPTIONS,
  PRICE_OPTIONS,
  RENT_PRICE_OPTIONS,
  SQUARE_FEET_OPTIONS,
} from "@batdongsan/shared";

/**
 * Parse chuỗi range từ shared/index.js sang { min, max } số:
 *  - 'null,null' → {}               (không lọc — Thỏa thuận)
 *  - '0,b'       → { max: b }      (0 < x < b  — bỏ min=0 tránh lọc nhầm)
 *  - 'a,b'       → { min: a, max: b }
 *  - 'a,null'    → { min: a }      (a < x, không giới hạn trên)
 */
function parseRangeValue(value) {
  if (!value) return {};
  const [rawMin, rawMax] = value.split(",");
  const min = rawMin === "null" || rawMin === "0" ? undefined : Number(rawMin);
  const max = rawMax === "null" ? undefined : Number(rawMax);
  return { min, max };
}

const InputForm = ({ label, lg, sm, lastSm, propertyStatus }) => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const [propertyDefaults, setPropertyDefaults] = useState({
    propertyTypes: [],
    rooms: ROOMS_OPTIONS,
    bath: BATH_OPTIONS,
    bed: BED_OPTIONS,
    price: propertyStatus === "FOR_SALE" ? PRICE_OPTIONS : RENT_PRICE_OPTIONS,
    squareFeet: SQUARE_FEET_OPTIONS,
  });

  useEffect(() => {
    getData("/api/batdongsan/options")
      .then((res) => {
        if (res?.data) {
          setPropertyDefaults((prev) => ({
            ...prev,
            price: propertyStatus === "FOR_SALE" ? PRICE_OPTIONS : RENT_PRICE_OPTIONS,
            propertyTypes: res.data.propertyTypes || [],
          }));
        }
      })
      .catch((error) => console.error("Failed to fetch property options:", error));
  }, [propertyStatus]);

  /**
   * Gọi POST /api/batdongsan/search với bộ lọc từ form.
   * Mapping form values → SearchPropertyDto (backend camelCase):
   *   propertyType  → propertyTypes[]
   *   bath          → minBaths  (số phòng tắm tối thiểu)
   *   bed           → minBeds   (số phòng ngủ tối thiểu)
   *   squareFeet    → minArea / maxArea  (parse từ chuỗi 'a,b')
   *   price         → minPrice / maxPrice (parse từ chuỗi 'a,b')
   */
  /**
   * handleSearch chỉ build URL query params rồi push router.
   * page.js sẽ đọc params này và tự gọi đúng API (search hoặc list).
   * Không gọi fetch ở đây để tránh gọi API 2 lần.
   */
  /**
   * Tra cứu `value` (chuỗi range) từ `id` trong danh sách options.
   * ReactstrapSelectInput render <option value={option.id}>, nên form trả về id.
   * Hàm này mapping id → value thực sự ('0,500000000') trước khi parse.
   */
  const getRangeValueById = (id, options) => {
    if (!id) return null;
    const found = options.find((opt) => String(opt.id) === String(id));
    return found?.value ?? null;
  };

  const handleSearch = (values) => {
    console.log('------------------------- values', values);
    setIsSearching(true);
    try {
      const params = new URLSearchParams();

      if (propertyStatus) params.set("property_status", propertyStatus);
      if (values.propertyType) params.set("property_type", values.propertyType);
      if (values.bath) params.set("min_baths", values.bath);
      if (values.bed) params.set("min_beds", values.bed);

      // squareFeet: form trả về id → mapping sang chuỗi range rồi parse
      if (values.squareFeet) {
        const squareFeetRange = getRangeValueById(values.squareFeet, propertyDefaults.squareFeet);
        const { min: minArea, max: maxArea } = parseRangeValue(squareFeetRange);
        if (minArea !== undefined) params.set("min_area", minArea);
        if (maxArea !== undefined) params.set("max_area", maxArea);
      }

      // price: form trả về id → mapping sang chuỗi range rồi parse
      if (values.price) {
        const priceRange = getRangeValueById(values.price, propertyDefaults.price);
        if (priceRange && priceRange !== "null,null") {
          const { min: minPrice, max: maxPrice } = parseRangeValue(priceRange);
          if (minPrice !== undefined) params.set("min_price", minPrice);
          if (maxPrice !== undefined) params.set("max_price", maxPrice);
        }
      }

      console.log("[InputForm] Điều hướng với params:", params.toString());
      router.push(`/batdongsan?${params.toString()}`);
    } catch (err) {
      console.error("[InputForm] Lỗi khi điều hướng:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const initialValues = {
    propertyType: "",
    bath: "",
    bed: "",
    squareFeet: "",
    price: "",
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSearch}>
      {({ isSubmitting }) => (
        <Form>
          <Row className="gx-3">
            {/* Loại bất động sản */}
            <Field
              name="propertyType"
              component={ReactstrapSelect}
              className="form-control"
              style={{ marginBottom: 0 }}
              inputprops={{
                options: propertyDefaults.propertyTypes,
                defaultOption: "Loại bất động sản",
              }}
            />

            {/* Phòng tắm — giá trị là id số (1,2,3,4) */}
            <Field
              name="bath"
              component={ReactstrapSelect}
              className="form-control"
              inputprops={{
                options: propertyDefaults.bath,
                defaultOption: "Phòng tắm",
              }}
            />

            {/* Phòng ngủ — giá trị là id số (1,2,3,4) */}
            <Field
              name="bed"
              component={ReactstrapSelect}
              className="form-control"
              inputprops={{
                options: propertyDefaults.bed,
                defaultOption: "Phòng ngủ",
              }}
            />

            {/* Diện tích — giá trị option.value là chuỗi 'a,b' */}
            <Field
              name="squareFeet"
              component={ReactstrapSelect}
              className="form-control"
              inputprops={{
                options: propertyDefaults.squareFeet,
                defaultOption: "Diện tích",
              }}
            />

            {/* Khoảng giá — giá trị option.value là chuỗi 'a,b' */}
            <Field
              name="price"
              component={ReactstrapSelect}
              className="form-control"
              inputprops={{
                options: propertyDefaults.price,
                defaultOption: "Khoảng giá",
              }}
            />

            <Col lg={lg || 12}>
              <button
                type="submit"
                className="btn btn-gradient mt-3 w-100"
              //disabled={isSubmitting || isSearching}
              >
                {isSearching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default InputForm;
