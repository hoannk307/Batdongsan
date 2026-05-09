/**
 * @fileoverview Shared enum constants for Batdongsan project.
 * Compatible with: frontend_client (Next.js), frontend_admin (Next.js), backend (NestJS/TypeScript).
 *
 * Usage:
 *   - JS/Next.js:  import { PRICE_OPTIONS } from '@batdongsan/shared'
 *   - TS/NestJS:   import { PRICE_OPTIONS } from '@batdongsan/shared'
 */

// ---------------------------------------------------------------------------
// Rooms (số phòng)
// ---------------------------------------------------------------------------
const ROOMS_OPTIONS = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
  { id: 5, name: "5" },
  { id: 6, name: "6" },
];

// ---------------------------------------------------------------------------
// Bathrooms (số phòng tắm)
// ---------------------------------------------------------------------------
const BATH_OPTIONS = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
];

// ---------------------------------------------------------------------------
// Bedrooms (số phòng ngủ)
// ---------------------------------------------------------------------------
const BED_OPTIONS = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
];

// ---------------------------------------------------------------------------
// Sale price ranges (khoảng giá bán - đơn vị: triệu / tỷ VND)
// ---------------------------------------------------------------------------
const PRICE_OPTIONS = [
  { id: 1, name: "Thỏa thuận", value: 'null,null' },
  { id: 2, name: "< 500 triệu", value: '0,500000000' },
  { id: 3, name: "500 - 800 triệu", value: '500000000,800000000' },
  { id: 4, name: "800 triệu - 1 tỷ", value: '800000000,1000000000' },
  { id: 5, name: "1 - 2 tỷ", value: '1000000000,2000000000' },
  { id: 6, name: "2 - 3 tỷ", value: '2000000000,3000000000' },
  { id: 7, name: "3 - 5 tỷ", value: '3000000000,5000000000' },
  { id: 8, name: "5 - 7 tỷ", value: '5000000000,7000000000' },
  { id: 9, name: "7 - 10 tỷ", value: '7000000000,10000000000' },
  { id: 10, name: "10 - 20 tỷ", value: '10000000000,20000000000' },
  { id: 11, name: "20 - 30 tỷ", value: '20000000000,30000000000' },
  { id: 12, name: "30 - 40 tỷ", value: '30000000000,40000000000' },
  { id: 13, name: "40 - 60 tỷ", value: '40000000000,60000000000' },
  { id: 14, name: "Trên 60 tỷ", value: '60000000000,null' },
];

// ---------------------------------------------------------------------------
// Rent price ranges (khoảng giá thuê - đơn vị: triệu VND/tháng)
// ---------------------------------------------------------------------------
const RENT_PRICE_OPTIONS = [
  { id: 1, name: "Thỏa thuận", value: 'null,null' },
  { id: 2, name: "< 1 triệu", value: '0,1000000' },
  { id: 3, name: "1 - 3 triệu", value: '1000000,3000000' },
  { id: 4, name: "3 - 5 triệu", value: '3000000,5000000' },
  { id: 5, name: "5 - 10 triệu", value: '5000000,10000000' },
  { id: 6, name: "10 - 20 triệu", value: '10000000,20000000' },
  { id: 7, name: "20 - 30 triệu", value: '20000000,30000000' },
  { id: 8, name: "30 - 50 triệu", value: '30000000,50000000' },
  { id: 9, name: "Trên 50 triệu", value: '50000000,null' },
];

// ---------------------------------------------------------------------------
// Square feet / Area ranges (khoảng diện tích - đơn vị: m²)
// ---------------------------------------------------------------------------
const SQUARE_FEET_OPTIONS = [
  { id: 1, name: "< 50 m²", value: "0,50" },
  { id: 2, name: "50 - 80 m²", value: "50,80" },
  { id: 3, name: "80 - 100 m²", value: "80,100" },
  { id: 4, name: "100 - 120 m²", value: "100,120" },
  { id: 5, name: "120 - 150 m²", value: "120,150" },
  { id: 6, name: "150 - 200 m²", value: "150,200" },
  { id: 7, name: "200 - 250 m²", value: "200,250" },
  { id: 8, name: "250 - 300 m²", value: "250,300" },
  { id: 9, name: "300 - 400 m²", value: "300,400" },
  { id: 10, name: "400 - 500 m²", value: "400,500" },
  { id: 11, name: "Trên 500 m²", value: "500,null" },
];

// ---------------------------------------------------------------------------
// Property status (trạng thái bất động sản)
// ---------------------------------------------------------------------------
const PROPERTY_STATUS = {
  FOR_SALE: "FOR_SALE",
  FOR_RENT: "FOR_RENT",
  SOLD: "SOLD",
  RENTED: "RENTED",
};

const PROPERTY_STATUS_OPTIONS = [
  { id: PROPERTY_STATUS.FOR_SALE, name: "Bán" },
  { id: PROPERTY_STATUS.FOR_RENT, name: "Cho thuê" },
  { id: PROPERTY_STATUS.SOLD, name: "Đã bán" },
  { id: PROPERTY_STATUS.RENTED, name: "Đã cho thuê" },
];

// ---------------------------------------------------------------------------
// Exports (CommonJS — works in Node/NestJS and is also consumed by Next.js)
// ---------------------------------------------------------------------------
module.exports = {
  ROOMS_OPTIONS,
  BATH_OPTIONS,
  BED_OPTIONS,
  PRICE_OPTIONS,
  RENT_PRICE_OPTIONS,
  SQUARE_FEET_OPTIONS,
  PROPERTY_STATUS,
  PROPERTY_STATUS_OPTIONS,
};
