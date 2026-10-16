import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Alert from "../../components/alert/Alert";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import FormModal from "../../components/modal/FormModal";
import PageHeader from "../../components/header/PageHeader";
import Table from "../../components/table/Table";
import { useAlert } from "../../hooks/useAlert";
import {
  createKecamatanService,
  deleteKecamatanService,
  getAllKecamatanService,
  updateKecamatanService,
} from "../../services/kecamatan";

const kecamatanFields = [
  {
    name: "nama",
    label: "Nama Kecamatan",
    type: "text",
    placeholder: "Masukkan nama kecamatan",
    required: true,
  },
  {
    name: "deskripsi",
    label: "Deskripsi",
    type: "textarea",
    placeholder: "Deskripsi opsional",
    rows: 3,
  },
];

export default function KecamatanPage() {
  const { alert, showAlert } = useAlert();
  const [kecamatan, setKecamatan] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllKecamatanService();
      setKecamatan(data);
    } catch (error) {
      showAlert("error", error?.message || "Gagal memuat data kecamatan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredKecamatan = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    if (!query) return kecamatan;

    return kecamatan.filter((item) =>
      `${item.nama} ${item.deskripsi || ""}`
        .toLocaleLowerCase("id-ID")
        .includes(query),
    );
  }, [kecamatan, search]);

  const openCreate = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editItem) {
        await updateKecamatanService(editItem.id, data);
        showAlert("success", "Data kecamatan berhasil diperbarui.");
      } else {
        await createKecamatanService(data);
        showAlert("success", "Kecamatan berhasil ditambahkan.");
      }
      setIsModalOpen(false);
      setEditItem(null);
      await load();
    } catch (error) {
      showAlert("error", error?.message || "Gagal menyimpan data kecamatan.");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus kecamatan ${item.nama}?`)) return;

    try {
      await deleteKecamatanService(item.id);
      showAlert("success", "Kecamatan berhasil dihapus.");
      await load();
    } catch (error) {
      showAlert("error", error?.message || "Gagal menghapus kecamatan.");
    }
  };

  const columns = [
    {
      header: "No",
      render: (_, index) => index + 1,
    },
    {
      header: "Nama Kecamatan",
      render: (item) => (
        <span className="font-semibold text-[var(--text-high-emphasis)]">
          {item.nama}
        </span>
      ),
    },
    {
      header: "Deskripsi",
      render: (item) => item.deskripsi || "-",
    },
    {
      header: "Aset Terdaftar",
      render: (item) => item.assets_count ?? 0,
    },
    {
      header: "Aksi",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Edit kecamatan"
            onClick={() => openEdit(item)}
            className="icon-button"
          >
            <Icon icon="lucide:square-pen" width={15} />
          </button>
          <button
            type="button"
            title={
              item.assets_count
                ? "Tidak dapat menghapus kecamatan yang digunakan aset"
                : "Hapus kecamatan"
            }
            onClick={() => handleDelete(item)}
            disabled={item.assets_count > 0}
            className="icon-button text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon="lucide:trash-2" width={15} />
          </button>
        </div>
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
              <Icon icon="lucide:map-pinned" />
              Data Referensi
            </>
          }
          title="Manajemen Kecamatan"
          description="Kelola daftar kecamatan yang digunakan pada data aset tanah."
          actions={
            <Button size="small" onClick={openCreate}>
              <Icon icon="lucide:plus" width={15} />
              Tambah Kecamatan
            </Button>
          }
        />

        <Card padding={false} className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="surface-card__title">Daftar Kecamatan</h2>
              <p className="surface-card__description">
                {kecamatan.length} kecamatan terdaftar
              </p>
            </div>
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 sm:w-80">
              <Icon
                icon="lucide:search"
                width={15}
                className="shrink-0 text-[var(--text-low-emphasis)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kecamatan..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-high-emphasis)] outline-none placeholder:text-[var(--text-low-emphasis)]"
              />
            </label>
          </div>
          <div className="min-w-0 overflow-hidden p-4">
            <Table
              columns={columns}
              data={filteredKecamatan}
              loading={loading}
              selectable={false}
              variant="compact"
              emptyMessage="Belum ada kecamatan yang sesuai."
            />
          </div>
        </Card>
      </div>

      <FormModal
        title={editItem ? "Edit Kecamatan" : "Tambah Kecamatan"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditItem(null);
        }}
        fields={kecamatanFields}
        initialData={editItem}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
