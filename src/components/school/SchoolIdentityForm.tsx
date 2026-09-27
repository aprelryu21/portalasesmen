import React, { useState, useRef, useEffect } from 'react';
import { School, Exam, GoogleSheetsConfig, UserAccount } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { fileToDataUrl } from '../../utils/photoMatcher';
import { DEFAULT_SCHOOL, DEFAULT_EXAM } from '../../data/mockData';
import { gasUploadLogo, gasUploadSignature } from '../../utils/gasApi';
import {
  Building2,
  Upload,
  Trash2,
  Calendar,
  Save,
  CheckCircle2,
  Sparkles,
  Loader2,
  BookOpen,
  PenTool,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';

interface SchoolIdentityFormProps {
  school: School;
  exam: Exam;
  onSaveSchool: (school: School) => void;
  onSaveExam: (exam: Exam) => void;
  onSaveSchoolAndExam?: (school: School, exam: Exam) => Promise<void> | void;
  googleSheets?: GoogleSheetsConfig;
  currentUser?: UserAccount | null;
}

export const SchoolIdentityForm: React.FC<SchoolIdentityFormProps> = ({
  school,
  exam,
  onSaveSchool,
  onSaveExam,
  onSaveSchoolAndExam,
  googleSheets,
  currentUser,
}) => {
  const [localSchool, setLocalSchool] = useState<School>(school || DEFAULT_SCHOOL);
  const [localExam, setLocalExam] = useState<Exam>(exam || DEFAULT_EXAM);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [signatureUploadMessage, setSignatureUploadMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (school) setLocalSchool(school);
  }, [school]);

  useEffect(() => {
    if (exam) setLocalExam(exam);
  }, [exam]);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingSignature(true);
      setSignatureUploadMessage('Memproses & mengunggah tanda tangan ke Google Drive...');
      const dataUrl = await fileToDataUrl(file);

      setLocalSchool((prev) => ({ ...prev, principalSignatureUrl: dataUrl }));

      const activeUrl = googleSheets?.webAppUrl;
      if (googleSheets?.isConnected && activeUrl && activeUrl.trim().startsWith('http')) {
        try {
          const res = await gasUploadSignature(activeUrl, {
            username: currentUser?.username || 'Nagata',
            schoolName: localSchool.name || currentUser?.schoolName || 'Sekolah',
            base64Data: dataUrl,
            fileName: `TTD_${localSchool.principalNip || localSchool.npsn || 'KEPSEK'}.png`,
          });

          if (res.status === 'success' && res.signatureUrl) {
            setLocalSchool((prev) => ({ ...prev, principalSignatureUrl: res.signatureUrl! }));
            setSignatureUploadMessage('✓ Tanda tangan berhasil tersimpan di Google Drive sekolah!');
            setTimeout(() => setSignatureUploadMessage(null), 4000);
          } else {
            setSignatureUploadMessage('Tanda tangan tersimpan di memori sementara');
            setTimeout(() => setSignatureUploadMessage(null), 3000);
          }
        } catch {
          setSignatureUploadMessage('Tersimpan di perangkat lokal');
          setTimeout(() => setSignatureUploadMessage(null), 3000);
        }
      } else {
        setSignatureUploadMessage('✓ Tanda tangan tersimpan di perangkat lokal');
        setTimeout(() => setSignatureUploadMessage(null), 3000);
      }
    } catch {
      alert('Gagal memproses file tanda tangan.');
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      setUploadMessage('Memproses & mengunggah logo ke Google Drive...');
      const dataUrl = await fileToDataUrl(file);

      setLocalSchool((prev) => ({ ...prev, logoUrl: dataUrl }));

      const activeUrl = googleSheets?.webAppUrl;
      if (googleSheets?.isConnected && activeUrl && activeUrl.trim().startsWith('http')) {
        try {
          const res = await gasUploadLogo(activeUrl, {
            username: currentUser?.username || 'Nagata',
            schoolName: localSchool.name || currentUser?.schoolName || 'Sekolah',
            base64Data: dataUrl,
            fileName: `LOGO_${localSchool.npsn || 'SEKOLAH'}.png`,
          });

          if (res.status === 'success' && res.logoUrl) {
            setLocalSchool((prev) => ({ ...prev, logoUrl: res.logoUrl! }));
            setUploadMessage('✓ Logo berhasil tersimpan di Google Drive sekolah!');
            setTimeout(() => setUploadMessage(null), 4000);
          } else {
            setUploadMessage('Logo tersimpan di memori sementara');
            setTimeout(() => setUploadMessage(null), 3000);
          }
        } catch {
          setUploadMessage('Tersimpan di perangkat lokal');
          setTimeout(() => setUploadMessage(null), 3000);
        }
      } else {
        setUploadMessage('✓ Logo tersimpan di perangkat lokal');
        setTimeout(() => setUploadMessage(null), 3000);
      }
    } catch {
      alert('Gagal memproses file logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const schoolToSave = { ...localSchool };

      if (onSaveSchoolAndExam) {
        await onSaveSchoolAndExam(schoolToSave, localExam);
      } else {
        onSaveSchool(schoolToSave);
        onSaveExam(localExam);
      }

      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-yellow-300 border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase mb-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Identitas Sekolah & Ujian
            </div>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
              Data Resmi Lembaga & Kop Ujian
            </h2>
            <p className="text-xs text-neutral-800 font-medium">
              Data ini otomatis digunakan pada kop kartu peserta, kartu meja, ID pengawas, dan lembar cetak A4.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#FFF] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-yellow-300" /> : <Save className="w-4 h-4 text-yellow-300" />}
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Identitas'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. KARTU PROFIL SEKOLAH */}
        <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-black" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                1. Profil & Identitas Lembaga Sekolah
              </h3>
            </div>
          </div>

          {/* Logo Upload Box */}
          <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <SchoolLogo
                url={localSchool.logoUrl}
                name={localSchool.name || 'Logo'}
                sizeMm={20}
                className="shadow-[3px_3px_0px_#000] bg-white border-2 border-black"
              />
              {localSchool.logoUrl && (
                <button
                  type="button"
                  onClick={() => setLocalSchool((prev) => ({ ...prev, logoUrl: '' }))}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full border border-black shadow cursor-pointer"
                  title="Hapus Logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-1.5 min-w-[200px]">
              <div className="text-xs font-black uppercase">Logo Resmi Sekolah</div>
              <p className="text-[11px] text-neutral-600">
                Format PNG transparan atau JPG. Logo akan ditampilkan pada bagian kop header kartu peserta & ID pengawas.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isUploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploadingLogo ? 'Mengunggah...' : localSchool.logoUrl ? 'Ganti Logo' : 'Unggah Logo'}</span>
                </button>
                {uploadMessage && (
                  <span className="text-[11px] font-bold text-emerald-700 animate-in fade-in">
                    {uploadMessage}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields: Nama, NPSN, NSS */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Nama Resmi Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={localSchool.name}
                onChange={(e) => setLocalSchool({ ...localSchool, name: e.target.value })}
                placeholder="Contoh: SD NEGERI 1 MEDOWO"
                className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                NPSN (8 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={localSchool.npsn}
                onChange={(e) => setLocalSchool({ ...localSchool, npsn: e.target.value })}
                placeholder="Contoh: 20512345"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                NSS / Kode Sekolah
              </label>
              <input
                type="text"
                value={localSchool.nss || ''}
                onChange={(e) => setLocalSchool({ ...localSchool, nss: e.target.value })}
                placeholder="Contoh: 101051308001"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Alamat Lengkap & Wilayah */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Alamat Jalan / Gedung
              </label>
              <input
                type="text"
                value={localSchool.address}
                onChange={(e) => setLocalSchool({ ...localSchool, address: e.target.value })}
                placeholder="Contoh: Jl. Raya Medowo No. 12"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Desa / Kelurahan
              </label>
              <input
                type="text"
                value={localSchool.village || ''}
                onChange={(e) => setLocalSchool({ ...localSchool, village: e.target.value })}
                placeholder="Contoh: Medowo"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={localSchool.district || ''}
                onChange={(e) => setLocalSchool({ ...localSchool, district: e.target.value })}
                placeholder="Contoh: Kandangan"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={localSchool.regency || ''}
                onChange={(e) => setLocalSchool({ ...localSchool, regency: e.target.value })}
                placeholder="Contoh: Kabupaten Kediri"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                value={localSchool.province || ''}
                onChange={(e) => setLocalSchool({ ...localSchool, province: e.target.value })}
                placeholder="Contoh: Jawa Timur"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Kepala Sekolah */}
          <div className="pt-2 border-t border-neutral-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-3">
              Tanda Tangan Kepala Sekolah / Penanggung Jawab
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Nama Kepala Sekolah & Gelar
                </label>
                <input
                  type="text"
                  value={localSchool.principalName}
                  onChange={(e) => setLocalSchool({ ...localSchool, principalName: e.target.value })}
                  placeholder="Contoh: BAMBANG SUTRISNO, S.Pd., M.M."
                  className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={localSchool.principalNip}
                  onChange={(e) => setLocalSchool({ ...localSchool, principalNip: e.target.value })}
                  placeholder="Contoh: 19750812 200003 1 005"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Sebutan Jabatan
                </label>
                <input
                  type="text"
                  value={localSchool.headTitle || 'Kepala Sekolah'}
                  onChange={(e) => setLocalSchool({ ...localSchool, headTitle: e.target.value })}
                  placeholder="Contoh: Kepala Sekolah / Plt. Kepala Sekolah"
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Form Input Foto / Scan Tanda Tangan Kepala Sekolah */}
            <div className="mt-4 p-4 bg-amber-50/60 border-2 border-black rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-900" />
                  <span className="text-xs font-black uppercase tracking-tight text-neutral-900">
                    Berkas Tanda Tangan Kepala Sekolah (Scan / Foto Digital)
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-yellow-200 border border-black rounded text-[10px] font-black uppercase text-amber-950">
                  Sinkron Spreadsheet & Drive
                </span>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6">
                {/* Signature Preview Box */}
                <div className="relative shrink-0 w-36 h-20 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-center p-2 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px]">
                  {localSchool.principalSignatureUrl && localSchool.principalSignatureUrl.trim().length > 0 ? (
                    <>
                      <img
                        src={localSchool.principalSignatureUrl}
                        alt="Tanda Tangan Kepala Sekolah"
                        className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setLocalSchool((prev) => ({ ...prev, principalSignatureUrl: '' }))}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full border border-black shadow cursor-pointer transition-transform hover:scale-110"
                        title="Hapus Tanda Tangan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center px-1">
                      <PenTool className="w-6 h-6 text-neutral-300 mx-auto mb-1 stroke-1" />
                      <span className="text-[10px] font-bold text-neutral-400 block leading-tight">
                        Belum Ada TTD
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Action & Guidance */}
                <div className="flex-1 space-y-1.5 min-w-[200px]">
                  <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
                    Unggah gambar tanda tangan kepala sekolah (format <strong>PNG transparan</strong> atau <strong>JPG/WEBP</strong>). Tanda tangan akan disimpan ke database Google Spreadsheet & Google Drive sekolah, serta dapat ditampilkan pada kartu ujian peserta (opsi <em>Digital</em>) dan berkas administrasi.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={isUploadingSignature}
                      className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-transform active:translate-y-0.5"
                    >
                      {isUploadingSignature ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isUploadingSignature
                          ? 'Mengunggah ke Drive...'
                          : localSchool.principalSignatureUrl
                          ? 'Ganti Tanda Tangan'
                          : 'Unggah Foto / Scan TTD'}
                      </span>
                    </button>

                    {signatureUploadMessage && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400 animate-in fade-in flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{signatureUploadMessage}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {showSavedToast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-500 rounded-xl text-xs font-black animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Identitas Sekolah Berhasil Disimpan!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 active:translate-y-0.5 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Identitas'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
