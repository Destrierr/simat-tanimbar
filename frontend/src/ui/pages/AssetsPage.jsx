import { useCallback, useEffect, useMemo, useState } from "react";
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
import Dropdown from "../../components/dropdown/Dropdown";
import useAppStore from "../../stores/useAppStore";
import { useKecamatanOptions } from "../../hooks/useKecamatan";
import {
  useAssetsQuery,
  useCreateAsset,
  useEditAsset,
  useDeleteAsset,
  useUploadDocument,
} from "../../hooks/useAssets";

const PAGE_SIZE = 10;

const REQUIRED_FIELDS = new Set([
  "nama_jenis_barang",
  "kode_barang",
  "register",
  "luas",
  "tahun_pengadaan",
  "lokasi",
  "letak_alamat",
  "kecamatan",
  "status_tanah",
  "nama_pemilik",
  "tanggal_dokumen",
  "no_dokumen_kepemilikan",
  "asal_usul",
  "harga",
  "pematokan",
  "progres_bpn",
]);

const EMPTY_META = {
  total: 0,
  last_page: 1,
  completeness_counts: {},
  filter_options: { status_tanah: [], nama_jenis_barang: [] },
};

const assetFields = [
  { name: "kode_barang", label: "Kode Barang", type: "text", placeholder: "cth. 01.01.01.04.002" },
  { name: "register", label: "Nomor Register", type: "text", placeholder: "cth. 072-2026-XX" },
  { name: "nama_jenis_barang", label: "Nama/Jenis Barang", type: "text", placeholder: "cth. Tanah Bangunan Pendidikan" },
  { name: "lokasi", label: "Nama/Lokasi Aset", type: "text", placeholder: "Masukkan nama atau lokasi aset" },
  { name: "letak_alamat", label: "Letak/Alamat", type: "text", placeholder: "Masukkan alamat aset" },
  { name: "kecamatan", label: "Kecamatan", type: "text", placeholder: "cth. Tanimbar Selatan" },
  { name: "luas", label: "Luas Tanah (m²)", type: "number", placeholder: "cth. 2500" },
  { name: "tahun_pengadaan", label: "Tahun Pengadaan", type: "number", placeholder: "cth. 2025" },
  { name: "status_tanah", label: "Status Tanah", type: "text", placeholder: "cth. Hak Pakai" },
  { name: "nama_pemilik", label: "Nama Pemilik", type: "text", placeholder: "Nama pemilik" },
  { name: "no_dokumen_kepemilikan", label: "Nomor Dokumen Kepemilikan", type: "text" },
  { name: "tanggal_dokumen", label: "Tanggal Dokumen", type: "date" },
  { name: "asal_usul", label: "Asal Usul", type: "text" },
  { name: "harga", label: "Harga", type: "number" },
  { name: "keterangan", label: "Keterangan", type: "text" },
  {
    name: "pematokan",
    label: "Pematokan",
    type: "select",
    options: [
      { value: "true", label: "Sudah dipatok" },
      { value: "false", label: "Belum dipatok" },
    ],
  },
  { name: "progres_bpn", label: "Progres BPN", type: "text" },
  { name: "permasalahan", label: "Permasalahan", type: "text" },
  { name: "rincian_permasalahan", label: "Rincian Permasalahan", fullWidth: true, type: "text" },
  {
    name: "link_google_maps",
    label: "Link Google Maps",
    type: "url",
    placeholder: "https://maps.google.com/...",
    fullWidth: true,
  },
  {
  name: "jenis_dokumen",
  label: "Jenis Dokumen",
  type: "select",
  fullWidth: true,
  placeholder: "Pilih jenis dokumen (jika upload file)",
  options: [
    { value: "Sertifikat", label: "Sertifikat" },
    { value: "Akta", label: "Akta" },
    { value: "Surat Keputusan", label: "Surat Keputusan" },
    { value: "Dokumen Pendukung", label: "Dokumen Pendukung" },
  ],
},
{
  name: "dokumen",
  label: "Upload Dokumen",
  type: "file",
  accept: ".pdf,.jpg,.jpeg,.png",
  maxSize: "10 MB",
  fullWidth: true,
  helperText: "Opsional. Format PDF, JPG, atau PNG.",
},
];

