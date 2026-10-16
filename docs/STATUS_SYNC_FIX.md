# Fix: Job Report Status Update Sync Issue

## Problem
Saat approval disetujui, status di detail modal menunjukkan "DISETUJUI" tetapi di tabel masih menampilkan "DRAFT" (tidak terupdate).

## Root Cause
Aplikasi memiliki beberapa halaman yang menampilkan data job report dengan sources yang berbeda:
- **JobReportTable.jsx** (inputter): Menggunakan `/v1/get-jobreport`
- **ApprovalReport.jsx** (approval): Menggunakan `/v1/get-jobreport-approval`
- **ReviewReport.jsx** (reviewer): Menggunakan service terpisah

Data tidak tersinkronisasi antar halaman ketika status berubah di satu halaman, halaman lain tidak tahu tentang perubahan tersebut.

## Solution Implemented

### 1. **Auto-Refresh Mechanism** (5-second interval)
Setiap halaman sekarang secara otomatis refetch data setiap 5 detik untuk memastikan status selalu up-to-date:

```javascript
const refreshInterval = setInterval(fetchData, 5000);
return () => clearInterval(refreshInterval);
```

### 2. **Visibility Change Listener**
Ketika user kembali ke tab aplikasi, data otomatis direfresh:

```javascript
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchData(); // Refetch saat tab aktif
  }
};
document.addEventListener('visibilitychange', handleVisibilityChange);
```

### 3. **Window Focus Listener**
Ketika window mendapat focus, data direfresh:

```javascript
const handleFocus = () => {
  fetchData();
};
window.addEventListener('focus', handleFocus);
```

### 4. **Proper onSuccess Callbacks**
Modal action success handlers sekarang refetch data dari server untuk memastikan state terbaru:

```javascript
const handleSuccess = async () => {
  const result = await getJobReportApproval();
  setRawData(result);
  closeAllModals();
};
```

## Files Modified

### 1. `src/ui/pages/inputter/JobReportTable.jsx`
- ✅ Tambah auto-refresh interval (5 detik)
- ✅ Tambah visibility change listener
- ✅ Tambah window focus listener
- ✅ Improve detail modal close handler dengan error handling

### 2. `src/ui/pages/approval/ApprovalReport.jsx`
- ✅ Tambah auto-refresh interval (5 detik)
- ✅ Tambah visibility change listener
- ✅ Tambah window focus listener
- ✅ handleSuccess sudah refetch data

### 3. `src/ui/pages/reviewer/ReviewReport.jsx`
- ✅ Tambah auto-refresh interval (5 detik)
- ✅ Tambah visibility change listener
- ✅ Tambah window focus listener
- ✅ Ubah onSuccess callbacks untuk refetch data dari server

## How It Works Now

### Skenario: User A Melakukan Approval

1. **User B berada di halaman JobReportTable (inputter)**
   - Halaman melakukan auto-refresh setiap 5 detik
   - Dapat visibility change listener

2. **User A melakukan approval di ApprovalReport**
   - Backend update status menjadi "DISETUJUI"
   - ApprovalReport merefresh data dengan handleSuccess
   - User A melihat status updated di tabelnya

3. **User B kembali ke tab aplikasi / atau menunggu 5 detik berikutnya**
   - Visibility change listener trigger → refetch
   - Atau interval 5 detik trigger → refetch
   - JobReportTable menampilkan status "DISETUJUI"

## Benefits

✅ **Real-time-ish updates** - Data refresh maksimal 5 detik
✅ **Tab switching aware** - Refetch saat user kembali ke tab
✅ **No stale data** - Detail modal refetch sebelum ditutup
✅ **Network friendly** - Hanya refetch jika perlu (interval + events)
✅ **Fallback handling** - Error handling untuk refetch failure

## Testing

Untuk test solusi ini:

1. Buka 2 browser tab: satu di halaman approval, satu di halaman inputter
2. Lakukan approval di tab pertama
3. Kembali ke tab kedua → Status harus update otomatis dalam 5 detik
4. Atau tukar tab (minimize/maximize) → Trigger refetch immediate
5. Buka detail modal → Saat menutup akan refetch status terbaru

## Future Improvements

Untuk solusi yang lebih optimal ke depan, pertimbangkan:
1. **Gunakan WebSocket** untuk real-time updates
2. **Implement React Query/SWR** untuk data caching yang lebih baik
3. **Gunakan event emitter system** untuk komunikasi antar halaman
4. **Adjust interval time** berdasarkan performa
