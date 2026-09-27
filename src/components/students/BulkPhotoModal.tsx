import React, { useState, useRef } from 'react';
import { Student } from '../../types';
import {
  PhotoMatchResult,
  processAndMatchPhotos,
  extractAndMatchFromZip,
} from '../../utils/photoMatcher';
import {
  X,
  FileArchive,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface BulkPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onApplyPhotos: (matchedMap: Record<string, string>) => void;
}

export const BulkPhotoModal: React.FC<BulkPhotoModalProps> = ({
  isOpen,
  onClose,
  students,
  onApplyPhotos,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [matchResult, setMatchResult] = useState<PhotoMatchResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle multiple image files
  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const items: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < files.length; i++) {
        items.push({ name: files[i].name, blob: files[i] });
      }
      const result = await processAndMatchPhotos(items, students);
      setMatchResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses kumpulan foto.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle ZIP file
  const handleZipFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const result = await extractAndMatchFromZip(file, students);
      setMatchResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengekstrak file ZIP foto.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!matchResult) return;
    onApplyPhotos(matchResult.matchedMap);
    onClose();
  };

  const studentsWithoutPhotoCount = students.length - (matchResult?.matchedCount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-3xl w-full p-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black flex-shrink-0">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-cyan-600" />
              Upload Foto Siswa Massal (Multiple / ZIP)
            </h3>
            <p className="text-xs text-neutral-500">
              Unggah banyak file foto sekaligus atau arsip .ZIP. Sistem mencocokkan otomatis berdasarkan NISN / NIS.
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

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-100 border-2 border-rose-500 rounded-lg text-xs font-bold text-rose-700 flex-shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Upload Zone */}
        {!matchResult ? (
          <div className="py-6 space-y-6 flex-1 overflow-y-auto">
            {/* Rule / Guide Note */}
            <div className="p-4 bg-cyan-50 border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl text-xs font-medium text-cyan-950 space-y-1">
              <h4 className="font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-700" />
                Ketentuan Penamaan File Foto:
              </h4>
              <p>
                1. Beri nama file foto dengan nomor <strong>NISN</strong> (Contoh: <code>0123456781.jpg</code>) atau nomor <strong>NIS</strong>.
              </p>
              <p>
                2. Siswa yang fotonya belum ditemukan akan <strong>otomatis menggunakan Avatar Gender</strong> (Laki-laki / Perempuan), kartu tetap siap dicetak!
              </p>
            </div>

            {/* Two Upload Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: ZIP Archive */}
              <div
                onClick={() => zipInputRef.current?.click()}
                className="border-3 border-dashed border-neutral-400 hover:border-black bg-neutral-50 hover:bg-yellow-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
              >
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleZipFile}
                  className="hidden"
                />
                <div className="w-14 h-14 bg-cyan-100 group-hover:bg-cyan-200 border-2 border-black rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000]">
                  <FileArchive className="w-6 h-6 text-cyan-800" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight">Upload File .ZIP</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Kemas folder foto siswa menjadi file .zip lalu unggah di sini.
                </p>
              </div>

              {/* Option B: Multiple Files */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-3 border-dashed border-neutral-400 hover:border-black bg-neutral-50 hover:bg-yellow-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleMultipleFiles}
                  className="hidden"
                />
                <div className="w-14 h-14 bg-yellow-100 group-hover:bg-yellow-200 border-2 border-black rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000]">
                  <ImageIcon className="w-6 h-6 text-yellow-800" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight">Pilih Banyak Foto</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Pilih beberapa file JPG, PNG, WEBP langsung dari komputermu.
                </p>
              </div>
            </div>

            {isProcessing && (
              <div className="p-4 bg-yellow-100 border-2 border-black rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mengekstrak dan mencocokkan foto dengan data siswa...
              </div>
            )}
          </div>
        ) : (
          /* Match Summary Display */
          <div className="py-4 space-y-4 flex-1 flex flex-col min-h-0">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 flex-shrink-0">
              <div className="p-3 bg-neutral-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Total Foto Ditemukan</div>
                <div className="text-lg font-black">{matchResult.totalPhotosFound} FOTO</div>
              </div>
              <div className="p-3 bg-emerald-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Cocok dengan Siswa
                </div>
                <div className="text-lg font-black text-emerald-900">{matchResult.matchedCount} SISWA</div>
              </div>
              <div className="p-3 bg-amber-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Tetap Pakai Avatar
                </div>
                <div className="text-lg font-black text-amber-900">
                  {Math.max(0, studentsWithoutPhotoCount)} SISWA
                </div>
              </div>
            </div>

            {/* Matched Details Table */}
            <div className="border-2 border-black rounded-xl overflow-hidden flex-1 flex flex-col min-h-[200px]">
              <div className="bg-neutral-100 px-4 py-2 border-b-2 border-black text-xs font-black uppercase flex justify-between items-center">
                <span>Daftar Siswa yang Berhasil Dicocokkan</span>
                <span className="text-[11px] font-mono text-neutral-600">
                  {matchResult.matchedDetails.length} siswa
                </span>
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-black text-[10px] font-black uppercase text-neutral-600 sticky top-0">
                    <tr>
                      <th className="p-2 w-12 text-center">Foto</th>
                      <th className="p-2">Nama Siswa</th>
                      <th className="p-2">NISN</th>
                      <th className="p-2">Nama File</th>
                      <th className="p-2">Metode Cocok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium">
                    {matchResult.matchedDetails.map((item) => (
                      <tr key={item.studentId}>
                        <td className="p-2 text-center">
                          <img
                            src={item.dataUrl}
                            alt=""
                            className="w-7 h-9 object-cover rounded border border-black inline-block"
                          />
                        </td>
                        <td className="p-2 font-bold">{item.studentName}</td>
                        <td className="p-2 font-mono">{item.nisn}</td>
                        <td className="p-2 font-mono text-neutral-600">{item.matchedFileName}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-400">
                            Cocok via {item.matchedBy}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unmatched warnings */}
            {matchResult.unmatchedFiles.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-800">
                <strong>{matchResult.unmatchedFiles.length} file tidak cocok</strong> dengan NISN/NIS siswa mana pun ({matchResult.unmatchedFiles.slice(0, 4).join(', ')}...).
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3 flex-shrink-0">
          {matchResult ? (
            <>
              <button
                type="button"
                onClick={() => setMatchResult(null)}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
              >
                ← Unggah Ulang
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Terapkan {matchResult.matchedCount} Foto ke Data Siswa
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
