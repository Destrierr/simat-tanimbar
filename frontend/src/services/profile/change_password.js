import { apiRequest } from "../api";

export async function changePasswordService(data) {
  return apiRequest("/me/password", {
    method: "PUT",
    body: {
      current_password: data.oldPassword,
      password: data.newPassword,
      password_confirmation: data.confirmPassword,
    },
  });
}
