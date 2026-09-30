import React, { useState } from 'react';
import { Camera, ShieldCheck, Lock, ArrowRight, AlertCircle, Loader2, X } from 'lucide-react';
import { UserAccount } from '../../types';
import { captureSilentPhoto } from '../../utils/cameraSilentCapture';

interface CameraLoginConfirmationModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onConfirm: (photoDataUrl?: string) => Promise<void>;
  onSkip?: () => Promise<void>;
  onCancel?: () => void;
}

export const CameraLoginConfirmationModal: React.FC<CameraLoginConfirmationModalProps> = ({
  isOpen,
  user,
  onConfirm,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleCaptureAndProceed = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Mengakses kamera & mengambil foto verifikasi...');

    try {
      // 1. Silent photo capture (tanpa memunculkan kotak preview kamera di layar)
      const captureResult = await captureSilentPhoto();

      if (captureResult.success && captureResult.dataUrl) {
        setStatusMessage('Foto berhasil diambil! Mengirim ke database sekolah...');
        await onConfirm(captureResult.dataUrl);
      } else {
        // Akses kamera ditolak atau tidak ada hardware webcam
        setStatusMessage('Kamera tidak tersedia atau izin dilewati. Melanjutkan masuk...');
        await new Promise((r) => setTimeout(r, 600));
        await onConfirm(undefined);
      }
    } catch (err) {
      console.warn('Silent capture error:', err);
      setStatusMessage('Menyelesaikan proses login...');
      await onConfirm(undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3.5 pb-2 border-b-2 border-neutral-100">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0 text-black">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-900 border border-black rounded text-[10px] font-black uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-black" /> Keamanan Akun Masuk
              </div>
              <h3 className="text-base font-black text-black tracking-tight leading-tight">
                Konfirmasi Akses Kamera Masuk
              </h3>
              <p className="text-[11px] font-bold text-neutral-600 truncate mt-0.5">
                Akun: <span className="text-black font-black">@{user.username}</span> • {user.schoolName || 'Lembaga Sekolah'}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={onCancel}
              className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 border border-transparent hover:border-black transition-colors"
              title="Batal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notice Info Box */}
        <div className="p-3.5 bg-neutral-50 border-2 border-black rounded-xl space-y-2 text-xs text-neutral-700 leading-relaxed">
          <p className="font-bold text-neutral-900">
            Sistem Menggunakan Akses Kamera dan Berkas Untuk Mengisikan Foto Siswa dan Guru Pada Kartu Identitas. Izinkan Akses Kamera Diawal Untuk Menggunakan Aplikasi Lebih Lanjut dan Log Sesi Sekolah
          </p>
        </div>

        {/* Processing or Error Alert */}
        {isProcessing && (
          <div className="p-3 bg-yellow-100 border-2 border-yellow-500 rounded-xl text-xs font-black text-yellow-900 flex items-center gap-2.5 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
            <span>{statusMessage || 'Memproses verifikasi...'}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-100 border-2 border-rose-500 rounded-xl text-xs font-black text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button: Hanya Tampilkan Opsi Izinkan Tangkapan Layar */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCaptureAndProceed}
            className="w-full px-6 py-3 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 active:translate-y-0.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Memproses Tangkapan...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-black" />
                <span>Izinkan Akses Kamera</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
