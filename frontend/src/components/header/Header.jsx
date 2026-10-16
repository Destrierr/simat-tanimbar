import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Avatar from "../avatar/Avatar";

const roleName = (role) =>
  ({ admin: "Administrator", operator: "Operator", viewer: "Viewer" })[
    role?.toLowerCase()
  ] ||
  role ||
  "Pengguna";

export default function Header({
  title,
  status,
  onOpenSidebar,
  user,
  role,
  onOpenProfile,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(now);
  const timeLabel = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(clock);
  }, []);

  const displayName = user?.name || roleName(role);
  const avatarSrc = user?.photoprofile || undefined;

  return (
    <header className="sticky top-0 z-30 flex min-h-[85px] shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 backdrop-blur sm:px-5">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="icon-button lg:hidden"
        aria-label="Buka menu"
      >
        <Icon icon="lucide:panel-left" width={18} />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold text-[var(--text-high-emphasis)]">
          {title}
        </h2>
        {status ? (
          <div className="mt-1 hidden items-center gap-1.5 text-[10px] font-medium text-[var(--text-medium-emphasis)] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {roleName(role)}
          </div>
        ) : null}
      </div>

      <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[10px] font-medium text-[var(--text-medium-emphasis)] md:flex">
        <Icon
          icon="lucide:calendar-days"
          width={14}
          className="text-[var(--text-active)]"
        />
        <span>{dateLabel}</span>
        <span className="text-slate-300">·</span>
        <Icon
          icon="lucide:clock-3"
          width={14}
          className="text-[var(--text-active)]"
        />
        <span className="tabular-nums">{timeLabel}</span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowNotifications((value) => !value)}
          className="icon-button"
          aria-label="Notifikasi"
          aria-expanded={showNotifications}
        >
          <Icon icon="lucide:bell" width={18} />
        </button>
        {showNotifications ? (
          <div className="absolute right-0 top-12 z-50 w-[280px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Notifikasi</p>
                <p className="mt-0.5 text-[10px] text-[var(--text-low-emphasis)]">
                  Pemberitahuan terbaru
                </p>
              </div>
              <button
                type="button"
                className="icon-button h-7 w-7 border-0 bg-transparent"
                onClick={() => setShowNotifications(false)}
                aria-label="Tutup"
              >
                <Icon icon="lucide:x" width={15} />
              </button>
            </div>
            <div className="mt-5 flex flex-col items-center py-5 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--text-active)]">
                <Icon icon="lucide:bell-off" width={18} />
              </span>
              <p className="mt-3 text-xs font-semibold">Belum ada notifikasi</p>
              <p className="mt-1 text-[10px] text-[var(--text-low-emphasis)]">
                Notifikasi baru akan muncul di sini.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenProfile}
        className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-[var(--surface-muted)]"
        aria-label="Buka profil pengguna"
      >
        <Avatar name={displayName} src={avatarSrc} size="s2" />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-32 truncate text-xs font-semibold text-[var(--text-high-emphasis)]">
            {displayName}
          </span>
          <span className="block text-[10px] text-[var(--text-low-emphasis)]">
            {roleName(role)}
          </span>
        </span>
        {/* <Icon icon="lucide:chevron-down" width={14} className="hidden text-[var(--text-low-emphasis)] sm:block" /> */}
      </button>
    </header>
  );
}
