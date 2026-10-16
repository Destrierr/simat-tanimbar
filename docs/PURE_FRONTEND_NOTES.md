# Catatan — TanahGIS (Pure Frontend Dashboard)

Template ini awalnya adalah aplikasi helpdesk chat, sekarang sudah diubah
sepenuhnya menjadi dashboard untuk capstone **Sistem Informasi Manajemen
Aset Tanah Berbasis GIS** (BPKAD Kabupaten Kepulauan Tanimbar). Masih dalam
mode **pure frontend** — tidak ada koneksi ke backend/API manapun, semua
data disimpan di memori browser (`src/data/mockDb.js`) dan reset setiap
refresh halaman.

## Halaman yang tersedia

| Route | Halaman | Akses |
|---|---|---|
| `/` | Login | Semua |
| `/dashboard` | Ringkasan statistik aset | Admin, Operator, Viewer |
| `/assets` | Daftar & CRUD aset tanah | Admin, Operator, Viewer (Viewer read-only) |
| `/assets/:id` | Detail aset + dokumen + mini-peta | Admin, Operator, Viewer |
| `/map` | Peta GIS sebaran aset | Admin, Operator, Viewer |
| `/reports` | Laporan inventaris + export Excel/PDF | Admin, Operator, Viewer |
| `/users` | Manajemen pengguna | Admin saja |

## Cara login (demo)

Login selalu berhasil dengan username apa pun; role ditentukan dari kata
di dalam username yang diketik:

| Username mengandung | Masuk sebagai |
|---|---|
| `admin...`    | **Admin** — akses penuh termasuk manajemen pengguna |
| `operator...` | **Operator** — kelola aset, dokumen, tidak bisa kelola pengguna |
| lainnya       | **Viewer** — hanya melihat, tombol tambah/edit/hapus disembunyikan |

Contoh: `admin1` → Admin, `operator1` → Operator, `viewer1` → Viewer.

## Yang perlu diketahui

- **Peta GIS** pada halaman `/map` dan mini-peta di detail aset masih berupa
  visual dekoratif (posisi marker dihitung dari latitude/longitude aset,
  digambar dengan CSS/SVG) — bukan peta Leaflet/OpenStreetMap sungguhan,
  supaya tetap jalan tanpa akses internet. Sesuai `architecture.md` di
  proyekmu, saat backend sudah siap, ini tinggal diganti komponen
  `react-leaflet` (`<MapContainer>` + `<TileLayer>`) yang menerima data
  yang sama persis dari `getAllAssetsService()`.
- **Export Laporan**: tombol "Unduh Excel" menghasilkan file `.csv` asli
  yang bisa dibuka Excel. Tombol "Cetak / Simpan PDF" membuka halaman cetak
  di tab baru — gunakan dialog print browser (Ctrl/Cmd+P → Save as PDF).
- **Upload dokumen** disimulasikan (progress bar lokal), tidak ada file yang
  benar-benar tersimpan di server manapun.
- Semua service di `src/services/**` sudah punya nama fungsi & bentuk data
  yang konsisten dengan `implementation.md` (mis. `GET /api/assets`,
  `POST /api/assets/{id}/documents`, dst) — jadi saat backend Laravel-nya
  jadi, tinggal ganti isi fungsi-fungsi ini dengan `axios` call ke endpoint
  sungguhan, tanpa perlu ubah halaman/komponen React sama sekali.

## Menjalankan

```bash
npm install
npm run dev
```

Tidak perlu backend, database, atau file `.env` apapun.
