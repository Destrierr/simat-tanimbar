import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Table, { ActionButton } from "../../components/table/Table";
import { UserMinusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import Pagination from "../../components/pagination/Pagination";
import FormModal from "../../components/modal/FormModal";
import { ModalConfirm } from "../../components/modal/Modal";
import Alert from "../../components/alert/Alert";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import { useAlert } from "../../hooks/useAlert";
import useAppStore from "../../stores/useAppStore";
import Dropdown from "../../components/dropdown/Dropdown";
import {
  useCreateUser,
  useDeleteUser,
  useEditUser,
  useSetUserStatus,
  useUsers,
} from "../../hooks/useUsers";
import { getErrorMessage, useToastAlert } from "../../hooks/useToastAlert";

const ROLE_OPTIONS = [
  { value: "Admin", label: "Admin" },
  { value: "Operator", label: "Operator" },
  { value: "Viewer", label: "Viewer" },
];

const PAGE_SIZE = 10;

const ROLE_STYLES = {
  Admin: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    icon: "lucide:shield-check",
    tone: "sky",
  },
  Operator: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    icon: "lucide:user-cog",
    tone: "amber",
  },
  Viewer: {
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    icon: "lucide:user-round",
    tone: "violet",
  },
};

const TONES = {
  sky: "bg-sky-50 text-sky-500 ring-sky-100 dark:bg-sky-500/10 dark:ring-sky-500/20",
  emerald:
    "bg-emerald-50 text-emerald-500 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20",
  amber:
    "bg-amber-50 text-amber-500 ring-amber-100 dark:bg-amber-500/10 dark:ring-amber-500/20",
  violet:
    "bg-violet-50 text-violet-500 ring-violet-100 dark:bg-violet-500/10 dark:ring-violet-500/20",
};

const EMPTY_META = {
  current_page: 1,
  per_page: PAGE_SIZE,
  total: 0,
  last_page: 1,
  role_counts: {},
};

const userFields = [
  {
    name: "name",
    label: "Nama Lengkap",
    type: "text",
    fullWidth: true,
    placeholder: "Masukkan nama lengkap",
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    fullWidth: true,
    placeholder: "Masukkan username",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    fullWidth: true,
    placeholder: "Masukkan email",
  },
  {
    name: "rolename",
    label: "Role",
    type: "select",
    fullWidth: true,
    placeholder: "Pilih role",
    options: ROLE_OPTIONS,
  },
  {
    name: "password",
    label: "Masukkan password",
    type: "password",
    fullWidth: true,
    placeholder: "Minimal 8 karakter",
  },
  
];
const editUserFields = userFields.filter((field) => field.name !== "password");
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

