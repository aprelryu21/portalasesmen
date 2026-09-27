import React from 'react';
import { ShieldAlert, Clock, LogIn, X } from 'lucide-react';

interface AutoLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAgain: () => void;
  timeoutMinutes?: number;
}

export const AutoLogoutModal: React.FC<AutoLogoutModalProps> = ({
  isOpen,
  onClose,
  onLoginAgain,
  timeoutMinutes = 15,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 bg-rose-400 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0 text-black">
            <ShieldAlert className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-900 border border-black rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-rose-700" /> Keamanan Akun Sekolah
            </div>
            <h3 className="text-base font-black text-black tracking-tight leading-tight">
              Sesi Berakhir Otomatis (Auto Logout)
            </h3>
            <p className="text-[11px] font-bold text-neutral-600 mt-0.5">
              Tidak ada aktivitas selama {timeoutMinutes} menit
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 bg-neutral-50 border-2 border-black rounded-xl space-y-2 text-xs text-neutral-700 leading-relaxed">
          <p className="font-bold text-neutral-900">
            Anda telah dikeluarkan secara otomatis karena aplikasi tidak digunakan dalam beberapa waktu.
          </p>
          <p className="text-[11px] text-neutral-600">
            Aturan auto logout ini berlaku khusus untuk akun sekolah demi mencegah akses tidak berwenang pada komputer atau perangkat yang ditinggalkan.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLoginAgain();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 active:translate-y-0.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-black" />
            <span>Masuk Kembali →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
