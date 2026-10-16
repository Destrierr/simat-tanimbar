import { apiRequest } from "../api";

const roleName = (role = "viewer") =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
const userToUi = (user) => ({
  ...user,
  username: user.username || user.email?.split("@")[0] || "",
  rolename: roleName(user.role),
  status: user.is_active ? "active" : "inactive",
});

export async function createUserService(data) {
  const response = await apiRequest("/users", {
    method: "POST",
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: (data.rolename || "Viewer").toLowerCase(),
      is_active: data.is_active ?? true,
    },
  });
  return { data: userToUi(response.data), message: response.message };
}

export async function getAllUsersService({
  page = 1,
  perPage = 10,
  search = "",
  role = "",
  status = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(Math.min(perPage, 100)),
  });
  if (search.trim()) params.set("search", search.trim());
  if (role) params.set("role", role.toLowerCase());
  if (status) params.set("is_active", String(status === "active"));

  const response = await apiRequest(`/users?${params}`);
  return {
    data: (response.data || []).map(userToUi),
    meta: response.meta || {
      current_page: page,
      per_page: perPage,
      total: 0,
      last_page: 1,
      role_counts: {},
      latest_users: [],
    },
    latestUsers: (response.meta?.latest_users || []).map(userToUi),
  };
}

export async function editUserService(id, data) {
  const body = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.email !== undefined) body.email = data.email;
  if (data.rolename !== undefined) body.role = data.rolename.toLowerCase();
  if (data.is_active !== undefined) body.is_active = data.is_active;
  if (data.password) body.password = data.password;
  const response = await apiRequest(`/users/${id}`, { method: "PUT", body });
  return { data: userToUi(response.data), message: response.message };
}

export async function deleteUserService(id) {
  return apiRequest(`/users/${id}`, { method: "DELETE" });
}

export async function setUserStatusService(id, status) {
  const response = await apiRequest(`/users/${id}`, {
    method: "PUT",
    body: { is_active: status === "active" },
  });
  return { data: userToUi(response.data), message: response.message };
}
