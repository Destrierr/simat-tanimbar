import { apiRequest, getAllPages } from "./api";

export async function getAllKecamatanService() {
  const rows = await getAllPages("/kecamatan", { per_page: "100" });
  return { data: rows };
}

export async function createKecamatanService(data) {
  const response = await apiRequest("/kecamatan", {
    method: "POST",
    body: data,
  });
  return { data: response.data, message: response.message };
}

export async function updateKecamatanService(id, data) {
  const response = await apiRequest(`/kecamatan/${id}`, {
    method: "PUT",
    body: data,
  });
  return { data: response.data, message: response.message };
}

export async function deleteKecamatanService(id) {
  return apiRequest(`/kecamatan/${id}`, { method: "DELETE" });
}
