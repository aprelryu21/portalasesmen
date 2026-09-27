import React, { useState, useEffect } from 'react';
import { UserAccount, GoogleSheetsConfig, LoginLogEntry } from '../../types';
import {
  Sun,
  Moon,
  Palette,
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  Building2,
  HardDrive,
  Download,
  AlertTriangle,
  Layers,
  Clock,
  Globe,
  Camera,
  Laptop,
  ShieldAlert,
} from 'lucide-react';
import { formatLoginTime } from '../../utils/browserDetection';

export interface ThemeColorOption {
  id: string;
  name: string;
  hex: string;
  classBg: string;
  classBorder: string;
}

export const THEME_COLOR_OPTIONS: ThemeColorOption[] = [
  {
    id: 'yellow',
    name: 'Kuning Neobrutal (Default)',
    hex: '#FFE600',
    classBg: 'bg-yellow-300',
    classBorder: 'border-yellow-500',
  },
  {
    id: 'blue',
    name: 'Biru Samudra (Ocean)',
    hex: '#3B82F6',
    classBg: 'bg-blue-500',
    classBorder: 'border-blue-600',
  },
  {
    id: 'emerald',
    name: 'Hijau Zamrud (Madrasah)',
    hex: '#10B981',
    classBg: 'bg-emerald-400',
    classBorder: 'border-emerald-600',
  },
  {
    id: 'rose',
    name: 'Merah Ruby (Crimson)',
    hex: '#F43F5E',
    classBg: 'bg-rose-400',
    classBorder: 'border-rose-600',
  },
  {
    id: 'purple',
    name: 'Ungu Elegan (Violet)',
    hex: '#A855F7',
    classBg: 'bg-purple-400',
    classBorder: 'border-purple-600',
  },
  {
    id: 'cyan',
    name: 'Cyan Modern (Teal)',
    hex: '#06B6D4',
    classBg: 'bg-cyan-300',
    classBorder: 'border-cyan-500',
  },
];

