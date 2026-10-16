# Sistem Informasi Manajemen Aset Tanah — Backend

Backend REST API untuk **Sistem Informasi Manajemen Aset Tanah Berbasis Web** Pemerintah Kabupaten Kepulauan Tanimbar.

## Stack

- PHP 8.3+
- Laravel 13
- Laravel Sanctum
- PostgreSQL
- Laravel Storage untuk dokumen privat
- Maatwebsite Excel untuk export Excel
- DomPDF untuk export PDF

## Scope saat ini

Sistem mencakup:

- authentication dan role-based authorization;
- manajemen user: Admin, Operator, Viewer;
- CRUD aset tanah;
- dokumen digital dan metadata;
- kelengkapan data aset;
- status tanah, pematokan, progres BPN, dan permasalahan;
- pencarian dan server-side filtering;
- informasi lokasi administratif dan link Google Maps;
- laporan dan export PDF/Excel.

**Tidak termasuk:** GIS, latitude/longitude, GPS survey, polygon bidang, Leaflet/OpenStreetMap, spatial query, dan PostGIS.

## Struktur database

- `role`
- `users`
- `kecamatan`
- `status_tanah`
- `progres_bpn`
- `jenis_dokumen`
- `assets`
- `dokumen_aset`

Relasi:

- `role 1:N users`
- `kecamatan 1:N assets`
- `status_tanah 1:N assets`
- `progres_bpn 1:N assets`
- `assets 1:N dokumen_aset`
- `jenis_dokumen 1:N dokumen_aset`
- `users 1:N dokumen_aset` melalui `diunggah_oleh`

Dokumen fisik disimpan pada Laravel Storage private; metadata disimpan pada PostgreSQL. Endpoint download melakukan authorization sebelum file diberikan. Status pematokan dan permasalahan disimpan sebagai boolean di tabel `assets`.

## Role

| Role | Akses |
|---|---|
| Admin | User + Asset + Document + Report |
| Operator | Asset + Document + Report |
| Viewer | Read-only Asset + Report |

Permission diperiksa di backend menggunakan Policy.

## API utama

### Auth

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

Login menggunakan `email` dan `password`.

### Assets

- `GET /api/assets`
- `POST /api/assets`
- `GET /api/assets/{id}`
- `PUT /api/assets/{id}`
- `DELETE /api/assets/{id}`

Filter mendukung `search`, `kecamatan`, `status_tanah`, `tahun_pengadaan`, `jenis_dokumen_kepemilikan`, `progres_bpn`, `completeness`, `page`, dan `per_page`.

### Documents

- `GET /api/assets/{asset}/documents`
- `POST /api/assets/{asset}/documents`
- `GET /api/documents/{id}`
- `DELETE /api/documents/{id}`
- `GET /api/documents/{id}/download`

### Reports

- `GET /api/reports/assets`
- `GET /api/reports/summary`
- `GET /api/reports/export/pdf`
- `GET /api/reports/export/excel`

### Users

Admin only:

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`

## Menjalankan project

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Pastikan PostgreSQL sudah tersedia dan nilai `DB_*` pada `.env` sesuai dengan database lokal.

Seeder menyediakan tiga akun development dengan password `password`:

- `admin@example.com`
- `operator@example.com`
- `viewer@example.com`

Ganti password tersebut sebelum deployment.

## Catatan completeness

Dokumen perencanaan menyebutkan bahwa field wajib final harus disepakati pada tahap analisis kebutuhan. Implementasi ini menyediakan aturan awal yang eksplisit di `app/Services/AssetCompletenessService.php` agar fitur completeness dapat langsung digunakan dan diuji. Daftar tersebut dapat disesuaikan tanpa mengubah struktur database.
