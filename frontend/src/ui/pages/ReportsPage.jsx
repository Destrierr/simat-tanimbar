import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Table from "../../components/table/Table";
import Alert from "../../components/alert/Alert";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Dropdown from "../../components/dropdown/Dropdown";
import Pagination from "../../components/pagination/Pagination";
import { getErrorMessage, useToastAlert } from "../../hooks/useToastAlert";
import {
  useExportReport,
  useReportAssets,
  useReportSummary,
} from "../../hooks/useReports";
import { useKecamatanOptions } from "../../hooks/useKecamatan";
import useAppStore from "../../stores/useAppStore";

function getCompletenessBadgeClass(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value === "lengkap")
    return "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
  if (value === "belum lengkap")
    return "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
  return "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
}

function StatCard({ title, value, note, icon, tone }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon icon={icon} width={21} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold text-[var(--text-medium-emphasis)]">
          {title}
        </span>
        <span className="mt-0.5 block text-2xl font-extrabold tracking-tight text-[var(--text-high-emphasis)]">
          {value}
        </span>
        <span className="mt-1 block truncate text-[10px] text-[var(--text-low-emphasis)]">
          {note}
        </span>
      </span>
    </div>
  );
}

const textCell = (value, extra = "") => (
  <span className={`whitespace-nowrap text-slate-600 dark:text-slate-300 ${extra}`}>
    {value || "-"}
  </span>
);

const longTextCell = (value) => (
  <span
    className="block max-w-52 truncate text-slate-600 dark:text-slate-300"
    title={value || ""}
  >
    {value || "-"}
  </span>
);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatRupiah = (value) =>
  value || value === 0
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)
    : "-";

const formatCoordinate = (asset) =>
  asset.latitude && asset.longitude ? `${asset.latitude}, ${asset.longitude}` : "-";

const initialFilters = {
  search: "",
  kecamatan: "",
  status_tanah: "",
  tahun_pengadaan: "",
  progres_bpn: "",
  completeness: "",
};

const pageSize = 10;

