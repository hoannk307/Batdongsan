import { NextResponse } from "next/server";
import { propertyData } from "../../../../public/API-Data/property";

const FALLBACK_BACKEND_API_URL = "http://localhost:3000/api";
const FETCH_TIMEOUT_MS = 5000; // 5 giây timeout

// Hàm fetch với timeout để tránh treo request
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const page = searchParams.get("page") || "1"; // Thêm lại tham số page cho các danh sách chung

  const backendApiBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    FALLBACK_BACKEND_API_URL;

  let targetUrl;
  let isRelatedPropertyRequest = false; // Cờ để xử lý các hình dạng phản hồi backend tiềm năng khác nhau

  if (id) {
    // Lấy chi tiết 1 bất động sản theo ID → GET /api/properties/:id
    targetUrl = `${backendApiBaseUrl}/properties/${encodeURIComponent(id)}`;
    isRelatedPropertyRequest = true;
  } else {
    // Lấy danh sách bất động sản → GET /api/properties?page=...
    targetUrl = `${backendApiBaseUrl}/properties?page=${encodeURIComponent(page)}`;
  }

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    // Khi lấy 1 property theo ID → trả về object với đúng tên field từ Prisma schema
    if (isRelatedPropertyRequest) {
      if (!res.ok || !payload) {
        return NextResponse.json({ data: null }, { status: res.status || 404 });
      }
      const p = payload;
      const images =
        Array.isArray(p?.file_attach) && p.file_attach.length > 0
          ? p.file_attach.map((f) => f?.path).filter(Boolean)
          : ["/assets/images/property/12.jpg"];
      return NextResponse.json({
        data: {
          view_count: p?.view_count ?? 0,
          // --- Ảnh ---
          img: images,
          file_attach: p?.file_attach || [],

          // --- Đúng tên field Prisma schema ---
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
        },
      });
    }

    // Khi lấy danh sách
    let propertiesToMap = payload?.data || [];

    // Fallback nếu backend trả về rỗng
    if (!res.ok || propertiesToMap.length === 0) {
      return NextResponse.json({
        data: {
          LatestPropertyData: propertyData.LatestPropertyData || [],
        },
      });
    }

    const mappedListing = propertiesToMap.map((p) => {
      const images =
        Array.isArray(p?.file_attach) && p.file_attach.length > 0
          ? p.file_attach.map((f) => f?.path).filter(Boolean)
          : ["/assets/images/property/12.jpg"];

      return {
        img: images,
        propertyStatus: p?.property_status,
        label: [],
        country: p?.any_city || "",
        title: p?.property_type || "Property",
        price: Number(p?.price || 0),
        details: p?.landmark || p?.any_ward || p?.any_city || "",
        home: p?.any_city || "",
        bed: p?.beds ?? 0,
        bath: p?.baths ?? 0,
        sqft: Number(p?.area || 0),
        rooms: (p?.beds ?? 0) + (p?.baths ?? 0),
        date: p?.created_at ? new Date(p.created_at).getFullYear() : "",
        id: String(p?.id ?? ""),
      };
    });

    return NextResponse.json({
      data: {
        LatestPropertyData: mappedListing,
      },
    });

  } catch (e) {
    // Nếu backend chưa chạy (ECONNREFUSED) hoặc timeout, dùng dữ liệu tĩnh
    const isConnectionError =
      e?.cause?.code === "ECONNREFUSED" ||
      e?.name === "AbortError" ||
      e?.code === "ECONNREFUSED";

    if (isConnectionError) {
      console.warn(
        `[API/property] Backend không khả dụng tại ${targetUrl} — đang dùng dữ liệu tĩnh (fallback).`
      );
    } else {
      console.error("[API/property] Lỗi không xác định khi fetch properties:", e);
    }
    // Khi có lỗi, trả về dữ liệu tĩnh theo định dạng mong đợi
    return NextResponse.json({
      data: {
        LatestPropertyData: propertyData.LatestPropertyData || [],
      },
    });
  }
}



