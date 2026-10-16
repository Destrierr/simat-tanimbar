import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/table/Table";
import Pagination from "../../components/pagination/Pagination";
import FormModal from "../../components/modal/FormModal";
import { ModalConfirm } from "../../components/modal/Modal";
import Alert from "../../components/alert/Alert";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Badge from "../../components/badge/Badge";
import {
  getAssetsPageService,
  createAssetService,
  editAssetService,
  deleteAssetService,
} from "../../services/assets/assets";
import useAppStore from "../../stores/useAppStore";
import { useAlert } from "../../hooks/useAlert";
import Dropdown from "../../components/dropdown/Dropdown";
import { getAllKecamatanService } from "../../services/kecamatan";

const PAGE_SIZE = 10;

const assetFields = [
  {
    name: "kode_barang",
    label: "Kode Barang",
    type: "text",
    placeholder: "cth. 01.01.01.04.002",
  },
  {
    name: "register",
    label: "Nomor Register",
    type: "text",
    placeholder: "cth. 072-2026-XX",
  },
  {
    name: "nama_jenis_barang",
    label: "Nama/Jenis Barang",
    type: "text",
    placeholder: "cth. Tanah Bangunan Pendidikan",
  },
  {
    name: "lokasi",
    label: "Nama/Lokasi Aset",
    type: "text",
    placeholder: "Masukkan nama atau lokasi aset",
  },
  {
    name: "letak_alamat",
    label: "Letak/Alamat",
    type: "text",
    placeholder: "Masukkan alamat aset",
  },
  {
    name: "kecamatan",
    label: "Kecamatan",
    type: "text",
    placeholder: "cth. Tanimbar Selatan",
  },
  {
    name: "luas",
    label: "Luas Tanah (m²)",
    type: "number",
    placeholder: "cth. 2500",
  },
  {
    name: "tahun_pengadaan",
    label: "Tahun Pengadaan",
    type: "number",
    placeholder: "cth. 2025",
  },
  {
    name: "status_tanah",
    label: "Status Tanah",
    type: "text",
    placeholder: "cth. Hak Pakai",
  },
  {
    name: "nama_pemilik",
    label: "Nama Pemilik",
    type: "text",
    placeholder: "Nama pemilik",
  },
  {
    name: "no_dokumen_kepemilikan",
    label: "Nomor Dokumen Kepemilikan",
    type: "text",
  },
  {
    name: "asal_usul",
    label: "Asal Usul",
    type: "text",
  },
  {
    name: "harga",
    label: "Harga",
    type: "number",
  },
  {
    name: "keterangan",
    label: "Keterangan",
    type: "text",
  },
  {
    name: "pematokan",
    label: "Pematokan",
    type: "select",
    options: [
      { value: "true", label: "Sudah dipatok" },
      { value: "false", label: "Belum dipatok" },
    ],
  },
  {
    name: "progres_bpn",
    label: "Progres BPN",
    type: "text",
  },
  {
    name: "permasalahan",
    label: "Permasalahan",
    type: "text",
  },
  {
    name: "rincian_permasalahan",
    label: "Rincian Permasalahan",
    type: "text",
  },
  {
    name: "link_google_maps",
    label: "Link Google Maps",
    type: "url",
    placeholder: "https://maps.google.com/...",
  },
];

