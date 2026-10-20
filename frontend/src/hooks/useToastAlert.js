import { useCallback, useState } from "react";

// Ambil pesan validasi pertama dari backend, kalau tidak ada pakai message
export function getErrorMessage(err, fallback) {
  const validationErrors = err?.response?.data?.errors ?? err?.errors;

  if (validationErrors) {
    const first = Object.values(validationErrors).flat()[0];
    if (first) return first;
  }

  return err?.response?.data?.message || err?.message || fallback;
}

export function useToastAlert() {
  const [alertState, setAlertState] = useState({
    show: false,
    id: 0,
    type: "success",
    title: "",
    description: "",
  });

  const showAlert = useCallback((type, message) => {
    const isError = type === "error";

    setAlertState((current) => ({
      show: true,
      id: current.id + 1,
      type: isError ? "delete" : type,
      title: isError ? "Gagal" : "Berhasil",
      description:
        typeof message === "string" && message.trim()
          ? message
          : isError
            ? "Terjadi kesalahan. Silakan coba lagi."
            : "Aksi berhasil dilakukan.",
    }));
  }, []);

  const closeAlert = useCallback(
    () => setAlertState((current) => ({ ...current, show: false })),
    [],
  );

  return { alertState, showAlert, closeAlert };
}