function UsersPage() {
  const { role } = useAppStore();
  const canEdit = ["admin", "administrator"].includes(
    role?.toLowerCase()?.trim(),
  );

  const { alertState, showAlert, closeAlert } = useToastAlert();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // ---- Data (TanStack Query) ----
  const usersQuery = useUsers({
    page,
    perPage: PAGE_SIZE,
    search,
    role: roleFilter,
    status: statusFilter,
  });
  const createUser = useCreateUser();
  const editUser = useEditUser();
  const deleteUser = useDeleteUser();
  const setUserStatus = useSetUserStatus();

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta ?? EMPTY_META;
  const latestUsers = usersQuery.data?.latestUsers ?? [];
  const loading = usersQuery.isFetching;
  const deletingUser = deleteUser.isPending; // v4: isLoading

  // Alert error saat load gagal
  useEffect(() => {
  if (usersQuery.error)
    showAlert(
      "error",
      getErrorMessage(usersQuery.error, "Gagal memuat data pengguna"),
    );
}, [usersQuery.error, showAlert]);

  // Kalau halaman saat ini melebihi last_page (mis. setelah hapus data terakhir)
  useEffect(() => {
    const lastPage = usersQuery.data?.meta?.last_page;
    if (lastPage && page > lastPage) setPage(Math.max(1, lastPage));
  }, [usersQuery.data, page]);

  const totalPages = Math.max(1, meta.last_page || 1);
  const roleCounts = meta.role_counts || {};
  const totalUsersByRole = Object.values(roleCounts).reduce(
    (total, count) => total + Number(count),
    0,
  );

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // ---- Handlers ----
  const handleDelete = async () => {
  if (!userToDelete) return;

  const userName = userToDelete.name || "pengguna";

  try {
    await deleteUser.mutateAsync(userToDelete.id);
    setUserToDelete(null);
    showAlert("success", `Pengguna “${userName}” berhasil dihapus`);
  } catch (error) {
    setUserToDelete(null);
    showAlert("error", getErrorMessage(error, "Gagal menghapus pengguna"));
  }
};

const toggleUserStatus = async (user) => {
  const isActive = user.status === "active";

  try {
    await setUserStatus.mutateAsync({
      id: user.id,
      status: isActive ? "inactive" : "active",
    });
    showAlert(
      "success",
      `Akun “${user.name}” berhasil ${isActive ? "dinonaktifkan" : "diaktifkan"}`,
    );
  } catch (error) {
    showAlert(
      "error",
      getErrorMessage(
        error,
        `Gagal ${isActive ? "menonaktifkan" : "mengaktifkan"} akun`,
      ),
    );
  }
};

  const columns = [
    { header: "No", render: (_, index) => (page - 1) * PAGE_SIZE + index + 1 },
    {
      header: "Nama Lengkap",
      render: (user) => (
        <div className="flex min-w-36 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[10px] font-bold text-white">
            {initials(user.name)}
          </span>
          <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
            {user.name}
          </span>
        </div>
      ),
    },
    {
      header: "Username",
      render: (user) => (
        <span className="text-slate-500 dark:text-slate-400">
          {user.username}
        </span>
      ),
    },
    {
      header: "Email",
      render: (user) => (
        <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">
          {user.email}
        </span>
      ),
    },
    {
      header: "Role",
      render: (user) => {
        const style = ROLE_STYLES[user.rolename] || ROLE_STYLES.Viewer;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold ${style.badge}`}
          >
            <Icon icon={style.icon} width={12} />
            {user.rolename}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (user) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${user.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {user.status === "active" ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      header: "Aksi",
      render: (user) => {
        const isActive = user.status === "active";

        return (
          <div className="flex items-center gap-2">
            <ActionButton
              row={user}
              action={{
                key: "status",
                label: isActive ? "Nonaktifkan pengguna" : "Aktifkan pengguna",
                icon: isActive ? UserMinusIcon : UserPlusIcon,
                onClick: () => toggleUserStatus(user),
              }}
            />
            <ActionButton
              row={user}
              action={{
                key: "update",
                label: "Edit pengguna",
                onClick: () => {
                  setEditData(user);
                  setOpenEditModal(true);
                },
              }}
            />
            <ActionButton
              row={user}
              action={{
                key: "delete",
                label: "Hapus pengguna",
                onClick: () => setUserToDelete(user),
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-shell">
      {alertState.show ? (
        <Alert
          key={alertState.id}
          mode="absolute"
          type={alertState.type}
          title={alertState.title}
          description={alertState.description}
          duration={4000}
          className="!z-[10000]"
          onClose={closeAlert}
        />
      ) : null}
      <div className="page-container space-y-5">
        <PageHeader
          eyebrow={
            <>
              <Icon icon="lucide:users-round" />
              Manajemen Pengguna
            </>
          }
          title="Manajemen Pengguna"
          description="Kelola akun pengguna dan hak akses sesuai peran masing-masing."
        />

        <div className="grid grid-cols-1 items-start gap-3 2xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* =========================================
              CARD DAFTAR PENGGUNA
          ========================================== */}
          <Card padding={false} className="min-w-0 overflow-hidden">
            {/* HEADER + BUTTON */}
            <div className="border-b border-[var(--border)] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="surface-card__title">Daftar Pengguna</h2>

                  <p className="surface-card__description">
                    Kelola akun pengguna dan hak akses sesuai peran.
                  </p>
                </div>

                {/* TAMBAH PENGGUNA */}
                {canEdit && (
                  <Button size="medium" onClick={() => setOpenModal(true)}>
                    <Icon icon="lucide:plus" width={15} height={15} />
                    <span>Tambah User</span>
                  </Button>
                )}
              </div>

              {/* =========================================
                  FILTER
              ========================================== */}
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* SEARCH */}
                <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 sm:col-span-2 lg:col-span-2">
                  <Icon
                    icon="lucide:search"
                    width={15}
                    className="shrink-0 text-[var(--text-low-emphasis)]"
                  />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nama, username, atau email..."
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-[var(--text-high-emphasis)] shadow-none outline-none ring-0 placeholder:text-[var(--text-low-emphasis)] focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0"
                  />
                </label>

                {/* ROLE */}
                <Dropdown
                  value={roleFilter || undefined}
                  onChange={(option) => {
                    setRoleFilter(option?.value ?? "");
                    setPage(1);
                  }}
                  placeholder="Semua Role"
                  options={[
                    { value: "", label: "Semua Role" },
                    ...ROLE_OPTIONS,
                  ]}
                />

                {/* STATUS */}
                <Dropdown
                  value={statusFilter || undefined}
                  onChange={(option) => {
                    setStatusFilter(option?.value ?? "");
                    setPage(1);
                  }}
                  placeholder="Semua Status"
                  options={[
                    { value: "", label: "Semua Status" },
                    { value: "active", label: "Aktif" },
                    { value: "inactive", label: "Nonaktif" },
                  ]}
                />
              </div>
            </div>

            {/* =========================================
                TABLE
            ========================================== */}
            <div className="min-w-0 p-4">
              <div className="min-w-0 overflow-hidden">
                <Table
                  columns={columns}
                  data={users}
                  loading={loading}
                  selectable={false}
                  variant="compact"
                  emptyMessage="Tidak ada pengguna yang cocok dengan filter."
                />
              </div>

              {/* =========================================
                  PAGINATION
              ========================================== */}
              <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center">
                {/* INFO DATA */}
                <span className="text-[10px] text-[var(--text-low-emphasis)]">
                  Menampilkan {meta.total ? (page - 1) * PAGE_SIZE + 1 : 0}–
                  {Math.min(page * PAGE_SIZE, meta.total)} dari {meta.total}{" "}
                  pengguna
                </span>

                {/* PAGINATION KANAN */}
                <div className="ml-auto shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    disabled={loading}
                    onPageChange={(nextPage) =>
                      setPage(Math.max(1, Math.min(totalPages, nextPage)))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* =========================================
              SIDEBAR RINGKASAN
          ========================================== */}
          <aside className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
            {/* RINGKASAN ROLE */}
            <Card>
              <h2 className="surface-card__title mb-4">Ringkasan Role</h2>

              <div className="space-y-4">
                {ROLE_OPTIONS.map(({ value }) => {
                  const roleUsers = roleCounts[value.toLowerCase()] || 0;

                  const percent = totalUsersByRole
                    ? Math.round((roleUsers / totalUsersByRole) * 100)
                    : 0;

                  const style = ROLE_STYLES[value];

                  return (
                    <div key={value}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONES[style.tone]}`}
                        >
                          <Icon icon={style.icon} width={17} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-semibold">{value}</span>

                            <span className="text-[var(--text-low-emphasis)]">
                              {percent}%
                            </span>
                          </div>

                          <p className="text-[9px] text-[var(--text-low-emphasis)]">
                            {roleUsers} pengguna
                          </p>
                        </div>
                      </div>

                      <div className="ml-11 mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            value === "Admin"
                              ? "bg-sky-500"
                              : value === "Operator"
                                ? "bg-amber-400"
                                : "bg-violet-500"
                          }`}
                          style={{
                            width: `${percent}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* PENGGUNA TERBARU */}
            <Card>
              <h2 className="surface-card__title mb-3">Pengguna Terbaru</h2>

              {latestUsers.length ? (
                <div className="divide-y divide-[var(--border)]">
                  {latestUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2.5 py-2.5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-[9px] font-bold text-white">
                        {initials(user.name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold">
                          {user.name}
                        </p>

                        <p className="truncate text-[9px] text-[var(--text-low-emphasis)]">
                          {user.rolename} ·{" "}
                          {user.status === "active" ? "Aktif" : "Nonaktif"}
                        </p>
                      </div>

                      <Icon
                        icon="lucide:chevron-right"
                        width={14}
                        className="text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[var(--text-low-emphasis)]">
                  Belum ada pengguna.
                </p>
              )}
            </Card>
          </aside>
        </div>
      </div>

      <FormModal
        title="Tambah Pengguna"
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        fields={userFields}
        onSubmit={async (data) => {
          try {
            const result = await createUser.mutateAsync(data);
            setOpenModal(false);
            showAlert(
              "success",
              `Pengguna “${result?.data?.name || data.name}” berhasil ditambahkan`,
            );
          } catch (error) {
            showAlert("error", getErrorMessage(error, "Gagal menambahkan pengguna"));
          }
        }}
      />

      <FormModal
        title="Edit Pengguna"
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setEditData(null);
        }}
        fields={editUserFields}
        initialData={editData}
        onSubmit={async (data) => {
          try {
            const result = await editUser.mutateAsync({ id: editData.id, data });
            setOpenEditModal(false);
            setEditData(null);
            showAlert(
              "success",
              `Data pengguna “${result?.data?.name || editData.name}” berhasil diperbarui`,
            );
          } catch (error) {
            showAlert("error", getErrorMessage(error, "Gagal memperbarui pengguna"));
          }
        }}
      />

      <ModalConfirm
        open={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Pengguna"
        description={`Yakin ingin menghapus akun ${userToDelete?.name || "pengguna ini"}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Pengguna"
        loading={deletingUser}
        variant="danger"
      />
    </div>
  );
}

export default UsersPage;
