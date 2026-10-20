import { useQuery } from "@tanstack/react-query";
import { getAllKecamatanService } from "../services/kecamatan";

export function useKecamatanOptions() {
  return useQuery({
    queryKey: ["kecamatan", "all"],
    queryFn: getAllKecamatanService,
    staleTime: 1000 * 60 * 30, // jarang berubah, cache 30 menit
    select: (res) =>
      (res?.data ?? []).map((item) => ({ value: item.nama, label: item.nama })),
  });
}