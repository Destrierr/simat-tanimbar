import { apiRequest } from "./api";

export async function getSystemSettingsService() {
  const response = await apiRequest("/settings");
  return { data: response.data || {} };
}

export async function updateSystemSettingsService(data) {
  return apiRequest("/settings", { method: "PUT", body: data });
}
