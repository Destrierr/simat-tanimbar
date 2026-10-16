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

const colors = ["#1688ed", "#0bbd9a", "#ffbd43", "#a78bfa", "#94a3b8"];

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
    { header: "Kecamatan", render: (asset) => asset.kecamatan || "-" },
    {
      header: "Kelengkapan",
      render: (asset) => (
        <Badge
          label={asset.completeness_status || "Belum Lengkap"}
          tone={
            {
              Lengkap: "success",
              "Sebagian Lengkap": "warning",
              "Belum Lengkap": "error",
            }[asset.completeness_status] || "neutral"
          }
        />
      ),
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
            title="Belum Lengkap"
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
                  "Belum Lengkap",
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
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
            {recentAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="rounded-xl border border-[var(--border)] p-3 text-left transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]"
              >
                <span className="block truncate text-xs font-bold text-[var(--text-high-emphasis)]">
                  {asset.lokasi || asset.nama_jenis_barang}
                </span>
                <span className="mt-1 block truncate text-[10px] text-[var(--text-low-emphasis)]">
                  Reg. {asset.register || "-"} · {asset.kecamatan || "-"}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
