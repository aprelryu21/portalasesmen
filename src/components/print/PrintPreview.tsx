import React, { useState, useMemo, useEffect } from 'react';
import { School, Exam, Student, Teacher, CardDesignSettings, PrintSettings, PosterDesignSettings, AnswerSheetDesignSettings } from '../../types';
import { DEFAULT_POSTER_DESIGN, DEFAULT_ANSWER_SHEET_DESIGN } from '../../data/mockData';
import { ExamCard } from '../card/ExamCard';
import { DeskCardPrint } from './DeskCardPrint';
import { ProctorGuestPreview } from './ProctorGuestPreview';
import { PinchZoomCardContainer } from '../card/PinchZoomCardContainer';
import { A4SheetContainer } from './A4SheetContainer';
import { PrintConfirmationModal } from './PrintConfirmationModal';
import { ExamPosterPrint } from './ExamPosterPrint';
import { AnswerSheetPrint } from './AnswerSheetPrint';
import {
  Printer,
  Settings2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Calendar,
  Building2,
  BookOpen,
  Users,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Smartphone,
  FileText,
  Megaphone,
  Clock,
} from 'lucide-react';

export type PrintCardCategory =
  | 'menu'
  | 'student_exam'
  | 'desk_card'
  | 'proctor_id'
  | 'guest_id'
  | 'exam_admin'
  | 'exam_poster'
  | 'answer_sheet';

