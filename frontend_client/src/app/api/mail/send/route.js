/**
 * POST /api/mail/send
 *
 * Proxy route - forward yêu cầu gửi email từ frontend đến backend NestJS.
 *
 * Body (JSON):
 *   {
 *     toEmail: string,       // email chủ BĐS (từ userData)
 *     senderName: string,    // họ tên người liên hệ (từ form)
 *     senderEmail: string,   // email người liên hệ (từ form)
 *     senderPhone?: string,  // SĐT người liên hệ (từ form)
 *     message?: string,      // tin nhắn (từ form)
 *     propertyTitle?: string,// tiêu đề BĐS (từ singleData)
 *     propertyId?: string,   // ID BĐS (từ singleData)
 *     propertyAddress?: string, // địa chỉ BĐS (từ singleData)
 *   }
 *
 * Response:
 *   200  { success: true, message: string }
 *   400  { success: false, error: string }
 *   503  { success: false, error: string }
 */
import { NextResponse } from "next/server";
import {
  fetchWithTimeout,
  getBackendBaseUrl,
  isConnectionError,
} from "../../../../lib/api/fetchBackend";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body không hợp lệ." },
      { status: 400 }
    );
  }

  const { toEmail, senderName, senderEmail } = body;

  if (!toEmail || !senderName || !senderEmail) {
    return NextResponse.json(
      {
        success: false,
        error: "Thiếu thông tin bắt buộc: toEmail, senderName, senderEmail.",
      },
      { status: 400 }
    );
  }

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/mail/send`;

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: payload?.message || "Gửi email thất bại. Vui lòng thử lại.",
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: payload?.message || "Email đã được gửi thành công!",
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/mail/send] Backend không khả dụng tại ${targetUrl}.`);
    } else {
      console.error("[API/mail/send] Lỗi không xác định:", e);
    }
    return NextResponse.json(
      { success: false, error: "Không thể kết nối đến server. Vui lòng thử lại sau." },
      { status: 503 }
    );
  }
}