export default function ReportsPage() {
  const navigate = useNavigate();
  const { role } = useAppStore();
  const { alertState, showAlert, closeAlert } = useToastAlert();
  const normalizedRole = role?.toLowerCase().replace(/\s+/g, "").trim();
  const canExport = ["admin", "administrator", "operator"].includes(normalizedRole);

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);

  // ---- Data (TanStack Query) ----
  const summaryQuery = useReportSummary();
  const reportQuery = useReportAssets({ filters, page, pageSize });
  const { data: kecamatanOptions = [], error: kecamatanError } =
    useKecamatanOptions();
  const exportMutation = useExportReport({
    onError: (message) => showAlert("error", message),
  });

  const summary = summaryQuery.data ?? null;
  const rows = reportQuery.data?.data ?? [];
  const reportMeta = reportQuery.data?.meta ?? {};
  const totalRows = reportMeta.total ?? rows.length;
  const totalPages = Math.max(1, reportMeta.last_page || 1);
  const loading = reportQuery.isFetching;

  // ---- Alert error ----
    useEffect(() => {
      if (summaryQuery.error)
        showAlert("error", getErrorMessage(summaryQuery.error, "Gagal memuat ringkasan"));
    }, [summaryQuery.error, showAlert]);

    useEffect(() => {
      if (reportQuery.error)
        showAlert("error", getErrorMessage(reportQuery.error, "Gagal memuat laporan"));
    }, [reportQuery.error, showAlert]);

    useEffect(() => {
      if (kecamatanError)
        showAlert("error", getErrorMessage(kecamatanError, "Gagal memuat data kecamatan"));
    }, [kecamatanError, showAlert]);

  // ---- Handlers ----
  const set = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const exportFile = (format) => exportMutation.mutate({ format, filters });

  const statusOptions = (summary?.by_status_tanah || [])
    .map((row) => row.status_tanah)
    .filter(Boolean);
  const progressOptions = (summary?.by_progres_bpn || [])
    .map((row) => row.progres_bpn)
    .filter(Boolean);

  // ---- Kolom tabel (sama dengan halaman aset) ----
  const columns = [
    { header: "No", render: (_, index) => (page - 1) * pageSize + index + 1 },
    {
      header: "Nama / Jenis Barang",
      render: (asset) => (
        <div className="max-w-52">
          <button
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="block max-w-full truncate text-left font-semibold text-slate-700 hover:text-sky-600 dark:text-slate-200"
            title={asset.nama_jenis_barang}
          >
            {asset.nama_jenis_barang || "-"}
          </button>
        </div>
      ),
    },
    { header: "Kode Barang", render: (asset) => textCell(asset.kode_barang, "font-medium") },
    { header: "Register", render: (asset) => textCell(asset.register, "font-medium") },
    {
      header: "Luas (m²)",
      render: (asset) => (
        <span className="whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">
          {Number(asset.luas || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
    { header: "Tahun Pengadaan", render: (asset) => textCell(asset.tahun_pengadaan) },
    { header: "Lokasi", render: (asset) => longTextCell(asset.lokasi) },
    {
      header: "Letak / Alamat",
      render: (asset) => (
        <div className="flex max-w-52 items-start gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <Icon icon="lucide:map-pin" width={13} />
          </span>
          {longTextCell(asset.letak_alamat)}
        </div>
      ),
    },
    { header: "Kecamatan", render: (asset) => textCell(asset.kecamatan) },
    { header: "Status Tanah", render: (asset) => textCell(asset.status_tanah) },
    {
      header: "Jenis Dokumen Kepemilikan",
      render: (asset) => textCell(asset.jenis_dokumen_kepemilikan),
    },
    { header: "Nama Pemilik", render: (asset) => textCell(asset.nama_pemilik) },
    { header: "Tanggal Dokumen", render: (asset) => textCell(formatDate(asset.tanggal_dokumen)) },
    {
      header: "No. Dokumen Kepemilikan",
      render: (asset) => textCell(asset.no_dokumen_kepemilikan),
    },
    { header: "Asal Usul", render: (asset) => longTextCell(asset.asal_usul) },
    {
      header: "Harga",
      render: (asset) => (
        <span className="whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">
          {formatRupiah(asset.harga)}
        </span>
      ),
    },
    { header: "Keterangan", render: (asset) => longTextCell(asset.keterangan) },
    {
      header: "Pematokan",
      render: (asset) => (
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            asset.pematokan
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-blue-100 text-blue-500 dark:bg-blue-700 dark:text-blue-300"
          }`}
        >
          {asset.pematokan ? "Sudah" : "Belum"}
        </span>
      ),
    },
    { header: "Progres BPN", render: (asset) => textCell(asset.progres_bpn) },
    {
      header: "Permasalahan yang Dihadapi",
      render: (asset) => longTextCell(asset.permasalahan),
    },
    {
      header: "Rincian Permasalahan",
      render: (asset) => longTextCell(asset.rincian_permasalahan),
    },
    { header: "Koordinat LatLong", render: (asset) => textCell(formatCoordinate(asset)) },
    {
      header: "Link Google Maps",
      render: (asset) =>
        asset.link_google_maps ? (
          <a
            href={asset.link_google_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sky-600 hover:underline dark:text-sky-300"
          >
            <Icon icon="lucide:external-link" width={13} />
            Buka Maps
          </a>
        ) : (
          "-"
        ),
    },
    {
      header: "Kelengkapan",
      render: (asset) => {
        const status = asset.completeness?.status || "Sebagian Lengkap";
        return (
          <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getCompletenessBadgeClass(status)}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const summaryCards = [
    {
      label: "Total Aset",
      count: summary?.total_assets || 0,
      note: "Aset terdaftar",
      icon: "lucide:land-plot",
      tone: "bg-blue-50 text-blue-500 dark:bg-blue-500/10",
    },
    {
      label: "Total Dokumen",
      count: summary?.total_documents || 0,
      note: "Dokumen digital tersimpan",
      icon: "lucide:files",
      tone: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
    },
    {
      label: "Lengkap",
      count: summary?.complete || 0,
      note: "Field wajib terpenuhi",
      icon: "lucide:file-check-2",
      tone: "bg-teal-50 text-teal-500 dark:bg-teal-500/10",
    },
    {
      label: "Belum Lengkap",
      count: (summary?.incomplete || 0) + (summary?.partially_complete || 0),
      note: "Perlu dilengkapi",
      icon: "lucide:file-warning",
      tone: "bg-amber-50 text-amber-500 dark:bg-amber-500/10",
    },
    {
      label: "Ada Masalah",
      count: summary?.with_problems || 0,
      note: "Aset dengan catatan masalah",
      icon: "lucide:triangle-alert",
      tone: "bg-rose-50 text-rose-500 dark:bg-rose-500/10",
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
              <Icon icon="lucide:file" />
              Laporan & Rekapitulasi
            </>
          }
          title="Laporan & Rekapitulasi"
          description="Laporan aset, status tanah, kelengkapan dokumen, progres BPN, dan permasalahan."
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <StatCard
              key={card.label}
              title={card.label}
              value={summaryQuery.isLoading ? "—" : card.count.toLocaleString("id-ID")}
              note={card.note}
              icon={card.icon}
              tone={card.tone}
            />
          ))}
        </div>

        <Card padding={false} className="overflow-hidden p-4">
          <div className="border-b border-[var(--border)] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="surface-card__title">Filter Laporan</h2>
                <p className="surface-card__description">
                  {totalRows.toLocaleString("id-ID")} baris tersedia
                </p>
              </div>

              {canExport ? (
                <div className="mb-4 flex justify-end gap-2">
                  <Button size="medium" variant="secondary" disabled={exportMutation.isPending} onClick={() => exportFile("pdf")}>
                    <Icon icon="lucide:file-text" width={15} height={15} />
                    <span>PDF</span>
                  </Button>
                  <Button size="medium" disabled={exportMutation.isPending} onClick={() => exportFile("excel")}>
                    <Icon icon="lucide:file-spreadsheet" width={15} height={15} />
                    <span>Excel</span>
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 sm:col-span-2 lg:col-span-2">
                <Icon
                  icon="lucide:search"
                  width={16}
                  className="shrink-0 text-[var(--text-low-emphasis)]"
                />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => set("search", event.target.value)}
                  placeholder="Cari nomor register, nama aset, atau lokasi..."
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-[var(--text-high-emphasis)] shadow-none outline-none ring-0 placeholder:text-[var(--text-low-emphasis)] focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0"
                />
              </label>

              <Dropdown
                value={filters.kecamatan || undefined}
                onChange={(option) => set("kecamatan", option?.value ?? "")}
                placeholder="Semua Kecamatan"
                options={[
                  { value: "", label: "Semua Kecamatan" },
                  ...kecamatanOptions,
                ]}
              />

              <Dropdown
                value={filters.status_tanah || undefined}
                onChange={(option) => set("status_tanah", option?.value ?? "")}
                placeholder="Semua Status Tanah"
                options={[
                  { value: "", label: "Semua Status Tanah" },
                  ...statusOptions.map((status) => ({
                    value: status,
                    label: status,
                  })),
                ]}
              />

              <label className="min-w-0">
                <span className="sr-only">Tahun pengadaan</span>
                <input
                  type="number"
                  value={filters.tahun_pengadaan}
                  onChange={(event) =>
                    set("tahun_pengadaan", event.target.value)
                  }
                  placeholder="Tahun pengadaan"
                  className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-xs text-[var(--text-high-emphasis)] outline-none transition placeholder:text-[var(--text-low-emphasis)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <Dropdown
                value={filters.progres_bpn || undefined}
                onChange={(option) => set("progres_bpn", option?.value ?? "")}
                placeholder="Semua Progres BPN"
                options={[
                  { value: "", label: "Semua Progres BPN" },
                  ...progressOptions.map((progress) => ({
                    value: progress,
                    label: progress,
                  })),
                ]}
              />

              <Dropdown
                value={filters.completeness || undefined}
                onChange={(option) => set("completeness", option?.value ?? "")}
                placeholder="Semua Kelengkapan"
                options={[
                  { value: "", label: "Semua Kelengkapan" },
                  { value: "Lengkap", label: "Lengkap" },
                  { value: "Sebagian Lengkap", label: "Sebagian Lengkap" },
                  { value: "Belum Lengkap", label: "Belum Lengkap" },
                ]}
              />
            </div>
          </div>

          <div className="min-w-0 overflow-hidden">
            <Table
              columns={columns}
              data={rows}
              loading={loading}
              selectable={false}
              variant="compact"
              emptyMessage="Tidak ada data laporan."
            />
          </div>

          {totalRows > 0 ? (
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center">
              <span className="text-[10px] text-[var(--text-low-emphasis)]">
                Menampilkan {Math.min((page - 1) * pageSize + 1, totalRows)}
                {" - "}
                {Math.min(page * pageSize, totalRows)} dari{" "}
                {totalRows.toLocaleString("id-ID")} laporan
              </span>

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
          ) : null}
        </Card>
        </div>
      </div>
  );
}