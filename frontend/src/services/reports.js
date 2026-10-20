import { http } from "./http";

function mapFilters(filters = {}) {
  const mapped = {
    search: filters.search,
    kecamatan: filters.location || filters.kecamatan,
    status_tanah: filters.status_tanah || filters.status,
    tahun_pengadaan: filters.tahun_pengadaan,
    progres_bpn: filters.progres_bpn,
    completeness: filters.completeness,
  };

  // Sama seperti service aset: buang nilai kosong supaya tidak ikut terkirim
  return Object.fromEntries(
    Object.entries(mapped).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
}

export async function getReportAssetsService(filters = {}) {
  const { data: body } = await http.get("/reports/assets", {
    params: {
      ...mapFilters(filters),
      per_page: filters.per_page || 100,
      page: filters.page || 1,
    },
  });

  return {
    data: body.data || [],
    meta: body.meta || {},
  };
}

export async function getReportSummaryService() {
  const { data: body } = await http.get("/reports/summary");
  return body; // { data: {...} }
}

export async function downloadReport(format, filters = {}) {
  const { data: blob } = await http.get(`/reports/export/${format}`, {
    params: mapFilters(filters),
    responseType: "blob",
  });
  return blob;
}