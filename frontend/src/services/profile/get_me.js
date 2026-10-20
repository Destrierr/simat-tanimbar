import { http } from "../http";

export async function getMeService() {
  const { data: body } = await http.get("/me");
  return {
    data: {
      ...body.data,
      photoprofile: body.data?.profile_photo_url || null,
    },
  };
}

export async function viewPhotoProfileService(path) {
  if (!path) return null;
  return path;
}

export async function editProfileService(data) {
  const form = new FormData();

  for (const key of ["name", "username", "email"]) {
    if (data[key] !== undefined) form.append(key, data[key]);
  }
  if (data.avatarFile) form.append("avatar_file", data.avatarFile);
  form.append("_method", "PUT");

  const { data: body } = await http.post("/me", form);
  return { data: body.data, message: body.message };
}

export async function deletePhotoProfileService() {
  await http.delete("/profile/photo");
}