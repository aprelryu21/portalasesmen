import React, { useState, useRef, useEffect } from 'react';
import { School, Exam, Student, Teacher, CardDesignSettings, TemplatePreset, GuestCardData, PosterDesignSettings, AnswerSheetDesignSettings } from '../../types';
import { ExamCard } from './ExamCard';
import { DeskCard, DESK_THEMES } from './DeskCard';
import { ProctorGuestCard, PROCTOR_GUEST_THEMES, CardThemeId } from './ProctorGuestCard';
import { PinchZoomCardContainer } from './PinchZoomCardContainer';
import { ThemeSliderBox } from './ThemeSliderBox';
import { getThemeById } from '../../config/cardThemes';
import { SchoolLogo } from '../common/SchoolLogo';
import { GenderAvatar } from '../common/GenderAvatar';
import { QrCodeImage } from '../common/QrCodeImage';
import { PRESET_TEMPLATES, DEFAULT_POSTER_DESIGN, DEFAULT_ANSWER_SHEET_DESIGN } from '../../data/mockData';
import { PosterDesigner } from '../poster/PosterDesigner';
import { AnswerSheetDesigner } from '../answersheet/AnswerSheetDesigner';
import {
  Palette,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Armchair,
  ShieldCheck,
  UserCheck,
  Printer,
  Compass,
  ArrowRight,
  ArrowLeft,
  Layers,
  CheckSquare,
  Square,
  Eye,
  Type,
  User,
  Hash,
  GraduationCap,
  Calendar,
  MapPin,
  QrCode,
  FileCheck,
  PenTool,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export type DesignerMenuId = 'menu' | 'student' | 'desk' | 'proctor' | 'guest' | 'poster' | 'answersheet';

interface CardDesignerProps {
  school: School;
  exam: Exam;
  students: Student[];
  teachers?: Teacher[];
  design: CardDesignSettings;
  posterDesign?: PosterDesignSettings;
  answerSheetDesign?: AnswerSheetDesignSettings;
  onUpdateDesign: (newDesign: CardDesignSettings) => void;
  onUpdatePosterDesign?: (newDesign: PosterDesignSettings) => void;
  onSavePosterDesignToCloud?: (design: PosterDesignSettings) => Promise<void>;
  onUpdateAnswerSheetDesign?: (newDesign: AnswerSheetDesignSettings) => void;
  onSaveAnswerSheetDesignToCloud?: (design: AnswerSheetDesignSettings) => Promise<void>;
  onNavigateToPrint: (category?: string) => void;
  initialMenu?: DesignerMenuId;
}

const THEME_PRESETS: {
  id: TemplatePreset;
  name: string;
  category: string;
  headerColor: string;
  accentColor: string;
  textColor: string;
  description: string;
}[] = [
  { id: 'neobrutal', name: 'Neobrutal Pop', category: 'Chunky & Kontras', headerColor: '#FFE600', accentColor: '#00F0FF', textColor: '#111111', description: 'Gaya tebal kontras, frame stiker, font bold punchy' },
  { id: 'modern', name: 'Modern Minimalist', category: 'Sleek & Clean', headerColor: '#0F766E', accentColor: '#14B8A6', textColor: '#FFFFFF', description: 'Dual-ring halo frame, font geometris modern, chip tags' },
  { id: 'classic', name: 'Classic Academic', category: 'Formal Piagam', headerColor: '#1E293B', accentColor: '#D97706', textColor: '#FFFFFF', description: 'Frame double-border emas & navy, font serif formal akademik' },
  { id: 'madrasah', name: 'Madrasah Islami', category: 'Kemenag Hijau', headerColor: '#047857', accentColor: '#F59E0B', textColor: '#FFFFFF', description: 'Frame kubah mihrab, emerald & emas, ornamen islami' },
  { id: 'cyber', name: 'Cyber Tech Stealth', category: 'Dark HUD Monospace', headerColor: '#0A0F1D', accentColor: '#06B6D4', textColor: '#38BDF8', description: 'Frame sudut chamfered neon HUD, font monospace, dark mode' },
];

const PREVIEW_SAMPLE_STUDENT: Student = {
  id: 'preview_sample_std',
  name: 'MUHAMMAD RIZKY PRATAMA',
  nisn: '0012345678',
  nis: '2024001',
  gender: 'L',
  religion: 'Islam',
  className: 'Kelas VI-A',
  birthPlace: 'Kediri',
  birthDate: '2012-05-15',
  examRoom: 'Ruang 01',
  examSeat: 'Meja 12',
  photoUrl: '',
  createdAt: '',
  updatedAt: '',
};

export const CardDesigner: React.FC<CardDesignerProps> = ({
  school,
  exam,
  students,
  teachers = [],
  design,
  posterDesign,
  answerSheetDesign,
  onUpdateDesign,
  onUpdatePosterDesign,
  onSavePosterDesignToCloud,
  onUpdateAnswerSheetDesign,
  onSaveAnswerSheetDesignToCloud,
  onNavigateToPrint,
  initialMenu,
}) => {
  // Default to 'menu' or initialMenu
  const [activeMenu, setActiveMenu] = useState<DesignerMenuId>(initialMenu || 'menu');

  useEffect(() => {
    if (initialMenu) {
      setActiveMenu(initialMenu);
    }
  }, [initialMenu]);

  // Sub-tabs for ID Siswa
  const [studentTab, setStudentTab] = useState<'dimension' | 'fields' | 'colors' | 'header' | 'footer'>('dimension');
  const [previewScale, setPreviewScale] = useState<number>(1.15);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Desk Card Specific Design State (10 Themes)
  const [deskSize, setDeskSize] = useState<'standard' | 'compact'>('standard');
  const [deskOrientation, setDeskOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [deskThemeId, setDeskThemeId] = useState<string>('neobrutal');
  const [deskThemeColor, setDeskThemeColor] = useState<string>('');

  // Proctor Card Specific Design State (10 Themes)
  const [proctorOrientation, setProctorOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [proctorThemeId, setProctorThemeId] = useState<CardThemeId>('neobrutal');
  const [proctorThemeColor, setProctorThemeColor] = useState<string>('');
  const [proctorRoleBadge, setProctorRoleBadge] = useState<string>('PENGAWAS RUANG UJIAN');
  const [showProctorLanyard, setShowProctorLanyard] = useState<boolean>(true);

  // Guest Card Specific Design State (10 Themes)
  const [guestOrientation, setGuestOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [guestThemeId, setGuestThemeId] = useState<CardThemeId>('neobrutal');
  const [guestThemeColor, setGuestThemeColor] = useState<string>('');
  const [guestTypeBadge, setGuestTypeBadge] = useState<string>('TAMU & MONEV UJIAN');
  const [showGuestLanyard, setShowGuestLanyard] = useState<boolean>(true);

  // Safe Fallback Data for clean previewing
  const displayStudent = students[selectedStudentIndex] || students[0] || PREVIEW_SAMPLE_STUDENT;
  const displaySchool: School = {
    ...school,
    name: school.name || 'SD NEGERI 1 CONTOH',
    npsn: school.npsn || '20512345',
    principalName: school.principalName || 'BAMBANG SUTRISNO, S.Pd., M.M.',
    principalNip: school.principalNip || '19750810 200003 1 005',
    headTitle: school.headTitle || 'Kepala Sekolah',
  };
  const displayExam: Exam = {
    ...exam,
    name: exam?.name || '',
    semester: exam?.semester || '',
    academicYear: exam?.academicYear || '',
  };

  const currentOrientation = design.cardOrientation || 'landscape';

  const updateField = <K extends keyof CardDesignSettings>(key: K, value: CardDesignSettings[K]) => {
    onUpdateDesign({
      ...design,
      [key]: value,
    });
  };

  const applyPreset = (preset: TemplatePreset) => {
    const presetValues = PRESET_TEMPLATES[preset] || {};
    onUpdateDesign({
      ...design,
      ...presetValues,
      templatePreset: preset,
    });
  };

  const applySizePreset = (sizeKey: 'standard' | 'idcard' | 'large') => {
    if (sizeKey === 'standard') {
      onUpdateDesign({ ...design, presetSize: 'standard', widthMm: 95, heightMm: 65 });
    } else if (sizeKey === 'idcard') {
      onUpdateDesign({ ...design, presetSize: 'idcard', widthMm: 86, heightMm: 54 });
    } else if (sizeKey === 'large') {
      onUpdateDesign({ ...design, presetSize: 'large', widthMm: 105, heightMm: 74 });
    }
  };

  const toggleStudentOrientation = (orient: 'landscape' | 'portrait') => {
    if (orient === currentOrientation) return;
    const isNowPortrait = orient === 'portrait';
    const newWidth = isNowPortrait ? Math.min(design.widthMm, design.heightMm) : Math.max(design.widthMm, design.heightMm);
    const newHeight = isNowPortrait ? Math.max(design.widthMm, design.heightMm) : Math.min(design.widthMm, design.heightMm);
    onUpdateDesign({
      ...design,
      cardOrientation: orient,
      widthMm: newWidth,
      heightMm: newHeight,
    });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Active theme objects (5 Themes)
  const activeProctorTheme = PROCTOR_GUEST_THEMES.find((t) => t.id === proctorThemeId) || PROCTOR_GUEST_THEMES[0];
  const activeGuestTheme = PROCTOR_GUEST_THEMES.find((t) => t.id === guestThemeId) || PROCTOR_GUEST_THEMES[0];

  // =========================================================================
  // 1. SUB-VIEW: MENU UTAMA DESAIN (TAMPILKAN MENU SAJA SEPERTI HALAMAN DATA)
  // =========================================================================
  if (activeMenu === 'menu') {
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Banner Utama */}
        <div className="bg-yellow-300 border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Studio Editor & Desain Kartu
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
                Pusat Desain Kartu & Tanda Pengenal
              </h2>
              <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-2xl">
                Pilih jenis kartu di bawah ini untuk mengatur tata letak, orientasi potret/lanskap, bidang data database, dan 10 pilihan tema visual modern.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToPrint()}
              className="px-4 py-2 text-xs font-black uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 text-black" />
              <span>Halaman Cetak</span>
            </button>
          </div>
        </div>

        {/* 6 Kotak Menu Desain - 2 Menu per Baris */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Menu 1: Desain ID Siswa */}
          <div
            onClick={() => setActiveMenu('student')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6 text-black" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-amber-800 transition-colors">
                  Desain ID Siswa
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Kartu peserta ujian resmi. Kustomisasi model potret & lanskap, pilih data database yang ditampilkan, atur foto, dan QR barcode.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-900 rounded text-[9px] font-bold border border-yellow-300">
                  Potret & Lanskap
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Toggle Database
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  CR80 & Standar
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Editor Kartu</span>
              <div className="w-7 h-7 rounded-lg bg-yellow-300 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Menu 2: Desain ID Bangku */}
          <div
            onClick={() => setActiveMenu('desk')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                <Armchair className="w-6 h-6 text-black" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-amber-800 transition-colors">
                  Desain ID Bangku
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Label nomor meja ujian kelas. 10 tema keren, nomor meja jumbo sangat terbaca, orientasi potret & lanskap, serta QR scan meja.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-bold border border-amber-300">
                  10 Pilihan Tema
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Angka Jumbo
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Ukuran Meja A4
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Editor Bangku</span>
              <div className="w-7 h-7 rounded-lg bg-amber-400 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Menu 3: Desain ID Pengawas */}
          <div
            onClick={() => setActiveMenu('proctor')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform text-white">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-indigo-800 transition-colors">
                  Desain ID Pengawas
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Tanda pengenal Pengawas Ruang & Panitia Ujian. 10 pilihan tema berwibawa, lubang tali lanyard, foto guru, dan label tugas.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-900 rounded text-[9px] font-bold border border-indigo-300">
                  10 Pilihan Tema
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Model Lanyard
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Data Ruang Jaga
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Editor Pengawas</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-400 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Menu 4: Desain ID Tamu */}
          <div
            onClick={() => setActiveMenu('guest')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform text-black">
                <UserCheck className="w-6 h-6 text-black" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-emerald-800 transition-colors">
                  Desain ID Tamu
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Tanda pengenal Tamu Resmi, Asesor Akreditasi, dan Monev Dinas. 10 pilihan tema eksklusif, tali lanyard, dan akses ruangan.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[9px] font-bold border border-emerald-300">
                  10 Pilihan Tema
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Tamu VIP & Monev
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Hak Akses Ruang
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Editor Tamu</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-400 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Menu 5: Desain Poster Asesmen */}
          <div
            onClick={() => setActiveMenu('poster')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform text-white">
                <Sparkles className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-purple-800 transition-colors">
                  Desain Poster Asesmen
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Poster tata tertib, ruang ujian, dilarang bawa HP, panitia, & pengawas. Atur orientasi, 5 gaya visual, dan watermark logo tengah.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 rounded text-[9px] font-bold border border-purple-300">
                  6 Format Poster
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  5 Gaya Visual
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  A4 Penuh
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Editor Poster</span>
              <div className="w-7 h-7 rounded-lg bg-purple-600 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform text-white">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Menu 6: Desain Lembar Jawaban */}
          <div
            onClick={() => setActiveMenu('answersheet')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform text-white">
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-teal-800 transition-colors">
                  Desain Lembar Jawaban
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Lembar Jawaban A4 (LJK / LJ). Kustomisasi Kop Surat resmi, tabel nama/kelas/nilai, serta butir PG (10–50), Isian (5–20), &amp; Uraian (5–10).
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-teal-100 text-teal-900 rounded text-[9px] font-bold border border-teal-300">
                  Kop Surat Resmi
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  PG, Isian &amp; Uraian
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[9px] font-bold border border-neutral-300">
                  Standar A4
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Editor Lembar Jawaban</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform text-white">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUB-NAV BAR UNTUK KEMBALI KE MENU & SWITCH KATEGORI DESAIN
  // =========================================================================
  const renderTopSubNav = () => (
    <div className="bg-white border-2 border-black rounded-xl p-2.5 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveMenu('menu')}
          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Menu Desain</span>
        </button>

        <span className="text-neutral-300 font-bold hidden sm:inline">|</span>

        {/* Switcher Tabs */}
        <button
          type="button"
          onClick={() => setActiveMenu('student')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeMenu === 'student'
              ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-yellow-50 text-neutral-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>ID Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('desk')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeMenu === 'desk'
              ? 'bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-amber-50 text-neutral-700'
          }`}
        >
          <Armchair className="w-3.5 h-3.5" />
          <span>ID Bangku</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('proctor')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeMenu === 'proctor'
              ? 'bg-indigo-400 text-white shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-indigo-50 text-neutral-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ID Pengawas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('guest')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeMenu === 'guest'
              ? 'bg-emerald-400 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-emerald-50 text-neutral-700'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>ID Tamu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('poster')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeMenu === 'poster'
              ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-purple-50 text-neutral-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Poster Asesmen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMenu('answersheet')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeMenu === 'answersheet'
              ? 'bg-teal-600 text-white shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-teal-50 text-neutral-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Lembar Jawaban</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onNavigateToPrint(activeMenu === 'student' ? 'student_exam' : activeMenu === 'desk' ? 'desk_card' : activeMenu === 'proctor' ? 'proctor_id' : 'guest_id')}
        className="px-3.5 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Cetak Kartu Ini</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {renderTopSubNav()}

      {/* ========================================================= */}
      {/* 2. SUB-MENU 1: DESAIN ID SISWA                            */}
      {/* ========================================================= */}
      {activeMenu === 'student' && (
        <div className="space-y-5">
          {/* Top Controls Box */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-500" />
                Pengaturan Desain Kartu Siswa
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Atur orientasi (Potret/Lanskap), bidang data database yang tampil, tema warna, dan susunan elemen.
              </p>
            </div>

            {/* TAB SUB-NAV ID SISWA */}
            <div className="flex items-center gap-1 pb-2 border-b-2 border-neutral-100 overflow-x-auto">
              <button
                type="button"
                onClick={() => setStudentTab('dimension')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 cursor-pointer transition-all shrink-0 ${
                  studentTab === 'dimension'
                    ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_#000]'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Orientasi & Ukuran
              </button>

              <button
                type="button"
                onClick={() => setStudentTab('fields')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 cursor-pointer transition-all shrink-0 ${
                  studentTab === 'fields'
                    ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_#000]'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Data Database
              </button>

              <button
                type="button"
                onClick={() => setStudentTab('colors')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 cursor-pointer transition-all shrink-0 ${
                  studentTab === 'colors'
                    ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_#000]'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Tema Warna
              </button>

              <button
                type="button"
                onClick={() => setStudentTab('header')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 cursor-pointer transition-all shrink-0 ${
                  studentTab === 'header'
                    ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_#000]'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Kop Sekolah
              </button>

              <button
                type="button"
                onClick={() => setStudentTab('footer')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 cursor-pointer transition-all shrink-0 ${
                  studentTab === 'footer'
                    ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_#000]'
                    : 'border-transparent text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Ttd & Catatan
              </button>
            </div>

            {/* TAB 1: ORIENTASI & UKURAN KARTU */}
            {studentTab === 'dimension' && (
              <div className="space-y-4">
                {/* ORIENTASI KARTU: POTRET VS LANSKAP */}
                <div className="p-3.5 bg-yellow-50/70 border-2 border-black rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase flex items-center gap-1.5 text-neutral-900">
                      <Compass className="w-4 h-4 text-black" />
                      Orientasi Model Kartu Siswa
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-yellow-300 border border-black rounded">
                      Aktif: {currentOrientation === 'portrait' ? 'Potret' : 'Lanskap'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleStudentOrientation('landscape')}
                      className={`p-3 rounded-xl border-2 sm:border-3 border-black text-left flex flex-col justify-between transition-all cursor-pointer ${
                        currentOrientation === 'landscape'
                          ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] ring-2 ring-black font-black'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase">↔️ Lanskap</span>
                        <div className="w-7 h-4 rounded border-2 border-black bg-white" />
                      </div>
                      <p className="text-[10px] opacity-80 leading-tight">
                        Format horizontal lega. Foto di kiri, biodata dan QR code berdampingan.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStudentOrientation('portrait')}
                      className={`p-3 rounded-xl border-2 sm:border-3 border-black text-left flex flex-col justify-between transition-all cursor-pointer ${
                        currentOrientation === 'portrait'
                          ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] ring-2 ring-black font-black'
                          : 'bg-white hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black uppercase">↕️ Potret</span>
                        <div className="w-4 h-7 rounded border-2 border-black bg-white" />
                      </div>
                      <p className="text-[10px] opacity-80 leading-tight">
                        Format vertikal proporsional. Foto di tengah atas, nama besar, data bersusun rapi.
                      </p>
                    </button>
                  </div>
                </div>

                {/* UKURAN STANDAR */}
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-2">
                    Ukuran Fisik Kartu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => applySizePreset('standard')}
                      className={`p-2.5 rounded-lg border-2 border-black text-left cursor-pointer transition-all ${
                        design.presetSize === 'standard' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Standar B5</div>
                      <div className="text-[10px] text-neutral-500 font-mono">95 × 65 mm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applySizePreset('idcard')}
                      className={`p-2.5 rounded-lg border-2 border-black text-left cursor-pointer transition-all ${
                        design.presetSize === 'idcard' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-bold">ID Card CR80</div>
                      <div className="text-[10px] text-neutral-500 font-mono">86 × 54 mm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applySizePreset('large')}
                      className={`p-2.5 rounded-lg border-2 border-black text-left cursor-pointer transition-all ${
                        design.presetSize === 'large' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Besar A7</div>
                      <div className="text-[10px] text-neutral-500 font-mono">105 × 74 mm</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PILIHAN DATA DATABASE YANG DITAMPILKAN */}
            {studentTab === 'fields' && (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-50 border-2 border-black rounded-xl">
                  <h4 className="text-xs font-black uppercase text-neutral-900 mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    Pilihan Kolom Data Database Siswa
                  </h4>
                  <p className="text-[11px] text-neutral-600">
                    Centang data apa saja yang ingin dimunculkan pada kartu tanda peserta ujian:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                  {/* Nama Siswa */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showStudentName !== false}
                      onChange={(e) => updateField('showStudentName', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <User className="w-4 h-4 text-black" />
                    <span>Nama Peserta Didik</span>
                  </label>

                  {/* NISN */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showNisn}
                      onChange={(e) => updateField('showNisn', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <Hash className="w-4 h-4 text-black" />
                    <span>Nomor NISN</span>
                  </label>

                  {/* NIS */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showNis}
                      onChange={(e) => updateField('showNis', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <Hash className="w-4 h-4 text-neutral-600" />
                    <span>Nomor Induk Sekolah (NIS)</span>
                  </label>

                  {/* Kelas */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showClass}
                      onChange={(e) => updateField('showClass', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <GraduationCap className="w-4 h-4 text-black" />
                    <span>Kelas / Rombel</span>
                  </label>

                  {/* Jenis Kelamin */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(design.showGender)}
                      onChange={(e) => updateField('showGender', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Jenis Kelamin (L / P)</span>
                  </label>

                  {/* Agama */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showReligion !== false}
                      onChange={(e) => updateField('showReligion', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Agama Siswa</span>
                  </label>

                  {/* Tempat Tanggal Lahir */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showBirthDate}
                      onChange={(e) => updateField('showBirthDate', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <Calendar className="w-4 h-4 text-black" />
                    <span>Tempat & Tanggal Lahir (TTL)</span>
                  </label>

                  {/* Ruang & Meja */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showRoomSeat}
                      onChange={(e) => updateField('showRoomSeat', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Ruang & Nomor Meja Ujian</span>
                  </label>

                  {/* Foto Siswa */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showPhoto}
                      onChange={(e) => updateField('showPhoto', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <Eye className="w-4 h-4 text-black" />
                    <span>Foto / Avatar Siswa</span>
                  </label>

                  {/* QR Code */}
                  <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-black rounded-xl cursor-pointer hover:bg-yellow-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={design.showQrCode}
                      onChange={(e) => updateField('showQrCode', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <QrCode className="w-4 h-4 text-black" />
                    <span>QR Code Validasi NISN</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: TEMA WARNA */}
            {studentTab === 'colors' && (
              <div className="space-y-4">
                <ThemeSliderBox
                  selectedThemeId={design.templatePreset}
                  onSelectTheme={(tId) => {
                    const thm = getThemeById(tId);
                    onUpdateDesign({
                      ...design,
                      templatePreset: thm.id,
                      themeBaseColor: thm.defaultBaseColor,
                      headerBgColor: thm.defaultBaseColor,
                      headerTextColor: thm.headerText,
                      accentColor: thm.accentColor,
                      cardBorderColor: thm.id === 'cyber' ? '#0EA5E9' : thm.defaultBaseColor,
                    });
                  }}
                  baseColor={design.themeBaseColor || design.headerBgColor}
                  onChangeBaseColor={(col) => {
                    onUpdateDesign({
                      ...design,
                      themeBaseColor: col,
                      headerBgColor: col,
                      cardBorderColor: design.templatePreset === 'cyber' ? '#0EA5E9' : col,
                    });
                  }}
                  title="Pilihan 10 Tema Desain ID Siswa"
                  subtitle="Geser horizontal untuk memilih tema. Gunakan tombol warna di bawah untuk merubah warna dasar tema."
                />

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Warna Header
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={design.headerBgColor}
                        onChange={(e) => updateField('headerBgColor', e.target.value)}
                        className="w-8 h-8 rounded border border-black cursor-pointer"
                      />
                      <span className="text-xs font-mono">{design.headerBgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Warna Teks Header
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={design.headerTextColor}
                        onChange={(e) => updateField('headerTextColor', e.target.value)}
                        className="w-8 h-8 rounded border border-black cursor-pointer"
                      />
                      <span className="text-xs font-mono">{design.headerTextColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: KOP SEKOLAH */}
            {studentTab === 'header' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.showLogo}
                      onChange={(e) => updateField('showLogo', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className="text-xs font-bold">Tampilkan Logo Sekolah</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.showSchoolName}
                      onChange={(e) => updateField('showSchoolName', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className="text-xs font-bold">Tampilkan Nama Sekolah</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.showExamName}
                      onChange={(e) => updateField('showExamName', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className="text-xs font-bold">Tampilkan Nama Ujian / Asesmen</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.showSemesterYear}
                      onChange={(e) => updateField('showSemesterYear', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className="text-xs font-bold">Tampilkan Semester & Tahun Pelajaran</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={design.showNpsn}
                      onChange={(e) => updateField('showNpsn', e.target.checked)}
                      className="w-4 h-4 accent-yellow-400"
                    />
                    <span className="text-xs font-bold">Tampilkan NPSN Sekolah</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: FOOTER & TTD */}
            {studentTab === 'footer' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={design.showFooter}
                    onChange={(e) => updateField('showFooter', e.target.checked)}
                    className="w-4 h-4 accent-yellow-400"
                  />
                  <span className="text-xs font-bold">Tampilkan Baris Footer & Catatan Aturan</span>
                </label>

                {design.showFooter && (
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      Teks Catatan / Tata Tertib Ujian
                    </label>
                    <input
                      type="text"
                      value={design.customRulesNote}
                      onChange={(e) => updateField('customRulesNote', e.target.value)}
                      placeholder="Wajib membawa kartu ini saat ujian berlangsung."
                      className="w-full px-3 py-2 text-xs border-2 border-black rounded-lg"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-neutral-200">
                  <input
                    type="checkbox"
                    checked={design.showPrincipalSign}
                    onChange={(e) => updateField('showPrincipalSign', e.target.checked)}
                    className="w-4 h-4 accent-yellow-400"
                  />
                  <span className="text-xs font-bold">Tampilkan Tanda Tangan & Nama Kepala Sekolah</span>
                </label>

                {design.showPrincipalSign && (
                  <div className="space-y-3 pl-3 sm:pl-4 border-l-2 border-yellow-400 mt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1.5 uppercase">
                        Model Tanda Tangan (TTD)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateField('signatureType', 'qr')}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            (design.signatureType || 'qr') === 'qr'
                              ? 'bg-yellow-300 text-black border-black shadow-[2px_2px_0px_#000] font-black'
                              : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <QrCode className="w-4 h-4 shrink-0" />
                            <span>TTD QR Code</span>
                          </div>
                          <p className="text-[10px] text-neutral-600 mt-1 font-medium leading-tight">
                            QR validasi digital kepala sekolah
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateField('signatureType', 'digital')}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            design.signatureType === 'digital'
                              ? 'bg-yellow-300 text-black border-black shadow-[2px_2px_0px_#000] font-black'
                              : 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <PenTool className="w-4 h-4 shrink-0" />
                            <span>TTD Digital (Foto)</span>
                          </div>
                          <p className="text-[10px] text-neutral-600 mt-1 font-medium leading-tight">
                            Foto / scan asli dari database
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Status Foto TTD jika opsi Digital dipilih */}
                    {design.signatureType === 'digital' && (
                      <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-700">Foto TTD di Database:</span>
                          {school?.principalSignatureUrl ? (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px] border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Foto Tersedia
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-black text-[10px] border border-amber-300">
                              Belum Dilampirkan
                            </span>
                          )}
                        </div>

                        {school?.principalSignatureUrl ? (
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-16 h-8 bg-white border border-neutral-300 rounded p-1 flex items-center justify-center">
                              <img
                                src={school.principalSignatureUrl}
                                alt="Pratinjau TTD"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <span className="text-[10.5px] text-neutral-600">
                              Foto tanda tangan siap tampil di kolom tanda tangan kepala sekolah.
                            </span>
                          </div>
                        ) : (
                          <p className="text-[10.5px] text-neutral-500 leading-tight">
                            Silakan unggah foto/scan tanda tangan kepala sekolah di menu <strong>Data Sekolah &gt; Data Sekolah (Identitas)</strong> agar dapat tampil otomatis di kartu.
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        Sebutan Jabatan
                      </label>
                      <input
                        type="text"
                        value={design.principalTitle || 'Kepala Sekolah'}
                        onChange={(e) => updateField('principalTitle', e.target.value)}
                        placeholder="Contoh: Kepala Sekolah / Plt. Kepala Sekolah"
                        className="w-full px-3 py-2 text-xs border-2 border-black rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Live Preview Box */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Pratinjau ID Siswa
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-yellow-300 border border-black rounded font-black">
                  {currentOrientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {design.widthMm} × {design.heightMm} mm
                </span>
              </div>
            </div>

            {/* Container Live Preview Card with Mobile Pinch to Zoom */}
            <PinchZoomCardContainer
              cardTitle="ID Ujian Siswa"
              badgeLabel={`${currentOrientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'} (${design.widthMm}×${design.heightMm}mm)`}
              initialScale={1.05}
            >
              <ExamCard
                student={displayStudent}
                school={displaySchool}
                exam={displayExam}
                design={design}
                scale={1}
              />
            </PinchZoomCardContainer>

            {/* Hint & Switch Siswa Preview */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 text-xs">
              <div className="text-neutral-500 text-[11px]">
                Pratinjau dengan data: <strong className="text-black">{displayStudent.name}</strong>
              </div>

              {students.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIndex((prev) => (prev > 0 ? prev - 1 : students.length - 1))}
                    className="p-1 bg-neutral-100 hover:bg-neutral-200 border border-black rounded cursor-pointer"
                    title="Siswa Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1">
                    {selectedStudentIndex + 1}/{students.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIndex((prev) => (prev < students.length - 1 ? prev + 1 : 0))}
                    className="p-1 bg-neutral-100 hover:bg-neutral-200 border border-black rounded cursor-pointer"
                    title="Siswa Selanjutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-MENU 2: DESAIN ID BANGKU (10 PILIHAN TEMA)         */}
      {/* ========================================================= */}
      {activeMenu === 'desk' && (
        <div className="space-y-5">
          {/* Top Controls */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <Armchair className="w-5 h-5 text-amber-500" />
                Pengaturan Desain Kartu / Label Meja
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Pilih dari 10 tema keren, tentukan orientasi potret/lanskap, dan atur ukuran kartu meja.
              </p>
            </div>

            {/* ORIENTASI KARTU BANGKU */}
            <div className="p-3 bg-neutral-50 border-2 border-black rounded-xl space-y-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-neutral-900">
                <Compass className="w-4 h-4 text-black" />
                Orientasi Kartu Meja
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeskOrientation('landscape')}
                  className={`py-2 px-3 rounded-lg border-2 border-black text-xs font-black cursor-pointer transition-all ${
                    deskOrientation === 'landscape'
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>↔️ Lanskap (Horizontal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeskOrientation('portrait')}
                  className={`py-2 px-3 rounded-lg border-2 border-black text-xs font-black cursor-pointer transition-all ${
                    deskOrientation === 'portrait'
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>↕️ Potret (Vertikal)</span>
                </button>
              </div>
            </div>

            {/* 10 PILIHAN TEMA KEREN ID BANGKU (KOTAK GESER) */}
            <ThemeSliderBox
              selectedThemeId={deskThemeId}
              onSelectTheme={(id) => setDeskThemeId(id)}
              baseColor={deskThemeColor}
              onChangeBaseColor={(col) => setDeskThemeColor(col)}
              title="10 Pilihan Tema ID Bangku"
              subtitle="Geser untuk memilih tema. Sesuaikan warna dasar kartu meja."
            />

            {/* UKURAN MEJA */}
            <div className="pt-2 border-t border-neutral-200">
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5">
                Ukuran Cetak Label Meja
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeskSize('standard')}
                  className={`p-2 rounded-lg border-2 border-black text-xs font-bold cursor-pointer ${
                    deskSize === 'standard' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-50'
                  }`}
                >
                  <div>Standar (4 Kartu per A4)</div>
                  <div className="text-[10px] text-neutral-500 font-mono">130 × 92 mm</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeskSize('compact')}
                  className={`p-2 rounded-lg border-2 border-black text-xs font-bold cursor-pointer ${
                    deskSize === 'compact' ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-50'
                  }`}
                >
                  <div>Kompak (6 Kartu per A4)</div>
                  <div className="text-[10px] text-neutral-500 font-mono">95 × 68 mm</div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Live Preview */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Pratinjau ID Bangku
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-yellow-300 border border-black rounded font-black">
                {deskOrientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'}
              </span>
            </div>

            <PinchZoomCardContainer
              cardTitle="ID Tempat Duduk Meja"
              badgeLabel={deskOrientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'}
              initialScale={1.05}
            >
              <DeskCard
                student={displayStudent}
                school={displaySchool}
                exam={displayExam}
                cardSize={deskSize}
                orientation={deskOrientation}
                themeId={deskThemeId}
                themeColor={deskThemeColor}
              />
            </PinchZoomCardContainer>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SUB-MENU 3: DESAIN ID PENGAWAS (10 PILIHAN TEMA)       */}
      {/* ========================================================= */}
      {activeMenu === 'proctor' && (
        <div className="space-y-5">
          {/* Top Controls */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Pengaturan Desain ID Card Pengawas Ruang
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Tersedia 10 pilihan tema berwibawa, orientasi potret (lanyard) / lanskap, dan teks penugasan.
              </p>
            </div>

            {/* ORIENTASI KARTU PENGAWAS */}
            <div className="p-3 bg-neutral-50 border-2 border-black rounded-xl space-y-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-neutral-900">
                <Compass className="w-4 h-4 text-indigo-600" />
                Orientasi Kartu Pengawas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProctorOrientation('portrait')}
                  className={`py-2 px-3 rounded-lg border-2 border-black text-xs font-black cursor-pointer transition-all ${
                    proctorOrientation === 'portrait'
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>↕️ Potret (Standar Lanyard)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProctorOrientation('landscape')}
                  className={`py-2 px-3 rounded-lg border-2 border-black text-xs font-black cursor-pointer transition-all ${
                    proctorOrientation === 'landscape'
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>↔️ Lanskap (Horizontal)</span>
                </button>
              </div>
            </div>

            {/* 10 PILIHAN TEMA PENGAWAS (KOTAK GESER) */}
            <ThemeSliderBox
              selectedThemeId={proctorThemeId}
              onSelectTheme={(id) => setProctorThemeId(id)}
              baseColor={proctorThemeColor}
              onChangeBaseColor={(col) => setProctorThemeColor(col)}
              title="10 Pilihan Tema ID Pengawas"
              subtitle="Geser untuk memilih tema. Sesuaikan warna dasar kartu pengawas."
            />

            {/* LABEL TUGAS */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Teks Penugasan Pada ID Card
              </label>
              <input
                type="text"
                value={proctorRoleBadge}
                onChange={(e) => setProctorRoleBadge(e.target.value)}
                placeholder="PENGAWAS RUANG UJIAN"
                className="w-full px-3 py-2 text-xs font-black uppercase border-2 border-black rounded-lg"
              />
            </div>

            {/* TOGGLE LUBANG TALI */}
            <label className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-300 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showProctorLanyard}
                onChange={(e) => setShowProctorLanyard(e.target.checked)}
                className="w-4 h-4 accent-yellow-400"
              />
              <span className="text-xs font-bold">Tampilkan Lubang Tali Lanyard (Atas Kartu)</span>
            </label>
          </div>

          {/* Bottom Live Preview */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Pratinjau ID Pengawas
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-yellow-300 border border-black rounded font-black">
                {proctorOrientation === 'portrait' ? 'Potret (Lanyard)' : 'Lanskap'}
              </span>
            </div>

            <PinchZoomCardContainer
              cardTitle="ID Pengawas Ruang"
              badgeLabel={proctorOrientation === 'portrait' ? 'Potret (Lanyard)' : 'Lanskap'}
              initialScale={1.05}
            >
              <ProctorGuestCard
                type="proctor"
                themeId={proctorThemeId}
                themeColor={proctorThemeColor}
                orientation={proctorOrientation}
                school={displaySchool}
                exam={displayExam}
                teacher={teachers[0] || {
                  id: 'preview_proctor',
                  name: 'Drs. Bambang Suryono, M.Pd.',
                  nip: '19780512 200501 1 008',
                  gender: 'L',
                  subject: 'Matematika',
                  roomDuty: 'Ruang 01',
                  createdAt: '',
                  updatedAt: '',
                }}
                showLanyard={showProctorLanyard}
                roleBadgeText={proctorRoleBadge}
              />
            </PinchZoomCardContainer>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUB-MENU 4: DESAIN ID TAMU (10 PILIHAN TEMA)           */}
      {/* ========================================================= */}
      {activeMenu === 'guest' && (
        <div className="space-y-5">
          {/* Top Controls */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Pengaturan Desain ID Card Tamu &amp; Monev
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Tersedia 5 pilihan tema eksklusif untuk Asesor Akreditasi, Monev Dinas, dan Tamu Resmi Ujian.
              </p>
            </div>

            {/* ORIENTASI KARTU TAMU */}
            <div className="p-3 bg-neutral-50 border-2 border-black rounded-xl space-y-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-neutral-900">
                <Compass className="w-4 h-4 text-emerald-600" />
                Orientasi Kartu Tamu
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGuestOrientation('portrait')}
                  className={`py-2 px-3 rounded-lg border-2 border-black text-xs font-black cursor-pointer transition-all ${
                    guestOrientation === 'portrait'
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>↕️ Potret (Standar Lanyard)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGuestOrientation('landscape')}
                  className={`py-2 px-3 rounded-lg border-2 border-black text-xs font-black cursor-pointer transition-all ${
                    guestOrientation === 'landscape'
                      ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>↔️ Lanskap (Horizontal)</span>
                </button>
              </div>
            </div>

            {/* 10 PILIHAN TEMA TAMU (KOTAK GESER) */}
            <ThemeSliderBox
              selectedThemeId={guestThemeId}
              onSelectTheme={(id) => setGuestThemeId(id)}
              baseColor={guestThemeColor}
              onChangeBaseColor={(col) => setGuestThemeColor(col)}
              title="10 Pilihan Tema ID Tamu"
              subtitle="Geser untuk memilih tema. Sesuaikan warna dasar kartu tamu."
            />

            {/* LABEL STATUS TAMU */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Teks Label Status Tamu
              </label>
              <input
                type="text"
                value={guestTypeBadge}
                onChange={(e) => setGuestTypeBadge(e.target.value)}
                placeholder="TAMU &amp; MONEV UJIAN"
                className="w-full px-3 py-2 text-xs font-black uppercase border-2 border-black rounded-lg"
              />
            </div>

            {/* TOGGLE LUBANG TALI */}
            <label className="flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-300 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showGuestLanyard}
                onChange={(e) => setShowGuestLanyard(e.target.checked)}
                className="w-4 h-4 accent-yellow-400"
              />
              <span className="text-xs font-bold">Tampilkan Lubang Tali Lanyard (Atas Kartu)</span>
            </label>
          </div>

          {/* Bottom Live Preview */}
          <div className="w-full bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                Live Pratinjau ID Tamu
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-yellow-300 border border-black rounded font-black">
                {guestOrientation === 'portrait' ? 'Potret (Lanyard)' : 'Lanskap'}
              </span>
            </div>

            <PinchZoomCardContainer
              cardTitle="ID Tamu & Monev"
              badgeLabel={guestOrientation === 'portrait' ? 'Potret (Lanyard)' : 'Lanskap'}
              initialScale={1.05}
            >
              <ProctorGuestCard
                type="guest"
                themeId={guestThemeId}
                themeColor={guestThemeColor}
                orientation={guestOrientation}
                school={displaySchool}
                exam={displayExam}
                guestData={{
                  id: 'preview_sample_guest',
                  label: guestTypeBadge,
                  name: 'Drs. H. Mulyadi, M.Pd.',
                  nip: '19710315 199602 1 002',
                  gender: 'L',
                  position: 'Pengawas Pembina Cabang Dinas',
                }}
                showLanyard={showGuestLanyard}
                roleBadgeText={guestTypeBadge}
              />
            </PinchZoomCardContainer>
          </div>
        </div>
      )}

      {/* 5. SUB-VIEW: DESAIN POSTER ASESMEN */}
      {activeMenu === 'poster' && (
        <PosterDesigner
          school={school}
          exam={exam}
          students={students}
          posterDesign={posterDesign || DEFAULT_POSTER_DESIGN}
          onUpdatePosterDesign={onUpdatePosterDesign || (() => {})}
          onSaveToCloud={onSavePosterDesignToCloud}
          onNavigateToPrint={() => onNavigateToPrint('exam_poster')}
          onBackToMenu={() => setActiveMenu('menu')}
        />
      )}

      {/* 6. SUB-VIEW: DESAIN LEMBAR JAWABAN */}
      {activeMenu === 'answersheet' && (
        <AnswerSheetDesigner
          school={school}
          exam={exam}
          design={answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN}
          onUpdateDesign={onUpdateAnswerSheetDesign || (() => {})}
          onSaveToCloud={onSaveAnswerSheetDesignToCloud}
          onNavigateToPrint={() => onNavigateToPrint('answer_sheet')}
          onBackToMenu={() => setActiveMenu('menu')}
        />
      )}
    </div>
  );
};
