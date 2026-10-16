// ============================================================================
// PURE FRONTEND MODE
// ----------------------------------------------------------------------------
// File ini sebelumnya berisi axios instance + interceptor yang menghubungkan
// aplikasi ke backend (base URL, HMAC signature, refresh token, dsb).
// Semua koneksi backend telah dilepas dari proyek ini — setiap service di
// src/services/** sekarang membaca/menulis data lokal melalui
// src/data/mockDb.js, jadi file ini tidak lagi dipakai untuk memanggil API
// apapun. Dibiarkan sebagai stub kosong agar import lama tidak error.
// ============================================================================
const axiosInstance = null;

export default axiosInstance;