function StatCard({ title, value, note, icon, tone, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-0 items-center gap-3 rounded-2xl border bg-[var(--surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-[var(--accent-border)] ring-2 ring-sky-100 dark:ring-sky-500/20"
          : "border-[var(--border)]"
      }`}
    >
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
      <Icon
        icon="lucide:chevron-right"
        width={16}
        className="shrink-0 text-slate-300 transition group-hover:text-sky-500"
      />
    </button>
  );
}

function categoryStyle(category) {
  const styles = {
    Pemerintahan: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    Pendidikan: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    Kesehatan: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
    "Sarana Publik": "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
    Pertanian: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return styles[category] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

function getErrorMessage(err, fallback) {
  const validationErrors = err?.response?.data?.errors;

  if (validationErrors) {
    const first = Object.values(validationErrors).flat()[0];
    if (first) return first;
  }

  return err?.response?.data?.message || err?.message || fallback;
}

// Form -> payload backend
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, samakan dengan backend

function buildAssetPayload(data) {
  const { dokumen, jenis_dokumen, ...rest } = data;

  const payload = {
    ...rest,
    pematokan:
      rest.pematokan === "" || rest.pematokan == null
        ? null
        : rest.pematokan === true || rest.pematokan === "true",
    tanggal_dokumen: rest.tanggal_dokumen || null,
  };

  return {
    payload,
    file: dokumen || null,
    documentType: jenis_dokumen || "Dokumen Pendukung",
  };
}

// Data backend -> nilai awal form edit
function toFormValues(asset) {
  const pematokan = asset.pematokan;

  return {
    ...asset,
    pematokan:
      pematokan === null || pematokan === undefined
        ? ""
        : String(
            pematokan === true ||
              pematokan === 1 ||
              pematokan === "1" ||
              pematokan === "true",
          ),
    tanggal_dokumen: asset.tanggal_dokumen
      ? String(asset.tanggal_dokumen).slice(0, 10)
      : "",
  };
}

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function AssetsPage() {
  const navigate = useNavigate();
  const { role } = useAppStore();

  /* ---------- ALERT ---------- */
  const [alertState, setAlertState] = useState({
    show: false,
    id: 0,
    type: "success",
    title: "",
    description: "",
  });

  const showAlert = useCallback((type, message) => {
    const isError = type === "error";

    setAlertState((current) => ({
      show: true,
      id: current.id + 1,
      type: isError ? "delete" : type,
      title: isError ? "Gagal" : "Berhasil",
      description:
        typeof message === "string" && message.trim()
          ? message
          : isError
            ? "Terjadi kesalahan. Silakan coba lagi."
            : "Aksi berhasil dilakukan.",
    }));
  }, []);

  /* ---------- ROLE ---------- */
  const normalizedRole = role?.toLowerCase().replace(/\s+/g, "").trim();
  const canEdit = ["admin", "administrator", "operator"].includes(normalizedRole);
  const canDelete = normalizedRole === "admin" || normalizedRole === "administrator";

  /* ---------- STATE ---------- */
  const [uploadProgress, setUploadProgress] = useState(0);
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

  /* ---------- QUERY & MUTATION ---------- */
  const debouncedSearch = useDebouncedValue(filterValues.search);

  const queryParams = {
    page,
    per_page: PAGE_SIZE,
    search: debouncedSearch,
    status_tanah: filterValues.status_tanah,
    kecamatan: filterValues.kecamatan,
    nama_jenis_barang: filterValues.nama_jenis_barang,
    completeness: filterValues.completeness,
  };

  const { data: kecamatanOptions = [], error: kecamatanError } = useKecamatanOptions();

  const { data: result, isLoading, isFetching, error } = useAssetsQuery(queryParams);

  const assets = result?.data ?? [];
  const assetMeta = { ...EMPTY_META, ...(result?.meta ?? {}) };
  const loading = isLoading || isFetching;

  const createAsset = useCreateAsset();
  const editAsset = useEditAsset();
  const deleteAsset = useDeleteAsset();
  const uploadDocument = useUploadDocument();

  const totalPages = Math.max(1, assetMeta.last_page || 1);
  const completenessCounts = assetMeta.completeness_counts || {};
  const filterOptions = assetMeta.filter_options || {};

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    if (error) showAlert("error", getErrorMessage(error, "Gagal memuat data aset"));
  }, [error, showAlert]);

  useEffect(() => {
  if (kecamatanError) {
    showAlert("error", getErrorMessage(kecamatanError, "Gagal memuat data kecamatan"));
  }
}, [kecamatanError, showAlert]);

  // kalau halaman saat ini melebihi jumlah halaman (mis. setelah hapus), mundur
  useEffect(() => {
    if (result?.meta?.last_page && page > result.meta.last_page) {
      setPage(Math.max(1, result.meta.last_page));
    }
  }, [result, page]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [filterValues]);

  /* ---------- HANDLERS ---------- */
  const handleDelete = async () => {
    if (!assetToDelete) return;

    const assetName = assetToDelete.lokasi || assetToDelete.nama_jenis_barang || "ini";

    try {
      await deleteAsset.mutateAsync(assetToDelete.id);
      setSelectedIds((previous) => previous.filter((id) => id !== assetToDelete.id));
      setAssetToDelete(null);
      showAlert("success", `Aset “${assetName}” berhasil dihapus`);
    } catch (err) {
      setAssetToDelete(null);
      showAlert("error", getErrorMessage(err, "Gagal menghapus aset"));
    }
  };

  const uploadIfAny = async (assetId, file, documentType) => {
  if (!file || !assetId) return null;

  try {
    setUploadProgress(0);
    await uploadDocument.mutateAsync({
      assetId,
      file,
      documentType,
      onProgress: setUploadProgress,
    });
    return true;
  } catch {
    return false;
  }
};


  const handleCreate = async (data) => {
  const { payload, file, documentType } = buildAssetPayload(data);

  // cek file SEBELUM aset disimpan, supaya tidak ada aset yatim
  if (file && file.size > MAX_FILE_SIZE) {
    showAlert("error", "Ukuran file maksimal 10 MB.");
    return;
  }

  let created;
  try {
    created = await createAsset.mutateAsync(payload);
  } catch (err) {
    showAlert("error", getErrorMessage(err, "Gagal menambahkan aset"));
    return;
  }

    const uploaded = await uploadIfAny(created?.data?.id, file);

    if (uploaded === false) {
      showAlert(
        "error",
        "Aset tersimpan, tetapi dokumen gagal diupload. Upload ulang lewat halaman edit.",
      );
    } else if (uploaded) {
      showAlert("success", "Aset dan dokumen berhasil ditambahkan");
    } else {
      showAlert("success", "Aset baru berhasil ditambahkan");
    }

    setOpenModal(false);
  };

  const handleEdit = async (data) => {
  const { payload, file, documentType } = buildAssetPayload(data);

  if (file && file.size > MAX_FILE_SIZE) {
    showAlert("error", "Ukuran file maksimal 10 MB.");
    return;
  }

  try {
    await editAsset.mutateAsync({ id: editData.id, payload });
  } catch (err) {
    showAlert("error", getErrorMessage(err, "Gagal memperbarui aset"));
    return;
  }

    const uploaded = await uploadIfAny(editData.id, file);

    if (uploaded === false) {
      showAlert(
        "error",
        "Perubahan tersimpan, tetapi dokumen gagal diupload. Silakan coba upload ulang.",
      );
    } else if (uploaded) {
      showAlert("success", "Perubahan data aset dan dokumen berhasil disimpan");
    } else {
      showAlert("success", "Perubahan data aset berhasil disimpan");
    }

    setOpenEditModal(false);
    setEditData(null);
  };

   /* ---------- HELPER ---------- */

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

  /* ---------- TABLE ---------- */
  const columns = [
    { header: "No", render: (_, index) => (page - 1) * PAGE_SIZE + index + 1 },
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
              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
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
  ];

  const rowActions = [
    {
      key: "detail",
      label: "Lihat detail",
      onClick: (asset) => navigate(`/assets/${asset.id}`),
    },
    canEdit && {
      key: "update",
      label: "Edit aset",
      onClick: (asset) => {
        setEditData(asset);
        setOpenEditModal(true);
      },
    },
    canDelete && {
      key: "delete",
      label: "Hapus aset",
      onClick: (asset) => setAssetToDelete(asset),
    },
  ].filter(Boolean);

  const stats = [
    {
      label: "Total Aset",
      count: assetMeta.total || 0,
      note: "Aset terdaftar",
      icon: "lucide:land-plot",
      tone: "bg-blue-50 text-blue-500 dark:bg-blue-500/10",
      key: "",
    },
    {
      label: "Lengkap",
      count: completenessCounts["Lengkap"] || 0,
      note: "Field wajib terpenuhi",
      icon: "lucide:file-check-2",
      tone: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
      key: "Lengkap",
    },
    {
      label: "Sebagian Lengkap",
      count: completenessCounts["Sebagian Lengkap"] || 0,
      note: "Masih ada data yang kurang",
      icon: "lucide:file-warning",
      tone: "bg-amber-50 text-amber-500 dark:bg-amber-500/10",
      key: "Sebagian Lengkap",
    },
    {
      label: "Belum Lengkap",
      count: completenessCounts["Belum Lengkap"] || 0,
      note: "Perlu dilengkapi",
      icon: "lucide:file-x-2",
      tone: "bg-rose-50 text-rose-500 dark:bg-rose-500/10",
      key: "Belum Lengkap",
    },
  ];

  /* ---------- FORM FIELDS ---------- */
  const fieldsWithKecamatanOptions = useMemo(
    () =>
      assetFields.map((field) => {
        const base = { ...field, required: REQUIRED_FIELDS.has(field.name) };

        return field.name === "kecamatan"
          ? {
              ...base,
              type: "select",
              options: kecamatanOptions,
              placeholder: "Pilih kecamatan",
              searchable: true,
            }
          : base;
      }),
    [kecamatanOptions],
  );

  const editInitialData = useMemo(
    () => (editData ? toFormValues(editData) : null),
    [editData],
  );

  const updateFilter = (key) => (option) =>
    setFilterValues((current) => ({ ...current, [key]: option?.value ?? "" }));

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
          onClose={() => setAlertState((current) => ({ ...current, show: false }))}
        />
      ) : null}

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
            <StatCard
              key={stat.label}
              title={stat.label}
              value={loading ? "—" : stat.count.toLocaleString("id-ID")}
              note={stat.note}
              icon={stat.icon}
              tone={stat.tone}
              // active={filterValues.completeness === stat.key}
              onClick={() =>
                setFilterValues((current) => ({ ...current, completeness: stat.key }))
              }
            />
          ))}
        </div>

        <Card className="w-full min-w-0 overflow-hidden">
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

          {canEdit && (
            <div className="mb-4 flex justify-end">
              <Button size="medium" onClick={() => setOpenModal(true)}>
                <Icon icon="lucide:plus" width={15} height={15} />
                <span>Tambah Aset</span>
              </Button>
            </div>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex h-10 min-w-0 items-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 sm:col-span-2 lg:col-span-2">
              <Icon
                icon="lucide:search"
                width={16}
                className="mr-2 shrink-0 text-[var(--text-low-emphasis)]"
              />
              <input
                type="text"
                value={filterValues.search}
                onChange={(event) =>
                  setFilterValues((current) => ({ ...current, search: event.target.value }))
                }
                placeholder="Cari nomor register, nama aset, atau lokasi..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-[var(--text-high-emphasis)] shadow-none outline-none ring-0 placeholder:text-[var(--text-low-emphasis)] focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0"
              />
            </label>

            <Dropdown
              value={filterValues.status_tanah || undefined}
              onChange={updateFilter("status_tanah")}
              placeholder="Semua Status Tanah"
              options={[
                { value: "", label: "Semua Status Tanah" },
                ...(filterOptions.status_tanah || []).map((status) => ({
                  value: status,
                  label: status,
                })),
              ]}
            />

            <Dropdown
              value={filterValues.nama_jenis_barang || undefined}
              onChange={updateFilter("nama_jenis_barang")}
              placeholder="Semua Jenis Barang"
              options={[
                { value: "", label: "Semua Jenis Barang" },
                ...(filterOptions.nama_jenis_barang || []).map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
            />

            <Dropdown
              value={filterValues.kecamatan || undefined}
              onChange={updateFilter("kecamatan")}
              placeholder="Semua Kecamatan"
              options={[{ value: "", label: "Semua Kecamatan" }, ...kecamatanOptions]}
            />

            <Dropdown
              value={filterValues.completeness || undefined}
              onChange={updateFilter("completeness")}
              placeholder="Status Kelengkapan"
              options={[
                { value: "", label: "Semua" },
                { value: "Lengkap", label: "Lengkap" },
                { value: "Sebagian Lengkap", label: "Sebagian Lengkap" },
                { value: "Belum Lengkap", label: "Belum Lengkap" },
              ]}
            />
          </div>

          {selectedIds.length > 0 ? (
            <div className="my-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/10 dark:text-sky-300">
              <span className="truncate">{selectedIds.length} aset dipilih</span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="shrink-0 font-semibold hover:underline"
              >
                Batalkan pilihan
              </button>
            </div>
          ) : null}

          <div className="mt-4 min-w-0 overflow-hidden">
            <Table
              columns={columns}
              data={assets}
              rowActions={rowActions}
              actionsHeader="Aksi"
              selectable={false}
            />
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center">
            <span className="text-[10px] text-[var(--text-low-emphasis)]">
              Menampilkan {assetMeta.total ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, assetMeta.total)} dari {assetMeta.total} aset
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
        showFileUpload
        isUploading={uploadDocument.isPending}
        uploadProgress={uploadProgress}
        onSubmit={handleCreate}
      />

      <FormModal
        title="Edit Aset Tanah"
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setEditData(null);
        }}
        fields={fieldsWithKecamatanOptions}
        initialData={editInitialData}
        showFileUpload
        isUploading={uploadDocument.isPending}
        uploadProgress={uploadProgress}
        onSubmit={handleEdit}
      />

      <ModalConfirm
        open={Boolean(assetToDelete)}
        onClose={() => !deleteAsset.isPending && setAssetToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Aset"
        description={`Yakin ingin menghapus aset “${assetToDelete?.lokasi || assetToDelete?.nama_jenis_barang || "ini"}” beserta dokumen terkait? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Aset"
        loading={deleteAsset.isPending}
        variant="danger"
      />
    </div>
  );
}

export default AssetsPage;