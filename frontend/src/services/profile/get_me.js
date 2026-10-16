import { apiRequest } from "../api";

export async function getMeService() {
  const response = await apiRequest("/me");
  return {
    data: {
      ...response.data,
      photoprofile: response.data?.profile_photo_url || null,
    },
  };
}

export async function viewPhotoProfileService(path) {
  if (!path) return null;
  return path;
}

export async function editProfileService(data) {
  const body = new FormData();
  for (const key of ["name", "username", "email"])
    if (data[key] !== undefined) body.append(key, data[key]);
  if (data.avatarFile) body.append("avatar_file", data.avatarFile);
  body.append("_method", "PUT");
  const response = await apiRequest("/me", { method: "POST", body });
  return { data: response.data, message: response.message };
}

export async function deletePhotoProfileService() {
  return apiRequest("/profile/photo", { method: "DELETE" });
}
