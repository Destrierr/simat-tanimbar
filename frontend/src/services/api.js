const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  "",
);

export async function apiRequest(path, options = {}) {
  const { body, headers = {}, responseType, ...requestOptions } = options;
  const token = localStorage.getItem("token");
  const isFormData = body instanceof FormData;
  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    },
  );

  if (responseType === "blob") {
    if (!response.ok) throw await responseError(response);
    return response.blob();
  }
  if (response.status === 204) return { success: true, data: null };

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || "Permintaan ke server gagal.");
    error.status = response.status;
    error.errors = result.errors || {};
    if (response.status === 401 && path !== "/login") {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    throw error;
  }
  return result;
}

async function responseError(response) {
  const result = await response.json().catch(() => ({}));
  const error = new Error(result.message || "Gagal mengambil berkas.");
  error.status = response.status;
  error.errors = result.errors || {};
  return error;
}

export async function getAllPages(path, params = {}) {
  const results = [];
  let page = 1;
  let lastPage = 1;
  do {
    const query = new URLSearchParams({
      ...params,
      per_page: String(params.per_page || 100),
      page: String(page),
    });
    const response = await apiRequest(`${path}?${query}`);
    results.push(...(response.data || []));
    lastPage = response.meta?.last_page || 1;
    page += 1;
  } while (page <= lastPage);
  return results;
}
