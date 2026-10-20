import { Icon } from "@iconify/react";

export const ACTION_META = {
  login: { label: "Login", icon: "lucide:log-in", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  logout: { label: "Logout", icon: "lucide:log-out", badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  login_failed: { label: "Login Gagal", icon: "lucide:shield-alert", badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
  create: { label: "Tambah", icon: "lucide:plus-circle", badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" },
  update: { label: "Ubah", icon: "lucide:square-pen", badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  delete: { label: "Hapus", icon: "lucide:trash-2", badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
  status: { label: "Status Akun", icon: "lucide:user-cog", badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" },
  upload: { label: "Unggah", icon: "lucide:upload", badge: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300" },
  download: { label: "Unduh", icon: "lucide:download", badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
  export: { label: "Ekspor", icon: "lucide:file-down", badge: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" },
  reset_password: { label: "Reset Password", icon: "lucide:key-round", badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" },
};

const FALLBACK = {
  icon: "lucide:activity",
  badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export const getActionLabel = (action) => ACTION_META[action]?.label || action;

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export function ActionBadge({ action }) {
  const meta = ACTION_META[action] || { ...FALLBACK, label: action };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${meta.badge}`}
    >
      <Icon icon={meta.icon} width={12} />
      {meta.label}
    </span>
  );
}

// compact = true untuk widget dashboard (tanpa kolom No dan IP)
export function getActivityColumns({ compact = false, offset = 0 } = {}) {
  const columns = [];

  if (!compact) {
    columns.push({ header: "No", render: (_, index) => offset + index + 1 });
  }

  columns.push(
    {
      header: "Waktu",
      render: (log) => (
        <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">
          {formatDateTime(log.created_at)}
        </span>
      ),
    },
    {
      header: "Pengguna",
      render: (log) => (
        <div className="min-w-28">
          <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
            {log.user?.name || "Sistem"}
          </p>
          {log.user?.username ? (
            <p className="truncate text-[10px] text-[var(--text-low-emphasis)]">
              @{log.user.username}
            </p>
          ) : null}
        </div>
      ),
    },
    { header: "Aksi", render: (log) => <ActionBadge action={log.action} /> },
    {
      header: "Deskripsi",
      render: (log) => (
        <span
          className={`block text-slate-600 dark:text-slate-300 ${compact ? "max-w-64 truncate" : "min-w-56 max-w-md"}`}
          title={log.description}
        >
          {log.description}
        </span>
      ),
    },
  );

  if (!compact) {
    columns.push({
      header: "IP Address",
      render: (log) => (
        <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">
          {log.ip_address || "-"}
        </span>
      ),
    });
  }

  return columns;
}