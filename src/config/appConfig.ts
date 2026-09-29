/**
 * ============================================================================
 * KONFIGURASI PUSAT GOOGLE APPS SCRIPT (DATABASE CLOUD GOOGLE SPREADSHEET)
 * ============================================================================
 * 
 * TULISKAN ATAU TEMPELKAN URL WEB APP GOOGLE APPS SCRIPT ANDA DI BAWAH INI:
 * 
 * 💡 KEUNGGULAN SISTEM INI:
 * 1. Saat aplikasi sudah Anda publish dan dibuka di browser lain, HP, laptop operator
 *    sekolah lain, atau jendela incognito, aplikasi LANGSUNG OTOMATIS TERKONEKSI
 *    ke Google Spreadsheet tanpa perlu menginput ulang URL sama sekali!
 * 2. Jika Anda membuat versi deployment baru (New Deployment) di Google Apps Script
 *    dan URL berubah, Anda cukup mengganti nilai variabel di bawah ini satu kali saja.
 *    Semua pengguna di seluruh perangkat otomatis langsung terhubung ke database baru.
 */

export const GOOGLE_APPS_SCRIPT_WEB_APP_URL: string = "https://script.google.com/macros/s/AKfycbyf-UrhwCOkHnIbzMgWIlVuxO7yiTY_0aDzWWDSwM7e4nM1hC2TEIImLDjKAAqMaZB7/exec";

/**
 * Helper untuk mengecek apakah URL Web App valid dan sudah dikonfigurasi di dalam kode.
 */
export const isConfiguredGasUrl = (url?: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith('https://script.google.com/macros/s/') && trimmed.includes('/exec');
};

/**
 * Mendapatkan URL aktif dengan urutan prioritas:
 * 1. URL yang ditulis langsung di dalam kode file ini (GOOGLE_APPS_SCRIPT_WEB_APP_URL)
 * 2. URL dari Environment Variable (jika ada: VITE_GAS_WEB_APP_URL)
 * 3. URL dari parameter fallback / penyimpanan lokal
 */
export const getActiveGasUrl = (fallbackUrl?: string): string => {
  // Prioritas 1: URL langsung di kode file ini
  if (isConfiguredGasUrl(GOOGLE_APPS_SCRIPT_WEB_APP_URL)) {
    return GOOGLE_APPS_SCRIPT_WEB_APP_URL.trim();
  }

  // Prioritas 2: Environment variable jika diset
  const envUrl = (import.meta as any).env?.VITE_GAS_WEB_APP_URL;
  if (isConfiguredGasUrl(envUrl)) {
    return envUrl.trim();
  }

  // Prioritas 3: Fallback dari cache/browser lokal jika ada
  if (isConfiguredGasUrl(fallbackUrl)) {
    return (fallbackUrl || '').trim();
  }

  return (GOOGLE_APPS_SCRIPT_WEB_APP_URL || '').trim();
};
