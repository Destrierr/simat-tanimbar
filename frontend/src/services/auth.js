import { http } from "./http";

export async function loginService(username, password) {
  if (!username || !password)
    throw new Error("Username dan password wajib diisi.");

  const { data: body } = await http.post("/login", {
    username: username.trim().toLowerCase(),
    password,
  });

  const token = body.data?.token;
  const user = body.data?.user;
  if (token) localStorage.setItem("token", token);

  return { data: { access_token: token, role: user?.role, user } };
}

export async function logoutService() {
  try {
    const { data: body } = await http.post("/logout");
    return body;
  } finally {
    localStorage.removeItem("token");
  }
}

export async function refreshTokenService() {
  const { data: body } = await http.post("/refresh");
  const token = body.data?.token;
  if (token) localStorage.setItem("token", token);
  return { data: { access_token: token, user: body.data?.user } };
}