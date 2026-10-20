import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/alert/Alert";
import FormModal from "../../components/modal/FormModal";
import Card from "../../components/card/Card";
import PageHeader from "../../components/header/PageHeader";
import Button from "../../components/button/Button";
import { ModalConfirm } from "../../components/modal/Modal";
import { getErrorMessage, useToastAlert } from "../../hooks/useToastAlert";
import useAppStore from "../../stores/useAppStore";
import {
  getAssetDetailService,
  editAssetService,
} from "../../services/assets/assets";
import {
  getDocumentsByAssetService,
  viewDocumentService,
  deleteDocumentService,
} from "../../services/document/get_document";
import { uploadDocumentsService } from "../../services/document/upload_data";
import { getAllKecamatanService } from "../../services/kecamatan";

function getCompletenessBadgeClass(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value === "lengkap")
    return "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
  if (value === "belum lengkap")
    return "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
  return "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
}

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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAppStore();
  const { alertState, showAlert, closeAlert } = useToastAlert();
  const fileInputRef = useRef(null);

  const canEdit = ["admin", "operator"].includes(role);
  const canDeleteDocument = ["admin", "operator"].includes(role);

  const [asset, setAsset] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [kecamatanOptions, setKecamatanOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [preview, setPreview] = useState(null); // { doc, url, kind }
  const [previewingId, setPreviewingId] = useState(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
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
      showAlert("error", getErrorMessage(error, "Aset tidak ditemukan"));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [id]);

  // Bebaskan object URL saat preview ditutup, diganti, atau halaman ditinggalkan
  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [preview?.url]);

  // Tutup preview dengan tombol Escape
  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (event) => event.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

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
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      showAlert("error", "Ukuran file maksimal 10 MB.");
      return;
    }

    setUploading(true);
    try {
      await uploadDocumentsService({
        asset_id: id,
        document_type: "Dokumen Aset",
        file,
      });
      showAlert("success", `Dokumen “${file.name}” berhasil diunggah`);
      await load(true);
    } catch (error) {
      showAlert("error", getErrorMessage(error, "Gagal mengunggah dokumen"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    const fileName = documentToDelete.file_name || "dokumen";
    setDeletingDocument(true);
    try {
      await deleteDocumentService(documentToDelete.id);
      setDocumentToDelete(null);
      showAlert("success", `Dokumen “${fileName}” berhasil dihapus`);
      await load(true);
    } catch (error) {
      setDocumentToDelete(null);
      showAlert("error", getErrorMessage(error, "Gagal menghapus dokumen"));
    } finally {
      setDeletingDocument(false);
    }
  };

  const handlePreview = async (doc) => {
    setPreviewingId(doc.id);
    try {
      const blob = await viewDocumentService(doc.id);
      const ext = (doc.file_name || "").split(".").pop().toLowerCase();
      const isPdf = blob.type === "application/pdf" || ext === "pdf";
      const isImage =
        blob.type.startsWith("image/") || ["jpg", "jpeg", "png"].includes(ext);

      if (!isPdf && !isImage) {
        showAlert("error", "Format file ini tidak bisa dipratinjau.");
        return;
      }

      // Pastikan tipe PDF benar supaya iframe menampilkannya, bukan mengunduh
      const typed =
        isPdf && blob.type !== "application/pdf"
          ? new Blob([blob], { type: "application/pdf" })
          : blob;

      setPreview({
        doc,
        url: URL.createObjectURL(typed),
        kind: isPdf ? "pdf" : "image",
      });
    } catch (error) {
      showAlert("error", getErrorMessage(error, "Gagal membuka pratinjau dokumen"));
    } finally {
      setPreviewingId(null);
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
  const canUpload = canEdit && documents.length === 0;

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
        <button onClick={() => navigate("/assets")} className="btn-ghost -ml-2">
          <Icon icon="lucide:arrow-left" width={15} /> Kembali ke Daftar Aset
        </button>

        <PageHeader
          title={asset.lokasi || asset.nama_jenis_barang || "Detail Aset"}
          description={`Reg. ${asset.register || "-"} · ${asset.kecamatan || "-"}`}
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
              <span
                className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getCompletenessBadgeClass(completenessStatus)}`}
              >
                {completenessStatus}
              </span>
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

            {canUpload ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <Button
                  size="medium"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon icon="lucide:upload" width={15} height={15} />
                  <span>{uploading ? "Mengunggah..." : "Tambah Dokumen"}</span>
                </Button>
              </>
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
                    disabled={previewingId === document.id}
                    onClick={() => handlePreview(document)}
                  >
                    <Icon icon="lucide:eye" width={14} height={14} />
                    <span>
                      {previewingId === document.id ? "Membuka..." : "Pratinjau"}
                    </span>
                  </Button>
                  {canDeleteDocument ? (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => setDocumentToDelete(document)}
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
              setOpenEdit(false);
              showAlert("success", "Aset berhasil diperbarui");
              await load(true);
            } catch (error) {
              showAlert("error", getErrorMessage(error, "Gagal memperbarui aset"));
            }
          }}
        />

        <ModalConfirm
          open={Boolean(documentToDelete)}
          onClose={() => !deletingDocument && setDocumentToDelete(null)}
          onConfirm={handleDelete}
          title="Hapus Dokumen"
          description={`Yakin ingin menghapus dokumen “${documentToDelete?.file_name || "ini"}”? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus Dokumen"
          loading={deletingDocument}
          variant="danger"
        />

        {preview ? (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setPreview(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Pratinjau ${preview.doc.file_name}`}
              className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-bg)] text-[var(--text-active)]">
                  <Icon icon="lucide:file-text" width={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[var(--text-high-emphasis)]">
                    {preview.doc.file_name}
                  </p>
                  <p className="truncate text-[10px] text-[var(--text-low-emphasis)]">
                    {preview.doc.document_type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  aria-label="Tutup pratinjau"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-medium-emphasis)] hover:bg-[var(--surface-muted)]"
                >
                  <Icon icon="lucide:x" width={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-auto bg-[var(--surface-muted)]">
                {preview.kind === "pdf" ? (
                  <iframe
                    src={preview.url}
                    title={preview.doc.file_name}
                    className="h-full w-full border-0"
                  />
                ) : (
                  <div className="flex min-h-full items-center justify-center p-4">
                    <img
                      src={preview.url}
                      alt={preview.doc.file_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}