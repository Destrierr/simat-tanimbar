# Product Requirements Document

## Product

LAND ASSET GIS is an internal land-asset inventory and GIS workspace for BPKAD Kabupaten Kepulauan Tanimbar. It keeps the existing React/Vite interface and serves data through a Laravel REST API backed by PostgreSQL and PostGIS.

## Users and permissions

| Capability | Admin | Operator | Viewer |
|---|---:|---:|---:|
| Dashboard, assets, documents, map, reports | Read/write as noted below | Read/write as noted below | Read only |
| Create/update assets and locations | Yes | Yes | No |
| Delete assets and locations | Yes | No | No |
| Upload/update/delete documents | Yes | Yes / No delete | No |
| Export reports | Yes | Yes | No by default |
| Import spreadsheet | Yes | No by default | No |
| User management, settings, audit log | Yes | No | No |

All write permissions are enforced by Laravel policies and route middleware.

## Functional requirements

- Sign in with username or email and a password; issue and revoke Sanctum tokens.
- Search, filter, sort, paginate, create, update, inspect, and soft-delete land assets.
- Preserve the workbook's 23 domain columns and original values; use database-generated primary keys and `(item_code, register_number)` as the import matching key.
- Upload PDF/JPG/JPEG/PNG files to private Laravel Storage; allow authenticated preview and download.
- Save optional WGS84 point locations; emit GeoJSON in `[longitude, latitude]` order. Never infer coordinates from an empty cell or map link.
- Calculate dashboard metrics and filtered reports from current database records; export asset and document reports to XLSX/PDF.
- Import Excel/CSV rows idempotently and return total, created, updated, and failed row counts with row-level errors.
- Manage role/status changes, protect the last active administrator, record important actions, and configure non-secret system identity values.

## Data and security requirements

- PostgreSQL with PostGIS; migrations enable SRID 4326 geometry and validate latitude/longitude ranges.
- Hash passwords; never return hashes or credentials.
- Apply validation, authorization, rate limits, consistent JSON errors, and private file storage on the server.
- Keep production secrets in environment variables and exclude them from source control.

## Acceptance checks

The feature suite covers login/token use, Viewer denial, Operator asset permissions, GIS axis order, private document upload, report exports, and repeatable Excel import. The frontend production build and Laravel migration/seed are verified locally.
