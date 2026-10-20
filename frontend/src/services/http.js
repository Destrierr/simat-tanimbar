import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  "",
);

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    let result = error.response?.data;

    // Error dari request blob (export PDF/Excel) datang sebagai Blob, parse dulu
    if (result instanceof Blob) {
      result = await result
        .text()
        .then(JSON.parse)
        .catch(() => ({}));
    }

    // Bentuk error disamakan dengan apiRequest lama
    error.message = result?.message || error.message;
    error.status = error.response?.status;
    error.errors = result?.errors || {};

    if (error.status === 401 && error.config?.url !== "/login") {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    return Promise.reject(error);
  },
);

export async function getAllPages(url, params = {}) {
  const rows = [];
  const perPage = params.per_page || 100;
  let page = 1;
  let lastPage = 1;

  do {
    const { data: body } = await http.get(url, {
      params: { ...params, per_page: perPage, page },
    });

    rows.push(...(body.data || []));
    lastPage = body.meta?.last_page || 1;
    page += 1;
  } while (page <= lastPage);

  return rows;
}