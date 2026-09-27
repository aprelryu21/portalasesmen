import React, { useState, useRef } from 'react';
import { Student, ImportValidationResult } from '../../types';
import { downloadExcelTemplate, parseAndValidateExcel } from '../../utils/excel';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  onImportComplete: (importedStudents: Student[]) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  onImportComplete,
}) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg('');
    setFileName(file.name);

    try {
      const result = await parseAndValidateExcel(file, existingStudents);
      setValidationResult(result);
      setStep('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file Excel.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult) return;

    // Filter valid rows and deduplicate by NISN before creating students
    const validRows = validationResult.rows.filter((r) => r.isValid);
    const seenNisns = new Set<string>();
    const deduplicatedRows = validRows.filter((r) => {
      const nisnKey = r.data.nisn ? r.data.nisn.trim().toLowerCase() : '';
      if (nisnKey && seenNisns.has(nisnKey)) return false;
      if (nisnKey) seenNisns.add(nisnKey);
      return true;
    });

    const newStudents: Student[] = deduplicatedRows.map((r, idx) => ({
      id: `std_imp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      nisn: r.data.nisn || `GEN${Date.now()}${idx}`,
      nis: r.data.nis || '',
      name: r.data.name || 'Siswa',
      gender: r.data.gender || 'L',
      religion: r.data.religion || 'Islam',
      className: r.data.className || 'Kelas 6',
      birthPlace: r.data.birthPlace || '',
      birthDate: r.data.birthDate || '',
      examRoom: r.data.examRoom || 'Ruang 01',
      examSeat: r.data.examSeat || String(idx + 1).padStart(2, '0'),
      photoUrl: '', // Will use gender avatar until photo is uploaded
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    onImportComplete(newStudents);
    onClose();
  };

  const resetImport = () => {
    setStep('upload');
    setValidationResult(null);
    setErrorMsg('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-3xl w-full p-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black flex-shrink-0">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Import Data Siswa dari Excel
            </h3>
            <p className="text-xs text-neutral-500">
              Unggah file Excel (XLSX) atau CSV dengan format template sekolah.
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

        {/* STEP 1: UPLOAD & TEMPLATE DOWNLOAD */}
        {step === 'upload' && (
          <div className="py-6 space-y-6 flex-1 overflow-y-auto">
            {/* Step 1A: Download Template Banner */}
            <div className="p-4 bg-yellow-50 border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                  Belum punya template Excel?
                </h4>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Unduh template resmi berformat .xlsx lengkap dengan kolom NISN, NIS, Nama, Kelas, dan petunjuk pengisian.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                Download Template Excel
              </button>
            </div>

            {/* Step 1B: File Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-neutral-400 hover:border-black bg-neutral-50 hover:bg-yellow-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 bg-emerald-100 group-hover:bg-emerald-200 border-2 border-black rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_#000]">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-800" />
                ) : (
                  <Upload className="w-6 h-6 text-emerald-800" />
                )}
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight">
                {isProcessing ? 'Memvalidasi File Excel...' : 'Klik atau Tarik File Excel ke Sini'}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                Mendukung format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>. Sistem akan membaca dan memvalidasi otomatis sebelum disimpan.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & VALIDATION SUMMARY */}
        {step === 'preview' && validationResult && (
          <div className="py-4 space-y-4 flex-1 flex flex-col min-h-0">
            {/* Statistics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              <div className="p-3 bg-neutral-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Total Baris</div>
                <div className="text-lg font-black">{validationResult.totalRows} DATA</div>
              </div>
              <div className="p-3 bg-emerald-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Data Valid
                </div>
                <div className="text-lg font-black text-emerald-900">{validationResult.validCount} DATA</div>
              </div>
              <div className="p-3 bg-amber-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Peringatan
                </div>
                <div className="text-lg font-black text-amber-900">{validationResult.warningCount} DATA</div>
              </div>
              <div className="p-3 bg-rose-100 border-2 border-black rounded-xl">
                <div className="text-[10px] font-bold text-rose-700 uppercase flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" /> Error Ditolak
                </div>
                <div className="text-lg font-black text-rose-900">{validationResult.errorCount} DATA</div>
              </div>
            </div>

            {/* Validation Rows Table */}
            <div className="border-2 border-black rounded-xl overflow-hidden flex-1 flex flex-col min-h-[220px]">
              <div className="bg-neutral-100 px-4 py-2 border-b-2 border-black text-xs font-black uppercase flex justify-between items-center">
                <span>Pratinjau Data ({fileName})</span>
                <span className="text-[11px] font-mono text-neutral-600">
                  {validationResult.validCount} siswa siap diimport
                </span>
              </div>
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-black text-[10px] font-black uppercase text-neutral-600 sticky top-0">
                    <tr>
                      <th className="p-2 w-12 text-center">Baris</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">NISN</th>
                      <th className="p-2">Nama Lengkap</th>
                      <th className="p-2">L/P</th>
                      <th className="p-2">Agama</th>
                      <th className="p-2">Kelas</th>
                      <th className="p-2">Keterangan / Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium">
                    {validationResult.rows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={!row.isValid ? 'bg-rose-50/70' : row.warnings.length > 0 ? 'bg-amber-50/50' : ''}
                      >
                        <td className="p-2 text-center font-mono font-bold text-neutral-500">
                          #{row.rowNumber}
                        </td>
                        <td className="p-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-500">
                              ✓ Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 border border-rose-500">
                              ✕ Error
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-mono font-bold">{row.data.nisn || '-'}</td>
                        <td className="p-2 font-bold">{row.data.name || '-'}</td>
                        <td className="p-2 font-mono">{row.data.gender}</td>
                        <td className="p-2">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border border-neutral-300 bg-neutral-100 text-neutral-800">
                            {row.data.religion || 'Islam'}
                          </span>
                        </td>
                        <td className="p-2">{row.data.className}</td>
                        <td className="p-2 text-[11px]">
                          {row.errors.length > 0 && (
                            <div className="text-rose-700 font-bold">
                              {row.errors.join(', ')}
                            </div>
                          )}
                          {row.warnings.length > 0 && (
                            <div className="text-amber-700">
                              {row.warnings.join(', ')}
                            </div>
                          )}
                          {row.errors.length === 0 && row.warnings.length === 0 && (
                            <span className="text-neutral-400">Siap diimport</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3 flex-shrink-0">
          {step === 'preview' ? (
            <>
              <button
                type="button"
                onClick={resetImport}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
              >
                ← Ganti File Excel
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
                  disabled={!validationResult || validationResult.validCount === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Database className="w-4 h-4" />
                  Konfirmasi & Simpan {validationResult?.validCount} Siswa
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
