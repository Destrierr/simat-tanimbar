import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getAssetsPageService,
  createAssetService,
  editAssetService,
  deleteAssetService,
  uploadAssetDocumentService,
} from "../services/assets/assets";

export const assetKeys = {
  all: ["assets"],
  list: (params) => ["assets", "list", params],
};

export function useAssetsQuery(params) {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => getAssetsPageService(params),
    placeholderData: keepPreviousData,
  });
}

function useAssetMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export const useCreateAsset = () => useAssetMutation(createAssetService);

export const useEditAsset = () =>
  useAssetMutation(({ id, payload }) => editAssetService(id, payload));

export const useDeleteAsset = () => useAssetMutation(deleteAssetService);

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, file, onProgress, documentType }) =>
  uploadAssetDocumentService(assetId, file, onProgress, documentType),
    onSuccess: () => {
      // jumlah dokumen di tabel ikut ter-update
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
};