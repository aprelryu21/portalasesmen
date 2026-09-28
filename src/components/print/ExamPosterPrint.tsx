import React, { useState, useMemo } from 'react';
import { School, Exam, Student } from '../../types';
import { A4SheetContainer } from './A4SheetContainer';
import { PrintConfirmationModal } from './PrintConfirmationModal';
import {
  Printer,
  ArrowLeft,
  Megaphone,
  VolumeX,
  Smartphone,
  Camera,
  DoorClosed,
  Users,
  Building2,
  Award,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Sliders,
  Eye,
  FileCheck,
  Ban,
  GraduationCap,
} from 'lucide-react';

export type PosterTypeId =
  | 'quiet'
  | 'room_name'
  | 'communication'
  | 'committee'
  | 'principal'
  | 'guest_proctor';

export type PosterStyleId =
  | 'neobrutal'
  | 'modern'
  | 'hazard'
  | 'classic_academic'
  | 'playful_friendly';

interface ExamPosterPrintProps {
  school: School;
  exam: Exam;
  students: Student[];
  onBackToMenu: () => void;
}

interface RoomItem {
  id: string;
  roomNumber: string; // e.g. "RUANG 01"
  classLabel: string; // e.g. "KELAS 1"
  fullTitle: string; // e.g. "RUANGAN ASESMEN KELAS 1"
  subdetail?: string; // e.g. "Peserta: 28 Siswa"
}