interface PrintPreviewProps {
  school: School;
  exam: Exam;
  exams?: Exam[];
  onSelectActiveExam?: (exam: Exam) => void;
  students: Student[];
  teachers?: Teacher[];
  selectedStudentIds: string[];
  onToggleStudentSelect: (id: string) => void;
  onSelectAllStudents: (selected: boolean) => void;
  design: CardDesignSettings;
  posterDesign?: PosterDesignSettings;
  answerSheetDesign?: AnswerSheetDesignSettings;
  printSettings: PrintSettings;
  onUpdatePrintSettings: (newSettings: PrintSettings) => void;
  onBackToDesigner: () => void;
  onNavigateToPosterDesigner?: () => void;
  onNavigateToAnswerSheetDesigner?: () => void;
  initialCategory?: PrintCardCategory;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({
  school,
  exam,
  exams = [],
  onSelectActiveExam,
  students,
  teachers = [],
  selectedStudentIds,
  onToggleStudentSelect,
  onSelectAllStudents,
  design,
  posterDesign,
  answerSheetDesign,
  printSettings,
  onUpdatePrintSettings,
  onBackToDesigner,
  onNavigateToPosterDesigner,
  onNavigateToAnswerSheetDesigner,
  initialCategory,
}) => {
  // Main view state: default to 'menu' or initialCategory
  const [activeCategory, setActiveCategory] = useState<PrintCardCategory>(initialCategory || 'menu');

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  // Selected assessment state
  const [selectedExamId, setSelectedExamId] = useState<string>(exam?.id || '');

  // Keep selectedExamId in sync if exam prop changes
  useEffect(() => {
    if (exam?.id) {
      setSelectedExamId(exam.id);
    }
  }, [exam?.id]);

  const availableExams = useMemo(() => {
    if (exams && exams.length > 0) return exams;
    return exam ? [exam] : [];
  }, [exams, exam]);

  const currentExam: Exam = useMemo(() => {
    const found = availableExams.find((e) => e.id === selectedExamId);
    return found || exam;
  }, [availableExams, selectedExamId, exam]);

  const handleExamChange = (newId: string) => {
    setSelectedExamId(newId);
    const found = availableExams.find((e) => e.id === newId);
    if (found && onSelectActiveExam) {
      onSelectActiveExam(found);
    }
  };

  // Exam Card filter & settings
  const [filterMode, setFilterMode] = useState<'selected' | 'all'>('selected');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // Mobile Pinch-to-Zoom inspection view mode state
  const [viewDisplayMode, setViewDisplayMode] = useState<'inspect_card' | 'sheets'>('inspect_card');
  const [inspectedIndex, setInspectedIndex] = useState<number>(0);
  const [inspectModalStudent, setInspectModalStudent] = useState<Student | null>(null);
  const [mobileSheetFit, setMobileSheetFit] = useState<boolean>(true);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState<boolean>(false);

  // Filter students based on selection & deduplicate to prevent key errors
  const printableStudents = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueStudents = (students || []).filter((s) => {
      if (!s || !s.id) return false;
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    });

    if (filterMode === 'all') {
      return uniqueStudents;
    }
    const selectedSet = new Set(selectedStudentIds);
    return uniqueStudents.filter((s) => selectedSet.has(s.id));
  }, [students, selectedStudentIds, filterMode]);

  // Calculate cards per page based on layout and physical dimensions for ExamCard
  const paginationInfo = useMemo(() => {
    // A4 dimensions in mm
    const pageW = printSettings.orientation === 'portrait' ? 210 : 297;
    const pageH = printSettings.orientation === 'portrait' ? 297 : 210;

    const availableW = pageW - printSettings.marginMm * 2;
    const availableH = pageH - printSettings.marginMm * 2;

    const cols = printSettings.layoutMode === '2_col' ? 2 : 1;
    const cardH = design.heightMm;
    const spacing = printSettings.spacingMm;

    // Estimate rows that fit comfortably on a single A4 page
    const rows = Math.max(1, Math.floor((availableH + spacing) / (cardH + spacing)));
    const cardsPerPage = cols * rows;

    // Split printable students into pages
    const pages: Student[][] = [];
    for (let i = 0; i < printableStudents.length; i += cardsPerPage) {
      pages.push(printableStudents.slice(i, i + cardsPerPage));
    }

    return {
      cols,
      rows,
      cardsPerPage,
      totalPages: Math.max(1, pages.length),
      pages: pages.length > 0 ? pages : [[]],
    };
  }, [printableStudents, printSettings, design]);

  // Tombol cetak memunculkan pop-up konfirmasi neobrutalisme terlebih dahulu
  const handlePrint = () => {
    setIsPrintConfirmOpen(true);
  };

  const handleExecuteBrowserPrint = () => {
    setIsPrintConfirmOpen(false);
    setTimeout(() => {
      window.focus();
      window.print();
    }, 200);
  };

  // Keyboard shortcut Ctrl+P or Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateSetting = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
    onUpdatePrintSettings({
      ...printSettings,
      [key]: value,
    });
  };

  // Quick category switcher tabs displayed at the top of any active generator
  const renderCategorySwitcher = () => (
    <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-black">
      <button
        type="button"
        onClick={() => setActiveCategory('menu')}
        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Menu Pilihan</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('student_exam')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'student_exam'
            ? 'bg-yellow-300 text-black'
            : 'bg-white hover:bg-yellow-50 text-neutral-700'
        }`}
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>ID Ujian Siswa</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('desk_card')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'desk_card'
            ? 'bg-amber-300 text-black'
            : 'bg-white hover:bg-amber-50 text-neutral-700'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>ID Tempat Duduk</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('proctor_id')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'proctor_id'
            ? 'bg-indigo-300 text-black'
            : 'bg-white hover:bg-indigo-50 text-neutral-700'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>ID Pengawas</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('guest_id')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'guest_id'
            ? 'bg-emerald-300 text-black'
            : 'bg-white hover:bg-emerald-50 text-neutral-700'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>ID Tamu</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('exam_admin')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'exam_admin'
            ? 'bg-rose-300 text-black'
            : 'bg-white hover:bg-rose-50 text-neutral-700'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Administrasi Ujian</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('exam_poster')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'exam_poster'
            ? 'bg-purple-300 text-black'
            : 'bg-white hover:bg-purple-50 text-neutral-700'
        }`}
      >
        <Megaphone className="w-3.5 h-3.5" />
        <span>Poster Ujian</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveCategory('answer_sheet')}
        className={`px-3 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
          activeCategory === 'answer_sheet'
            ? 'bg-teal-300 text-black'
            : 'bg-white hover:bg-teal-50 text-neutral-700'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Lembar Jawaban</span>
      </button>
    </div>
  );

  // 1. MENU UTAMA: PILIHAN JENIS KARTU UNTUK DICETAK
  if (activeCategory === 'menu') {
    const assessmentList = (exams && exams.length > 0 ? exams : (exam && exam.name ? [exam] : [])).filter(
      (e) => e && e.name && e.name.trim().length > 0
    );

    return (
      <div className="space-y-6">
        {/* Header Banner Hub */}
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-300 text-black border border-black rounded text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                Pusat Percetakan Kartu &amp; Tanda Pengenal
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
                Pilih Jenis Kartu yang Ingin Dicetak
              </h2>
            </div>
          </div>

          {/* Quick Context Summary Chips & Assessment Selector */}
          <div className="pt-3 border-t-2 border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
                <Building2 className="w-3.5 h-3.5 text-neutral-700" />
                <span>{school?.name || 'Sekolah Terdaftar'}</span>
              </span>

              {/* Assessment Selector: Nama asesmen dibuat ringkas agar tidak over */}
              <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-black rounded-xl px-3 py-1 shadow-[2px_2px_0px_#000] max-w-full">
                <BookOpen className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="text-[11px] font-black uppercase text-neutral-800 shrink-0">Pilih Asesmen:</span>
                {assessmentList.length > 0 ? (
                  <select
                    value={exam?.id || ''}
                    onChange={(e) => {
                      const chosen = assessmentList.find((ex) => ex.id === e.target.value);
                      if (chosen && onSelectActiveExam) {
                        onSelectActiveExam(chosen);
                      }
                    }}
                    className="bg-white border-2 border-black rounded-lg px-2.5 py-1 text-xs font-black text-black cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-black max-w-[170px] sm:max-w-[240px] truncate"
                  >
                    {assessmentList.map((ex) => {
                      const shortName = ex.name
                        ? (ex.name.length > 24 ? `${ex.name.slice(0, 24)}...` : ex.name)
                        : 'Asesmen';
                      return (
                        <option key={ex.id || ex.name} value={ex.id || ex.name}>
                          {shortName} {ex.semester ? `• ${ex.semester}` : ''} {ex.academicYear ? `(${ex.academicYear})` : ''}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <span className="text-xs font-bold text-neutral-700 italic px-2">Belum ada asesmen</span>
                )}
              </div>
            </div>

            {exam?.dateText && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 text-neutral-600 border border-neutral-300 rounded-lg text-[11px] font-mono font-bold">
                <Calendar className="w-3 h-3 text-neutral-500" />
                <span>{exam.dateText}</span>
              </span>
            )}
          </div>
        </div>

        {/* 4 MENU PILIHAN KARTU DALAM GRID NEOBRUTALIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* MENU 1: ID UJIAN SISWA */}
          <div
            onClick={() => setActiveCategory('student_exam')}
            className="group relative bg-white hover:bg-yellow-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-yellow-300 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-black group-hover:scale-105 transition-transform">
                  <CreditCard className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-yellow-300 text-black border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  Generator Utama
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-yellow-600 transition-colors flex items-center gap-2">
                  ID Ujian Siswa
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Kartu Peserta Ujian Resmi
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Mencetak kartu tanda peserta ujian lengkap dengan foto siswa atau avatar gender, barcode & QR validasi, data rombel/kelas, kop sekolah, dan stempel/ttd kepala sekolah.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Format cetak presisi A4 dengan garis potong rapi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Opsi 1 kolom (besar) atau 2 kolom (hemat kertas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Garis potong gunting (dashed) & tanda potong sudut</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-yellow-300 group-hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Generator ID Ujian Siswa</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MENU 2: ID TEMPAT DUDUK */}
          <div
            onClick={() => setActiveCategory('desk_card')}
            className="group relative bg-white hover:bg-amber-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-amber-300 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-black group-hover:scale-105 transition-transform">
                  <LayoutGrid className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-amber-200 text-amber-950 border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  Kartu Meja Ujian
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                  ID Tempat Duduk
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Kartu Nomor Meja Peserta
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Mencetak kartu nomor meja dan ruang ujian untuk ditempel di meja masing-masing peserta. Memuat nomor ruang, nomor meja besar, nama lengkap, NISN, dan QR code scan meja.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dihasilkan otomatis dari data ruang & meja siswa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pilihan 4 kartu/lembar (standar) atau 6 kartu/lembar (ringkas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Kop sekolah resmi & tanda garis potong sudut</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-amber-300 group-hover:bg-amber-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Generator ID Tempat Duduk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MENU 3: ID PENGAWAS */}
          <div
            onClick={() => setActiveCategory('proctor_id')}
            className="group relative bg-white hover:bg-indigo-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-indigo-200 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-indigo-900 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  Pengawas & Panitia
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                  ID Pengawas
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Tanda Pengenal Pengawas Ruang
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Tanda pengenal resmi untuk Guru Pengawas Ruang dan Panitia Pelaksana Ujian. Dilengkapi kop sekolah, badge status tugas pengawas, QR code verifikasi, dan tanda tangan kepala sekolah.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Terintegrasi identitas sekolah ({school?.name || 'Sekolah'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Format ID Card portrait siap pasang tali lanyard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Format cetak presisi A4 siap potong & pasang tali</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-indigo-200 group-hover:bg-indigo-300 text-indigo-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Generator ID Pengawas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MENU 4: ID TAMU */}
          <div
            onClick={() => setActiveCategory('guest_id')}
            className="group relative bg-white hover:bg-emerald-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-emerald-200 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-emerald-900 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  Tamu & Monev
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                  ID Tamu
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Tanda Pengenal Tamu & Asesor
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Tanda pengenal resmi untuk Tamu Kunjungan, Tim Monitoring & Evaluasi (Monev), Pengawas Pembina, dan Pejabat Dinas Pendidikan dengan tanda verifikasi akses ruangan.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Terintegrasi kop resmi ({school?.name || 'Sekolah'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>QR Code verifikasi izin akses seluruh ruangan ujian</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Format ID Card resmi A4 dengan stempel & tanda tangan</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-emerald-200 group-hover:bg-emerald-300 text-emerald-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Generator ID Tamu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MENU 5: ADMINISTRASI UJIAN (MASIH DIKEMBANGKAN) */}
          <div
            onClick={() => setActiveCategory('exam_admin')}
            className="group relative bg-white hover:bg-rose-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-rose-200 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-rose-900 group-hover:scale-105 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-amber-300 text-black border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000] animate-pulse">
                  Masih Dikembangkan
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-rose-600 transition-colors flex items-center gap-2">
                  Administrasi Ujian
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Berkas &amp; Dokumen Operasional Ujian
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Paket dokumen kelengkapan ruang ujian seperti Daftar Hadir Peserta per Ruang, Berita Acara Pelaksanaan Ujian (BAPU), Denah Tempat Duduk, dan Rekapitulasi Presensi Pengawas.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Daftar Hadir Peserta Ujian per Ruang &amp; Kolom TTD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Berita Acara Pelaksanaan Ujian (BAPU) Resmi</span>
                </div>
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Status: Menu masih dikembangkan</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-rose-200 group-hover:bg-rose-300 text-rose-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Menu Administrasi Ujian</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MENU 6: CETAK POSTER UJIAN (AKAN DIKEMBANGKAN MENDATANG) */}
          <div
            onClick={() => setActiveCategory('exam_poster')}
            className="group relative bg-white hover:bg-purple-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-purple-200 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-purple-900 group-hover:scale-105 transition-transform">
                  <Megaphone className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-purple-300 text-purple-950 border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  Siap Cetak A4
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                  Cetak Poster Ujian
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Poster Tata Tertib &amp; Panduan Ruang
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Fungsi untuk mencetak poster pengumuman ujian (A4 penuh) beresolusi tinggi dengan 6 pilihan tema resmi, 5 gaya visual premium, serta watermark logo dan nama sekolah.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Harap Tenang, Bebas HP/Kamera &amp; Ruangan Asesmen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Ruang Panitia, Kepala Sekolah, dan Tamu &amp; Pengawas</span>
                </div>
                <div className="flex items-center gap-2 text-purple-800 font-bold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>6 Tema • 5 Gaya Tampilan Unik A4 Penuh Watermark</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-purple-200 group-hover:bg-purple-300 text-purple-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Cetak Poster Ujian</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* MENU 7: CETAK LEMBAR JAWABAN */}
          <div
            onClick={() => setActiveCategory('answer_sheet')}
            className="group relative bg-white hover:bg-teal-50/50 border-3 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] rounded-2xl p-6 flex flex-col justify-between transition-all duration-150 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 bg-teal-200 border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-teal-900 group-hover:scale-105 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 bg-teal-300 text-teal-950 border border-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  Format Resmi A4
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900 group-hover:text-teal-700 transition-colors flex items-center gap-2">
                  Cetak Lembar Jawaban
                </h3>
                <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                  Lembar Jawaban Asesmen / Ujian Sekolah (LJK / LJ)
                </p>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2.5">
                  Fungsi untuk mencetak lembar jawaban siswa ukuran A4 lengkap dengan kop sekolah resmi, tabel identitas &amp; nilai, pilihan ganda (A B C D), isian singkat, dan uraian.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-200 text-xs font-semibold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Kop sekolah resmi &amp; tabel identitas siswa terintegrasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Opsi PG (10–50 butir), Isian (5–20), &amp; Uraian (5–10)</span>
                </div>
                <div className="flex items-center gap-2 text-teal-800 font-bold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Cetak massal siap pakai per kelas atau per mata pelajaran</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-teal-300 group-hover:bg-teal-200 text-teal-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Buka Percetakan Lembar Jawaban</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. SUB-GENERATOR 2: ID TEMPAT DUDUK (DESK CARD)
  if (activeCategory === 'desk_card') {
    return (
      <div className="space-y-4">
        {renderCategorySwitcher()}
        <DeskCardPrint
          school={school}
          exam={exam}
          students={students}
          selectedStudentIds={selectedStudentIds}
          onSelectAllStudents={onSelectAllStudents}
          onBackToMenu={() => setActiveCategory('menu')}
        />
      </div>
    );
  }

  // 3. SUB-GENERATOR 3: ID PENGAWAS
  if (activeCategory === 'proctor_id') {
    return (
      <div className="space-y-4">
        {renderCategorySwitcher()}
        <ProctorGuestPreview
          type="proctor"
          school={school}
          exam={exam}
          teachers={teachers}
          onBackToMenu={() => setActiveCategory('menu')}
        />
      </div>
    );
  }

  // 4. SUB-GENERATOR 4: ID TAMU
  if (activeCategory === 'guest_id') {
    return (
      <div className="space-y-4">
        {renderCategorySwitcher()}
        <ProctorGuestPreview
          type="guest"
          school={school}
          exam={exam}
          onBackToMenu={() => setActiveCategory('menu')}
        />
      </div>
    );
  }

  // 5. SUB-GENERATOR 5: ADMINISTRASI UJIAN (MASIH DIKEMBANGKAN)
  if (activeCategory === 'exam_admin') {
    return (
      <div className="space-y-6">
        {renderCategorySwitcher()}

        {/* Header Banner */}
        <div className="bg-rose-100 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500 text-white rounded text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Status: Masih Dikembangkan
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-rose-700" />
                Administrasi Pelaksanaan Ujian
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl font-medium mt-1">
                Modul pencetakan berkas administrasi dan kelengkapan operasional ruang ujian untuk asesmen <strong>{exam?.name || 'Asesmen Ujian'}</strong> di <strong>{school?.name || 'Sekolah'}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveCategory('menu')}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Menu</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-rose-200 border-2 border-black flex items-center justify-center font-black">
                1
              </span>
              <span className="px-2 py-0.5 bg-yellow-300 text-black text-[10px] font-black rounded border border-black uppercase">
                Segera Hadir
              </span>
            </div>
            <h3 className="text-base font-black uppercase">Daftar Hadir Peserta Ujian per Ruang</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Format lembar presensi otomatis berisi daftar nama siswa di masing-masing ruang ujian, nomor meja, NISN, serta kolom tanda tangan sesi pagi dan siang.
            </p>
            <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Format A4 Portrait • Siap Cetak per Ruang</span>
            </div>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-rose-200 border-2 border-black flex items-center justify-center font-black">
                2
              </span>
              <span className="px-2 py-0.5 bg-yellow-300 text-black text-[10px] font-black rounded border border-black uppercase">
                Segera Hadir
              </span>
            </div>
            <h3 className="text-base font-black uppercase">Berita Acara Pelaksanaan Ujian (BAPU)</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Formulir berita acara resmi berisi identitas mata pelajaran, jumlah peserta hadir/tidak hadir, catatan integritas dan insiden ruang, serta tanda tangan pengawas.
            </p>
            <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Format Standar Kemdikbud &amp; Kemenag</span>
            </div>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-rose-200 border-2 border-black flex items-center justify-center font-black">
                3
              </span>
              <span className="px-2 py-0.5 bg-yellow-300 text-black text-[10px] font-black rounded border border-black uppercase">
                Segera Hadir
              </span>
            </div>
            <h3 className="text-base font-black uppercase">Denah Ruang &amp; Denah Tempat Duduk</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Diagram visual susunan meja dan nomor peserta per ruangan untuk ditempel di pintu masuk agar peserta ujian mudah menemukan posisinya.
            </p>
            <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Layout Meja Otomatis (U / Baris Standar)</span>
            </div>
          </div>

          <div className="bg-white border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-rose-200 border-2 border-black flex items-center justify-center font-black">
                4
              </span>
              <span className="px-2 py-0.5 bg-yellow-300 text-black text-[10px] font-black rounded border border-black uppercase">
                Segera Hadir
              </span>
            </div>
            <h3 className="text-base font-black uppercase">Rekapitulasi Presensi &amp; Honor Pengawas</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Laporan ringkas kehadiran pengawas ruang, jadwal penugasan harian, dan lembar tanda terima berkas soal/jawaban.
            </p>
            <div className="pt-2 border-t border-neutral-200 flex items-center gap-2 text-xs font-bold text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Terintegrasi Database Guru Pengawas</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. SUB-GENERATOR 6: CETAK POSTER UJIAN A4 (6 TEMA • 5 GAYA)
  if (activeCategory === 'exam_poster') {
    return (
      <ExamPosterPrint
        school={school}
        exam={exam}
        students={students}
        posterDesign={posterDesign || DEFAULT_POSTER_DESIGN}
        onBackToMenu={() => setActiveCategory('menu')}
        onNavigateToDesigner={onNavigateToPosterDesigner}
      />
    );
  }

  // 7. SUB-GENERATOR 7: CETAK LEMBAR JAWABAN SISWA (A4)
  if (activeCategory === 'answer_sheet') {
    return (
      <AnswerSheetPrint
        school={school}
        exam={exam}
        exams={exams}
        answerSheetDesign={answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN}
        onBackToMenu={() => setActiveCategory('menu')}
        onNavigateToDesigner={onNavigateToAnswerSheetDesigner}
      />
    );
  }

  // 5. SUB-GENERATOR 1: ID UJIAN SISWA (KARTU PESERTA UJIAN A4)
  return (
    <div className="space-y-6">
      {/* Category Quick Switcher */}
      {renderCategorySwitcher()}

      {/* Top Controls & Print Action (Hidden on Print) */}
      <div className="no-print bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory('menu')}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Kembali ke Menu Pilihan Kartu"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pilihan Kartu Lain</span>
          </button>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              ID Ujian Siswa (Pratinjau & Cetak A4)
            </h2>
            <p className="text-xs font-medium text-neutral-600">
              Tata letak presisi A4 dengan panduan garis potong rapi
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layout Mode switcher */}
          <div className="flex bg-neutral-100 p-1 border-2 border-black rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => updateSetting('layoutMode', '2_col')}
              className={`px-3 py-1 rounded cursor-pointer ${
                printSettings.layoutMode === '2_col'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200'
              }`}
            >
              1 Baris × 2 Kartu (Hemat)
            </button>
            <button
              type="button"
              onClick={() => updateSetting('layoutMode', '1_col')}
              className={`px-3 py-1 rounded cursor-pointer ${
                printSettings.layoutMode === '1_col'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200'
              }`}
            >
              1 Baris × 1 Kartu (Besar)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="px-3 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
            Pengaturan Kertas
          </button>

          {/* PRINT BUTTON */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Ekspor PDF Sekarang
          </button>
        </div>
      </div>

      {/* Print Settings Drawer (Collapsible) */}
      {showSettingsDrawer && (
        <div className="no-print bg-[#FEF9C3] border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-black text-black mb-1">Target Siswa</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as 'selected' | 'all')}
              className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
            >
              <option value="selected">Cetak Siswa Terpilih ({selectedStudentIds.length})</option>
              <option value="all">Cetak Seluruh Siswa ({students.length})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">Margin Halaman (mm)</label>
            <input
              type="number"
              min={4}
              max={25}
              value={printSettings.marginMm}
              onChange={(e) => updateSetting('marginMm', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">Jarak Antar Kartu (mm)</label>
            <input
              type="number"
              min={2}
              max={15}
              value={printSettings.spacingMm}
              onChange={(e) => updateSetting('spacingMm', Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
            />
          </div>

          <div className="flex flex-col justify-end space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showCutLines}
                onChange={(e) => updateSetting('showCutLines', e.target.checked)}
                className="w-4 h-4 accent-black"
              />
              Garis Potong Gunting (Dashed)
            </label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showCropMarks}
                onChange={(e) => updateSetting('showCropMarks', e.target.checked)}
                className="w-4 h-4 accent-black"
              />
              Tanda Sudut Potong (Crop Marks)
            </label>
          </div>
        </div>
      )}

      {/* VIEW MODE SWITCHER: Inspeksi Kartu Detail (Pinch-to-Zoom) vs Lembar Cetak A4 */}
      <div className="no-print bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setViewDisplayMode('inspect_card')}
            className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 ${
              viewDisplayMode === 'inspect_card'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5 text-black" />
            <span>Inspeksi Detail Kartu</span>
            <span className="px-1.5 py-0.2 bg-black text-white text-[9px] rounded font-mono uppercase">
              Pinch-to-Zoom
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewDisplayMode('sheets')}
            className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 ${
              viewDisplayMode === 'sheets'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tata Letak Lembar A4 ({paginationInfo.totalPages} Lembar)</span>
          </button>
        </div>

        <div className="text-xs font-bold text-neutral-600 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded text-[11px]">
            {printableStudents.length} Siswa Siap Cetak
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAMPILAN MODE 1: INSPEKSI KARTU DETAIL DENGAN PINCH-TO-ZOOM (MOBILE)     */}
      {/* ========================================================================= */}
      {viewDisplayMode === 'inspect_card' && (
        <div className="no-print space-y-4 animate-in fade-in duration-150">
          {/* Student Selector Toolbar */}
          <div className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setInspectedIndex((prev) =>
                    prev > 0 ? prev - 1 : Math.max(0, printableStudents.length - 1)
                  )
                }
                disabled={printableStudents.length <= 1}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] font-black text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                title="Siswa Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 border-2 border-black rounded-lg text-xs font-black">
                <span>Kartu #{printableStudents.length > 0 ? inspectedIndex + 1 : 0}</span>
                <span className="text-neutral-500 font-normal">/ {printableStudents.length}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setInspectedIndex((prev) =>
                    prev < printableStudents.length - 1 ? prev + 1 : 0
                  )
                }
                disabled={printableStudents.length <= 1}
                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] font-black text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                title="Siswa Selanjutnya"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Student Selector Dropdown */}
            {printableStudents.length > 0 && (
              <div className="flex items-center gap-2 min-w-0 flex-1 max-w-sm">
                <select
                  value={inspectedIndex}
                  onChange={(e) => setInspectedIndex(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white truncate"
                >
                  {printableStudents.map((s, idx) => (
                    <option key={s.id || idx} value={idx}>
                      #{idx + 1} - {s.name} ({s.className || 'Kelas'} • NISN: {s.nisn || '-'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>

          {/* Pinch-to-Zoom Card Container */}
          {printableStudents.length > 0 && printableStudents[inspectedIndex] ? (
            <div className="space-y-3">
              <PinchZoomCardContainer
                cardTitle={`Kartu: ${printableStudents[inspectedIndex].name}`}
                badgeLabel={`${design.cardOrientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'} (${design.widthMm}×${design.heightMm}mm)`}
                initialScale={1.15}
                maxScale={4.0}
              >
                <ExamCard
                  student={printableStudents[inspectedIndex]}
                  school={school}
                  exam={exam}
                  design={design}
                  scale={1}
                />
              </PinchZoomCardContainer>

              {/* Student Metadata Card info */}
              <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 font-bold">
                  <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                    Kelas: <strong>{printableStudents[inspectedIndex].className || '-'}</strong>
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 font-mono">
                    NISN: <strong>{printableStudents[inspectedIndex].nisn || '-'}</strong>
                  </span>
                  {printableStudents[inspectedIndex].examRoom && (
                    <span className="px-2 py-0.5 bg-yellow-100 border border-yellow-300 rounded text-amber-900">
                      Ruang: <strong>{printableStudents[inspectedIndex].examRoom}</strong>
                    </span>
                  )}
                  {printableStudents[inspectedIndex].examSeat && (
                    <span className="px-2 py-0.5 bg-yellow-100 border border-yellow-300 rounded text-amber-900">
                      Meja: <strong>{printableStudents[inspectedIndex].examSeat}</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setViewDisplayMode('sheets')}
                  className="text-xs font-black text-neutral-800 underline hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Seluruh Lembar Cetak A4</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white border-2 border-black rounded-xl">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-bold">Belum ada siswa yang dipilih untuk diinspeksi.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAMPILAN MODE 2: TATA LETAK LEMBAR A4 (DENGAN RESPONSIVE SCALE MOBILE)   */}
      {/* ========================================================================= */}
      {viewDisplayMode === 'sheets' && (
        <div className="no-print bg-neutral-50 border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-neutral-700" />
            <span>Tampilan Layar Mobile:</span>
            <div className="flex items-center gap-1 bg-white border-2 border-black rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setMobileSheetFit(true)}
                className={`px-2.5 py-1 rounded text-[11px] font-black cursor-pointer transition-colors ${
                  mobileSheetFit ? 'bg-yellow-300 text-black shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Pas Layar HP (Fit)
              </button>
              <button
                type="button"
                onClick={() => setMobileSheetFit(false)}
                className={`px-2.5 py-1 rounded text-[11px] font-black cursor-pointer transition-colors ${
                  !mobileSheetFit ? 'bg-yellow-300 text-black shadow-xs' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                100% Ukuran Nyata
              </button>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500">
            💡 Tips: Klik tombol <span className="font-bold text-black border border-black px-1 rounded bg-yellow-200">🔍 Zoom</span> pada kartu untuk inspeksi pinch-to-zoom!
          </div>
        </div>
      )}

      {/* A4 Sheets Container (Always rendered for window.print, visible when 'sheets' mode) */}
      <div
        className={`print-only-container flex flex-col items-center gap-8 py-4 ${
          viewDisplayMode === 'inspect_card' ? 'hidden print:flex' : 'flex'
        }`}
      >
        {printableStudents.length === 0 ? (
          <div className="no-print bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-8 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-sm font-black uppercase">Belum ada siswa yang dipilih</h3>
            <p className="text-xs text-neutral-600 mt-1 mb-4">
              Pilih siswa di tabel data atau aktifkan opsi "Cetak Seluruh Siswa".
            </p>
            <button
              type="button"
              onClick={() => onSelectAllStudents(true)}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Pilih Semua Siswa ({students.length})
            </button>
          </div>
        ) : (
          paginationInfo.pages.map((pageStudents, pageIdx) => (
            <A4SheetContainer
              key={pageIdx}
              pageNumber={pageIdx + 1}
              totalPages={paginationInfo.totalPages}
              totalCards={pageStudents.length}
              orientation={printSettings.orientation}
              marginMm={printSettings.marginMm}
              className={pageIdx < paginationInfo.totalPages - 1 ? 'page-break-after' : ''}
            >
              {/* Cards Grid */}
              <div
                className={`w-full grid ${
                  printSettings.layoutMode === '2_col'
                    ? 'grid-cols-2 justify-items-center'
                    : 'grid-cols-1 justify-items-center'
                }`}
                style={{
                  rowGap: `${printSettings.spacingMm}mm`,
                  columnGap: `${printSettings.spacingMm}mm`,
                }}
              >
                {pageStudents.map((student, sIdx) => (
                  <div
                    key={`print_card_${student.id || student.nisn || sIdx}_${sIdx}`}
                    className="relative print-card-item group"
                    style={{
                      padding: printSettings.showCutLines ? '2mm' : 0,
                    }}
                  >
                    {/* Optional dashed cutting guide lines */}
                    {printSettings.showCutLines && (
                      <div className="absolute inset-0 border border-dashed border-neutral-400 pointer-events-none rounded" />
                    )}

                    {/* Optional corner crop marks */}
                    {printSettings.showCropMarks && (
                      <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neutral-700 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neutral-700 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neutral-700 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neutral-700 pointer-events-none" />
                      </>
                    )}

                    {/* Quick Mobile Zoom Button on Sheet */}
                    <button
                      type="button"
                      onClick={() => setInspectModalStudent(student)}
                      className="no-print absolute top-1.5 right-1.5 px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 text-black border border-black rounded text-[9.5px] font-black shadow-[1px_1px_0px_#000] flex items-center gap-1 z-30 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Perbesar & Inspeksi Kartu Ini (Pinch-to-Zoom)"
                    >
                      <ZoomIn className="w-2.5 h-2.5" />
                      <span>Zoom</span>
                    </button>

                    <ExamCard
                      student={student}
                      school={school}
                      exam={exam}
                      design={design}
                      scale={1}
                    />
                  </div>
                ))}
              </div>
            </A4SheetContainer>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL OVERLAY INSPEKSI PINCH-TO-ZOOM DARI LEMBAR A4                     */}
      {/* ========================================================================= */}
      {inspectModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-3 bg-yellow-300 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ZoomIn className="w-4 h-4 text-black shrink-0" />
                <span className="text-xs font-black uppercase truncate">
                  Inspeksi Kartu: {inspectModalStudent.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalStudent(null)}
                className="p-1 bg-white hover:bg-neutral-100 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-4 flex-1 overflow-auto bg-neutral-100">
              <PinchZoomCardContainer
                cardTitle={inspectModalStudent.name}
                badgeLabel={`${design.cardOrientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'} (${design.widthMm}×${design.heightMm}mm)`}
                initialScale={1.15}
                maxScale={4.0}
              >
                <ExamCard
                  student={inspectModalStudent}
                  school={school}
                  exam={exam}
                  design={design}
                  scale={1}
                />
              </PinchZoomCardContainer>
            </div>

            <div className="p-3 bg-white border-t-2 border-black flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-600 font-bold">
                NISN: {inspectModalStudent.nisn || '-'} • Kelas: {inspectModalStudent.className || '-'}
              </span>
              <button
                type="button"
                onClick={() => setInspectModalStudent(null)}
                className="px-4 py-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Selesai Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Konfirmasi Cetak Kartu Peserta Ujian */}
      <PrintConfirmationModal
        isOpen={isPrintConfirmOpen}
        onClose={() => setIsPrintConfirmOpen(false)}
        onConfirm={handleExecuteBrowserPrint}
        cardType="Kartu Peserta Ujian Siswa"
        itemCount={printableStudents.length}
        estimatedSheets={paginationInfo.totalPages}
        orientation={printSettings.orientation}
      />
    </div>
  );
};
