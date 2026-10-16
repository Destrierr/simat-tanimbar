# API

Base URL for local development: `http://127.0.0.1:8000/api`. Except login, calls require `Authorization: Bearer <token>` and `Accept: application/json`.

Success envelope: `{ "success": true, "message": "...", "data": {}, "meta": {} }`. Validation errors use HTTP 422 and `{ "success": false, "message": "...", "errors": {} }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/login` | Public, rate limited | Authenticate username/email and issue Sanctum token |
| POST | `/logout` | Authenticated | Revoke current token |
| GET | `/me` | Authenticated | Current user |
| PUT | `/me` | Authenticated | Update own profile |
| PUT | `/me/password` | Authenticated | Change own password |
| DELETE | `/profile/photo` | Authenticated | Remove own profile photo |
| GET | `/dashboard/summary` | All roles | Database-backed dashboard statistics |
| GET | `/dashboard/recent-assets` | All roles | Most recently updated assets |
| GET | `/dashboard/recent-documents` | All roles | Latest uploaded documents |
| GET | `/dashboard/recent-activities` | All roles | Latest activity entries |
| GET | `/dashboard/ownership-statistics` | All roles | Asset counts by land status |
| GET | `/dashboard/document-statistics` | All roles | Complete/incomplete document counts |
| GET | `/dashboard/location-statistics` | All roles | Mapped/unmapped counts and district totals |
| GET/POST | `/assets` | Read / Admin+Operator | Search, filters, pagination / create |
| GET/PUT/DELETE | `/assets/{asset}` | Read / Admin+Operator / Admin | Detail, update, soft delete |
| GET | `/assets/{asset}/full-detail` | All roles | Asset, location, document metadata |
| GET | `/assets/{asset}/documents` | All roles | Related uploaded documents |
| POST | `/assets/{asset}/documents` | Admin+Operator | Validated multipart upload |
| POST | `/documents` | Admin+Operator | Upload using `land_asset_id` in multipart form |
| GET | `/documents` | All roles | Search/filter/paginated document list |
| GET | `/documents/{document}` | All roles | Document metadata |
| PUT/DELETE | `/documents/{document}` | Admin+Operator / Admin | Update metadata / soft delete and remove file |
| GET | `/documents/{document}/download` | All roles | Authenticated download |
| GET | `/documents/{document}/preview` | All roles | Authenticated inline preview |
| GET | `/map/assets` | All roles | GIS assets and mapping status |
| GET | `/map/geojson` | All roles | GeoJSON FeatureCollection |
| GET/POST | `/assets/{asset}/location` | Read / Admin+Operator | Current point / create point |
| PUT/DELETE | `/assets/{asset}/location` | Admin+Operator / Admin | Update / delete point |
| GET | `/reports` | All roles | Filtered report data |
| GET | `/reports/export.xlsx` | Admin+Operator | Download Excel |
| GET | `/reports/export.pdf` | Admin+Operator | Download PDF |
| POST | `/assets/import` | Admin | Idempotent Excel import and row error report |
| GET | `/assets/export/excel` | Admin+Operator | Export asset inventory as Excel |
| GET | `/reports/assets` | All roles | Filtered asset report |
| GET | `/reports/documents` | All roles | Filtered document report |
| GET | `/reports/locations` | All roles | Asset locations and mapping status |
| GET | `/reports/problems` | All roles | Assets with reported problems |
| GET | `/reports/ownership` | All roles | Ownership report |
| GET | `/reports/assets/export/{pdf|excel}` | Admin+Operator | Export asset report |
| GET | `/reports/documents/export/{pdf|excel}` | Admin+Operator | Export document report |
| GET/POST | `/users` | Admin | Search/filter/pagination and create users |
| GET/PUT/DELETE | `/users/{user}` | Admin | User details and management |
| PATCH | `/users/{user}/status` | Admin | Activate/deactivate |
| PATCH | `/users/{user}/role` | Admin | Change role |
| GET | `/activity-logs` | Admin | Searchable audit history |
| GET/PUT | `/settings` | Admin | Read/update system settings |

GeoJSON uses `[longitude, latitude]`; assets without coordinates are omitted from `features` and report `location_status: "belum_dipetakan"` in normal API resources. Coordinate bounds are validated before persistence.

### Example requests

```http
POST /api/login
Content-Type: application/json
Accept: application/json

{"login":"admin@example.com","password":"password"}
```

```http
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json

{"item_name":"Tanah Kantor","item_code":"01.01","register_number":"42","land_area":2500,"district":"Tanimbar Selatan"}
```

Errors use HTTP status codes and the common `{ "success": false, "message": "...", "errors": {} }` envelope. Asset and report list endpoints accept `search`, relevant field filters, `sort`, `direction`, `page`, and `per_page` where applicable. Login is limited to five attempts per minute per client.
