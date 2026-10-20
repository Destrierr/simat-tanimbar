import { http } from "../http";

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

  onProgress?.(0);

  const { data: body } = await http.post(
    `/assets/${data.asset_id}/documents`,
    form,
    {
      onUploadProgress: (event) => {
        // Tahan di 99 sampai server selesai memproses
        const percent = Math.round((event.loaded * 100) / (event.total || 1));
        onProgress?.(Math.min(percent, 99));
      },
    },
  );

  onProgress?.(100);
  return { data: body.data, message: body.message };
}