import axios from "axios";
import { getData } from "@/components/utils/getData";
import { API_BASE_URL, DEV_ACCESS_TOKEN } from "@/config/env";

const FALLBACK_TOKEN = DEV_ACCESS_TOKEN;

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;

  const directToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (directToken) return directToken;

  const storedUser = localStorage.getItem("user");
  if (!storedUser) return FALLBACK_TOKEN || null;

  try {
    const parsed = JSON.parse(storedUser);
    return parsed?.token || parsed?.accessToken || FALLBACK_TOKEN || null;
  } catch {
    return FALLBACK_TOKEN || null;
  }
}

export function getAuthHeaders() {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function fetchNewsList({ page = 1, limit = 20, status, category } = {}) {
  const apiBaseUrl = getApiBaseUrl();
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  }).toString();

  const res = await getData(`${apiBaseUrl}/news?${query}`);
  return res?.data; // { data, pagination }
}

export async function fetchNewsById(id) {
  const apiBaseUrl = getApiBaseUrl();
  const res = await getData(`${apiBaseUrl}/news/${id}`);
  return res?.data;
}

export async function createNews(payload) {
  const apiBaseUrl = getApiBaseUrl();
  const res = await axios.post(`${apiBaseUrl}/news`, payload, {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  return res.data;
}

export async function createNewsWithFiles(payload, files = []) {
  const apiBaseUrl = getApiBaseUrl();
  const formData = new FormData();

  // Append news fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        // Gửi array (tags) dưới dạng JSON string
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  // Append files
  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await axios.post(`${apiBaseUrl}/news/with-files`, formData, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
}

export async function updateNews(id, payload) {
  const apiBaseUrl = getApiBaseUrl();
  const res = await axios.patch(`${apiBaseUrl}/news/${id}`, payload, {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  });
  return res.data;
}

export async function deleteNews(id) {
  const apiBaseUrl = getApiBaseUrl();
  const res = await axios.delete(`${apiBaseUrl}/news/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
}

