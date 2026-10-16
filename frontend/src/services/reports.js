import { apiRequest } from "./api";

export async function getReportAssetsService(filters = {}) {
  const mapped = {
    search: filters.search,
    kecamatan: filters.location || filters.kecamatan,
    status_tanah: filters.status_tanah || filters.status,
    tahun_pengadaan: filters.tahun_pengadaan,
    progres_bpn: filters.progres_bpn,
    completeness: filters.completeness,
    per_page: filters.per_page || 100,
    page: filters.page || 1,
  };
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(mapped).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null,
      ),
    ),
  );
  return apiRequest(`/reports/assets?${query}`);
}

export async function getReportSummaryService() {
  return apiRequest("/reports/summary");
}

export async function downloadReport(format, filters = {}) {
  const mapped = {
    search: filters.search,
    kecamatan: filters.location || filters.kecamatan,
    status_tanah: filters.status_tanah || filters.status,
    tahun_pengadaan: filters.tahun_pengadaan,
    progres_bpn: filters.progres_bpn,
    completeness: filters.completeness,
  };
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(mapped).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null,
      ),
    ),
  );
  const suffix = query.size ? `?${query}` : "";
  return apiRequest(`/reports/export/${format}${suffix}`, {
    responseType: "blob",
  });
}
