import React from 'react';
import { Printer, CheckCircle2, AlertCircle, X, Sliders } from 'lucide-react';

interface PrintConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cardType: string;
  itemCount: number;
  estimatedSheets: number;
  orientation?: 'portrait' | 'landscape';
}

export const PrintConfirmationModal: React.FC<PrintConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cardType,
  itemCount,
  estimatedSheets,
  orientation = 'portrait',
}) => {
  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-300 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0 text-black">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-black rounded text-[10px] font-black uppercase">
                Siap Cetak
              </div>
              <h3 className="text-base font-black text-black tracking-tight mt-0.5">
                Konfirmasi Cetak Kartu
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Summary Badge */}
        <div className="p-3.5 bg-yellow-50 border-2 border-black rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-600">Jenis Dokumen:</span>
            <span className="font-black text-neutral-900 uppercase">{cardType}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-600">Total Kartu Terpilih:</span>
            <span className="font-black text-neutral-900 px-2 py-0.5 bg-white border border-black rounded">
              {itemCount} Kartu
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-600">Estimasi Kertas A4:</span>
            <span className="font-black text-indigo-700 px-2 py-0.5 bg-indigo-50 border border-indigo-400 rounded">
              {estimatedSheets} Lembar A4
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-600">Rekomendasi Orientasi:</span>
            <span className="font-black text-neutral-900 capitalize">
              {orientation === 'portrait' ? 'Potret (Tegak)' : 'Lanskap (Mendatar)'}
            </span>
          </div>
        </div>

        {/* Print Settings Checklist Guide */}
        <div className="p-3 bg-neutral-50 border-2 border-black rounded-xl space-y-2 text-[11px] text-neutral-700">
          <div className="flex items-center gap-1.5 font-black text-neutral-900 uppercase">
            <Sliders className="w-3.5 h-3.5 text-black" />
            <span>Petunjuk Dialog Cetak Browser:</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Ukuran Kertas:</strong> Pilih <strong>A4</strong> pada dialog print.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Skala:</strong> Setel ke <strong>100% (Default)</strong> agar ukuran pas.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Margin:</strong> Pilih <strong>None / Minimum</strong>.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Grafis Latar Belakang:</strong> Centang <strong>"Background graphics"</strong> agar warna dan ornamen kartu tercetak tajam.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <Printer className="w-4 h-4" />
            <span>Buka Print Browser</span>
          </button>
        </div>
      </div>
    </div>
  );
};
