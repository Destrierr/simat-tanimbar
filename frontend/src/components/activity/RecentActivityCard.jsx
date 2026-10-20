import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Card from "../card/Card";
import Table from "../table/Table";
import Button from "../button/Button";
import useAppStore from "../../stores/useAppStore";
import { useActivityLogs } from "../../hooks/useActivityLogs";
import { getActivityColumns } from "./activityColumns";

const columns = getActivityColumns({ compact: true });

export default function RecentActivityCard({ limit = 5 }) {
  const navigate = useNavigate();
  const { role } = useAppStore();
  const isAdmin = ["admin", "administrator"].includes(role?.toLowerCase()?.trim());

  const { data, isLoading, error } = useActivityLogs(
    { page: 1, per_page: limit },
    { enabled: isAdmin },
  );

  // Endpoint log hanya untuk admin
  if (!isAdmin) return null;

  const logs = data?.data ?? [];
  const goToLogs = () => navigate("/activity-logs");

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <div className="surface-card__header mb-4">
        <div className="min-w-0">
          <h2 className="surface-card__title">Log Aktivitas Terbaru</h2>
          <p className="surface-card__description">
            Aktivitas terakhir pengguna di sistem.
          </p>
        </div>
        <button onClick={goToLogs} className="btn-ghost">
              Lihat semua <Icon icon="lucide:arrow-up-right" width={14} />
            </button>
      </div>

      {error ? (
        <p className="py-6 text-center text-xs text-[var(--text-low-emphasis)]">
          Gagal memuat log aktivitas.
        </p>
      ) : isLoading ? (
        <p className="py-6 text-center text-xs text-[var(--text-low-emphasis)]">
          Memuat log aktivitas...
        </p>
      ) : logs.length === 0 ? (
        <p className="py-6 text-center text-xs text-[var(--text-low-emphasis)]">
          Belum ada aktivitas.
        </p>
      ) : (
        <div
          role="link"
          tabIndex={0}
          onClick={goToLogs}
          onKeyDown={(event) => event.key === "Enter" && goToLogs()}
          className="min-w-0 cursor-pointer overflow-hidden"
          title="Klik untuk membuka halaman log aktivitas"
        >
          <Table columns={columns} data={logs} selectable={false} />
        </div>
      )}
    </Card>
  );
}