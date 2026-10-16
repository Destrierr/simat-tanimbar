import { apiRequest } from "./api";

export async function loginService(username, password) {
  if (!username || !password)
    throw new Error("Username dan password wajib diisi.");
  const response = await apiRequest("/login", {
    method: "POST",
    body: { username: username.trim().toLowerCase(), password },
  });
  const token = response.data?.token;
  const user = response.data?.user;
  if (token) localStorage.setItem("token", token);
  return { data: { access_token: token, role: user?.role, user } };
}

export async function refreshTokenService() {
  const response = await apiRequest("/me");
  return { data: { user: response.data } };
}

export async function logoutService() {
  try {
    return await apiRequest("/logout", { method: "POST" });
  } finally {
    localStorage.removeItem("token");
  }
}
