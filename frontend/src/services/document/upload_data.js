import { apiRequest } from "../api";

export async function uploadDocumentsService(data, onProgress) {
  const form = new FormData();
  for (const key of [
    "document_type",
    "document_number",
    "document_date",
    "description",
  ]) {
    if (data[key]) form.append(key, data[key]);
  }
  if (data.file) form.append("file", data.file);
  onProgress?.(10);
  const response = await apiRequest(`/assets/${data.asset_id}/documents`, {
    method: "POST",
    body: form,
  });
  onProgress?.(100);
  return { data: response.data, message: response.message };
}
