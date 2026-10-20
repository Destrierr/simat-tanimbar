import { http, getAllPages } from "./http";

export async function getAllKecamatanService() {
  const rows = await getAllPages("/kecamatan", { per_page: 100 });
  return { data: rows };
}

export async function createKecamatanService(data) {
  const { data: body } = await http.post("/kecamatan", data);
  return { data: body.data, message: body.message };
}

export async function updateKecamatanService(id, data) {
  const { data: body } = await http.put(`/kecamatan/${id}`, data);
  return { data: body.data, message: body.message };
}

export async function deleteKecamatanService(id) {
  await http.delete(`/kecamatan/${id}`);
}