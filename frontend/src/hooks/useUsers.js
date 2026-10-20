import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createUserService,
  deleteUserService,
  editUserService,
  getAllUsersService,
  setUserStatusService,
} from "../services/crud_user/create_user";

export const userKeys = {
  all: ["users"],
  list: (params) => [...userKeys.all, "list", params],
};

export function useUsers(params) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getAllUsersService(params),
    placeholderData: keepPreviousData, // v4: keepPreviousData: true
  });
}

// Setelah create/edit/delete/ubah status, semua daftar user di-refetch
function useUserMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export const useCreateUser = () => useUserMutation(createUserService);

export const useEditUser = () =>
  useUserMutation(({ id, data }) => editUserService(id, data));

export const useDeleteUser = () => useUserMutation(deleteUserService);

export const useSetUserStatus = () =>
  useUserMutation(({ id, status }) => setUserStatusService(id, status));