export const ExamPosterPrint: React.FC<ExamPosterPrintProps> = ({
  school,
  exam,
  students = [],
  onBackToMenu,
}) => {
  // 1. State Management
  const [activePosterType, setActivePosterType] = useState<PosterTypeId>('quiet');
  const [selectedStyle, setSelectedStyle] = useState<PosterStyleId>('neobrutal');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all'); // 'all' or specific room id
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(14); // in percent (10-30%)
  const [showSchoolAddressInFooter, setShowSchoolAddressInFooter] = useState<boolean>(true);
  const [printScope, setPrintScope] = useState<'single' | 'all_rooms' | 'all_types'>('single');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // 2. Extract Unique Rooms & Classes from students data (tanpa ganda!)
  const roomItems: RoomItem[] = useMemo(() => {
    // Normalization helper
    const cleanClass = (val: string): string => {
      if (!val) return '';
      const trimmed = val.trim();
      const match = trimmed.match(/\b([1-6])\b/);
      if (match) return `KELAS ${match[1]}`;
      if (trimmed.toLowerCase().includes('kelas')) return trimmed.toUpperCase();
      return `KELAS ${trimmed.toUpperCase()}`;
    };

    const cleanRoom = (val: string, indexFallback: number): string => {
      if (!val) {
        return `RUANG 0${indexFallback}`;
      }
      const trimmed = val.trim().toUpperCase();
      if (trimmed.startsWith('RUANG')) return trimmed;
      if (/^\d+$/.test(trimmed)) {
        return `RUANG ${trimmed.padStart(2, '0')}`;
      }
      return `RUANG ${trimmed}`;
    };

    // If students are provided, aggregate and deduplicate
    if (students && students.length > 0) {
      // Map class -> { room, count }
      const classMap = new Map<string, { room: string; count: number }>();
      // Also map room -> Set of classes
      const roomMap = new Map<string, { classes: Set<string>; count: number }>();

      students.forEach((s) => {
        const rawClass = s.className ? s.className.trim() : '';
        const rawRoom = s.examRoom ? s.examRoom.trim() : '';

        const cLabel = cleanClass(rawClass);
        if (cLabel) {
          if (!classMap.has(cLabel)) {
            classMap.set(cLabel, {
              room: rawRoom ? cleanRoom(rawRoom, 1) : '',
              count: 0,
            });
          }
          const item = classMap.get(cLabel)!;
          item.count += 1;
          if (rawRoom && !item.room) {
            item.room = cleanRoom(rawRoom, 1);
          }
        }

        if (rawRoom) {
          const rLabel = cleanRoom(rawRoom, 1);
          if (!roomMap.has(rLabel)) {
            roomMap.set(rLabel, { classes: new Set(), count: 0 });
          }
          const rItem = roomMap.get(rLabel)!;
          rItem.count += 1;
          if (cLabel) rItem.classes.add(cLabel);
        }
      });

      // Prefer standard Kelas 1 s/d 6 deduplication
      const standardGrades = ['KELAS 1', 'KELAS 2', 'KELAS 3', 'KELAS 4', 'KELAS 5', 'KELAS 6'];
      const items: RoomItem[] = [];

      standardGrades.forEach((stdClass, idx) => {
        const found = classMap.get(stdClass);
        const roomNum = found?.room || `RUANG 0${idx + 1}`;
        const count = found?.count || 0;
        items.push({
          id: `room-grade-${idx + 1}`,
          roomNumber: roomNum,
          classLabel: stdClass,
          fullTitle: `RUANGAN ASESMEN ${stdClass}`,
          subdetail: count > 0 ? `Rekap: ${count} Peserta Ujian` : undefined,
        });
      });

      // Add any additional classes found in data that are not 1-6
      classMap.forEach((data, cLabel) => {
        if (!standardGrades.includes(cLabel)) {
          items.push({
            id: `room-custom-${cLabel.replace(/\s+/g, '-').toLowerCase()}`,
            roomNumber: data.room || `RUANG ${items.length + 1}`,
            classLabel: cLabel,
            fullTitle: `RUANGAN ASESMEN ${cLabel}`,
            subdetail: data.count > 0 ? `Rekap: ${data.count} Peserta Ujian` : undefined,
          });
        }
      });

      return items;
    }

    // Default fallback: RUANGAN ASESMEN KELAS 1 sampai 6
    return [1, 2, 3, 4, 5, 6].map((grade) => ({
      id: `room-grade-${grade}`,
      roomNumber: `RUANG 0${grade}`,
      classLabel: `KELAS ${grade}`,
      fullTitle: `RUANGAN ASESMEN KELAS ${grade}`,
    }));
  }, [students]);

  // Current room item to preview
  const currentRoomItem = useMemo(() => {
    if (selectedRoomId === 'all') return roomItems[0];
    return roomItems.find((r) => r.id === selectedRoomId) || roomItems[0];
  }, [roomItems, selectedRoomId]);

  // Execute native print
  const handleTriggerPrint = (scope: 'single' | 'all_rooms' | 'all_types') => {
    setPrintScope(scope);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPrint = () => {
    setIsConfirmModalOpen(false);
    setTimeout(() => {
      window.focus();
      window.print();
    }, 250);
  };

  // 3. Definition of 5 Themes
  const STYLES_CONFIG = [
    {
      id: 'neobrutal' as PosterStyleId,
      name: 'Neobrutalism Bold',
      desc: 'Border hitam tebal 5px, bayangan tegas, dan warna kontras tinggi.',
      previewBg: 'bg-yellow-300 border-2 border-black',
    },
    {
      id: 'modern' as PosterStyleId,
      name: 'Modern Minimalist',
      desc: 'Elegan, sudut melengkung halus, aksen navy & cobalt blue berwibawa.',
      previewBg: 'bg-slate-900 border-2 border-indigo-400 text-white',
    },
    {
      id: 'hazard' as PosterStyleId,
      name: 'Hazard Caution',
      desc: 'Pita garis kuning-hitam standar peringatan, visibilitas ekstra tinggi.',
      previewBg: 'bg-amber-400 border-2 border-black',
    },
    {
      id: 'classic_academic' as PosterStyleId,
      name: 'Formal Akademik',
      desc: 'Bingkai ornamen ganda formal kedinasan dengan aksen emerald & emas.',
      previewBg: 'bg-emerald-800 border-2 border-amber-400 text-amber-200',
    },
    {
      id: 'playful_friendly' as PosterStyleId,
      name: 'Ramah Anak Ceria',
      desc: 'Warna cerah ceria, rounded bubble, edukatif dan menenangkan siswa SD.',
      previewBg: 'bg-teal-400 border-2 border-teal-800 text-teal-950',
    },
  ];

  // Definition of 6 Poster Types
  const POSTER_TYPES = [
    {
      id: 'quiet' as PosterTypeId,
      number: '1',
      title: 'Harap Tenang',
      badge: 'Peringatan Asesmen',
      icon: VolumeX,
      summary: 'HARAP TENANG ! SEDANG BERLANGSUNG ASESMEN SUMATIF',
    },
    {
      id: 'room_name' as PosterTypeId,
      number: '2',
      title: 'Nama Ruangan',
      badge: 'Kelas 1 s/d 6',
      icon: DoorClosed,
      summary: 'RUANGAN ASESMEN KELAS 1 SAMPAI 6 (Rekap Bebas Duplikat)',
    },
    {
      id: 'communication' as PosterTypeId,
      number: '3',
      title: 'Peralatan Komunikasi',
      badge: 'Zona Bebas HP/Kamera',
      icon: Smartphone,
      summary: 'DILARANG MEMBAWA PERALATAN KOMUNIKASI, KAMERA, DLL',
    },
    {
      id: 'committee' as PosterTypeId,
      number: '4',
      title: 'Ruang Panitia',
      badge: 'Panitia & Guru',
      icon: Users,
      summary: 'RUANGAN PANITIA dan GURU',
    },
    {
      id: 'principal' as PosterTypeId,
      number: '5',
      title: 'Ruang Kepala',
      badge: 'Pimpinan Sekolah',
      icon: Building2,
      summary: 'RUANGAN KEPALA SEKOLAH',
    },
    {
      id: 'guest_proctor' as PosterTypeId,
      number: '6',
      title: 'Ruang Tamu & Pengawas',
      badge: 'Pengawas & Tamu',
      icon: Award,
      summary: 'RUANG TAMU dan PENGAWAS',
    },
  ];

  // Helper to render poster content based on type
  const getPosterData = (type: PosterTypeId, roomItem?: RoomItem) => {
    switch (type) {
      case 'quiet':
        return {
          categoryTag: 'ZONA STERIL & TENANG',
          categorySub: 'ASESMEN SATUAN PENDIDIKAN',
          mainHeadline: 'HARAP TENANG !',
          subHeadline: 'SEDANG BERLANGSUNG ASESMEN SUMATIF',
          bodyNotice: 'Dilarang Membuat Gaduh & Memasuki Area Ruang Ujian Tanpa Izin.',
          extraIcon: 'silence',
          rulesNote: 'Mohon menjaga ketenangan di sekitar lorong dan area ruang asesmen.',
        };
      case 'room_name': {
        const activeRoom = roomItem || currentRoomItem;
        return {
          categoryTag: activeRoom.roomNumber || 'RUANG UJIAN',
          categorySub: exam?.name || 'ASESMEN SUMATIF',
          mainHeadline: 'RUANGAN ASESMEN',
          subHeadline: activeRoom.classLabel,
          bodyNotice: `Selamat Mengerjakan Asesmen • Utamakan Kejujuran & Kemandirian`,
          extraIcon: 'room',
          rulesNote: activeRoom.subdetail || 'Peserta wajib menempati kursi sesuai kartu peserta asesmen.',
        };
      }
      case 'communication':
        return {
          categoryTag: 'PERINGATAN TATA TERTIB UJIAN',
          categorySub: 'INTEGRITAS & KEJUJURAN ASESMEN',
          mainHeadline: 'DILARANG MEMBAWA',
          subHeadline: 'PERALATAN KOMUNIKASI, KAMERA, DAN SEJENISNYA',
          bodyNotice: 'KEDALAM RUANGAN.',
          extraIcon: 'no_device',
          rulesNote: 'Ponsel (HP), jam tangan pintar (smartwatch), dan kamera wajib dimatikan dan disimpan pada tempat yang disediakan pengawas.',
        };
      case 'committee':
        return {
          categoryTag: 'AREA RESMI ASESMEN',
          categorySub: 'PANITIA PELAKSANA ASESMEN',
          mainHeadline: 'RUANGAN PANITIA',
          subHeadline: 'dan GURU',
          bodyNotice: 'Pusat Distribusi Soal, Lembar Jawaban & Administrasi Asesmen',
          extraIcon: 'committee',
          rulesNote: 'Selain Panitia, Pengawas, dan Petugas Berwenang dilarang masuk tanpa izin.',
        };
      case 'principal':
        return {
          categoryTag: 'PIMPINAN SATUAN PENDIDIKAN',
          categorySub: 'PENANGGUNG JAWAB ASESMEN',
          mainHeadline: 'RUANGAN',
          subHeadline: 'KEPALA SEKOLAH',
          bodyNotice: 'Pusat Koordinasi & Pengawasan Asesmen Satuan Pendidikan',
          extraIcon: 'principal',
          rulesNote: 'Tamu dinas dan petugas monitoring harap melapor terlebih dahulu.',
        };
      case 'guest_proctor':
        return {
          categoryTag: 'POSKO PENGAWAS & TAMU DINAS',
          categorySub: 'MONITORING & EVALUASI',
          mainHeadline: 'RUANG TAMU',
          subHeadline: 'dan PENGAWAS',
          bodyNotice: 'Ruang Transit Pengawas Ruang, Tim Monitoring, dan Tamu Dinas',
          extraIcon: 'proctor',
          rulesNote: 'Pengawas ruang dimohon hadir 30 menit sebelum sesi asesmen dimulai.',
        };
      default:
        return {
          categoryTag: 'PENGUMUMAN RESMI',
          categorySub: 'ASESMEN SEKOLAH',
          mainHeadline: 'PENGUMUMAN',
          subHeadline: 'ASESMEN RESMI',
          bodyNotice: '',
          extraIcon: 'none',
          rulesNote: '',
        };
    }
  };

  // 4. RENDER INDIVIDUAL POSTER CONTENT IN A GIVEN STYLE
  const renderSinglePosterA4 = (
    type: PosterTypeId,
    style: PosterStyleId,
    roomItem?: RoomItem,
    isPrintInstance: boolean = false
  ) => {
    const data = getPosterData(type, roomItem);
    const schoolName = school?.name || 'SD NEGERI CONTOH';
    const schoolLogo = school?.logoUrl;
    const academicYear = exam?.academicYear || '2026/2027';
    const examTitle = exam?.name || 'ASESMEN SUMATIF';

    // WATERMARK COMPONENT (Logo dan Nama Sekolah di Bagian Tengah Bawah)
    const WatermarkComponent = () => (
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none select-none z-0"
        style={{ opacity: watermarkOpacity / 100 }}
      >
        {schoolLogo ? (
          <img
            src={schoolLogo}
            alt="Watermark Logo Sekolah"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain grayscale filter"
          />
        ) : (
          <div className="w-48 h-48 rounded-full border-4 border-dashed border-neutral-700 flex items-center justify-center">
            <GraduationCap className="w-28 h-28 text-neutral-600" />
          </div>
        )}
        <div className="mt-2 text-center text-sm font-black uppercase tracking-widest text-neutral-800 max-w-sm">
          {schoolName}
        </div>
      </div>
    );

    // FOOTER IDENTITAS RESMI (Bagian Bawah Lembar A4)
    const OfficialFooter = ({ borderClass, textMutedClass }: { borderClass: string; textMutedClass: string }) => (
      <div className={`relative z-10 w-full pt-4 mt-auto border-t-2 ${borderClass} flex items-center justify-between gap-4 text-left`}>
        <div className="flex items-center gap-3">
          {schoolLogo ? (
            <img
              src={schoolLogo}
              alt="Logo Sekolah"
              className="w-12 h-12 object-contain shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7 text-neutral-700" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-black uppercase tracking-tight text-neutral-900 leading-tight">
              {schoolName}
            </h4>
            <div className={`text-[10px] ${textMutedClass} font-semibold leading-tight mt-0.5`}>
              {school?.npsn && <span>NPSN: {school.npsn} • </span>}
              <span>{examTitle} TA {academicYear}</span>
            </div>
            {showSchoolAddressInFooter && school?.address && (
              <div className={`text-[9px] ${textMutedClass} truncate max-w-md mt-0.5`}>
                {[school.address, school.village, school.district, school.regency].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-block px-2.5 py-1 bg-black text-white text-[9px] font-black uppercase tracking-wider rounded">
            Dokumen Resmi
          </div>
          <div className="text-[9px] font-bold text-neutral-500 mt-1">
            Dicetak Melalui Portal Asesmen
          </div>
        </div>
      </div>
    );

    // ==========================================
    // STYLE 1: NEOBRUTALISM BOLD
    // ==========================================
    if (style === 'neobrutal') {
      return (
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FFFDF5] border-[5px] border-black shadow-[10px_10px_0px_#000] print:border-[5px] print:shadow-none overflow-hidden select-none">
          <WatermarkComponent />

          {/* Top Header Badge */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                  {data.categoryTag}
                </span>
                <span className="text-[11px] font-black uppercase tracking-wide text-neutral-800">
                  {data.categorySub}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-300 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>A4 OFFICIAL</span>
              </div>
            </div>
          </div>

          {/* Center Main Poster Content (Teks Besar & Jelas) */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 space-y-6">
            {/* Visual Icon Box */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-yellow-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_#000]">
              {type === 'quiet' && <VolumeX className="w-14 h-14 sm:w-16 sm:h-16 text-black" />}
              {type === 'room_name' && <DoorClosed className="w-14 h-14 sm:w-16 sm:h-16 text-black" />}
              {type === 'communication' && (
                <div className="relative">
                  <Smartphone className="w-14 h-14 sm:w-16 sm:h-16 text-black" />
                  <Ban className="w-12 h-12 text-red-600 absolute inset-0 m-auto" />
                </div>
              )}
              {type === 'committee' && <Users className="w-14 h-14 sm:w-16 sm:h-16 text-black" />}
              {type === 'principal' && <Building2 className="w-14 h-14 sm:w-16 sm:h-16 text-black" />}
              {type === 'guest_proctor' && <Award className="w-14 h-14 sm:w-16 sm:h-16 text-black" />}
            </div>

            {/* Big Main Headline */}
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black leading-[1.05]">
                {data.mainHeadline}
              </h1>

              {data.subHeadline && (
                <div className="inline-block px-5 py-2 bg-black text-white border-3 border-black text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide rounded-xl shadow-[4px_4px_0px_#FFE600]">
                  {data.subHeadline}
                </div>
              )}
            </div>

            {/* Explanatory Body / Notice */}
            {data.bodyNotice && (
              <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] max-w-xl">
                <p className="text-base sm:text-lg md:text-xl font-extrabold uppercase text-neutral-900 leading-snug">
                  {data.bodyNotice}
                </p>
              </div>
            )}

            {/* Secondary Note */}
            {data.rulesNote && (
              <p className="text-xs sm:text-sm font-bold text-neutral-700 max-w-md leading-relaxed">
                {data.rulesNote}
              </p>
            )}
          </div>

          {/* Bottom Official Footer */}
          <OfficialFooter borderClass="border-black" textMutedClass="text-neutral-700" />
        </div>
      );
    }

    // ==========================================
    // STYLE 2: MODERN MINIMALIST / SLEEK CORPORATE
    // ==========================================
    if (style === 'modern') {
      return (
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 border-2 border-indigo-200 shadow-xl print:border-2 print:border-slate-300 print:shadow-none rounded-3xl overflow-hidden select-none">
          <WatermarkComponent />

          {/* Top Header */}
          <div className="relative z-10 border-b border-indigo-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  {data.categoryTag}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  {data.categorySub}
                </span>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-200">
                Official Protocol
              </span>
            </div>
          </div>

          {/* Center Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 space-y-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              {type === 'quiet' && <VolumeX className="w-14 h-14" />}
              {type === 'room_name' && <DoorClosed className="w-14 h-14" />}
              {type === 'communication' && (
                <div className="relative">
                  <Smartphone className="w-14 h-14" />
                  <Ban className="w-12 h-12 text-rose-300 absolute inset-0 m-auto" />
                </div>
              )}
              {type === 'committee' && <Users className="w-14 h-14" />}
              {type === 'principal' && <Building2 className="w-14 h-14" />}
              {type === 'guest_proctor' && <Award className="w-14 h-14" />}
            </div>

            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                {data.mainHeadline}
              </h1>

              {data.subHeadline && (
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 uppercase tracking-wide">
                  {data.subHeadline}
                </div>
              )}
            </div>

            {data.bodyNotice && (
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl">
                <p className="text-base sm:text-lg md:text-xl font-bold uppercase text-slate-800 leading-snug">
                  {data.bodyNotice}
                </p>
              </div>
            )}

            {data.rulesNote && (
              <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-md leading-relaxed">
                {data.rulesNote}
              </p>
            )}
          </div>

          {/* Bottom Official Footer */}
          <OfficialFooter borderClass="border-indigo-100" textMutedClass="text-slate-500" />
        </div>
      );
    }

    // ==========================================
    // STYLE 3: INDUSTRIAL HAZARD / EXTREME CAUTION
    // ==========================================
    if (style === 'hazard') {
      return (
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FFFBEB] border-[6px] border-black shadow-xl print:border-[6px] print:shadow-none overflow-hidden select-none">
          <WatermarkComponent />

          {/* Hazard Diagonal Warning Stripes Top Ribbon */}
          <div className="relative z-10 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-4">
            <div
              className="h-6 w-full border-b-4 border-black"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000, #000 14px, #FBBF24 14px, #FBBF24 28px)',
              }}
            />
            <div className="px-6 sm:px-8 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-black text-amber-300 text-xs font-black uppercase tracking-wider rounded">
                  PERINGATAN KETAT
                </span>
                <span className="text-xs font-black text-black uppercase">
                  {data.categoryTag}
                </span>
              </div>
              <div className="flex items-center gap-1 text-red-600 font-black text-xs uppercase">
                <AlertTriangle className="w-4 h-4 fill-red-600 text-white" />
                <span>ZONA UJIAN</span>
              </div>
            </div>
          </div>

          {/* Center Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4 space-y-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
              {type === 'quiet' && <ShieldAlert className="w-14 h-14 text-black" />}
              {type === 'room_name' && <DoorClosed className="w-14 h-14 text-black" />}
              {type === 'communication' && (
                <div className="relative">
                  <Smartphone className="w-14 h-14 text-black" />
                  <Ban className="w-12 h-12 text-red-600 absolute inset-0 m-auto" />
                </div>
              )}
              {type === 'committee' && <Users className="w-14 h-14 text-black" />}
              {type === 'principal' && <Building2 className="w-14 h-14 text-black" />}
              {type === 'guest_proctor' && <Award className="w-14 h-14 text-black" />}
            </div>

            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black leading-[1.05]">
                {data.mainHeadline}
              </h1>

              {data.subHeadline && (
                <div className="inline-block px-4 py-2 bg-amber-400 text-black border-4 border-black text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide rounded-md shadow-[4px_4px_0px_#000]">
                  {data.subHeadline}
                </div>
              )}
            </div>

            {data.bodyNotice && (
              <div className="p-4 bg-black text-amber-300 border-3 border-black rounded-lg max-w-xl shadow-[4px_4px_0px_#F59E0B]">
                <p className="text-base sm:text-lg md:text-xl font-black uppercase leading-snug">
                  {data.bodyNotice}
                </p>
              </div>
            )}

            {data.rulesNote && (
              <p className="text-xs sm:text-sm font-extrabold text-neutral-900 max-w-md leading-relaxed bg-amber-200/80 px-3 py-1 rounded border border-amber-400">
                {data.rulesNote}
              </p>
            )}
          </div>

          {/* Hazard Diagonal Warning Stripes Bottom Ribbon */}
          <div className="relative z-10 -mx-6 sm:-mx-8 mb-3">
            <div
              className="h-4 w-full border-t-2 border-b-2 border-black"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000, #000 12px, #FBBF24 12px, #FBBF24 24px)',
              }}
            />
          </div>

          {/* Bottom Official Footer */}
          <OfficialFooter borderClass="border-black" textMutedClass="text-neutral-700" />
        </div>
      );
    }

    // ==========================================
    // STYLE 4: FORMAL AKADEMIK / KEDINASAN
    // ==========================================
    if (style === 'classic_academic') {
      return (
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FCFDFE] border-4 border-[#064E3B] shadow-xl print:border-4 print:border-[#064E3B] print:shadow-none overflow-hidden select-none">
          <WatermarkComponent />

          {/* Ornamental Inner Double Border */}
          <div className="absolute inset-2 sm:inset-3 border-2 border-dashed border-[#B45309]/50 pointer-events-none rounded-sm"></div>

          {/* Formal Top Header Banner */}
          <div className="relative z-10 border-b-2 border-[#064E3B] pb-3 text-center space-y-1">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#064E3B]">
              PEMERINTAH REPUBLIK INDONESIA • DINAS PENDIDIKAN
            </div>
            <div className="inline-block px-4 py-0.5 bg-[#064E3B] text-amber-200 text-xs font-black uppercase tracking-wider rounded">
              {data.categoryTag}
            </div>
          </div>

          {/* Center Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-5 space-y-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#B45309] bg-emerald-50 text-[#064E3B] flex items-center justify-center shadow-md">
              {type === 'quiet' && <VolumeX className="w-14 h-14" />}
              {type === 'room_name' && <DoorClosed className="w-14 h-14" />}
              {type === 'communication' && (
                <div className="relative">
                  <Smartphone className="w-14 h-14" />
                  <Ban className="w-12 h-12 text-red-700 absolute inset-0 m-auto" />
                </div>
              )}
              {type === 'committee' && <Users className="w-14 h-14" />}
              {type === 'principal' && <Building2 className="w-14 h-14" />}
              {type === 'guest_proctor' && <Award className="w-14 h-14" />}
            </div>

            <div className="space-y-3 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#064E3B] leading-tight font-serif">
                {data.mainHeadline}
              </h1>

              {data.subHeadline && (
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#B45309] uppercase tracking-wide">
                  {data.subHeadline}
                </div>
              )}
            </div>

            {data.bodyNotice && (
              <div className="p-4 bg-emerald-50/70 border-2 border-[#064E3B] rounded-lg max-w-xl">
                <p className="text-base sm:text-lg md:text-xl font-bold uppercase text-[#064E3B] leading-snug">
                  {data.bodyNotice}
                </p>
              </div>
            )}

            {data.rulesNote && (
              <p className="text-xs sm:text-sm font-semibold text-neutral-600 max-w-md leading-relaxed italic">
                &ldquo;{data.rulesNote}&rdquo;
              </p>
            )}
          </div>

          {/* Bottom Official Footer */}
          <OfficialFooter borderClass="border-[#064E3B]" textMutedClass="text-emerald-900" />
        </div>
      );
    }

    // ==========================================
    // STYLE 5: RAMAH ANAK / EDUKASI CERIA (PLAYFUL FRIENDLY)
    // ==========================================
    return (
      <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FEFCE8] border-[4px] border-teal-800 shadow-xl print:border-[4px] print:border-teal-800 print:shadow-none rounded-[36px] overflow-hidden select-none">
        <WatermarkComponent />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-teal-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
              {data.categoryTag}
            </span>
            <span className="text-xs font-bold text-teal-900 uppercase">
              {data.categorySub}
            </span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-orange-400 text-white rounded-full text-xs font-black uppercase shadow-sm">
            <span>SEKOLAH RAMAH ANAK</span>
          </div>
        </div>

        {/* Center Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-5 space-y-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-lg transform rotate-[-2deg]">
            {type === 'quiet' && <VolumeX className="w-14 h-14" />}
            {type === 'room_name' && <DoorClosed className="w-14 h-14" />}
            {type === 'communication' && (
              <div className="relative">
                <Smartphone className="w-14 h-14" />
                <Ban className="w-12 h-12 text-rose-300 absolute inset-0 m-auto" />
              </div>
            )}
            {type === 'committee' && <Users className="w-14 h-14" />}
            {type === 'principal' && <Building2 className="w-14 h-14" />}
            {type === 'guest_proctor' && <Award className="w-14 h-14" />}
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-teal-950 leading-tight">
              {data.mainHeadline}
            </h1>

            {data.subHeadline && (
              <div className="inline-block px-5 py-1.5 bg-orange-500 text-white text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wide rounded-2xl shadow-md">
                {data.subHeadline}
              </div>
            )}
          </div>

          {data.bodyNotice && (
            <div className="p-4 bg-white border-2 border-teal-600 rounded-2xl shadow-sm max-w-xl">
              <p className="text-base sm:text-lg md:text-xl font-bold uppercase text-teal-900 leading-snug">
                {data.bodyNotice}
              </p>
            </div>
          )}

          {data.rulesNote && (
            <p className="text-xs sm:text-sm font-semibold text-teal-800 max-w-md leading-relaxed">
              {data.rulesNote}
            </p>
          )}
        </div>

        {/* Bottom Official Footer */}
        <OfficialFooter borderClass="border-teal-300" textMutedClass="text-teal-800" />
      </div>
    );
  };

  // 5. Compute Items to Print Based on Scope
  const printableList = useMemo(() => {
    if (printScope === 'all_rooms') {
      return roomItems.map((r) => ({
        type: 'room_name' as PosterTypeId,
        roomItem: r,
      }));
    }
    if (printScope === 'all_types') {
      return POSTER_TYPES.map((pt) => ({
        type: pt.id,
        roomItem: pt.id === 'room_name' ? currentRoomItem : undefined,
      }));
    }
    // Single poster
    return [
      {
        type: activePosterType,
        roomItem: activePosterType === 'room_name' ? currentRoomItem : undefined,
      },
    ];
  }, [printScope, roomItems, currentRoomItem, activePosterType]);

  return (
    <div className="space-y-6">
      {/* 1. TOP TOOLBAR & CONTROLS (Hidden on Print) */}
      <div className="no-print space-y-4">
        {/* Navigation & Title Card */}
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded shadow-xs">
                Modul Cetak Resmi A4
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase">
                6 Tema • 5 Gaya Estetika
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-purple-700" />
              Cetak Poster &amp; Pengumuman Asesmen
            </h2>
            <p className="text-xs text-neutral-600 max-w-xl">
              Pilihan poster A4 beresolusi tinggi dengan teks ekstra besar, 5 gaya visual premium, serta watermark logo &amp; identitas resmi sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToMenu}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Menu
            </button>

            {/* Quick Action: Print This Poster */}
            <button
              type="button"
              onClick={() => handleTriggerPrint('single')}
              className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              Cetak Poster Ini (A4)
            </button>
          </div>
        </div>

        {/* 2. POSTER TYPE SELECTOR (6 Jenis) */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-700" />
              Pilih Jenis Poster (1 - 6)
            </h3>
            <span className="text-[11px] font-bold text-neutral-500">
              Format Kertas: A4 Penuh (210 x 297 mm)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {POSTER_TYPES.map((pt) => {
              const Icon = pt.icon;
              const isSelected = activePosterType === pt.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setActivePosterType(pt.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-purple-100 border-black shadow-[3px_3px_0px_#000] ring-2 ring-purple-600'
                      : 'bg-neutral-50 hover:bg-white border-neutral-300 hover:border-black'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-black'
                          : 'bg-white text-neutral-700 border-neutral-300'
                      }`}
                    >
                      #{pt.number}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-purple-700' : 'text-neutral-500'
                      }`}
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-neutral-900 leading-tight">
                      {pt.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                      {pt.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sub-selector for Room Poster (Kelas 1 - 6) */}
          {activePosterType === 'room_name' && (
            <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-purple-50/60 p-3 rounded-xl border border-purple-200">
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
                  <DoorClosed className="w-4 h-4 text-purple-700" />
                  Daftar Ruang Ujian Siswa:
                </span>
                <p className="text-[11px] text-neutral-600">
                  Total {roomItems.length} ruangan terdata (bebas duplikat dari data sheet).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  {roomItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedRoomId(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border transition-all cursor-pointer ${
                        selectedRoomId === item.id
                          ? 'bg-purple-600 text-white border-black shadow-[2px_2px_0px_#000]'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {item.classLabel}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerPrint('all_rooms')}
                  className="px-3.5 py-1.5 bg-emerald-300 hover:bg-emerald-400 text-emerald-950 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Semua Ruang ({roomItems.length} Lembar)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. STYLE SELECTOR (5 Gaya Desain Berbeda) */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Pilih Gaya Tampilan Poster (5 Gaya Unik)
            </h3>
            <span className="text-[11px] font-bold text-neutral-500">
              Teks sama, tata letak &amp; estetika berbeda
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STYLES_CONFIG.map((st) => {
              const isSelected = selectedStyle === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-yellow-50 border-black shadow-[3px_3px_0px_#000] ring-2 ring-black'
                      : 'bg-neutral-50 hover:bg-white border-neutral-300 hover:border-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-neutral-900">
                      {st.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                    )}
                  </div>

                  <div className={`h-8 w-full rounded-md flex items-center justify-center text-[10px] font-black uppercase ${st.previewBg}`}>
                    Pratinjau Tema
                  </div>

                  <p className="text-[10px] text-neutral-600 line-clamp-2 leading-relaxed">
                    {st.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. WATERMARK & FOOTER OPTIONS */}
        <div className="bg-neutral-50 border-2 border-black rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-neutral-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-neutral-900">
              <Sliders className="w-4 h-4" />
              Kepekatan Watermark Logo:
            </span>
            <div className="flex items-center gap-1 bg-white border border-black rounded-lg px-2 py-1 shadow-xs">
              {[10, 14, 20, 26].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setWatermarkOpacity(op)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    watermarkOpacity === op
                      ? 'bg-black text-white'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {op}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSchoolAddressInFooter}
                onChange={(e) => setShowSchoolAddressInFooter(e.target.checked)}
                className="w-4 h-4 rounded text-black border-2 border-black focus:ring-0 cursor-pointer"
              />
              <span>Tampilkan Alamat Lengkap di Footer</span>
            </label>

            <button
              type="button"
              onClick={() => handleTriggerPrint('all_types')}
              className="px-3.5 py-1.5 bg-neutral-900 text-white border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-black cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-yellow-300" />
              Cetak Paket 6 Poster Lengkap
            </button>
          </div>
        </div>
      </div>

      {/* 2. ON-SCREEN LIVE PREVIEW (A4 SHEET CONTAINER) */}
      <div className="no-print w-full flex flex-col items-center">
        <A4SheetContainer
          pageNumber={1}
          totalPages={1}
          orientation="portrait"
          marginMm={0}
        >
          {renderSinglePosterA4(activePosterType, selectedStyle, currentRoomItem, false)}
        </A4SheetContainer>
      </div>

      {/* 3. PRINT-ONLY CONTAINER (Hanya terlihat saat Ctrl+P / window.print()) */}
      <div className="hidden print:block print-only-container">
        {printableList.map((item, idx) => (
          <div
            key={`print-poster-${item.type}-${idx}`}
            className="a4-page w-[210mm] min-h-[297mm] h-[297mm] p-0 m-0 box-border bg-white"
            style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
          >
            {renderSinglePosterA4(item.type, selectedStyle, item.roomItem, true)}
          </div>
        ))}
      </div>

      {/* 4. CONFIRMATION PRINT MODAL */}
      <PrintConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmPrint}
        cardType={`Poster Asesmen (${selectedStyle.toUpperCase()})`}
        itemCount={printableList.length}
        estimatedSheets={printableList.length}
        orientation="portrait"
      />
    </div>
  );
};
