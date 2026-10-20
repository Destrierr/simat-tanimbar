import { http } from "../http";

export async function getDocumentsByAssetService(assetId) {
  const { data: body } = await http.get(`/assets/${assetId}/documents`);
  return { data: body.data || [] };
}

// The current backend intentionally has no global /documents endpoint.
// Dashboard/list pages use asset.document_count; detail pages request documents per asset.
export async function getAllDocumentsService() {
  return { data: [] };
}

export async function viewDocumentService(documentId) {
  // Endpoint download yang terotorisasi; blob PDF/gambar bisa dirender sebagai preview.
  const { data: blob } = await http.get(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
  return blob;
}

export async function downloadDocumentService(documentId) {
  const { data: blob } = await http.get(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
  return blob;
}

export async function deleteDocumentService(id) {
  await http.delete(`/documents/${id}`);
}