import { NextResponse } from "next/server";
import { propertyData } from "../../../../public/API-Data/property";

const FALLBACK_BACKEND_API_URL = "http://localhost:3000/api";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";

  const backendApiBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    FALLBACK_BACKEND_API_URL;

  const targetUrl = `${backendApiBaseUrl}/properties/latest?page=${encodeURIComponent(
    page
  )}`;

  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    // Backend shape: { data: Property[], pagination: {...} }
    const latest = payload?.data;
    // if (!res.ok || !Array.isArray(latest)) {
    //   return NextResponse.json(propertyData);
    // }

    const mappedListing = latest.map((p) => {
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

    // Keep the legacy shape for the rest of the app, but override listing
    return NextResponse.json({
      PropertyListing: mappedListing,
    });
  } catch (e) {
    return NextResponse.json(propertyData);
  }
}


 
