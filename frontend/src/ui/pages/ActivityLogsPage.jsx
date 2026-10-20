import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Table from "../../components/table/Table";
import Pagination from "../../components/pagination/Pagination";
import Alert from "../../components/alert/Alert";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Dropdown from "../../components/dropdown/Dropdown";
import { getErrorMessage, useToastAlert } from "../../hooks/useToastAlert";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useActivityLogs } from "../../hooks/useActivityLogs";
import {
  getActionLabel,
  getActivityColumns,
} from "../../components/activity/activityColumns";

const PAGE_SIZE = 15;

const INITIAL_FILTERS = {
  search: "",
  action: "",
  subject_type: "",
  date_from: "",
  date_to: "",
};

const SUBJECT_LABELS = {
  asset: "Aset",
  document: "Dokumen",
  user: "Pengguna",
  report: "Laporan",
};

const dateInputClass =
  "h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-xs text-[var(--text-high-emphasis)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

export default function ActivityLogsPage() {
  const { alertState, showAlert, closeAlert } = useToastAlert();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(filters.search);

  const { data, isFetching, error } = useActivityLogs({
    page,
    per_page: PAGE_SIZE,
    ...filters,
    search: debouncedSearch,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta ?? {};
  const total = meta.total ?? 0;
  const totalPages = Math.max(1, meta.last_page || 1);
  const actionOptions = meta.filter_options?.action ?? [];
  const subjectOptions = meta.filter_options?.subject_type ?? [];

  const hasFilter = Object.values(filters).some(Boolean);

  useEffect(() => {
    if (error) showAlert("error", getErrorMessage(error, "Gagal memuat log aktivitas"));
  }, [error, showAlert]);

  useEffect(() => {
    if (meta.last_page && page > meta.last_page) setPage(Math.max(1, meta.last_page));
  }, [meta.last_page, page]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const columns = getActivityColumns({ offset: (page - 1) * PAGE_SIZE });

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
              <Icon icon="lucide:history" />
              Log Aktivitas
            </>
          }
          title="Log Aktivitas"
          description="Riwayat aktivitas pengguna di sistem: login, perubahan data, dokumen, dan ekspor laporan."
        />

        <Card className="w-full min-w-0 overflow-hidden">
          <div className="surface-card__header mb-4">
            <div className="min-w-0">
              <h2 className="surface-card__title">Riwayat Aktivitas</h2>
              <p className="surface-card__description">
                {total.toLocaleString("id-ID")} aktivitas tercatat.
              </p>
            </div>
            {hasFilter ? (
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setFilters(INITIAL_FILTERS);
                  setPage(1);
                }}
              >
                Reset filter
              </Button>
            ) : null}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex h-10 min-w-0 items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 sm:col-span-2 lg:col-span-2">
              <Icon
                icon="lucide:search"
                width={16}
                className="mr-2 shrink-0 text-[var(--text-low-emphasis)]"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(event) => setFilter("search", event.target.value)}
                placeholder="Cari pengguna, deskripsi, atau IP..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-[var(--text-high-emphasis)] shadow-none outline-none ring-0 placeholder:text-[var(--text-low-emphasis)] focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0"
              />
            </label>

            <Dropdown
              value={filters.action || undefined}
              onChange={(option) => setFilter("action", option?.value ?? "")}
              placeholder="Semua Aksi"
              options={[
                { value: "", label: "Semua Aksi" },
                ...actionOptions.map((action) => ({
                  value: action,
                  label: getActionLabel(action),
                })),
              ]}
            />

            <Dropdown
              value={filters.subject_type || undefined}
              onChange={(option) => setFilter("subject_type", option?.value ?? "")}
              placeholder="Semua Objek"
              options={[
                { value: "", label: "Semua Objek" },
                ...subjectOptions.map((type) => ({
                  value: type,
                  label: SUBJECT_LABELS[type] || type,
                })),
              ]}
            />

            <label className="min-w-0">
              <span className="sr-only">Dari tanggal</span>
              <input
                type="date"
                value={filters.date_from}
                max={filters.date_to || undefined}
                onChange={(event) => setFilter("date_from", event.target.value)}
                className={dateInputClass}
              />
            </label>

            <label className="min-w-0">
              <span className="sr-only">Sampai tanggal</span>
              <input
                type="date"
                value={filters.date_to}
                min={filters.date_from || undefined}
                onChange={(event) => setFilter("date_to", event.target.value)}
                className={dateInputClass}
              />
            </label>
          </div>

          <div className="mt-4 min-w-0 overflow-hidden">
            <Table columns={columns} data={logs} selectable={false} />
            {!isFetching && logs.length === 0 ? (
              <p className="py-8 text-center text-xs text-[var(--text-low-emphasis)]">
                Tidak ada aktivitas yang cocok dengan filter.
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center">
            <span className="text-[10px] text-[var(--text-low-emphasis)]">
              Menampilkan {total ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, total)} dari {total.toLocaleString("id-ID")} aktivitas
            </span>

            <div className="ml-auto shrink-0">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                disabled={isFetching}
                onPageChange={(nextPage) =>
                  setPage(Math.max(1, Math.min(totalPages, nextPage)))
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}