function categoryStyle(category) {
  const styles = {
    Pemerintahan:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    Pendidikan:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    Kesehatan:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
    "Sarana Publik":
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
    Pertanian:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return (
    styles[category] ||
    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
  );
}

function AssetsPage() {
  const navigate = useNavigate();
  const { role } = useAppStore();
  const { alert, showAlert } = useAlert();
  const normalizedRole = role?.toLowerCase().replace(/\s+/g, "").trim();
  const canEdit = ["admin", "administrator", "operator"].includes(
    normalizedRole,
  );
  const canDelete =
    normalizedRole === "admin" || normalizedRole === "administrator";

  const [assets, setAssets] = useState([]);
  const [kecamatanOptions, setKecamatanOptions] = useState([]);
  const [assetMeta, setAssetMeta] = useState({
    current_page: 1,
    per_page: PAGE_SIZE,
    total: 0,
    last_page: 1,
    completeness_counts: {},
    filter_options: { status_tanah: [], nama_jenis_barang: [] },
  });
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({
    search: "",
    status_tanah: "",
    kecamatan: "",
    completeness: "",
    nama_jenis_barang: "",
  });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAssetsPageService({
        page,
        per_page: PAGE_SIZE,
        search: filterValues.search,
        status_tanah: filterValues.status_tanah,
        kecamatan: filterValues.kecamatan,
        nama_jenis_barang: filterValues.nama_jenis_barang,
        completeness: filterValues.completeness,
      });
      setAssets(result.data);
      setAssetMeta(result.meta);
      if (page > result.meta.last_page) {
        setPage(Math.max(1, result.meta.last_page));
      }
    } catch (err) {
      showAlert("error", err?.message || "Gagal memuat data aset");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [
    filterValues.search,
    filterValues.status_tanah,
    filterValues.kecamatan,
    filterValues.nama_jenis_barang,
    filterValues.completeness,
    page,
  ]);
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
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [filterValues]);

  const totalPages = Math.max(1, assetMeta.last_page || 1);
  const completenessCounts = assetMeta.completeness_counts || {};
  const filterOptions = assetMeta.filter_options || {};

  const handleDelete = async () => {
    if (!assetToDelete) return;

    setDeletingAsset(true);
    try {
      await deleteAssetService(assetToDelete.id);
      setSelectedIds((previous) =>
        previous.filter((selectedId) => selectedId !== assetToDelete.id),
      );
      setAssetToDelete(null);
      showAlert("success", "Aset berhasil dihapus");
      await load();
    } catch (err) {
      showAlert("error", err?.message || "Gagal menghapus aset");
    } finally {
      setDeletingAsset(false);
    }
  };

  const columns = [
    // { header: <input aria-label="Pilih semua aset pada halaman ini" onChange={toggleCurrentPage} className="h-4 w-4 rounded border-slate-300 accent-sky-600" />, render: (asset) => <input aria-label={`Pilih ${asset.lokasi}`}  onClick={(event) => event.stopPropagation()} onChange={() => toggleSelected(asset.id)} className="h-4 w-4 rounded border-slate-300 accent-sky-600" /> },
    { header: "No", render: (_, index) => (page - 1) * PAGE_SIZE + index + 1 },
    {
      header: "Kode / Register",
      render: (asset) => (
        <span
          className="whitespace-nowrap font-medium text-slate-600 dark:text-slate-300"
          title={`Kode barang: ${asset.kode_barang || "-"}`}
        >
          {asset.kode_barang || "-"}
          <span className="block text-[10px] text-slate-400">
            Reg. {asset.register}
          </span>
        </span>
      ),
    },
    {
      header: "Nama / Jenis Barang",
      render: (asset) => (
        <div className="max-w-52">
          <button
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="block max-w-full truncate text-left font-semibold text-slate-700 hover:text-sky-600 dark:text-slate-200"
          >
            {asset.lokasi}
          </button>
          <span className="block truncate text-[10px] text-slate-400">
            {asset.nama_jenis_barang}
          </span>
        </div>
      ),
    },
    {
      header: "Lokasi",
      render: (asset) => (
        <div className="flex min-w-32 items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
            <Icon icon="lucide:map-pin" width={13} />
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-slate-600 dark:text-slate-300">
              {asset.letak_alamat.split(",")[0]}
            </span>
            <span className="block whitespace-nowrap text-[10px] text-slate-400">
              {asset.kecamatan || "-"}
            </span>
          </span>
        </div>
      ),
    },
    {
      header: "Luas (m²)",
      render: (asset) => (
        <span className="whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">
          {Number(asset.luas || 0).toLocaleString("id-ID")}
          <span className="block text-[10px] text-slate-400">
            Pengadaan {asset.tahun_pengadaan || "-"}
          </span>
        </span>
      ),
    },
    {
      header: "Status Tanah",
      render: (asset) => (
        <span className="whitespace-nowrap">{asset.status_tanah || "-"}</span>
      ),
    },
    {
      header: "Dokumen",
      render: (asset) => (
        <span className="whitespace-nowrap">
          {asset.document_count} tersimpan
        </span>
      ),
    },
    {
      header: "Kategori",
      render: (asset) => (
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${categoryStyle(asset.nama_jenis_barang || "Lainnya")}`}
        >
          {asset.nama_jenis_barang || "Lainnya"}
        </span>
      ),
    },
    {
      header: "Aksi",
      render: (asset) => (
        <div className="flex items-center gap-1">
          <button
            title="Lihat detail"
            onClick={() => navigate(`/assets/${asset.id}`)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-100 text-amber-600 hover:bg-amber-50 dark:border-slate-700 dark:text-amber-300"
          >
            <Icon icon="lucide:eye" width={15} />
          </button>
          {canEdit && (
            <button
              title="Edit aset"
              onClick={() => {
                setEditData(asset);
                setOpenEditModal(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-sky-600 hover:bg-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
            >
              <Icon icon="lucide:square-pen" width={15} />
            </button>
          )}
          {canDelete && (
            <button
              title="Hapus aset"
              onClick={() => setAssetToDelete(asset)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-100 text-red-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-500/10"
            >
              <Icon icon="lucide:trash-2" width={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Aset",
      count: assetMeta.total || 0,
      note: "Aset terdaftar",
      icon: "lucide:land-plot",
      tone: "from-blue-500 to-sky-400",
      key: "",
    },
    {
      label: "Lengkap",
      count: completenessCounts["Lengkap"] || 0,
      note: "Field wajib terpenuhi",
      icon: "lucide:file-check-2",
      tone: "from-emerald-500 to-teal-400",
      key: "Lengkap",
    },
    {
      label: "Sebagian Lengkap",
      count: completenessCounts["Sebagian Lengkap"] || 0,
      note: "Masih ada data yang kurang",
      icon: "lucide:file-warning",
      tone: "from-amber-400 to-orange-300",
      key: "Sebagian Lengkap",
    },
    {
      label: "Belum Lengkap",
      count: completenessCounts["Belum Lengkap"] || 0,
      note: "Perlu dilengkapi",
      icon: "lucide:file-x-2",
      tone: "from-rose-500 to-pink-400",
      key: "Belum Lengkap",
    },
  ];
  const fieldsWithKecamatanOptions = useMemo(
    () =>
      assetFields.map((field) =>
        field.name === "kecamatan"
          ? {
              ...field,
              type: "select",
              options: kecamatanOptions,
              placeholder: "Pilih kecamatan",
              searchable: true,
            }
          : field,
      ),
    [kecamatanOptions],
  );

  return (
    <div className="page-shell">
      {alert.show ? <Alert type={alert.type} message={alert.message} /> : null}
      <div className="page-container space-y-5">
        <PageHeader
          eyebrow={
            <>
              <Icon icon="lucide:layout-grid" />
              Data Aset Tanah
            </>
          }
          title="Data Aset Tanah"
          description="Kelola seluruh data aset tanah yang dimiliki oleh BPKAD Kabupaten Kepulauan Tanimbar"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() =>
                setFilterValues((current) => ({
                  ...current,
                  completeness: stat.key,
                }))
              }
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.tone} text-white`}
              >
                <Icon icon={stat.icon} width={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold text-[var(--text-medium-emphasis)]">
                  {stat.label}
                </span>
                <span className="mt-0.5 block text-2xl font-extrabold tracking-tight">
                  {loading ? "—" : stat.count.toLocaleString("id-ID")}
                </span>
                <span className="mt-1 block truncate text-[10px] text-[var(--text-low-emphasis)]">
                  {stat.note}
                </span>
              </span>
            </button>
          ))}
        </div>

        <Card className="w-full min-w-0 overflow-hidden">
          {/* =========================================
              HEADER DAFTAR ASET
          ========================================== */}
          <div className="surface-card__header mb-4">
            <div className="min-w-0">
              <h2 className="surface-card__title">Daftar Aset</h2>

              <p className="surface-card__description">
                Gunakan filter untuk menemukan aset dengan cepat.
              </p>
            </div>

            {selectedIds.length > 0 ? (
              <Badge tone="info" label={`${selectedIds.length} aset dipilih`} />
            ) : null}
          </div>

          {/* =========================================
              TOMBOL TAMBAH ASET
          ========================================== */}
          {canEdit && (
            <div className="mb-4 flex justify-end">
              <Button size="medium" onClick={() => setOpenModal(true)}>
                <Icon icon="lucide:plus" width={15} height={15} />
                <span>Tambah Aset</span>
              </Button>
            </div>
          )}

          {/* =========================================
              FILTER UTAMA
          ========================================== */}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* SEARCH */}
            <label className="flex h-10 min-w-0 items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 sm:col-span-2 lg:col-span-2">
              <Icon
                icon="lucide:search"
                width={16}
                className="mr-2 shrink-0 text-[var(--text-low-emphasis)]"
              />

              <input
                type="text"
                value={filterValues.search}
                onChange={(event) =>
                  setFilterValues((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                placeholder="Cari nomor register, nama aset, atau lokasi..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-high-emphasis)] outline-none placeholder:text-[var(--text-low-emphasis)]"
              />
            </label>

            {/* STATUS TANAH */}
            <Dropdown
              value={filterValues.status_tanah || undefined}
              onChange={(option) =>
                setFilterValues((current) => ({
                  ...current,
                  status_tanah: option?.value ?? "",
                }))
              }
              placeholder="Semua Status Tanah"
              options={[
                { value: "", label: "Semua Status Tanah" },
                ...(filterOptions.status_tanah || []).map((status) => ({
                  value: status,
                  label: status,
                })),
              ]}
            />

            {/* JENIS BARANG */}
            <Dropdown
              value={filterValues.nama_jenis_barang || undefined}
              onChange={(option) =>
                setFilterValues((current) => ({
                  ...current,
                  nama_jenis_barang: option?.value ?? "",
                }))
              }
              placeholder="Semua Jenis Barang"
              options={[
                { value: "", label: "Semua Jenis Barang" },
                ...(filterOptions.nama_jenis_barang || []).map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
            />

            {/* KECAMATAN */}
            <Dropdown
              value={filterValues.kecamatan || undefined}
              onChange={(option) =>
                setFilterValues((current) => ({
                  ...current,
                  kecamatan: option?.value ?? "",
                }))
              }
              placeholder="Semua Kecamatan"
              options={[
                { value: "", label: "Semua Kecamatan" },
                ...kecamatanOptions.map((kecamatan) => ({
                  value: kecamatan.value,
                  label: kecamatan.label,
                })),
              ]}
            />

            {/* STATUS KELENGKAPAN */}
            <Dropdown
              value={filterValues.completeness || undefined}
              onChange={(option) =>
                setFilterValues((current) => ({
                  ...current,
                  completeness: option?.value ?? "",
                }))
              }
              placeholder="Status Kelengkapan"
              options={[
                { value: "", label: "Semua" },
                { value: "Lengkap", label: "Lengkap" },
                {
                  value: "Sebagian Lengkap",
                  label: "Sebagian Lengkap",
                },
                {
                  value: "Belum Lengkap",
                  label: "Belum Lengkap",
                },
              ]}
            />
          </div>

          {/* =========================================
              SELECTED INFO
          ========================================== */}
          {selectedIds.length > 0 ? (
            <div className="my-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-sky-300">
              <span className="truncate">
                {selectedIds.length} aset dipilih
              </span>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="shrink-0 font-semibold hover:underline"
              >
                Batalkan pilihan
              </button>
            </div>
          ) : null}

          {/* =========================================
              TABLE
          ========================================== */}
          <div className="mt-4 min-w-0 overflow-hidden">
            <Table
              columns={columns}
              data={assets}
              loading={loading}
              selectable={false}
              variant="compact"
              emptyMessage="Tidak ada aset yang cocok dengan filter."
            />
          </div>

          {/* =========================================
              PAGINATION
          ========================================== */}
          <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center">
            <span className="text-[10px] text-[var(--text-low-emphasis)]">
              Menampilkan {assetMeta.total ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, assetMeta.total)} dari{" "}
              {assetMeta.total} aset
            </span>

            <div className="ml-auto shrink-0">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalData={assetMeta.total}
                disabled={loading}
                onPageChange={(nextPage) =>
                  setPage(Math.max(1, Math.min(totalPages, nextPage)))
                }
              />
            </div>
          </div>
        </Card>
      </div>

      <FormModal
        title="Tambah Aset Tanah"
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        fields={fieldsWithKecamatanOptions}
        onSubmit={async (data) => {
          try {
            await createAssetService(data);
            setOpenModal(false);
            showAlert("success", "Aset berhasil ditambahkan");
            load();
          } catch (err) {
            showAlert("error", err?.message || "Gagal menambahkan aset");
          }
        }}
      />
      <FormModal
        title="Edit Aset Tanah"
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setEditData(null);
        }}
        fields={fieldsWithKecamatanOptions}
        initialData={editData}
        onSubmit={async (data) => {
          try {
            await editAssetService(editData.id, data);
            setOpenEditModal(false);
            setEditData(null);
            showAlert("success", "Aset berhasil diperbarui");
            load();
          } catch (err) {
            showAlert("error", err?.message || "Gagal memperbarui aset");
          }
        }}
      />
      <ModalConfirm
        open={Boolean(assetToDelete)}
        onClose={() => setAssetToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Aset"
        description={`Yakin ingin menghapus aset “${assetToDelete?.lokasi || assetToDelete?.nama_jenis_barang || "ini"}” beserta dokumen terkait? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Aset"
        loading={deletingAsset}
        variant="danger"
      />
    </div>
  );
}

export default AssetsPage;
