import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadReport,
  getReportAssetsService,
  getReportSummaryService,
} from "../services/reports";

export const reportKeys = {
  all: ["reports"],
  summary: () => [...reportKeys.all, "summary"],
  assets: (params) => [...reportKeys.all, "assets", params],
};

// Ringkasan laporan. Hasilnya langsung objek summary (isi `data` dari response)
export function useReportSummary() {
  return useQuery({
    queryKey: reportKeys.summary(),
    queryFn: getReportSummaryService,
    select: (res) => res?.data ?? null,
  });
}

// Daftar laporan. Refetch otomatis saat filters / page / pageSize berubah
export function useReportAssets({ filters, page, pageSize }) {
  const params = { ...filters, page, per_page: pageSize };

  return useQuery({
    queryKey: reportKeys.assets(params),
    queryFn: () => getReportAssetsService(params),
    placeholderData: keepPreviousData, // v4: ganti dengan keepPreviousData: true
  });
}

// Export PDF / Excel
export function useExportReport({ onError } = {}) {
  return useMutation({
    mutationFn: ({ format, filters }) => downloadReport(format, filters),
    onSuccess: (blob, { format }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-aset-tanah.${format === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error, { format }) => {
      onError?.(error?.message || `Gagal mengekspor ${format}`);
    },
  });
}