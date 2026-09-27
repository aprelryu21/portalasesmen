import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  studentName?: string;
  studentNisn?: string;
  itemCount?: number;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isProcessing?: boolean;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Konfirmasi Hapus Data',
  message,
  studentName,
  studentNisn,
  itemCount = 1,
  confirmLabel,
  onConfirm,
  onClose,
  isProcessing = false,
  isDeleting = false,
}) => {
  const activeProcessing = isProcessing || isDeleting;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !activeProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeProcessing, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !activeProcessing) onClose();
      }}
    >
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-rose-100 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0 text-rose-600">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-100 text-rose-800 border border-black rounded text-[10px] font-black uppercase">
                Tindakan Permanen
              </div>
              <h3 className="text-lg font-black text-black tracking-tight mt-0.5">{title}</h3>
            </div>
          </div>

          <button
            type="button"
            disabled={activeProcessing}
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg transition-transform active:translate-y-0.5 disabled:opacity-40 cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-2">
          {message ? (
            <p className="text-xs font-medium text-neutral-700 leading-relaxed">{message}</p>
          ) : itemCount > 1 ? (
            <div>
              <p className="text-xs font-bold text-neutral-800">
                Anda akan menghapus <strong className="text-rose-600 font-black">{itemCount} data</strong> yang dipilih secara massal.
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Data yang telah dihapus akan langsung dibersihkan dari database cloud dan tidak dapat dipulihkan.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-neutral-800">
                Apakah Anda yakin ingin menghapus data ini?
              </p>
              {studentName && (
                <div className="mt-2 p-2.5 bg-white border-2 border-black rounded-lg text-xs shadow-[2px_2px_0px_#000]">
                  <div className="font-black text-neutral-900 truncate">{studentName}</div>
                  {studentNisn && (
                    <div className="text-[11px] font-mono text-neutral-600 mt-0.5">NISN/ID: {studentNisn}</div>
                  )}
                </div>
              )}
              <p className="text-[11px] text-neutral-500 mt-2">
                Data yang dihapus akan langsung dibersihkan dari database cloud dan aplikasi.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={activeProcessing}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={activeProcessing}
            onClick={() => {
              void onConfirm();
            }}
            className="px-5 py-2 text-xs font-black uppercase bg-rose-500 hover:bg-rose-600 text-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60 cursor-pointer"
          >
            {activeProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>
              {activeProcessing
                ? 'Menghapus...'
                : confirmLabel
                ? confirmLabel
                : itemCount > 1
                ? `Hapus ${itemCount} Data`
                : 'Ya, Hapus Data'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
