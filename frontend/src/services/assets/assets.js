import { apiRequest, getAllPages } from "../api";

function fromApiAsset(asset) {
  return {
    ...asset,
    // UI compatibility names; source of truth remains the new backend fields.
    inventory_code: asset.kode_barang,
    register_number: asset.register,
    asset_name: asset.lokasi,
    category: asset.nama_jenis_barang,
    administrative_location: [
      asset.letak_alamat,
      asset.kecamatan ? `Kec. ${asset.kecamatan}` : "",
    ]
      .filter(Boolean)
      .join(", "),
    land_area: asset.luas,
    procurement_year: asset.tahun_pengadaan,
    land_status: asset.status_tanah,
    ownership_status: asset.status_tanah,
    owner_name: asset.nama_pemilik,
    document_date: asset.tanggal_dokumen,
    document_number: asset.no_dokumen_kepemilikan,
    acquisition_origin: asset.asal_usul,
    asset_value: asset.harga,
    description: asset.keterangan,
    pematokan: String(Boolean(asset.pematokan)),
    staking_status: asset.pematokan ? "Sudah dipatok" : "Belum dipatok",
    bpn_progress: asset.progres_bpn,
    issue_type: asset.permasalahan,
    issue_detail: asset.rincian_permasalahan,
    google_maps_url: asset.link_google_maps,
    document_count: asset.document_count ?? 0,
    completeness_status: asset.completeness?.status,
  };
}

function toApiAsset(payload) {
  const address =
    payload.address ||
    payload.letak_alamat ||
    payload.administrative_location?.split(/,\s*Kec\.\s*/i)[0] ||
    "";
  const district =
    payload.kecamatan ||
    payload.district ||
    payload.administrative_location?.match(/Kec\.\s*(.+)$/i)?.[1] ||
    "";
  return {
    nama_jenis_barang: payload.nama_jenis_barang ?? payload.category ?? "",
    kode_barang: payload.kode_barang ?? payload.inventory_code ?? "",
    register: payload.register ?? payload.register_number ?? "",
    luas: payload.luas ?? payload.land_area ?? null,
    tahun_pengadaan:
      payload.tahun_pengadaan ?? payload.procurement_year ?? null,
    lokasi: payload.lokasi ?? payload.asset_name ?? "",
    letak_alamat: address,
    kecamatan: district,
    status_tanah:
      payload.status_tanah ??
      payload.land_status ??
      payload.ownership_status ??
      null,
    nama_pemilik: payload.nama_pemilik ?? payload.owner_name ?? null,
    tanggal_dokumen: payload.tanggal_dokumen ?? payload.document_date ?? null,
    no_dokumen_kepemilikan:
      payload.no_dokumen_kepemilikan ?? payload.document_number ?? null,
    asal_usul: payload.asal_usul ?? payload.acquisition_origin ?? null,
    harga: payload.harga ?? payload.asset_value ?? null,
    keterangan: payload.keterangan ?? payload.description ?? null,
    pematokan: [
      true,
      1,
      "1",
      "true",
      "ya",
      "sudah",
      "sudah dipatok",
      "sudah patok",
    ].includes(
      typeof (payload.pematokan ?? payload.staking_status) === "string"
        ? (payload.pematokan ?? payload.staking_status).trim().toLowerCase()
        : (payload.pematokan ?? payload.staking_status),
    ),
    progres_bpn: payload.progres_bpn ?? payload.bpn_progress ?? null,
    permasalahan: payload.permasalahan ?? payload.issue_type ?? null,
    rincian_permasalahan:
      payload.rincian_permasalahan ?? payload.issue_detail ?? null,
    link_google_maps:
      payload.link_google_maps ?? payload.google_maps_url ?? null,
  };
}

export async function getAllAssetsService(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
  const rows = await getAllPages("/assets", clean);
  return { data: rows.map(fromApiAsset) };
}

export async function getAssetsPageService(params = {}) {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    per_page: String(params.per_page || 10),
  });

  Object.entries(params).forEach(([key, value]) => {
    if (
      !["page", "per_page"].includes(key) &&
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      query.set(key, String(value));
    }
  });

  const response = await apiRequest(`/assets?${query}`);
  return {
    data: (response.data || []).map(fromApiAsset),
    meta: response.meta || {},
  };
}

export async function getAssetDetailService(id) {
  const response = await apiRequest(`/assets/${id}`);
  return { data: fromApiAsset(response.data) };
}

export async function createAssetService(payload) {
  const response = await apiRequest("/assets", {
    method: "POST",
    body: toApiAsset(payload),
  });
  return { data: fromApiAsset(response.data), message: response.message };
}

export async function editAssetService(id, payload) {
  const response = await apiRequest(`/assets/${id}`, {
    method: "PUT",
    body: toApiAsset(payload),
  });
  return { data: fromApiAsset(response.data), message: response.message };
}

export async function deleteAssetService(id) {
  return apiRequest(`/assets/${id}`, { method: "DELETE" });
}

export async function getDashboardSummaryService() {
  const response = await apiRequest("/dashboard/summary");
  const data = response.data || {};
  return {
    data: {
      totalAssets: data.total_assets || 0,
      totalDocuments: data.total_documents || 0,
      docCompleteCount: data.complete_count || 0,
      docIncompleteCount: data.incomplete_count || 0,
      problemCount: data.problem_count || 0,
      byOwnership: Object.fromEntries(
        (data.by_land_status || []).map((row) => [
          row.status_tanah || "Belum diisi",
          Number(row.count),
        ]),
      ),
      byBpnProgress: data.by_bpn_progress || [],
    },
  };
}
