# Project Brief

## Tujuan

LAND ASSET GIS mengelola inventaris aset tanah, dokumen kepemilikan, lokasi GIS, pengguna, dan laporan BPKAD Kabupaten Kepulauan Tanimbar melalui React SPA dan Laravel REST API.

## Sumber data

`Data Tanah CP.xlsx` menjadi acuan field serta data awal. Kode barang dan register dipertahankan sebagai string; nomor urut Excel bukan primary key. Null Excel tetap null. Koordinat kosong tidak diisi otomatis. Referensi arsip tetap teks, sedangkan berkas hasil upload disimpan melalui Laravel Storage.

## Modul

- Autentikasi dan role admin/operator/viewer
- Dashboard dan statistik database
- Aset tanah dan detail
- Dokumen digital
- Peta Leaflet dan GeoJSON PostGIS
- Laporan, Excel/PDF
- Manajemen pengguna
- Pengaturan dan activity log
- Import Excel yang idempotent serta melaporkan baris gagal

## Prinsip implementasi

- Frontend yang sudah ada tetap React/Vite; tidak dibuat ulang.
- Validasi, autentikasi, dan izin diberlakukan di backend.
- Aset memakai soft delete dan operasi penting memakai transaksi.
- Data demo serta rahasia production dipisahkan; `.env` tidak masuk version control.

