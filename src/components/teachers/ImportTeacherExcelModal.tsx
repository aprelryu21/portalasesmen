import React, { useState, useRef } from 'react';
import { Teacher, TeacherImportValidationResult } from '../../types';
import { downloadTeacherExcelTemplate, parseAndValidateTeacherExcel } from '../../utils/excel';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ImportTeacherExcelModalProps {
  isOpen: boolean;
  existingTeachers?: Teacher[];
  onClose: () => void;
  onImportComplete: (newTeachers: Teacher[]) => void;
}

export const ImportTeacherExcelModal: React.FC<ImportTeacherExcelModalProps> = ({
  isOpen,
  existingTeachers = [],
  onClose,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<TeacherImportValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await parseAndValidateTeacherExcel(selectedFile, existingTeachers);
      setValidationResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses file Excel.';
      setErrorMessage(message);
      setValidationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult) return;

    const validTeachers: Teacher[] = validationResult.rows
      .filter((row) => row.isValid && row.data.name)
      .map((row, idx) => ({
        id: `tch_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        name: row.data.name || 'Guru',
        nip: row.data.nip || '-',
        gender: row.data.gender || 'L',
        religion: row.data.religion || 'Islam',
        subject: row.data.subject || 'Guru Mata Pelajaran',
        roleType: row.data.roleType || 'pengawas',
        roomDuty: row.data.roomDuty || 'Ruang 01',
        phone: row.data.phone || '',
        email: row.data.email || '',
        photoUrl: row.data.photoUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    onImportComplete(validTeachers);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-400 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">Import Massal Data Guru</h3>
              <p className="text-xs text-neutral-500">
                Unggah berkas Excel (XLSX/XLS/CSV) berisi daftar guru & pengawas ujian sekolah.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Template Download Notice */}
          <div className="p-4 bg-yellow-50 border-2 border-black rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
            <div className="space-y-0.5">
              <div className="text-xs font-black uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                Gunakan Format Resmi Template Excel
              </div>
              <p className="text-[11px] text-neutral-600">
                Format kolom telah disesuaikan (NIP, Nama Lengkap, Gender, Agama, Mapel, Status Tugas, Ruang).
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTeacherExcelTemplate}
              className="px-3.5 py-2 bg-white hover:bg-yellow-100 text-black border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Unduh Template Guru (.xlsx)
            </button>
          </div>

          {/* Upload Drop Zone */}
          {!validationResult && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-neutral-400 hover:border-black rounded-xl p-8 text-center bg-neutral-50 hover:bg-emerald-50/50 cursor-pointer transition-colors space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 bg-white border-2 border-black rounded-2xl mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <Upload className="w-7 h-7 text-black" />
              </div>
              <div>
                <p className="text-sm font-black">Klik di sini untuk memilih file Excel Data Guru</p>
                <p className="text-xs text-neutral-500 mt-1">Mendukung format .XLSX, .XLS, atau .CSV</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-8 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-black uppercase">Memvalidasi baris data guru...</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-2.5">
              <XCircle className="w-5 h-5 shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Validation Summary & Preview Table */}
          {validationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-neutral-100 border-2 border-black rounded-xl">
                  <div className="text-[10px] font-black uppercase text-neutral-500">Total Baris</div>
                  <div className="text-xl font-black">{validationResult.totalRows}</div>
                </div>
                <div className="p-3 bg-emerald-100 border-2 border-black rounded-xl">
                  <div className="text-[10px] font-black uppercase text-emerald-800">Valid & Siap</div>
                  <div className="text-xl font-black text-emerald-700">{validationResult.validCount}</div>
                </div>
                <div className="p-3 bg-amber-100 border-2 border-black rounded-xl">
                  <div className="text-[10px] font-black uppercase text-amber-800">Peringatan</div>
                  <div className="text-xl font-black text-amber-700">{validationResult.warningCount}</div>
                </div>
                <div className="p-3 bg-rose-100 border-2 border-black rounded-xl">
                  <div className="text-[10px] font-black uppercase text-rose-800">Error</div>
                  <div className="text-xl font-black text-rose-700">{validationResult.errorCount}</div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_#000] max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-neutral-900 text-white font-black uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2.5 text-center w-12">Baris</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">NIP</th>
                      <th className="p-2.5">Nama Guru</th>
                      <th className="p-2.5 text-center">L/P</th>
                      <th className="p-2.5">Agama</th>
                      <th className="p-2.5">Mata Pelajaran</th>
                      <th className="p-2.5">Status Tugas</th>
                      <th className="p-2.5">Ruang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-medium">
                    {validationResult.rows.map((row) => (
                      <tr
                        key={`val_tch_${row.rowNumber}`}
                        className={row.isValid ? 'hover:bg-neutral-50' : 'bg-rose-50/70'}
                      >
                        <td className="p-2.5 text-center font-mono font-bold text-neutral-500">
                          {row.rowNumber}
                        </td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5" /> Siap
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700">
                              <XCircle className="w-3.5 h-3.5" /> Gagal
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] font-bold">{row.data.nip || '-'}</td>
                        <td className="p-2.5 font-bold text-neutral-900">{row.data.name || '-'}</td>
                        <td className="p-2.5 text-center font-black">{row.data.gender || 'L'}</td>
                        <td className="p-2.5 text-[11px]">{row.data.religion || 'Islam'}</td>
                        <td className="p-2.5 text-[11px]">{row.data.subject || '-'}</td>
                        <td className="p-2.5 text-[11px] capitalize">{row.data.roleType || 'Pengawas'}</td>
                        <td className="p-2.5 text-[11px] font-mono">{row.data.roomDuty || 'Ruang 01'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3 shrink-0">
          {validationResult ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-xs font-black"
            >
              Ganti File
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-xs font-black"
            >
              Tutup
            </button>
            {validationResult && (
              <button
                type="button"
                disabled={validationResult.validCount === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Import {validationResult.validCount} Data Guru</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
