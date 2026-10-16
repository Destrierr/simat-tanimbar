# Implementation Notes

## Current frontend integration

The Vite app lives under `frontend/`. It retains its React pages/components, Leaflet map, and Zustand store. Its existing local mock service layer is being replaced with HTTP adapters. API resources retain enough legacy aliases for the current UI while canonical database fields match the Excel.

## Excel mapping

| Excel header | API/database field |
|---|---|
| Nama / Jenis Barang | item_name |
| Kode Barang | item_code |
| Register | register_number |
| Luas (m2) | land_area |
| Tahun Pengadaan | acquisition_year |
| Lokasi | location_name |
| Letak/ Alamat | address |
| Kecamatan | district |
| Status Tanah | land_status |
| Jenis Dokumen Kepemilikan | ownership_document_type |
| Nama Pemilik | owner_name |
| Tanggal Dokumen | document_date |
| No. Dokumen Kepemilikan | ownership_document_number |
| Asal Usul | acquisition_origin |
| Harga | asset_value |
| Keterangan | description |
| Pematokan | staking_status |
| Progres BPN | bpn_progress |
| Permasalahan yang Dihadapi | problem_status |
| Rincian Permasalahan | problem_detail |
| Koordinat LatLong | asset_locations latitude/longitude + geometry |
| Link Google Maps | google_maps_url |
| Link Arsip Dokumen | document_archive_reference |

## Deployment values

- Frontend development origin: `http://localhost:5173`
- Backend development origin: `http://127.0.0.1:8000`
- API prefix: `/api`
- Database: PostgreSQL; PostGIS extension required
- Uploaded documents use generated names and private storage by default

## Data initialization and verification

The development seed includes three role accounts and 23 sample rows parsed from the provided Excel workbook. Its source has no usable precise coordinates, so the seed leaves every point unset and map status as unmapped. The Excel import uses the workbook's `Koordinat LatLong` column when it contains a coordinate pair; it never geocodes the Google Maps reference. Development verification uses PostgreSQL 17 with PostGIS and an isolated PostgreSQL test database. Never copy production `.env` credentials into source control.
