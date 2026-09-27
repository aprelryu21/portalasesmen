import React, { useState } from 'react';
import { Camera, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface CameraPermissionNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export const CameraPermissionNoticeModal: React.FC<CameraPermissionNoticeModalProps> = ({
  isOpen,
  onClose,
  onGranted,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setStatusMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatusMessage('Browser ini tidak mendukung akses kamera secara langsung.');
        localStorage.setItem('portal_asesmen_camera_permission_prompted', 'true');
        setTimeout(onClose, 2000);
        return;
      }

      // Prompt camera permission in the browser
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Cleanly stop tracks immediately so hardware camera indicator turns off
      stream.getTracks().forEach((track) => track.stop());

      // Save flag to localStorage so this never prompts again
      localStorage.setItem('portal_asesmen_camera_permission_prompted', 'true');
      setStatusMessage('Izin kamera berhasil diberikan! Anda siap mengambil foto siswa & guru.');

      if (onGranted) onGranted();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // User dismissed or blocked camera
      localStorage.setItem('portal_asesmen_camera_permission_prompted', 'dismissed');
      setStatusMessage('Akses kamera dilewati. Anda tetap dapat mengunggah file foto secara manual.');
      setTimeout(() => {
        onClose();
      }, 1800);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('portal_asesmen_camera_permission_prompted', 'dismissed');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0 text-black">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-200 text-yellow-900 border border-black rounded text-[10px] font-black uppercase">
                <ShieldCheck className="w-3 h-3" /> Fitur Kamera Praktis
              </div>
              <h3 className="text-base font-black text-black tracking-tight mt-0.5">
                Izin Akses Kamera Siswa & Guru
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Explanation */}
        <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-2.5 text-xs text-neutral-700 leading-relaxed">
          <p className="font-bold text-neutral-900">
            Aplikasi <strong>PORTAL ASESMEN</strong> mendukung pengambilan pasfoto langsung untuk kartu peserta siswa dan ID guru pengawas melalui kamera web/HP Anda.
          </p>
          <p className="text-[11px] text-neutral-600">
            Untuk memastikan Anda dapat langsung memotret tanpa terganggu pop-up izin browser berulang kali, silakan berikan izin akses kamera sekarang (cukup sekali diawal).
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kamera hanya aktif saat Anda membuka jendela foto dan privasi data sepenuhnya terjaga.</span>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 bg-yellow-100 border-2 border-yellow-500 rounded-lg text-xs font-bold text-yellow-900 text-center animate-pulse">
            {statusMessage}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isRequesting}
            className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Nanti Saja
          </button>

          <button
            type="button"
            disabled={isRequesting}
            onClick={() => void handleRequestPermission()}
            className="px-5 py-2.5 text-xs font-black uppercase bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Camera className="w-4 h-4" />
            <span>{isRequesting ? 'Meminta Izin...' : 'Izinkan Kamera Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
