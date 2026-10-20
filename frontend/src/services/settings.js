import { http } from "./http";

export async function getSystemSettingsService() {
  const { data: body } = await http.get("/settings");
  return { data: body.data || {} };
}

export async function updateSystemSettingsService(data) {
  const { data: body } = await http.put("/settings", data);
  return body;
}