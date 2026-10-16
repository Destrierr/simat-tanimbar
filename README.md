# Land Asset GIS

Sistem Informasi Manajemen Aset Tanah Berbasis GIS untuk BPKAD Kabupaten Kepulauan Tanimbar.

## Prasyarat

- Node.js 20+
- PHP 8.3+
- Composer 2+
- PostgreSQL 17 dengan ekstensi PostGIS

## Menjalankan frontend

```sh
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Atur `VITE_API_URL` pada `frontend/.env` untuk mengarahkan aplikasi ke Laravel.

## Menjalankan backend

```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Buat database PostgreSQL terlebih dahulu:
# createdb land_asset_gis
# Buat database PostgreSQL, lalu isi DB_DATABASE, DB_USERNAME, dan DB_PASSWORD di .env.
# Pengguna database perlu izin CREATE EXTENSION postgis atau DBA memasang PostGIS lebih dahulu.
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Isi koneksi PostgreSQL lokal di `backend/.env` sebelum migrate. Akun seeder hanya untuk pengembangan lokal:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password` |
| Operator | `operator@example.com` | `password` |
| Viewer | `viewer@example.com` | `password` |

Ubah password demo setelah setup lokal. Jangan pakai kredensial tersebut di production.

Tes backend memakai PostgreSQL/PostGIS database terpisah bernama `land_asset_gis_test`.
Buat database itu dengan `createdb land_asset_gis_test` dan pastikan kredensial `backend/.env` dapat mengaksesnya, lalu jalankan `cd backend && php artisan test`.

## Dokumentasi

Lihat [arsitektur](docs/architecture.md), [implementasi](docs/implementation.md), [project brief](docs/project.md), dan [API](docs/api.md).
