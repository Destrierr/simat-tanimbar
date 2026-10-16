import { apiRequest } from "../api";

export async function getDocumentsByAssetService(assetId) {
  const response = await apiRequest(`/assets/${assetId}/documents`);
  return { data: response.data || [] };
}

// The current backend intentionally has no global /documents endpoint.
// Dashboard/list pages use asset.document_count; detail pages request documents per asset.
export async function getAllDocumentsService() {
  return { data: [] };
}

export async function viewDocumentService(documentId) {
  // The backend exposes an authorized download endpoint; the browser can render
  // the returned PDF/image blob as a preview.
  return apiRequest(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
}

export async function downloadDocumentService(documentId) {
  return apiRequest(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
}

export async function deleteDocumentService(id) {
  return apiRequest(`/documents/${id}`, { method: "DELETE" });
}
