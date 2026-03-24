import axios from "axios";
import { getData } from "@/components/utils/getData";

const FALLBACK_API_URL = "http://localhost:3000/api";
const FALLBACK_TOKEN = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || process.env.DEV_ACCESS_TOKEN || "";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || FALLBACK_API_URL;
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

