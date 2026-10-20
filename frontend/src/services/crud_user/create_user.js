import { http } from "../http";

const roleName = (role = "viewer") =>
  role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

const userToUi = (user) => ({
  ...user,
  username: user.username || user.email?.split("@")[0] || "",
  rolename: roleName(user.role),
  status: user.is_active ? "active" : "inactive",
});

export async function createUserService(data) {
  const { data: body } = await http.post("/users", {
    name: data.name,
    email: data.email,
    password: data.password,
    role: (data.rolename || "Viewer").toLowerCase(),
    is_active: data.is_active ?? true,
  });
  return { data: userToUi(body.data), message: body.message };
}

export async function getAllUsersService({
  page = 1,
  perPage = 10,
  search = "",
  role = "",
  status = "",
} = {}) {
  const params = {
    page,
    per_page: Math.min(perPage, 100),
  };
  if (search.trim()) params.search = search.trim();
  if (role) params.role = role.toLowerCase();
  if (status) params.is_active = status === "active";

  const { data: body } = await http.get("/users", { params });

  return {
    data: (body.data || []).map(userToUi),
    meta: body.meta || {
      current_page: page,
      per_page: perPage,
      total: 0,
      last_page: 1,
      role_counts: {},
      latest_users: [],
    },
    latestUsers: (body.meta?.latest_users || []).map(userToUi),
  };
}

export async function editUserService(id, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.rolename !== undefined) payload.role = data.rolename.toLowerCase();
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  if (data.password) payload.password = data.password;

  const { data: body } = await http.put(`/users/${id}`, payload);
  return { data: userToUi(body.data), message: body.message };
}

export async function deleteUserService(id) {
  await http.delete(`/users/${id}`);
}

export async function setUserStatusService(id, status) {
  const { data: body } = await http.put(`/users/${id}`, {
    is_active: status === "active",
  });
  return { data: userToUi(body.data), message: body.message };
}

export async function resetUserPasswordService(id, password) {
  const { data: body } = await http.post(
    `/users/${id}/reset-password`,
    password ? { password, password_confirmation: password } : {},
  );
  return body; // { message, data: { temporary_password? } }
}