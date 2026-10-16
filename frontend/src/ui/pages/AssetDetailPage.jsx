import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/alert/Alert";
import FormModal from "../../components/modal/FormModal";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Button from "../../components/button/Button";
import Badge from "../../components/badge/Badge";
import { useAlert } from "../../hooks/useAlert";
import useAppStore from "../../stores/useAppStore";
import {
  getAssetDetailService,
  editAssetService,
} from "../../services/assets/assets";
import {
  getDocumentsByAssetService,
  downloadDocumentService,
  deleteDocumentService,
} from "../../services/document/get_document";
import { uploadDocumentsService } from "../../services/document/upload_data";
import { getAllKecamatanService } from "../../services/kecamatan";

const assetFields = [
  { name: "nama_jenis_barang", label: "Nama/Jenis Barang", type: "text" },
  { name: "kode_barang", label: "Kode Barang", type: "text" },
  { name: "register", label: "Register", type: "text" },
  { name: "luas", label: "Luas (m²)", type: "number" },
  { name: "tahun_pengadaan", label: "Tahun Pengadaan", type: "number" },
  { name: "lokasi", label: "Lokasi", type: "text" },
  { name: "letak_alamat", label: "Letak/Alamat", type: "text" },
  {
    name: "kecamatan",
    label: "Kecamatan",
    type: "select",
    options: [],
    placeholder: "Pilih kecamatan",
    searchable: true,
  },
  { name: "status_tanah", label: "Status Tanah", type: "text" },
  { name: "nama_pemilik", label: "Nama Pemilik", type: "text" },
  { name: "tanggal_dokumen", label: "Tanggal Dokumen", type: "date" },
  {
    name: "no_dokumen_kepemilikan",
    label: "Nomor Dokumen Kepemilikan",
    type: "text",
  },
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
  { name: "rincian_permasalahan", label: "Rincian Permasalahan", type: "text" },
  { name: "link_google_maps", label: "Link Google Maps", type: "url" },
];

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAppStore();
  const { alert, showAlert } = useAlert();
  const canEdit = ["admin", "operator"].includes(role);
  const canDeleteDocument = ["admin", "operator"].includes(role);
  const [asset, setAsset] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [kecamatanOptions, setKecamatanOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [assetResult, docResult, kecamatanResult] = await Promise.all([
        getAssetDetailService(id),
        getDocumentsByAssetService(id),
        getAllKecamatanService(),
      ]);
      setAsset(assetResult.data);
      setDocuments(docResult.data || []);
      setKecamatanOptions(
        kecamatanResult.data.map((item) => ({
          value: item.nama,
          label: item.nama,
        })),
      );
    } catch (error) {
      showAlert("error", error?.message || "Aset tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [id]);

  const assetFieldsWithKecamatanOptions = useMemo(
    () =>
      assetFields.map((field) =>
        field.name === "kecamatan"
          ? { ...field, options: kecamatanOptions }
          : field,
      ),
    [kecamatanOptions],
  );

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocumentsService({
        asset_id: id,
        document_type: "Dokumen Aset",
        file,
      });
      showAlert("success", "Dokumen berhasil diunggah");
      await load();
    } catch (error) {
      showAlert("error", error?.message || "Gagal mengunggah dokumen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await downloadDocumentService(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name || "dokumen";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert("error", error?.message || "Gagal mengunduh dokumen");
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm(`Hapus ${document.file_name}?`)) return;
    try {
      await deleteDocumentService(document.id);
      showAlert("success", "Dokumen dihapus");
      await load();
    } catch (error) {
      showAlert("error", error?.message || "Gagal menghapus dokumen");
    }
  };

  if (loading)
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="surface-card p-6 text-sm text-[var(--text-medium-emphasis)]">
            Memuat data aset...
          </div>
        </div>
      </div>
    );
  if (!asset)
    return (
      <div className="page-shell">
        <div className="page-container">
          <Card>
            <p className="text-sm font-semibold">Aset tidak ditemukan.</p>
            <button
              onClick={() => navigate("/assets")}
              className="btn-ghost mt-2"
            >
              ← Kembali ke daftar aset
            </button>
          </Card>
        </div>
      </div>
    );

  const rows = [
    ["Nama/Jenis Barang", asset.nama_jenis_barang],
    ["Kode Barang", asset.kode_barang],
    ["Register", asset.register],
    [
      "Luas",
      asset.luas == null
        ? "-"
        : `${Number(asset.luas).toLocaleString("id-ID")} m²`,
    ],
    ["Tahun Pengadaan", asset.tahun_pengadaan],
    ["Lokasi", asset.lokasi],
    ["Letak/Alamat", asset.letak_alamat],
    ["Kecamatan", asset.kecamatan],
    ["Status Tanah", asset.status_tanah],
    ["Nama Pemilik", asset.nama_pemilik],
    ["Tanggal Dokumen", asset.tanggal_dokumen],
    ["Nomor Dokumen", asset.no_dokumen_kepemilikan],
    ["Asal Usul", asset.asal_usul],
    [
      "Harga",
      asset.harga == null
        ? "-"
        : `Rp ${Number(asset.harga).toLocaleString("id-ID")}`,
    ],
    ["Pematokan", asset.staking_status],
    ["Progres BPN", asset.progres_bpn],
    ["Permasalahan", asset.permasalahan],
    ["Rincian Permasalahan", asset.rincian_permasalahan],
  ];
  const completenessStatus = asset.completeness_status || "Belum Lengkap";
  const completenessTone =
    {
      Lengkap: "success",
      "Sebagian Lengkap": "warning",
      "Belum Lengkap": "error",
    }[completenessStatus] || "neutral";
  return (
    <div className="page-shell">
      {alert.show ? <Alert type={alert.type} message={alert.message} /> : null}
      <div className="page-container space-y-5">
        <button onClick={() => navigate("/assets")} className="btn-ghost -ml-2">
          <Icon icon="lucide:arrow-left" width={15} /> Kembali ke Daftar Aset
        </button>
        <PageHeader
          title={asset.lokasi || asset.nama_jenis_barang || "Detail Aset"}
          description={`Reg. ${asset.register || "-"} · ${asset.kecamatan || "-"}`}
          actions={
            canEdit ? (
              <Button size="small" onClick={() => setOpenEdit(true)}>
                Edit Aset
              </Button>
            ) : null
          }
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="surface-card__header">
              <div>
                <h2 className="surface-card__title">Informasi Aset</h2>
                <p className="surface-card__description">
                  Detail administratif dan legalitas aset.
                </p>
              </div>
              <Badge tone={completenessTone} label={completenessStatus} />
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-low-emphasis)]">
                    {label}
                  </div>
                  <div className="break-words text-sm font-medium text-[var(--text-high-emphasis)]">
                    {value || "-"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-low-emphasis)]">
                Keterangan
              </div>
              <p className="text-sm text-[var(--text-medium-emphasis)]">
                {asset.keterangan || "-"}
              </p>
            </div>
          </Card>
          <Card>
            <div className="surface-card__header">
              <h2 className="surface-card__title">Informasi Lokasi</h2>
              <Icon
                icon="lucide:map-pin"
                className="text-[var(--text-active)]"
              />
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-medium-emphasis)]">
              {asset.letak_alamat || asset.lokasi || "Lokasi belum tersedia"}
            </p>
            <p className="mt-2 text-xs text-[var(--text-low-emphasis)]">
              Kecamatan: {asset.kecamatan || "-"}
            </p>
            {asset.link_google_maps ? (
              <a
                href={asset.link_google_maps}
                target="_blank"
                rel="noreferrer"
                className="btn-default mt-4 w-full"
              >
                <Icon icon="lucide:map" width={15} /> Buka Google Maps
              </a>
            ) : (
              <p className="mt-4 rounded-xl bg-[var(--surface-muted)] p-3 text-xs text-[var(--text-low-emphasis)]">
                Link Google Maps belum tersedia.
              </p>
            )}
          </Card>
        </div>

        <Card>
          <div className="surface-card__header">
            <div>
              <h2 className="surface-card__title">Dokumen Digital</h2>
              <p className="surface-card__description">
                {documents.length} dokumen tersimpan
              </p>
            </div>
            {canEdit ? (
              <label
                className={`btn-primary ${uploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <Icon icon="lucide:upload" width={15} />
                {uploading ? "Mengunggah..." : "Tambah Dokumen"}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            ) : null}
          </div>
          {documents.length ? (
            <div className="divide-y divide-[var(--border)]">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--text-active)]">
                    <Icon icon="lucide:file-text" width={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--text-high-emphasis)]">
                      {document.file_name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--text-low-emphasis)]">
                      {document.document_type} ·{" "}
                      {document.document_number || "Nomor tidak tersedia"} ·{" "}
                      {document.document_date || "-"}
                    </p>
                  </div>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleDownload(document)}
                  >
                    Unduh
                  </Button>
                  {canDeleteDocument ? (
                    <Button
                      size="small"
                      variant="tertiary"
                      onClick={() => handleDelete(document)}
                    >
                      Hapus
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state min-h-[120px]">
              <div className="empty-state__icon">
                <Icon icon="lucide:file-text" width={18} />
              </div>
              <p className="text-xs font-semibold">Belum ada dokumen</p>
              <p className="mt-1 text-[10px]">
                Tambahkan dokumen legalitas untuk aset ini.
              </p>
            </div>
          )}
        </Card>

        <FormModal
          title="Edit Aset Tanah"
          isOpen={openEdit}
          onClose={() => setOpenEdit(false)}
          fields={assetFieldsWithKecamatanOptions}
          initialData={asset}
          onSubmit={async (data) => {
            try {
              await editAssetService(id, data);
              showAlert("success", "Aset berhasil diperbarui");
              setOpenEdit(false);
              load();
            } catch (error) {
              showAlert("error", error?.message || "Gagal memperbarui aset");
            }
          }}
        />
      </div>
    </div>
  );
}