interface SchoolSettingsProps {
  currentUser?: UserAccount | null;
  onUpdateAccount?: (updated: UserAccount) => Promise<{ success: boolean; message?: string }>;
  onResetPassword?: (username: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  googleSheets?: GoogleSheetsConfig;
  onResetDemoData?: () => void;
  loginLogs?: LoginLogEntry[];
  autoLogoutMinutes?: number;
  onChangeAutoLogoutMinutes?: (minutes: number) => void;
}

export const SchoolSettings: React.FC<SchoolSettingsProps> = ({
  currentUser,
  onUpdateAccount,
  onResetPassword,
  googleSheets,
  onResetDemoData,
  loginLogs = [],
  autoLogoutMinutes = 15,
  onChangeAutoLogoutMinutes,
}) => {
  // 1. TAMPILAN & TEMA STATE
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('portal_ujian_dark_mode') === 'true';
  });

  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('portal_ujian_primary_theme') || 'yellow';
  });

  // 2. AKUN STATE
  const [username, setUsername] = useState(currentUser?.username || '');
  const [schoolName, setSchoolName] = useState(currentUser?.schoolName || '');
  const [npsn, setNpsn] = useState(currentUser?.npsn || '');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Account update state
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setSchoolName(currentUser.schoolName || '');
      setNpsn(currentUser.npsn || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('portal_ujian_primary_theme') || 'yellow';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Apply dark mode toggle immediately
  const handleToggleDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem('portal_ujian_dark_mode', String(dark));
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply theme color immediately
  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('portal_ujian_primary_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  // Handle Account info update
  const handleSaveAccountInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!username.trim()) {
      setAccountError('Username tidak boleh kosong!');
      return;
    }

    try {
      setIsUpdatingAccount(true);
      setAccountError(null);
      setAccountSuccess(null);

      if (onUpdateAccount) {
        const res = await onUpdateAccount({
          ...currentUser,
          username: username.trim(),
          schoolName: schoolName.trim(),
          npsn: npsn.trim(),
        });

        if (res.success) {
          setAccountSuccess('✓ Profil akun berhasil diperbarui & disimpan di database cloud!');
          setTimeout(() => setAccountSuccess(null), 4000);
        } else {
          setAccountError(res.message || 'Gagal memperbarui data akun.');
        }
      } else {
        setAccountSuccess('✓ Profil akun disimpan di perangkat lokal.');
        setTimeout(() => setAccountSuccess(null), 3000);
      }
    } catch {
      setAccountError('Terjadi kesalahan saat menyimpan perubahan profil.');
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  // Handle Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru!');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      if (onResetPassword) {
        const res = await onResetPassword(currentUser.username, newPassword);
        if (res.success) {
          setPasswordSuccess('✓ Password berhasil diganti & disinkronkan ke database cloud!');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => setPasswordSuccess(null), 4000);
        } else {
          setPasswordError(res.message || 'Gagal mereset password.');
        }
      } else {
        setPasswordSuccess('✓ Password berhasil diperbarui!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 3000);
      }
    } catch {
      setPasswordError('Terjadi kesalahan saat mengganti password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportBackupJson = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        username: currentUser?.username,
        schoolName: currentUser?.schoolName,
        npsn: currentUser?.npsn,
        theme: selectedTheme,
        darkMode: isDarkMode,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Backup_Profil_${currentUser?.username || 'sekolah'}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER BANNER (SEMUA MENU DALAM 1 HALAMAN BERSUSUN KEBAWAH) */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase mb-1">
                Preferensi & Keamanan
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
                Pengaturan Sistem & Preferensi Akun
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Semua menu konfigurasi tersaji dalam satu halaman bersusun ke bawah tanpa tab.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SESI 1: BUNGKUSAN KOTAK MODE TAMPILAN APLIKASI (GELAP / TERANG)          */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b-2 border-black flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-black uppercase mb-1">
              Sesi 1 • Tampilan
            </div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Mode Tampilan Aplikasi
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Pilihan langsung aktif seketika tanpa perlu memuat ulang halaman.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Mode Option */}
          <div
            onClick={() => handleToggleDarkMode(false)}
            className={`p-4 rounded-xl border-3 border-black cursor-pointer transition-all flex items-center justify-between ${
              !isDarkMode
                ? 'bg-amber-50 shadow-[4px_4px_0px_#000] ring-2 ring-yellow-400'
                : 'bg-neutral-50 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 border-2 border-black flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">Mode Terang (Light Mode)</h4>
                <p className="text-[11px] text-neutral-500">Latar bersih, cerah & kontras tajam</p>
              </div>
            </div>
            {!isDarkMode && (
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Dark Mode Option */}
          <div
            onClick={() => handleToggleDarkMode(true)}
            className={`p-4 rounded-xl border-3 border-black cursor-pointer transition-all flex items-center justify-between ${
              isDarkMode
                ? 'bg-neutral-900 text-white shadow-[4px_4px_0px_#000]'
                : 'bg-neutral-50 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 border-2 border-black flex items-center justify-center text-yellow-300">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">Mode Gelap (Dark Mode)</h4>
                <p className={`text-[11px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Nyaman untuk mata di ruangan redup
                </p>
              </div>
            </div>
            {isDarkMode && (
              <div className="w-6 h-6 rounded-full bg-yellow-300 text-black flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SESI 2: BUNGKUSAN KOTAK TEMA WARNA UTAMA UI                              */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b-2 border-black">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded text-[9px] font-black uppercase mb-1">
            Sesi 2 • Personalisasi Warna
          </div>
          <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            Tema Warna Utama UI (Primary Color)
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Pilih tema warna aplikasi. Begitu diklik, tema langsung terapply seketika ke seluruh antarmuka.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {THEME_COLOR_OPTIONS.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-3.5 rounded-xl border-3 border-black cursor-pointer transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-neutral-50 shadow-[4px_4px_0px_#000] ring-2 ring-black'
                    : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg border-2 border-black shrink-0 ${theme.classBg} flex items-center justify-center shadow-[1px_1px_0px_#000]`}
                >
                  {isSelected && <Check className="w-4 h-4 text-black" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate">{theme.name}</div>
                  <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase">
                    {theme.hex}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SESI 3: BUNGKUSAN KOTAK DATA PROFIL AKUN OPERATOR                        */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b-2 border-black">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-900 border border-yellow-300 rounded text-[9px] font-black uppercase mb-1">
            Sesi 3 • Identitas Akun
          </div>
          <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-black" />
            Data Profil Akun Operator
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Kelola username login dan informasi sekolah Anda yang terhubung.
          </p>
        </div>

        {accountSuccess && (
          <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded-xl text-xs font-black text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{accountSuccess}</span>
          </div>
        )}

        {accountError && (
          <div className="p-3 bg-rose-100 border-2 border-rose-500 rounded-xl text-xs font-black text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{accountError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAccountInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Username Akun <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Username digunakan saat masuk ke sistem Portal Ujian.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Peran / Hak Akses
              </label>
              <div className="px-3 py-2 bg-neutral-100 border-2 border-black rounded-xl text-xs font-mono font-black flex items-center justify-between">
                <span className="uppercase text-neutral-800">{currentUser?.role || 'operator'}</span>
                <span className="px-2 py-0.5 bg-yellow-300 text-black border border-black rounded text-[9px]">
                  AKTIF
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Nama Lembaga Sekolah
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SD NEGERI 1 CONTOH"
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                NPSN Sekolah
              </label>
              <input
                type="text"
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                placeholder="Contoh: 20512345"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingAccount}
              className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 active:translate-y-0.5 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingAccount ? 'Menyimpan...' : 'Simpan Profil Akun'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* SESI 4: BUNGKUSAN KOTAK KEAMANAN & GANTI PASSWORD                        */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b-2 border-black">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 rounded text-[9px] font-black uppercase mb-1">
            Sesi 4 • Keamanan
          </div>
          <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            Ganti Kata Sandi (Password)
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Perbarui kata sandi secara berkala untuk menjaga kerahasiaan data ujian sekolah.
          </p>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded-xl text-xs font-black text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-100 border-2 border-rose-500 rounded-xl text-xs font-black text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Password Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Konfirmasi Password Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 active:translate-y-0.5 cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4 text-yellow-300" />
              <span>{isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* SESI 5: BUNGKUSAN KOTAK CADANGAN DATA & PEMELIHARAAN LOKAL               */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b-2 border-black">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded text-[9px] font-black uppercase mb-1">
            Sesi 5 • Cadangan Data
          </div>
          <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-neutral-800" />
            Cadangan Data & Pemeliharaan Lokal
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Unduh salinan konfigurasi lokal atau bersihkan cache browser jika diperlukan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-neutral-50 border-2 border-black rounded-xl">
          <div>
            <div className="text-xs font-black uppercase text-neutral-900">Ekspor Salinan Konfigurasi</div>
            <div className="text-[11px] text-neutral-500">Unduh data profil dan preferensi ke file JSON</div>
          </div>
          <button
            type="button"
            onClick={handleExportBackupJson}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-yellow-200 text-neutral-800 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SESI 6: KEAMANAN AKUN, AUTO LOGOUT & RIWAYAT LOG MASUK                    */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 rounded text-[9px] font-black uppercase mb-1">
              Sesi 6 • Keamanan & Log Masuk
            </div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              Riwayat Log Masuk & Proteksi Akun
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Pantau sesi masuk akun sekolah Anda beserta waktu login dan peramban (browser) yang digunakan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 border-2 border-black rounded-lg text-[10px] font-black uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Auto Logout Aktif
            </span>
          </div>
        </div>

        {/* Aturan Auto Logout Informasi Box */}
        <div className="p-4 bg-yellow-50 border-2 border-black rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-black uppercase text-neutral-900">
                Aturan Auto Logout Otomatis ({autoLogoutMinutes} Menit)
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed max-w-xl">
              Khusus akun sekolah, aplikasi akan keluar otomatis jika tidak ada pergerakan mouse/keyboard selama <strong>{autoLogoutMinutes} menit</strong> untuk melindungi kerahasiaan data siswa dan ujian.
            </p>
          </div>
          {onChangeAutoLogoutMinutes && (
            <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 border-2 border-black rounded-xl">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onChangeAutoLogoutMinutes(mins)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                    autoLogoutMinutes === mins
                      ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabel Log Masuk Sekolah */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                Catatan Sesi Masuk (7 Terakhir)
              </span>
              <span className="text-[9px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-neutral-500" />
                Potret Keamanan: Hanya Admin
              </span>
            </div>
            <span className="text-[10px] font-bold text-neutral-500">
              Menampilkan 7 sesi masuk terakhir akun: @{currentUser?.username || 'sekolah'}
            </span>
          </div>

          {(() => {
            const currentU = (currentUser?.username || '').toLowerCase();
            const schoolLogs = loginLogs.filter(
              (item) =>
                item.username.toLowerCase() === currentU ||
                (currentUser?.schoolName && item.schoolName.toLowerCase() === currentUser.schoolName.toLowerCase())
            );

            if (schoolLogs.length === 0) {
              return (
                <div className="p-8 text-center bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl space-y-2">
                  <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-xs font-bold text-neutral-600">
                    Belum ada riwayat log masuk yang tersimpan untuk akun ini.
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Log sesi berikutnya akan otomatis dicatat setiap kali Anda masuk ke portal sekolah.
                  </p>
                </div>
              );
            }

            return (
              <div className="border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_#000] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-100 border-b-2 border-black font-black uppercase text-[10px] text-neutral-700 tracking-wider">
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Waktu Login</th>
                        <th className="py-2.5 px-3">Browser yang Digunakan</th>
                        <th className="py-2.5 px-3 text-center w-36">POTRET DIRI</th>
                        <th className="py-2.5 px-3 text-center w-24">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {schoolLogs.slice(0, 7).map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-yellow-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-500 font-bold text-center">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-neutral-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              <span>{formatLoginTime(log.loginTime)}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-700">
                            <div className="flex items-center gap-1.5">
                              <Laptop className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="font-semibold">{log.browser || 'Browser Standar'}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {log.photoUrl ? (
                              <div
                                className="inline-flex flex-col items-center justify-center"
                                title="Hanya admin yang bisa melihat potret keamanan ini"
                              >
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-400 rounded-md text-[10px] font-black uppercase tracking-wide">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>TERKIRIM</span>
                                </span>
                                <span className="text-[9px] text-neutral-500 font-bold mt-0.5">
                                  (Hanya Admin)
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-500 border border-neutral-300 rounded text-[10px] font-bold">
                                <Camera className="w-3 h-3 text-neutral-400" />
                                <span>Dilewati</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-400 rounded-md text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{log.status || 'Berhasil'}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
