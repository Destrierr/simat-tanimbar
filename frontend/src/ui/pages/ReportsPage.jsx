import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Table from "../../components/table/Table";
import Alert from "../../components/alert/Alert";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Dropdown from "../../components/dropdown/Dropdown";
import { useAlert } from "../../hooks/useAlert";
import useAppStore from "../../stores/useAppStore";
import { getAllKecamatanService } from "../../services/kecamatan";
import {
  getReportAssetsService,
  getReportSummaryService,
  downloadReport,
} from "../../services/reports";
import Pagination from "../../components/pagination/Pagination";

export default function ReportsPage() {
  const { role } = useAppStore();
  const { alert, showAlert } = useAlert();
  const canExport = ["admin", "operator"].includes(role);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [kecamatanOptions, setKecamatanOptions] = useState([]);
  const [reportMeta, setReportMeta] = useState({ total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const initialFilters = {
    search: "",
    kecamatan: "",
    status_tanah: "",
    tahun_pengadaan: "",
    progres_bpn: "",
    completeness: "",
  };
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    setLoading(true);
    try {
      const [summaryResult, reportResult] = await Promise.all([
        getReportSummaryService(),
        getReportAssetsService({ ...filters, per_page: pageSize, page }),
      ]);
      setSummary(summaryResult.data);
      setRows(reportResult.data || []);
      setReportMeta(
        reportResult.meta || {
          total: (reportResult.data || []).length,
          last_page: 1,
        },
      );
    } catch (error) {
      showAlert("error", error?.message || "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [filters, page]);

  useEffect(() => {
    getAllKecamatanService()
      .then(({ data }) => {
        setKecamatanOptions(
          data.map((item) => ({ value: item.nama, label: item.nama })),
        );
      })
      .catch((error) => {
        showAlert("error", error?.message || "Gagal memuat data kecamatan");
      });
  }, []);

  const set = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPage(1);
  };
  const exportFile = async (format) => {
    try {
      const blob = await downloadReport(format, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-aset-tanah.${format === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert("error", error?.message || `Gagal mengekspor ${format}`);
    }
  };

  const totalPages = Math.max(1, reportMeta.last_page || 1);
  const statusOptions = (summary?.by_status_tanah || [])
    .map((row) => row.status_tanah)
    .filter(Boolean);
  const progressOptions = (summary?.by_progres_bpn || [])
    .map((row) => row.progres_bpn)
    .filter(Boolean);

  const columns = [
    {
      header: "No",
      render: (_, index) => (page - 1) * pageSize + index + 1,
    },
    { header: "Kode Barang", render: (asset) => asset.kode_barang || "-" },
    { header: "Register", render: (asset) => asset.register || "-" },
    {
      header: "Nama/Jenis Barang",
      render: (asset) => asset.lokasi || asset.nama_jenis_barang || "-",
    },
    { header: "Kecamatan", render: (asset) => asset.kecamatan || "-" },
    { header: "Status Tanah", render: (asset) => asset.status_tanah || "-" },
    {
      header: "Dokumen",
      render: (asset) => `${asset.document_count || 0} tersimpan`,
    },
    { header: "Progres BPN", render: (asset) => asset.progres_bpn || "-" },
    {
      header: "Kelengkapan",
      render: (asset) => (
        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300">
          {asset.completeness?.status || "Belum Lengkap"}
        </span>
      ),
    },
  ];

  return (
    <div className="page-shell">
      {alert.show ? <Alert type={alert.type} message={alert.message} /> : null}
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
          actions={
            canExport ? (
              <>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => exportFile("pdf")}
                >
                  PDF
                </Button>
                <Button size="small" onClick={() => exportFile("excel")}>
                  Excel
                </Button>
              </>
            ) : null
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            [
              "Total Aset",
              summary?.total_assets || 0,
              "Aset terdaftar",
              "lucide:land-plot",
              "bg-blue-50 text-blue-500 dark:bg-blue-500/10",
            ],
            [
              "Total Dokumen",
              summary?.total_documents || 0,
              "Dokumen digital tersimpan",
              "lucide:files",
              "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
            ],
            [
              "Lengkap",
              summary?.complete || 0,
              "Field wajib terpenuhi",
              "lucide:file-check-2",
              "bg-teal-50 text-teal-500 dark:bg-teal-500/10",
            ],
            [
              "Belum Lengkap",
              (summary?.incomplete || 0) + (summary?.partially_complete || 0),
              "Perlu dilengkapi",
              "lucide:file-warning",
              "bg-amber-50 text-amber-500 dark:bg-amber-500/10",
            ],
            [
              "Ada Masalah",
              summary?.with_problems || 0,
              "Aset dengan catatan masalah",
              "lucide:triangle-alert",
              "bg-rose-50 text-rose-500 dark:bg-rose-500/10",
            ],
          ].map(([label, value, note, icon, tone]) => (
            <div
              key={label}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon icon={icon} width={21} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold text-[var(--text-medium-emphasis)]">
                  {label}
                </span>
                <strong className="mt-0.5 block text-2xl font-extrabold text-[var(--text-high-emphasis)]">
                  {Number(value).toLocaleString("id-ID")}
                </strong>
                <span className="mt-1 block truncate text-[10px] text-[var(--text-low-emphasis)]">
                  {note}
                </span>
              </span>
              <Icon
                icon="lucide:chevron-right"
                width={16}
                className="shrink-0 text-slate-300"
              />
            </div>
          ))}
        </div>

        <Card padding={false} className="overflow-hidden p-4">
          <div className="border-b border-[var(--border)] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="surface-card__title">Filter Laporan</h2>
                <p className="surface-card__description">
                  {reportMeta.total.toLocaleString("id-ID")} baris tersedia
                </p>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 sm:col-span-2 lg:col-span-2">
                <Icon
                  icon="lucide:search"
                  width={16}
                  className="shrink-0 text-[var(--text-low-emphasis)]"
                />
                <input
                  value={filters.search}
                  onChange={(event) => set("search", event.target.value)}
                  placeholder="Cari nama, kode, register..."
                  className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-high-emphasis)] outline-none placeholder:text-[var(--text-low-emphasis)]"
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

          {reportMeta.total > 0 ? (
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center">
              <span className="text-[10px] text-[var(--text-low-emphasis)]">
                Menampilkan{" "}
                {Math.min((page - 1) * pageSize + 1, reportMeta.total)}
                {" - "}
                {Math.min(page * pageSize, reportMeta.total)} dari{" "}
                {reportMeta.total.toLocaleString("id-ID")} laporan
              </span>

              <div className="ml-auto shrink-0">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalData={reportMeta.total}
                  onChange={(nextPage) =>
                    setPage(Math.max(1, Math.min(totalPages, nextPage)))
                  }
                  compact
                />
              </div>
            </div>
          ) : null}
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card>
            <h2 className="surface-card__title mb-3">Status Tanah</h2>
            {(summary?.by_status_tanah || []).length ? (
              (summary.by_status_tanah || []).map((row) => (
                <div
                  key={row.status_tanah}
                  className="flex justify-between border-b border-[var(--border)] py-2.5 text-xs last:border-0"
                >
                  <span className="text-[var(--text-medium-emphasis)]">
                    {row.status_tanah || "Belum diisi"}
                  </span>
                  <strong>{row.count}</strong>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-low-emphasis)]">
                Belum ada data.
              </p>
            )}
          </Card>
          <Card>
            <h2 className="surface-card__title mb-3">Progres BPN</h2>
            {(summary?.by_progres_bpn || []).length ? (
              (summary.by_progres_bpn || []).map((row) => (
                <div
                  key={row.progres_bpn}
                  className="flex justify-between border-b border-[var(--border)] py-2.5 text-xs last:border-0"
                >
                  <span className="text-[var(--text-medium-emphasis)]">
                    {row.progres_bpn || "Belum diisi"}
                  </span>
                  <strong>{row.count}</strong>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--text-low-emphasis)]">
                Belum ada data.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
