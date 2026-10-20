import { http } from "../http";

export async function changePasswordService(data) {
  const { data: body } = await http.put("/me/password", {
    current_password: data.oldPassword,
    password: data.newPassword,
    password_confirmation: data.confirmPassword,
  });
  return body;
}