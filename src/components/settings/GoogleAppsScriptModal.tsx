import React, { useState } from 'react';
import { GoogleSheetsConfig, School, Exam, Student, Teacher, CardDesignSettings, PrintSettings, UserAccount } from '../../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../utils/gasScriptTemplate';
import { testGasConnection, gasSaveAllData } from '../../utils/gasApi';
import { GOOGLE_APPS_SCRIPT_WEB_APP_URL, isConfiguredGasUrl } from '../../config/appConfig';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Link,
  ShieldCheck,
  Layers,
  Code2,
  Globe2,
} from 'lucide-react';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onSaveConfig: (newConfig: GoogleSheetsConfig) => void;
  currentUser: UserAccount | null;
  school: School;
  exam: Exam;
  exams?: Exam[];
  students: Student[];
  teachers?: Teacher[];
  cardDesign: CardDesignSettings;
  printSettings: PrintSettings;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentUser,
  school,
  exam,
  exams = [],
  students,
  teachers = [],
  cardDesign,
  printSettings,
}) => {
  const [webAppUrl, setWebAppUrl] = useState<string>(config.webAppUrl || '');
  const [copied, setCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCode, setShowCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Gagal menyalin teks ke clipboard. Silakan salin manual.');
    }
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setMessage({ type: 'error', text: 'Masukkan Web App URL Google Apps Script terlebih dahulu!' });
      return;
    }

    setIsTesting(true);
    setMessage(null);

    try {
      const res = await testGasConnection(webAppUrl);
      if (res.status === 'success') {
        const updatedConfig: GoogleSheetsConfig = {
          webAppUrl: webAppUrl.trim(),
          spreadsheetId: res.spreadsheetId,
          spreadsheetName: res.spreadsheetName,
          lastSyncedAt: new Date().toISOString(),
          isConnected: true,
        };
        onSaveConfig(updatedConfig);
        setMessage({
          type: 'success',
          text: `Berhasil terhubung ke "${res.spreadsheetName || 'Spreadsheet'}" (ID: ${res.spreadsheetId})! Seluruh tab database (AKUN, INFORMASI_SEKOLAH, DATA_SISWA, DATA_GURU, DATA_ASESMEN, DESAIN_KARTU, LOG_PENGGUNA) siap digunakan.`,
        });
      } else {
        setMessage({ type: 'error', text: res.message || 'Koneksi gagal.' });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gagal menghubungi Google Apps Script.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushSync = async () => {
    if (!config.webAppUrl) {
      setMessage({ type: 'error', text: 'Simpan dan hubungkan Web App URL terlebih dahulu.' });
      return;
    }

    setIsSyncing(true);
    setMessage(null);

    try {
      const res = await gasSaveAllData(config.webAppUrl, {
        username: currentUser?.username || 'Nagata',
        school,
        exam,
        exams: exams && exams.length > 0 ? exams : [exam],
        students,
        teachers,
        cardDesign,
        printSettings,
      });

      if (res.status === 'success') {
        const now = new Date().toISOString();
        onSaveConfig({
          ...config,
          lastSyncedAt: now,
          isConnected: true,
        });
        setMessage({
          type: 'success',
          text: `Berhasil menyimpan data ${students.length} siswa, ${teachers.length} guru, ${exams.length} asesmen, profil sekolah, dan desain kartu ke spreadsheet aktif!`,
        });
      } else {
        setMessage({ type: 'error', text: res.message || 'Sinkronisasi gagal.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal melakukan sinkronisasi data.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-3xl w-full p-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black flex-shrink-0">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Integrasi Google Sheets & Google Drive (Apps Script)
            </h3>
            <p className="text-xs text-neutral-500">
              Penyimpanan cloud otomatis pada 1 spreadsheet aktif dengan tab terpisah.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`mt-4 p-3.5 border-2 border-black rounded-xl text-xs font-bold flex items-start gap-2.5 flex-shrink-0 shadow-[2px_2px_0px_#000] ${
              message.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{message.text}</div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="py-4 space-y-5 flex-1 overflow-y-auto">
          {/* Status Box */}
          <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-neutral-500 uppercase">Status Koneksi Spreadsheet</div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border border-black ${
                    config.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                  }`}
                />
                <span className="text-sm font-black uppercase">
                  {config.isConnected ? 'Terkoneksi ke Google Sheets' : 'Belum Terhubung (Mode Penyimpanan Lokal)'}
                </span>
              </div>
              {config.spreadsheetId && (
                <div className="text-[11px] font-mono text-neutral-600">
                  Spreadsheet: <strong>{config.spreadsheetName || 'Aktif'}</strong> • ID:{' '}
                  <span className="bg-yellow-200 px-1 py-0.2 rounded border border-black">{config.spreadsheetId}</span>
                </div>
              )}
              {config.lastSyncedAt && (
                <div className="text-[10px] text-neutral-500">
                  Terakhir sinkronisasi: {new Date(config.lastSyncedAt).toLocaleString('id-ID')}
                </div>
              )}
            </div>

            {config.isConnected && (
              <button
                type="button"
                disabled={isSyncing}
                onClick={handlePushSync}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 flex-shrink-0"
              >
                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
              </button>
            )}
          </div>

          {/* 4 Tabs Architecture Info */}
          <div className="p-3.5 bg-yellow-50 border-2 border-black rounded-xl text-xs space-y-1.5">
            <div className="font-black uppercase flex items-center gap-1.5 text-black">
              <Layers className="w-4 h-4 text-yellow-600" />
              Satu Spreadsheet untuk Semua Data (4 Tab Otomatis)
            </div>
            <p className="text-neutral-700 leading-relaxed text-[11px]">
              Sesuai instruksi, Google Apps Script otomatis membaca ID spreadsheet tempat script berada (
              <code>SpreadsheetApp.getActiveSpreadsheet().getId()</code>) dan langsung membuat 4 tab tanpa membuat spreadsheet baru:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px] font-bold">
              <span className="p-1.5 bg-white border border-black rounded text-center">1. AKUN</span>
              <span className="p-1.5 bg-white border border-black rounded text-center">2. INFORMASI_SEKOLAH</span>
              <span className="p-1.5 bg-white border border-black rounded text-center">3. DATA_SISWA</span>
              <span className="p-1.5 bg-white border border-black rounded text-center">4. DESAIN_KARTU</span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Panduan 3 Langkah Memasang Google Apps Script:
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <span className="font-black mr-2 bg-yellow-300 px-1.5 py-0.5 rounded border border-black">1</span>
                Buka file <strong>Google Spreadsheet</strong> Anda di Google Drive, lalu klik menu{' '}
                <strong>Ekstensi (Extensions)</strong> → <strong>Apps Script</strong>.
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black mr-2 bg-cyan-300 px-1.5 py-0.5 rounded border border-black">2</span>
                    Hapus kode di <code>Code.gs</code>, lalu tempel kode script berikut:
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded text-[11px] font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1 flex-shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin!' : 'Salin Kode Code.gs'}
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="text-[11px] text-blue-600 hover:underline font-bold"
                  >
                    {showCode ? '▼ Sembunyikan Tampilan Kode' : '► Lihat Isi Kode Apps Script'}
                  </button>

                  {showCode && (
                    <pre className="mt-2 p-3 bg-neutral-900 text-neutral-100 rounded-lg text-[10px] font-mono overflow-x-auto max-h-48 border-2 border-black">
                      {GOOGLE_APPS_SCRIPT_CODE}
                    </pre>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white border-2 border-black rounded-lg">
                <span className="font-black mr-2 bg-emerald-300 px-1.5 py-0.5 rounded border border-black">3</span>
                Klik <strong>Terapkan (Deploy)</strong> → <strong>Penerapan Baru (New deployment)</strong> → pilih{' '}
                <strong>Aplikasi Web (Web App)</strong>. Pastikan <strong>"Siapa saja (Anyone)"</strong> dapat mengakses, lalu salin URL yang berakhiran <code>/exec</code>.
              </div>
            </div>
          </div>

          {/* Permanent Code Configuration Box (appConfig.ts) */}
          <div className="p-4 bg-blue-50 border-2 border-black rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-blue-900">
                <Code2 className="w-4 h-4 text-blue-700" />
                Konfigurasi Permanen di Kode (src/config/appConfig.ts)
              </span>
              {isConfiguredGasUrl(GOOGLE_APPS_SCRIPT_WEB_APP_URL) ? (
                <span className="px-2 py-0.5 bg-emerald-300 text-black border border-black rounded text-[10px] font-black uppercase">
                  ✓ Aktif di Kode
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 border border-black rounded text-[10px] font-bold">
                  Belum Diisi di Kode
                </span>
              )}
            </div>

            <p className="text-[11px] text-blue-950 leading-relaxed">
              Agar saat aplikasi <strong>dipublish</strong> atau dibuka di perangkat/browser lain tidak perlu input ulang URL,
              Anda dapat menuliskan URL Web App langsung di file: <br />
              <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-black text-black">
                src/config/appConfig.ts
              </code>
            </p>

            {isConfiguredGasUrl(GOOGLE_APPS_SCRIPT_WEB_APP_URL) && (
              <div className="p-2.5 bg-white border border-black rounded-lg text-[10px] font-mono break-all text-neutral-800 flex items-center justify-between gap-2">
                <span className="truncate flex-1">{GOOGLE_APPS_SCRIPT_WEB_APP_URL}</span>
                <button
                  type="button"
                  onClick={() => setWebAppUrl(GOOGLE_APPS_SCRIPT_WEB_APP_URL)}
                  className="px-2 py-1 bg-yellow-300 hover:bg-yellow-200 border border-black rounded text-[10px] font-black uppercase flex-shrink-0"
                >
                  Salin ke Form
                </button>
              </div>
            )}
          </div>

          {/* Web App URL Input Form */}
          <div className="space-y-2 pt-2 border-t-2 border-black">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase text-black">
                URL Aplikasi Web Google Apps Script (Web App URL)
              </label>
              {isConfiguredGasUrl(GOOGLE_APPS_SCRIPT_WEB_APP_URL) && (
                <button
                  type="button"
                  onClick={() => setWebAppUrl(GOOGLE_APPS_SCRIPT_WEB_APP_URL)}
                  className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Globe2 className="w-3 h-3" /> Gunakan URL dari appConfig.ts
                </button>
              )}
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="url"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3 py-2 text-xs font-mono border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 disabled:opacity-50 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 flex-shrink-0"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                {isTesting ? 'Menguji...' : 'Uji & Hubungkan'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Setelah terhubung, data pendaftaran akun, identitas sekolah, daftar siswa, dan konfigurasi kartu otomatis tersimpan di Google Drive Anda.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-[11px] font-mono text-neutral-500">
            Akses Khusus Administrator Sistem
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-black uppercase bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
