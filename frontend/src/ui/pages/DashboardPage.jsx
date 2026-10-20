import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummaryService,
  getAllAssetsService,
} from "../../services/assets/assets";
import Table from "../../components/table/Table";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Badge from "../../components/badge/Badge";
import Button from "../../components/button/Button";
import WelcomeBanner from "../../components/banner/WelcomeBanner";
import RecentActivityCard from "../../components/activity/RecentActivityCard";

const colors = ["#1688ed", "#0bbd9a", "#ffbd43", "#a78bfa", "#94a3b8"];

function getCompletenessBadgeClass(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value === "lengkap")
    return "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
  if (value === "belum lengkap")
    return "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
  return "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
}

function StatCard({ title, value, note, icon, tone, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
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
      <Icon
        icon="lucide:chevron-right"
        width={16}
        className="shrink-0 text-slate-300 transition group-hover:text-sky-500"
      />
    </button>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <Card className={className}>
      <div className="surface-card__header">
        <h2 className="surface-card__title">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getDashboardSummaryService(), getAllAssetsService()])
      .then(([summaryResult, assetResult]) => {
        if (!active) return;
        setSummary(summaryResult.data);
        setAssets(assetResult.data || []);
      })
      .catch(
        (error) =>
          active &&
          setLoadError(error?.message || "Data dashboard tidak dapat dimuat."),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const statusEntries = Object.entries(summary?.byOwnership || {});
  const locationEntries = useMemo(() => {
    const grouped = {};
    assets.forEach((asset) => {
      const name = asset.kecamatan || "Belum diisi";
      grouped[name] = (grouped[name] || 0) + 1;
    });
    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  }, [assets]);
  const attentionAssets = useMemo(
    () =>
      assets
        .filter(
          (asset) =>
            asset.completeness_status !== "Lengkap" ||
            (asset.permasalahan &&
              asset.permasalahan.toLowerCase() !== "tidak ada"),
        )
        .slice(0, 5),
    [assets],
  );
  const recentAssets = useMemo(
    () =>
      [...assets]
        .sort(
          (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0),
        )
        .slice(0, 5),
    [assets],
  );
  const assetColumns = [
    { header: "No", render: (_, index) => index + 1 },
    { header: "Register", render: (asset) => asset.register || "-" },
    {
      header: "Nama/Jenis Barang",
      render: (asset) => (
        <button
          onClick={() => navigate(`/assets/${asset.id}`)}
          className="max-w-56 truncate text-left text-xs font-semibold text-[var(--text-high-emphasis)] hover:text-[var(--text-active)]"
        >
          {asset.lokasi || asset.nama_jenis_barang}
        </button>
      ),
    },
    { 
      header: "Kecamatan", 
      render: (asset) => asset.kecamatan || "-" 
    },
    {
      header: "Kelengkapan",
      render: (asset) => {
        const status = asset.completeness_status || "Belum Lengkap";

        return (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getCompletenessBadgeClass(
              status,
            )}`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-container space-y-5">
        {/* <PageHeader title="Dashboard" description={`Sistem Informasi Manajemen Aset Tanah · ${roleLabel}`}  /> */}
        <WelcomeBanner />
        {loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-300">
            {loadError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Aset Tanah"
            value={
              loading ? "—" : summary?.totalAssets?.toLocaleString("id-ID")
            }
            note="Aset terdaftar"
            icon="lucide:land-plot"
            tone="bg-blue-50 text-blue-500 dark:bg-blue-500/10"
            onClick={() => navigate("/assets")}
          />
          <StatCard
            title="Dokumen Tersedia"
            value={
              loading ? "—" : summary?.totalDocuments?.toLocaleString("id-ID")
            }
            note="Dokumen digital tersimpan"
            icon="lucide:files"
            tone="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
            onClick={() => navigate("/assets")}
          />
          <StatCard
            title="Sebagian Lengkap"
            value={
              loading
                ? "—"
                : summary?.docIncompleteCount?.toLocaleString("id-ID")
            }
            note="Perlu dilengkapi"
            icon="lucide:file-warning"
            tone="bg-amber-50 text-amber-500 dark:bg-amber-500/10"
            onClick={() => navigate("/assets")}
          />
          <StatCard
            title="Ada Permasalahan"
            value={
              loading ? "—" : summary?.problemCount?.toLocaleString("id-ID")
            }
            note="Aset dengan catatan masalah"
            icon="lucide:triangle-alert"
            tone="bg-rose-50 text-rose-500 dark:bg-rose-500/10"
            onClick={() => navigate("/assets")}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <Panel title="Status Kelengkapan" className="xl:col-span-4">
            <div className="space-y-4">
              {[
                ["Lengkap", summary?.docCompleteCount || 0, "bg-emerald-500"],
                [
                  "Sebagian Lengkap",
                  summary?.docIncompleteCount || 0,
                  "bg-amber-500",
                ],
              ].map(([label, count, tone]) => (
                <div key={label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-[var(--text-medium-emphasis)]">
                      {label}
                    </span>
                    <strong>{count}</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full ${tone} rounded-full`}
                      style={{
                        width: `${summary?.totalAssets ? Math.min(100, (count / summary.totalAssets) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Status Tanah" className="xl:col-span-4">
            <div className="space-y-2.5">
              {statusEntries.slice(0, 6).map(([label, count], index) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colors[index % colors.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[var(--text-medium-emphasis)]">
                    {label}
                  </span>
                  <strong>{count}</strong>
                </div>
              ))}
              {!statusEntries.length && (
                <p className="text-xs text-[var(--text-low-emphasis)]">
                  Belum ada data.
                </p>
              )}
            </div>
          </Panel>
          <Panel title="Progres BPN" className="xl:col-span-4">
            <div className="space-y-2.5">
              {(summary?.byBpnProgress || []).slice(0, 6).map((row, index) => (
                <div
                  key={row.progres_bpn || index}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colors[index % colors.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[var(--text-medium-emphasis)]">
                    {row.progres_bpn || "Belum diisi"}
                  </span>
                  <strong>{row.count}</strong>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <Panel
            title="Aset yang Perlu Diperhatikan"
            className="xl:col-span-8"
            action={
              <button onClick={() => navigate("/assets")} className="btn-ghost">
                Lihat semua <Icon icon="lucide:arrow-up-right" width={14} />
              </button>
            }
          >
            <Table
              columns={assetColumns}
              data={attentionAssets}
              loading={loading}
              selectable={false}
              variant="compact"
              emptyMessage="Tidak ada aset yang perlu diperhatikan."
            />
          </Panel>
          <Panel title="Lokasi Aset Terbanyak" className="xl:col-span-4">
            <div className="space-y-4">
              {locationEntries.slice(0, 6).map(([location, count], index) => (
                <div
                  key={location}
                  className="flex items-center gap-3 text-[10px]"
                >
                  <span className="w-24 truncate text-[var(--text-medium-emphasis)]">
                    {location}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(8, (count / (locationEntries[0]?.[1] || 1)) * 100)}%`,
                        background: colors[index % colors.length],
                      }}
                    />
                  </span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
              {!locationEntries.length && (
                <p className="text-xs text-[var(--text-low-emphasis)]">
                  Data lokasi belum tersedia.
                </p>
              )}
            </div>
          </Panel>
        </div>

        <Panel
          title="Aset Terbaru"
          action={
            <button onClick={() => navigate("/assets")} className="btn-ghost">
              Lihat semua <Icon icon="lucide:arrow-up-right" width={14} />
            </button>
          }
        >
          {recentAssets.length ? (
            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              {/* Header kolom (disembunyikan di mobile) */}
              <div className="hidden grid-cols-[2.5fr_1.5fr_1.2fr_1.2fr_1fr_auto] items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-low-emphasis)] md:grid">
                <span>Nama / Lokasi</span>
                <span>Register</span>
                <span>Kecamatan</span>
                <span>Status Tanah</span>
                <span>Tahun</span>
                <span className="w-4" />
              </div>

              <div className="divide-y divide-[var(--border)]">
                {recentAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="group grid w-full grid-cols-1 items-center gap-1 px-4 py-3 text-left transition hover:bg-[var(--accent-bg)] md:grid-cols-[2.5fr_1.5fr_1.2fr_1.2fr_1fr_auto] md:gap-3"
                  >
                    {/* Nama / Lokasi */}
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                        <Icon icon="lucide:land-plot" width={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-[var(--text-high-emphasis)]">
                          {asset.lokasi || asset.nama_jenis_barang || "-"}
                        </span>
                        <span className="block truncate text-[10px] text-[var(--text-low-emphasis)]">
                          {asset.nama_jenis_barang || "-"}
                        </span>
                      </span>
                    </span>

                    <span className="truncate text-xs text-[var(--text-medium-emphasis)]">
                      <span className="mr-1 text-[10px] text-[var(--text-low-emphasis)] md:hidden">Reg.</span>
                      {asset.register || "-"}
                    </span>

                    <span className="truncate text-xs text-[var(--text-medium-emphasis)]">
                      {asset.kecamatan || "-"}
                    </span>

                    <span className="truncate text-xs text-[var(--text-medium-emphasis)]">
                      {asset.status_tanah || "-"}
                    </span>

                    <span className="text-xs tabular-nums text-[var(--text-medium-emphasis)]">
                      {asset.tahun_pengadaan || "-"}
                    </span>

                    <Icon
                      icon="lucide:chevron-right"
                      width={16}
                      className="hidden shrink-0 text-slate-300 transition group-hover:text-sky-500 md:block"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-[var(--text-low-emphasis)]">
              Belum ada aset.
            </p>
          )}
        </Panel>
        
        <RecentActivityCard />

      </div>
    </div>
  );
}
