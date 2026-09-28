import React, { useState } from 'react';
import {
  School,
  Exam,
  AnswerSheetDesignSettings,
  AnswerSheetPgCount,
  AnswerSheetIsianCount,
  AnswerSheetUraianCount,
} from '../../types';
import {
  FileText,
  Save,
  Printer,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Settings2,
  Check,
  RotateCcw,
} from 'lucide-react';

interface AnswerSheetDesignerProps {
  school: School;
  exam: Exam;
  design: AnswerSheetDesignSettings;
  onUpdateDesign: (design: AnswerSheetDesignSettings) => void;
  onSaveToCloud?: (design: AnswerSheetDesignSettings) => Promise<void>;
  onNavigateToPrint?: () => void;
  onBackToMenu?: () => void;
}

export const AnswerSheetDesigner: React.FC<AnswerSheetDesignerProps> = ({
  school,
  exam,
  design,
  onUpdateDesign,
  onSaveToCloud,
  onNavigateToPrint,
  onBackToMenu,
}) => {
  const [activeTab, setActiveTab] = useState<'kop' | 'identity' | 'questions'>('kop');
  const [isControlsMinimized, setIsControlsMinimized] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Helper updater for Kop
  const updateKop = (field: keyof AnswerSheetDesignSettings['kop'], value: any) => {
    onUpdateDesign({
      ...design,
      kop: {
        ...design.kop,
        [field]: value,
      },
    });
  };

  // Helper updater for Identity
  const updateIdentity = (field: keyof AnswerSheetDesignSettings['identity'], value: string) => {
    onUpdateDesign({
      ...design,
      identity: {
        ...design.identity,
        [field]: value,
      },
    });
  };

  // Helper updater for Questions
  const updateQuestions = (field: keyof AnswerSheetDesignSettings['questions'], value: any) => {
    onUpdateDesign({
      ...design,
      questions: {
        ...design.questions,
        [field]: value,
      },
    });
  };

  const handleSaveToCloud = async () => {
    if (!onSaveToCloud) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveToCloud(design);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan ke Google Spreadsheet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToSchoolDefault = () => {
    onUpdateDesign({
      ...design,
      kop: {
        showLogo: true,
        logoUrl: school.logoUrl || '',
        line1: 'PEMERINTAH KABUPATEN / KOTA',
        line2: 'DINAS PENDIDIKAN',
        line3: school.name ? school.name.toUpperCase() : 'SD NEGERI CONTOH',
        line4: school.address || 'Jl. Pendidikan No. 123',
        line5: `Telepon: ${school.phone || '-'} | Pos-el: ${school.email || '-'}`,
      },
      identity: {
        ...design.identity,
        examTitle: exam.name ? exam.name.toUpperCase() : 'ASESMEN SUMATIF',
        yearTitle: exam.academicYear ? `TAHUN PELAJARAN ${exam.academicYear}` : 'TAHUN PELAJARAN 2024 – 2025',
      },
    });
  };

  const { kop, identity, questions, fontFamily } = design;

  // Calculate question summary & estimated pages
  const totalQuestions =
    (questions.enablePg ? questions.pgCount : 0) +
    (questions.enableIsian ? questions.isianCount : 0) +
    (questions.enableUraian ? questions.uraianCount : 0);

  // Estimasi muat 1 lembar: jika PG <= 25, isian <= 10, uraian <= 5
  const isEstimatedSinglePage =
    (!questions.enablePg || questions.pgCount <= 25) &&
    (!questions.enableIsian || questions.isianCount <= 10) &&
    (!questions.enableUraian || questions.uraianCount <= 5);

  const activeLogoUrl = kop.logoUrl || school.logoUrl || '';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP HEADER CARD */}
      <div className="bg-emerald-300 border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBackToMenu && (
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1 transition-transform active:translate-y-0.5 cursor-pointer"
                  title="Kembali ke Menu Utama Desain"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-black" />
                  <span>Menu</span>
                </button>
              )}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>Desain Lembar Jawaban (LJ) A4</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
              Studio Desain Lembar Jawaban Siswa
            </h2>
            <p className="text-xs sm:text-sm text-neutral-800 font-medium">
              Atur kop sekolah resmi, tabel identitas &amp; nilai, serta konfigurasi Pilihan Ganda (10–50), Isian Singkat (5–20), dan Uraian (5–10).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {onSaveToCloud && (
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={isSaving}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black uppercase border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-500 text-white'
                    : isSaving
                    ? 'bg-neutral-300 text-neutral-600 cursor-wait'
                    : 'bg-white hover:bg-neutral-100 text-black'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Tersimpan di Cloud!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-black" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Desain LJ'}</span>
                  </>
                )}
              </button>
            )}

            {onNavigateToPrint && (
              <button
                type="button"
                onClick={onNavigateToPrint}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black uppercase bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5 text-yellow-300" />
                <span>Buka Halaman Cetak</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MIDDLE CARD: COLLAPSIBLE SETTINGS CONTROLS */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-black flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-emerald-900" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-neutral-900">
                Pengaturan Desain &amp; Komponen Lembar Jawaban
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                Sesuaikan teks kop, kolom isian identitas, dan jumlah butir soal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Page Count Estimate Badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000] ${
                isEstimatedSinglePage
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{isEstimatedSinglePage ? 'Format Ringkas (1 Lembar A4)' : 'Format Lengkap (2 Lembar A4)'}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsControlsMinimized(!isControlsMinimized)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer"
            >
              {isControlsMinimized ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Buka Pengaturan</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Ciutkan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimized Summary */}
        {isControlsMinimized ? (
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-bold text-neutral-800">
                Kop: {kop.line3 || 'Sekolah'}
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-800">
                PG: {questions.enablePg ? `${questions.pgCount} Soal (${questions.pgOptions})` : 'Nonaktif'}
              </span>
              <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 rounded font-bold text-amber-800">
                Isian: {questions.enableIsian ? `${questions.isianCount} Soal` : 'Nonaktif'}
              </span>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-300 rounded font-bold text-indigo-800">
                Uraian: {questions.enableUraian ? `${questions.uraianCount} Soal` : 'Nonaktif'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsControlsMinimized(false)}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              Ubah Pengaturan
            </button>
          </div>
        ) : (
          <div className="pt-4 space-y-4">
            {/* Tabs Selector */}
            <div className="flex items-center gap-2 border-b-2 border-neutral-200 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('kop')}
                className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                  activeTab === 'kop' ? 'bg-emerald-300 text-black' : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                1. Kop Sekolah &amp; Logo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                  activeTab === 'identity' ? 'bg-emerald-300 text-black' : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                2. Tabel Identitas &amp; Nilai
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                  activeTab === 'questions' ? 'bg-emerald-300 text-black' : 'bg-white hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                3. Butir Soal (PG, Isian, Uraian)
              </button>
            </div>

            {/* TAB 1: KOP SEKOLAH & LOGO */}
            {activeTab === 'kop' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={kop.showLogo}
                        onChange={(e) => updateKop('showLogo', e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-black text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-neutral-900">
                        Tampilkan Logo Sekolah di Kop
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetToSchoolDefault}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-neutral-600" />
                    <span>Sinkronkan Data Sekolah</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Logo URL Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-600" />
                      <span>URL Gambar Logo Sekolah / Daerah</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={kop.logoUrl || ''}
                        onChange={(e) => updateKop('logoUrl', e.target.value)}
                        placeholder={school.logoUrl ? 'Menggunakan logo sekolah aktif' : 'https://...'}
                        className="flex-1 px-3 py-1.5 text-xs border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                      />
                      {school.logoUrl && (
                        <button
                          type="button"
                          onClick={() => updateKop('logoUrl', school.logoUrl)}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-[10px] font-black uppercase shrink-0 cursor-pointer"
                          title="Gunakan Logo Sekolah Aktif"
                        >
                          Pakai Logo Utama
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Line 1: Instansi Induk */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">
                      Baris 1 (Pemerintah Kabupaten / Kota / Yayasan)
                    </label>
                    <input
                      type="text"
                      value={kop.line1}
                      onChange={(e) => updateKop('line1', e.target.value)}
                      placeholder="PEMERINTAH KABUPATEN KEDIRI"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-semibold uppercase"
                    />
                  </div>

                  {/* Line 2: Dinas */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">
                      Baris 2 (Dinas Pendidikan / Instansi Pembina)
                    </label>
                    <input
                      type="text"
                      value={kop.line2}
                      onChange={(e) => updateKop('line2', e.target.value)}
                      placeholder="DINAS PENDIDIKAN"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-semibold uppercase"
                    />
                  </div>

                  {/* Line 3: Nama Satuan Pendidikan (Besar) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">
                      Baris 3 (Nama Sekolah - Huruf Tebal / Besar)
                    </label>
                    <input
                      type="text"
                      value={kop.line3}
                      onChange={(e) => updateKop('line3', e.target.value)}
                      placeholder="SD NEGERI MEDOWO 1"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400 font-black uppercase text-neutral-900"
                    />
                  </div>

                  {/* Line 4: Alamat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">
                      Baris 4 (Alamat Jalan, Desa, Kecamatan, Kab &amp; Kode Pos)
                    </label>
                    <input
                      type="text"
                      value={kop.line4}
                      onChange={(e) => updateKop('line4', e.target.value)}
                      placeholder="Jl Raya Medowo Ds. Medowo, Kec. Kandangan, Kab. Kediri 64294"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {/* Line 5: Kontak & Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">
                      Baris 5 (Telepon, Pos-el / Email, Laman Web)
                    </label>
                    <input
                      type="text"
                      value={kop.line5}
                      onChange={(e) => updateKop('line5', e.target.value)}
                      placeholder="Telepon : - , Pos-el : sdnmedowosatu@gmail.com"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TABEL IDENTITAS & NILAI */}
            {activeTab === 'identity' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <p className="text-xs text-neutral-600">
                  Kustomisasi judul asesmen dan label kolom data siswa yang tercetak pada tabel identitas lembar jawaban (sesuai contoh gambar resmi).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Judul Dokumen */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Judul Dokumen</label>
                    <input
                      type="text"
                      value={identity.title}
                      onChange={(e) => updateIdentity('title', e.target.value)}
                      placeholder="LEMBAR JAWABAN"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-black uppercase"
                    />
                  </div>

                  {/* Nama Asesmen / Ujian */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Nama Asesmen / Kegiatan</label>
                    <input
                      type="text"
                      value={identity.examTitle}
                      onChange={(e) => updateIdentity('examTitle', e.target.value)}
                      placeholder="ASESMEN SUMATIF AKHIR SEMESTER 1"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-black uppercase"
                    />
                  </div>

                  {/* Tahun Pelajaran */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Tahun Pelajaran</label>
                    <input
                      type="text"
                      value={identity.yearTitle}
                      onChange={(e) => updateIdentity('yearTitle', e.target.value)}
                      placeholder="TAHUN PELAJARAN 2024 – 2025"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-bold uppercase"
                    />
                  </div>

                  {/* Label Nama / No */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Label Kolom Nama &amp; No</label>
                    <input
                      type="text"
                      value={identity.nameLabel}
                      onChange={(e) => updateIdentity('nameLabel', e.target.value)}
                      placeholder="Nama / No"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-semibold"
                    />
                  </div>

                  {/* Label Kelas */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Label Kolom Kelas</label>
                    <input
                      type="text"
                      value={identity.classLabel}
                      onChange={(e) => updateIdentity('classLabel', e.target.value)}
                      placeholder="Kelas"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-semibold"
                    />
                  </div>

                  {/* Label Mata Pelajaran */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Label Mata Pelajaran</label>
                    <input
                      type="text"
                      value={identity.subjectLabel}
                      onChange={(e) => updateIdentity('subjectLabel', e.target.value)}
                      placeholder="Mata Pelajaran"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-semibold"
                    />
                  </div>

                  {/* Label Hari / Tanggal */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Label Hari / Tanggal</label>
                    <input
                      type="text"
                      value={identity.dateLabel}
                      onChange={(e) => updateIdentity('dateLabel', e.target.value)}
                      placeholder="Hari / Tanggal"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-semibold"
                    />
                  </div>

                  {/* Label Kotak Nilai */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Label Kotak Nilai (Kanan Atas)</label>
                    <input
                      type="text"
                      value={identity.scoreLabel}
                      onChange={(e) => updateIdentity('scoreLabel', e.target.value)}
                      placeholder="Nilai:"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-semibold"
                    />
                  </div>

                  {/* Jenis Huruf Dokumen */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-800">Jenis Huruf (Font)</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => onUpdateDesign({ ...design, fontFamily: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded-lg font-bold bg-white cursor-pointer"
                    >
                      <option value="sans">Modern Sans (Arial / Inter)</option>
                      <option value="serif">Resmi Klasik (Times New Roman / Serif)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BUTIR SOAL */}
            {activeTab === 'questions' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* 1. PILIHAN GANDA (PG) */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border-2 border-black space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={questions.enablePg}
                        onChange={(e) => updateQuestions('enablePg', e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-black text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-neutral-900">
                        I. Bagian Pilihan Ganda (PG)
                      </span>
                    </label>

                    {questions.enablePg && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-neutral-600">Pilihan Opsi:</span>
                        <div className="flex items-center gap-1">
                          {(['ABCD', 'ABCDE'] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateQuestions('pgOptions', opt)}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded border ${
                                questions.pgOptions === opt
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-neutral-700 border-neutral-300'
                              } cursor-pointer`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {questions.enablePg && (
                    <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold text-neutral-700 mb-1.5">
                          Jumlah Soal Pilihan Ganda:
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {([10, 15, 20, 25, 50] as AnswerSheetPgCount[]).map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => updateQuestions('pgCount', count)}
                              className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5 ${
                                questions.pgCount === count
                                  ? 'bg-emerald-300 text-black'
                                  : 'bg-white hover:bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {count} Soal
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] text-neutral-500 bg-white p-2 rounded-lg border border-neutral-200">
                        Susunan vertikal: <strong>5 sampai 10 nomor ke bawah</strong> per kolom dengan format lingkaran bulatan (A) (B) (C) (D).
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. ISIAN SINGKAT */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border-2 border-black space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={questions.enableIsian}
                        onChange={(e) => updateQuestions('enableIsian', e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-black text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-neutral-900">
                        II. Bagian Isian Singkat
                      </span>
                    </label>
                  </div>

                  {questions.enableIsian && (
                    <div className="pt-2 border-t border-neutral-200">
                      <div className="text-[11px] font-bold text-neutral-700 mb-1.5">
                        Jumlah Soal Isian Singkat:
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {([5, 10, 15, 20] as AnswerSheetIsianCount[]).map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => updateQuestions('isianCount', count)}
                            className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5 ${
                              questions.isianCount === count
                                ? 'bg-amber-300 text-black'
                                : 'bg-white hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {count} Soal
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. URAIAN */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border-2 border-black space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={questions.enableUraian}
                        onChange={(e) => updateQuestions('enableUraian', e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-black text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-neutral-900">
                        III. Bagian Uraian (Essay)
                      </span>
                    </label>
                  </div>

                  {questions.enableUraian && (
                    <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold text-neutral-700 mb-1.5">
                          Jumlah Soal Uraian:
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {([5, 10] as AnswerSheetUraianCount[]).map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => updateQuestions('uraianCount', count)}
                              className={`px-3 py-1 rounded-lg border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5 ${
                                questions.uraianCount === count
                                  ? 'bg-indigo-300 text-black'
                                  : 'bg-white hover:bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {count} Soal
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-neutral-600">Baris per Nomor:</span>
                        <div className="flex items-center gap-1">
                          {[2, 3, 4].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => updateQuestions('uraianRowsPerNumber', n)}
                              className={`px-2 py-0.5 text-[11px] font-bold rounded border ${
                                (questions.uraianRowsPerNumber || 3) === n
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-neutral-700 border-neutral-300'
                              } cursor-pointer`}
                            >
                              {n} Baris
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM: FULL LIVE A4 PREVIEW */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-neutral-100">
          <div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-neutral-900 text-white rounded">
              Live Preview Lembar A4
            </span>
            <h3 className="text-base font-black uppercase text-neutral-900 mt-1">
              Pratinjau Lembar Jawaban Siswa
            </h3>
            <p className="text-xs text-neutral-500">
              Format lembar kertas A4 standar ujian sekolah nasional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700">
              Total: <strong>{totalQuestions} Soal</strong>
            </span>
          </div>
        </div>

        {/* The Paper Sheet Container */}
        <div className="flex justify-center p-2 sm:p-6 bg-neutral-100/70 rounded-xl border border-neutral-200 overflow-x-auto">
          <div
            className={`w-full max-w-[210mm] bg-white text-black border-2 border-neutral-400 shadow-xl p-6 sm:p-8 space-y-4 ${
              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
            style={{ minHeight: '297mm' }}
          >
            {/* KOP SURAT */}
            <div className="flex items-center gap-4 pb-2">
              {kop.showLogo && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                  {activeLogoUrl ? (
                    <img
                      src={activeLogoUrl}
                      alt="Logo Sekolah"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-neutral-400 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 text-center font-bold">
                      Logo
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 text-center space-y-0.5">
                {kop.line1 && (
                  <div className="text-[11px] sm:text-[13px] font-bold tracking-wide uppercase leading-tight">
                    {kop.line1}
                  </div>
                )}
                {kop.line2 && (
                  <div className="text-[11px] sm:text-[13px] font-bold tracking-wide uppercase leading-tight">
                    {kop.line2}
                  </div>
                )}
                {kop.line3 && (
                  <div className="text-[14px] sm:text-[17px] font-black tracking-wide uppercase leading-tight">
                    {kop.line3}
                  </div>
                )}
                {kop.line4 && (
                  <div className="text-[9px] sm:text-[10.5px] leading-tight text-neutral-800">
                    {kop.line4}
                  </div>
                )}
                {kop.line5 && (
                  <div className="text-[9px] sm:text-[10px] leading-tight text-neutral-700">
                    {kop.line5}
                  </div>
                )}
              </div>
            </div>

            {/* GARIS GANDA KOP SURAT (DOUBLE HORIZONTAL RULE) */}
            <div className="border-b-[3px] border-black pb-[1.5px]">
              <div className="border-b border-black"></div>
            </div>

            {/* TABEL IDENTITAS & NILAI (BOXED TABLE SESUAI FOTO) */}
            <div className="border-2 border-black text-black">
              {/* Row Atas: Judul Asesmen (Kiri/Tengah) & Kotak Nilai (Kanan) */}
              <div className="grid grid-cols-4 border-b border-black">
                <div className="col-span-3 p-2 text-center border-r border-black flex flex-col justify-center">
                  <div className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    {identity.title || 'LEMBAR JAWABAN'}
                  </div>
                  <div className="text-xs sm:text-sm font-black uppercase tracking-wide">
                    {identity.examTitle || 'ASESMEN SUMATIF'}
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wide">
                    {identity.yearTitle || 'TAHUN PELAJARAN 2024 – 2025'}
                  </div>
                </div>

                <div className="col-span-1 p-1.5 flex flex-col justify-between" style={{ minHeight: '68px' }}>
                  <div className="text-[11px] font-bold text-neutral-800">
                    {identity.scoreLabel || 'Nilai:'}
                  </div>
                  {/* Blank space for teacher grading */}
                  <div className="flex-1"></div>
                </div>
              </div>

              {/* Row Bawah: 2 Kolom Identitas Siswa */}
              <div className="grid grid-cols-2 text-[11px] sm:text-xs font-medium">
                {/* Kolom Kiri: Nama/No & Kelas */}
                <div className="border-r border-black">
                  <div className="flex items-center px-2 py-1 border-b border-black">
                    <span className="w-20 font-bold shrink-0">{identity.nameLabel || 'Nama / No'}</span>
                    <span className="mr-1.5 font-bold">:</span>
                    <span className="flex-1 text-neutral-400 truncate">
                      ............................................ / ......
                    </span>
                  </div>
                  <div className="flex items-center px-2 py-1">
                    <span className="w-20 font-bold shrink-0">{identity.classLabel || 'Kelas'}</span>
                    <span className="mr-1.5 font-bold">:</span>
                    <span className="flex-1 text-neutral-400 truncate">
                      ............................................
                    </span>
                  </div>
                </div>

                {/* Kolom Kanan: Mata Pelajaran & Hari/Tanggal */}
                <div>
                  <div className="flex items-center px-2 py-1 border-b border-black">
                    <span className="w-24 font-bold shrink-0">{identity.subjectLabel || 'Mata Pelajaran'}</span>
                    <span className="mr-1.5 font-bold">:</span>
                    <span className="flex-1 text-neutral-400 truncate">
                      ............................................
                    </span>
                  </div>
                  <div className="flex items-center px-2 py-1">
                    <span className="w-24 font-bold shrink-0">{identity.dateLabel || 'Hari / Tanggal'}</span>
                    <span className="mr-1.5 font-bold">:</span>
                    <span className="flex-1 text-neutral-400 truncate">
                      ............................................
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BAGIAN I: PILIHAN GANDA */}
            {questions.enablePg && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-black uppercase border-b border-black pb-0.5">
                  <span>I. PILIHAN GANDA</span>
                  <span className="text-[10px] font-normal normal-case text-neutral-600">
                    Berikan tanda silang (X) atau hitamkan salah satu huruf pilihan jawaban yang benar!
                  </span>
                </div>

                {/* Render Grid Soal PG (5 sampai 10 nomor ke bawah) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px] pt-1">
                  {renderPgColumns(questions.pgCount, questions.pgOptions)}
                </div>
              </div>
            )}

            {/* BAGIAN II: ISIAN SINGKAT */}
            {questions.enableIsian && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-black uppercase border-b border-black pb-0.5">
                  II. ISIAN SINGKAT
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pt-0.5">
                  {Array.from({ length: questions.isianCount }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-6 font-bold shrink-0">{idx + 1}.</span>
                      <span className="flex-1 border-b border-dotted border-black h-4"></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BAGIAN III: URAIAN */}
            {questions.enableUraian && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-black uppercase border-b border-black pb-0.5">
                  III. URAIAN
                </div>

                <div className="space-y-2.5 text-[11px] pt-0.5">
                  {Array.from({ length: questions.uraianCount }).map((_, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <span>{idx + 1}.</span>
                        <div className="flex-1 border-b border-black/40 h-3"></div>
                      </div>
                      {Array.from({ length: (questions.uraianRowsPerNumber || 3) - 1 }).map((_, rIdx) => (
                        <div key={rIdx} className="w-full border-b border-black/40 h-3"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tanda Tangan Orang Tua / Peserta */}
            <div className="pt-4 flex items-center justify-between text-[10px] text-neutral-700">
              <div className="text-center w-36">
                <div>Tanda Tangan Peserta</div>
                <div className="h-10"></div>
                <div className="border-b border-dotted border-black"></div>
              </div>

              <div className="text-center w-36">
                <div>Paraf Pengawas</div>
                <div className="h-10"></div>
                <div className="border-b border-dotted border-black"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper untuk menyusun butir PG menjadi kolom-kolom rapi (5 sampai 10 nomor ke bawah)
 */
function renderPgColumns(count: number, options: 'ABCD' | 'ABCDE') {
  const letters = options === 'ABCDE' ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];

  // Tentukan baris per kolom: jika 10 nomor -> 5 per kolom (2 kolom)
  // jika 15 -> 5 per kolom (3 kolom)
  // jika 20 -> 10 per kolom (2 kolom) atau 5 (4 kolom)
  // jika 25 -> 5 per kolom (5 kolom)
  // jika 50 -> 10 per kolom (5 kolom)
  const rowsPerCol = count <= 15 ? 5 : count === 25 ? 5 : 10;
  const numColumns = Math.ceil(count / rowsPerCol);

  const columns = [];
  for (let col = 0; col < numColumns; col++) {
    const colItems = [];
    const startNum = col * rowsPerCol + 1;
    const endNum = Math.min((col + 1) * rowsPerCol, count);

    for (let num = startNum; num <= endNum; num++) {
      colItems.push(
        <div key={num} className="flex items-center justify-between py-0.5 border-b border-neutral-100">
          <span className="w-5 font-bold text-neutral-900 shrink-0 text-[10px] sm:text-[11px]">{num}.</span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {letters.map((letter) => (
              <span
                key={letter}
                className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[9px] font-bold text-neutral-800 select-none hover:bg-neutral-100 cursor-pointer"
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      );
    }

    columns.push(
      <div key={col} className="bg-neutral-50/70 p-1.5 rounded border border-neutral-200 space-y-0.5">
        {colItems}
      </div>
    );
  }

  return columns;
}
