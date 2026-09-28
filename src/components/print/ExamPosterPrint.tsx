import React, { useState, useMemo } from 'react';
import { School, Exam, Student, PosterDesignSettings, PosterStyleId, PosterOrientation } from '../../types';
import { A4SheetContainer } from './A4SheetContainer';
import { PrintConfirmationModal } from './PrintConfirmationModal';
import {
  Printer,
  ArrowLeft,
  Megaphone,
  VolumeX,
  Smartphone,
  DoorClosed,
  Users,
  Building2,
  Award,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  GraduationCap,
  Ban,
  Settings,
  ArrowRight,
  Eye,
} from 'lucide-react';

export type PosterTypeId =
  | 'quiet'
  | 'room_name'
  | 'communication'
  | 'committee'
  | 'principal'
  | 'guest_proctor';

interface ExamPosterPrintProps {
  school: School;
  exam: Exam;
  students: Student[];
  posterDesign: PosterDesignSettings;
  onBackToMenu: () => void;
  onNavigateToDesigner?: () => void;
}

interface RoomItem {
  id: string;
  roomNumber: string;
  classLabel: string;
  fullTitle: string;
  subdetail?: string;
}

export const ExamPosterPrint: React.FC<ExamPosterPrintProps> = ({
  school,
  exam,
  students = [],
  posterDesign,
  onBackToMenu,
  onNavigateToDesigner,
}) => {
  // Navigation inside Print: null = show menu selection with thumbnails, PosterTypeId = preview & print specific poster
  const [activePosterType, setActivePosterType] = useState<PosterTypeId | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [printScope, setPrintScope] = useState<'single' | 'all_rooms' | 'all_types'>('single');

  // Active design settings (from Poster Designer)
  const currentStyle: PosterStyleId = posterDesign?.styleId || 'neobrutal';
  const currentOrientation: PosterOrientation = posterDesign?.orientation || 'portrait';
  const watermarkOpacity = posterDesign?.watermarkOpacity !== undefined ? posterDesign.watermarkOpacity : 14;
  const showAddress = posterDesign?.showSchoolAddressInFooter !== false;

  // Style names map
  const STYLE_NAMES: Record<PosterStyleId, string> = {
    neobrutal: 'Neobrutalism Bold',
    modern: 'Modern Minimalist',
    hazard: 'Hazard Caution',
    classic_academic: 'Formal Akademik',
    playful_friendly: 'Ramah Anak Ceria',
  };

  // 1. Extract Unique Rooms & Classes from students data (tanpa ganda!)
  const roomItems: RoomItem[] = useMemo(() => {
    const cleanClass = (val: string): string => {
      if (!val) return '';
      const trimmed = val.trim();
      const match = trimmed.match(/\b([1-6])\b/);
      if (match) return `KELAS ${match[1]}`;
      if (trimmed.toLowerCase().includes('kelas')) return trimmed.toUpperCase();
      return `KELAS ${trimmed.toUpperCase()}`;
    };

    const cleanRoom = (val: string, indexFallback: number): string => {
      if (!val) return `RUANG 0${indexFallback}`;
      const trimmed = val.trim().toUpperCase();
      if (trimmed.startsWith('RUANG')) return trimmed;
      if (/^\d+$/.test(trimmed)) return `RUANG ${trimmed.padStart(2, '0')}`;
      return `RUANG ${trimmed}`;
    };

    if (students && students.length > 0) {
      const classMap = new Map<string, { room: string; count: number }>();

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
      });

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

    return [1, 2, 3, 4, 5, 6].map((grade) => ({
      id: `room-grade-${grade}`,
      roomNumber: `RUANG 0${grade}`,
      classLabel: `KELAS ${grade}`,
      fullTitle: `RUANGAN ASESMEN KELAS ${grade}`,
    }));
  }, [students]);

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

  // Definition of 6 Poster Types
  const POSTER_TYPES = [
    {
      id: 'quiet' as PosterTypeId,
      number: '1',
      title: 'Harap Tenang',
      badge: 'Peringatan Asesmen',
      icon: VolumeX,
      description: 'HARAP TENANG ! SEDANG BERLANGSUNG ASESMEN SUMATIF',
      subtext: 'Dilarang Membuat Gaduh & Memasuki Area Ruang Ujian Tanpa Izin.',
    },
    {
      id: 'room_name' as PosterTypeId,
      number: '2',
      title: 'Nama Ruangan',
      badge: `Kelas 1 s/d 6 (${roomItems.length} Ruang)`,
      icon: DoorClosed,
      description: 'RUANGAN ASESMEN KELAS 1 SAMPAI 6',
      subtext: 'Sesuai rekap data input ruang ujian sheet data_siswa (bebas ganda).',
    },
    {
      id: 'communication' as PosterTypeId,
      number: '3',
      title: 'Peralatan Komunikasi',
      badge: 'Zona Bebas HP & Kamera',
      icon: Smartphone,
      description: 'DILARANG MEMBAWA PERALATAN KOMUNIKASI, KAMERA, DLL',
      subtext: 'Ponsel pintar (HP), kamera, dan sejenisnya dilarang masuk ke ruangan.',
    },
    {
      id: 'committee' as PosterTypeId,
      number: '4',
      title: 'Ruang Panitia',
      badge: 'Panitia & Guru',
      icon: Users,
      description: 'RUANGAN PANITIA dan GURU',
      subtext: 'Pusat distribusi soal & administrasi pelaksanaan asesmen.',
    },
    {
      id: 'principal' as PosterTypeId,
      number: '5',
      title: 'Ruang Kepala',
      badge: 'Pimpinan Lembaga',
      icon: Building2,
      description: 'RUANGAN KEPALA SEKOLAH',
      subtext: 'Pusat penanggung jawab & koordinasi asesmen satuan pendidikan.',
    },
    {
      id: 'guest_proctor' as PosterTypeId,
      number: '6',
      title: 'Ruang Tamu & Pengawas',
      badge: 'Pengawas & Tamu Dinas',
      icon: Award,
      description: 'RUANG TAMU dan PENGAWAS',
      subtext: 'Posko transit pengawas ruang, tim monitoring, dan dinas pendidikan.',
    },
  ];

  // Helper to render poster text data
  const getPosterData = (type: PosterTypeId, roomItem?: RoomItem) => {
    switch (type) {
      case 'quiet':
        return {
          categoryTag: 'ZONA STERIL & TENANG',
          categorySub: 'ASESMEN SATUAN PENDIDIKAN',
          mainHeadline: 'HARAP TENANG !',
          subHeadline: 'SEDANG BERLANGSUNG ASESMEN SUMATIF',
          bodyNotice: 'Dilarang Membuat Gaduh & Memasuki Area Ruang Ujian Tanpa Izin.',
          rulesNote: 'Mohon menjaga ketenangan di sekitar lorong dan area ruang asesmen.',
        };
      case 'room_name': {
        const activeRoom = roomItem || currentRoomItem;
        return {
          categoryTag: activeRoom.roomNumber || 'RUANG UJIAN',
          categorySub: exam?.name || 'ASESMEN SUMATIF',
          mainHeadline: 'RUANGAN ASESMEN',
          subHeadline: activeRoom.classLabel,
          bodyNotice: 'Selamat Mengerjakan Asesmen • Utamakan Kejujuran & Kemandirian',
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
          rulesNote: 'Ponsel (HP), jam tangan pintar (smartwatch), dan kamera wajib dimatikan dan disimpan pada tempat yang disediakan pengawas.',
        };
      case 'committee':
        return {
          categoryTag: 'AREA RESMI ASESMEN',
          categorySub: 'PANITIA PELAKSANA ASESMEN',
          mainHeadline: 'RUANGAN PANITIA',
          subHeadline: 'dan GURU',
          bodyNotice: 'Pusat Distribusi Soal, Lembar Jawaban & Administrasi Asesmen',
          rulesNote: 'Selain Panitia, Pengawas, dan Petugas Berwenang dilarang masuk tanpa izin.',
        };
      case 'principal':
        return {
          categoryTag: 'PIMPINAN SATUAN PENDIDIKAN',
          categorySub: 'PENANGGUNG JAWAB ASESMEN',
          mainHeadline: 'RUANGAN',
          subHeadline: 'KEPALA SEKOLAH',
          bodyNotice: 'Pusat Koordinasi & Pengawasan Asesmen Satuan Pendidikan',
          rulesNote: 'Tamu dinas dan petugas monitoring harap melapor terlebih dahulu.',
        };
      case 'guest_proctor':
        return {
          categoryTag: 'POSKO PENGAWAS & TAMU DINAS',
          categorySub: 'MONITORING & EVALUASI',
          mainHeadline: 'RUANG TAMU',
          subHeadline: 'dan PENGAWAS',
          bodyNotice: 'Ruang Transit Pengawas Ruang, Tim Monitoring, dan Tamu Dinas',
          rulesNote: 'Pengawas ruang dimohon hadir 30 menit sebelum sesi asesmen dimulai.',
        };
    }
  };

  // Render Full A4 Poster content in current style & orientation
  const renderSinglePosterA4 = (
    type: PosterTypeId,
    style: PosterStyleId,
    orientation: PosterOrientation,
    roomItem?: RoomItem,
    isPrintInstance: boolean = false
  ) => {
    const data = getPosterData(type, roomItem);
    const schoolName = school?.name || 'SD NEGERI CONTOH';
    const schoolLogo = school?.logoUrl;
    const academicYear = exam?.academicYear || '2026/2027';
    const examTitle = exam?.name || 'ASESMEN SUMATIF';
    const isLandscape = orientation === 'landscape';

    // Watermark component
    const WatermarkComponent = () => (
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none select-none z-0"
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

    // Official Footer
    const OfficialFooter = ({ borderClass, textMutedClass }: { borderClass: string; textMutedClass: string }) => (
      <div className={`relative z-10 w-full pt-3 mt-auto border-t-2 ${borderClass} flex items-center justify-between gap-4 text-left`}>
        <div className="flex items-center gap-3">
          {schoolLogo ? (
            <img src={schoolLogo} alt="Logo Sekolah" className="w-11 h-11 object-contain shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-neutral-100 border border-neutral-400 flex items-center justify-center shrink-0">
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
            {showAddress && school?.address && (
              <div className={`text-[9px] ${textMutedClass} truncate max-w-md mt-0.5`}>
                {[school.address, school.village, school.district, school.regency].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-block px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-wider rounded">
            Dokumen Resmi
          </div>
          <div className="text-[9px] font-bold text-neutral-500 mt-0.5">
            Portal Asesmen A4
          </div>
        </div>
      </div>
    );

    // Render icon helper
    const renderVisualIcon = (className: string) => {
      switch (type) {
        case 'quiet':
          return style === 'hazard' ? <ShieldAlert className={className} /> : <VolumeX className={className} />;
        case 'room_name':
          return <DoorClosed className={className} />;
        case 'communication':
          return (
            <div className="relative">
              <Smartphone className={className} />
              <Ban className="w-12 h-12 text-red-600 absolute inset-0 m-auto" />
            </div>
          );
        case 'committee':
          return <Users className={className} />;
        case 'principal':
          return <Building2 className={className} />;
        case 'guest_proctor':
          return <Award className={className} />;
      }
    };

    // ==========================================
    // 1. NEOBRUTALISM BOLD
    // ==========================================
    if (style === 'neobrutal') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FFFDF5] border-[5px] border-black shadow-[10px_10px_0px_#000] print:border-[5px] print:shadow-none overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <WatermarkComponent />

          {/* Top Header */}
          <div className="relative z-10 border-b-4 border-black pb-3 flex items-center justify-between">
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
              <span>A4 {isLandscape ? 'LANDSCAPE' : 'PORTRAIT'}</span>
            </div>
          </div>

          {/* Center Main Content */}
          {isLandscape ? (
            <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto py-4">
              <div className="col-span-5 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-yellow-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_#000]">
                  {renderVisualIcon('w-14 h-14 sm:w-16 sm:h-16 text-black')}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-black leading-tight">
                  {data.mainHeadline}
                </h1>
              </div>

              <div className="col-span-7 space-y-4 text-left">
                {data.subHeadline && (
                  <div className="inline-block px-5 py-2.5 bg-black text-white border-3 border-black text-2xl sm:text-3xl font-black uppercase tracking-wide rounded-xl shadow-[4px_4px_0px_#FFE600]">
                    {data.subHeadline}
                  </div>
                )}
                {data.bodyNotice && (
                  <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000]">
                    <p className="text-base sm:text-lg font-extrabold uppercase text-neutral-900 leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}
                {data.rulesNote && (
                  <p className="text-xs sm:text-sm font-bold text-neutral-700 leading-relaxed">
                    {data.rulesNote}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 space-y-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-yellow-400 border-4 border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_#000]">
                {renderVisualIcon('w-14 h-14 sm:w-16 sm:h-16 text-black')}
              </div>

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

              {data.bodyNotice && (
                <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] max-w-xl">
                  <p className="text-base sm:text-lg md:text-xl font-extrabold uppercase text-neutral-900 leading-snug">
                    {data.bodyNotice}
                  </p>
                </div>
              )}

              {data.rulesNote && (
                <p className="text-xs sm:text-sm font-bold text-neutral-700 max-w-md leading-relaxed">
                  {data.rulesNote}
                </p>
              )}
            </div>
          )}

          <OfficialFooter borderClass="border-black" textMutedClass="text-neutral-700" />
        </div>
      );
    }

    // ==========================================
    // 2. MODERN MINIMALIST
    // ==========================================
    if (style === 'modern') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 border-2 border-indigo-200 shadow-xl print:border-2 print:border-slate-300 print:shadow-none rounded-3xl overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <WatermarkComponent />

          <div className="relative z-10 border-b border-indigo-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">{data.categoryTag}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 uppercase">{data.categorySub}</span>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-200">
              A4 {isLandscape ? 'Landscape' : 'Portrait'}
            </span>
          </div>

          {isLandscape ? (
            <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto py-4">
              <div className="col-span-5 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  {renderVisualIcon('w-14 h-14')}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 leading-tight">
                  {data.mainHeadline}
                </h1>
              </div>

              <div className="col-span-7 space-y-4 text-left">
                {data.subHeadline && (
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 uppercase tracking-wide">
                    {data.subHeadline}
                  </div>
                )}
                {data.bodyNotice && (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-base sm:text-lg font-bold uppercase text-slate-800 leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}
                {data.rulesNote && (
                  <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                    {data.rulesNote}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 space-y-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                {renderVisualIcon('w-14 h-14')}
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
          )}

          <OfficialFooter borderClass="border-indigo-100" textMutedClass="text-slate-500" />
        </div>
      );
    }

    // ==========================================
    // 3. HAZARD CAUTION
    // ==========================================
    if (style === 'hazard') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FFFBEB] border-[6px] border-black shadow-xl print:border-[6px] print:shadow-none overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <WatermarkComponent />

          <div className="relative z-10 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-4">
            <div
              className="h-5 w-full border-b-4 border-black"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000, #000 14px, #FBBF24 14px, #FBBF24 28px)',
              }}
            />
            <div className="px-6 sm:px-8 pt-2.5 flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-black text-amber-300 text-xs font-black uppercase rounded">
                PERINGATAN RESMI: {data.categoryTag}
              </span>
              <div className="flex items-center gap-1 text-red-600 font-black text-xs uppercase">
                <AlertTriangle className="w-4 h-4 fill-red-600 text-white" />
                <span>ZONA UJIAN</span>
              </div>
            </div>
          </div>

          {isLandscape ? (
            <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto py-3">
              <div className="col-span-5 flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 bg-amber-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
                  {renderVisualIcon('w-14 h-14 text-black')}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase text-black leading-tight">
                  {data.mainHeadline}
                </h1>
              </div>

              <div className="col-span-7 space-y-3 text-left">
                {data.subHeadline && (
                  <div className="inline-block px-4 py-2 bg-amber-400 text-black border-4 border-black text-2xl font-black uppercase rounded-md shadow-[4px_4px_0px_#000]">
                    {data.subHeadline}
                  </div>
                )}
                {data.bodyNotice && (
                  <div className="p-3.5 bg-black text-amber-300 border-3 border-black rounded-lg shadow-[4px_4px_0px_#F59E0B]">
                    <p className="text-base font-black uppercase leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}
                {data.rulesNote && (
                  <p className="text-xs font-extrabold text-neutral-900 bg-amber-200/80 px-3 py-1 rounded border border-amber-400">
                    {data.rulesNote}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4 space-y-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-400 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
                {renderVisualIcon('w-14 h-14 text-black')}
              </div>

              <div className="space-y-3 max-w-2xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black leading-[1.05]">
                  {data.mainHeadline}
                </h1>
                {data.subHeadline && (
                  <div className="inline-block px-4 py-2 bg-amber-400 text-black border-4 border-black text-2xl sm:text-3xl md:text-4xl font-black uppercase rounded-md shadow-[4px_4px_0px_#000]">
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
          )}

          <div className="relative z-10 -mx-6 sm:-mx-8 mb-3">
            <div
              className="h-3.5 w-full border-t-2 border-b-2 border-black"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000, #000 12px, #FBBF24 12px, #FBBF24 24px)',
              }}
            />
          </div>

          <OfficialFooter borderClass="border-black" textMutedClass="text-neutral-700" />
        </div>
      );
    }

    // ==========================================
    // 4. FORMAL AKADEMIK
    // ==========================================
    if (style === 'classic_academic') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FCFDFE] border-4 border-[#064E3B] shadow-xl print:border-4 print:border-[#064E3B] print:shadow-none overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <WatermarkComponent />
          <div className="absolute inset-2 sm:inset-3 border-2 border-dashed border-[#B45309]/50 pointer-events-none rounded-sm" />

          <div className="relative z-10 border-b-2 border-[#064E3B] pb-2.5 text-center space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#064E3B]">
              PEMERINTAH REPUBLIK INDONESIA • DINAS PENDIDIKAN
            </div>
            <div className="inline-block px-3 py-0.5 bg-[#064E3B] text-amber-200 text-xs font-black uppercase rounded">
              {data.categoryTag}
            </div>
          </div>

          {isLandscape ? (
            <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto py-4">
              <div className="col-span-5 flex flex-col items-center text-center space-y-3">
                <div className="w-24 h-24 rounded-full border-4 border-[#B45309] bg-emerald-50 text-[#064E3B] flex items-center justify-center shadow-md">
                  {renderVisualIcon('w-14 h-14')}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#064E3B] leading-tight font-serif">
                  {data.mainHeadline}
                </h1>
              </div>

              <div className="col-span-7 space-y-3 text-left">
                {data.subHeadline && (
                  <div className="text-2xl sm:text-3xl font-black text-[#B45309] uppercase tracking-wide">
                    {data.subHeadline}
                  </div>
                )}
                {data.bodyNotice && (
                  <div className="p-3.5 bg-emerald-50/70 border-2 border-[#064E3B] rounded-lg">
                    <p className="text-base font-bold uppercase text-[#064E3B] leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}
                {data.rulesNote && (
                  <p className="text-xs font-semibold text-neutral-600 italic">
                    &ldquo;{data.rulesNote}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-5 space-y-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#B45309] bg-emerald-50 text-[#064E3B] flex items-center justify-center shadow-md">
                {renderVisualIcon('w-14 h-14')}
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
          )}

          <OfficialFooter borderClass="border-[#064E3B]" textMutedClass="text-emerald-900" />
        </div>
      );
    }

    // ==========================================
    // 5. RAMAH ANAK CERIA
    // ==========================================
    return (
      <div
        className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FEFCE8] border-[4px] border-teal-800 shadow-xl print:border-[4px] print:border-teal-800 print:shadow-none rounded-[36px] overflow-hidden select-none box-border ${
          isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
        }`}
      >
        <WatermarkComponent />

        <div className="relative z-10 flex items-center justify-between border-b-2 border-teal-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-black uppercase shadow-sm">
              {data.categoryTag}
            </span>
            <span className="text-xs font-bold text-teal-900 uppercase">{data.categorySub}</span>
          </div>
          <span className="px-3 py-1 bg-orange-400 text-white rounded-full text-xs font-black uppercase shadow-sm">
            SEKOLAH RAMAH ANAK
          </span>
        </div>

        {isLandscape ? (
          <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto py-4">
            <div className="col-span-5 flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-lg transform rotate-[-2deg]">
                {renderVisualIcon('w-14 h-14')}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase text-teal-950 leading-tight">
                {data.mainHeadline}
              </h1>
            </div>

            <div className="col-span-7 space-y-3 text-left">
              {data.subHeadline && (
                <div className="inline-block px-5 py-2 bg-orange-500 text-white text-2xl font-black uppercase rounded-2xl shadow-md">
                  {data.subHeadline}
                </div>
              )}
              {data.bodyNotice && (
                <div className="p-3.5 bg-white border-2 border-teal-600 rounded-2xl shadow-sm">
                  <p className="text-base font-bold uppercase text-teal-900 leading-snug">
                    {data.bodyNotice}
                  </p>
                </div>
              )}
              {data.rulesNote && (
                <p className="text-xs font-semibold text-teal-800 leading-relaxed">
                  {data.rulesNote}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-5 space-y-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-lg transform rotate-[-2deg]">
              {renderVisualIcon('w-14 h-14')}
            </div>

            <div className="space-y-2 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-teal-950 leading-tight">
                {data.mainHeadline}
              </h1>
              {data.subHeadline && (
                <div className="inline-block px-5 py-1.5 bg-orange-500 text-white text-2xl sm:text-3xl md:text-4xl font-black uppercase rounded-2xl shadow-md">
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
        )}

        <OfficialFooter borderClass="border-teal-300" textMutedClass="text-teal-800" />
      </div>
    );
  };

  // Compute printable list for bulk or single print
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
    return [
      {
        type: activePosterType || 'quiet',
        roomItem: activePosterType === 'room_name' ? currentRoomItem : undefined,
      },
    ];
  }, [printScope, roomItems, currentRoomItem, activePosterType]);

  // Dynamic CSS injection for print orientation
  const printPageStyle = `
    @media print {
      @page {
        size: A4 ${currentOrientation};
        margin: 0;
      }
    }
  `;

  // =========================================================================
  // VIEW 1: PILIHAN MENU POSTER (DENGAN CONTOH THUMBNAIL NYATA)
  // =========================================================================
  if (!activePosterType) {
    return (
      <div className="space-y-6">
        <style>{printPageStyle}</style>

        {/* Top Header Card */}
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded shadow-xs">
                Modul Cetak Poster A4
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase">
                Gaya Aktif: {STYLE_NAMES[currentStyle]} • Orientasi: {currentOrientation.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-purple-700" />
              Pilih Jenis Poster untuk Dicetak
            </h2>
            <p className="text-xs text-neutral-600 max-w-xl">
              Klik salah satu kotak poster di bawah untuk membuka pratinjau lembar cetak A4 penuh. Desain dan orientasi telah disesuaikan melalui menu Desain Poster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToDesigner && (
              <button
                type="button"
                onClick={onNavigateToDesigner}
                className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Ubah Desain Poster
              </button>
            )}

            <button
              type="button"
              onClick={onBackToMenu}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Menu
            </button>
          </div>
        </div>

        {/* 6 Grid Cards with Live Mini Thumbnails */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {POSTER_TYPES.map((pt) => {
            const Icon = pt.icon;
            return (
              <div
                key={pt.id}
                onClick={() => setActivePosterType(pt.id)}
                className="group bg-white hover:bg-purple-50/40 border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] hover:shadow-[7px_7px_0px_#000] flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 bg-purple-600 text-white rounded-lg border border-black flex items-center justify-center text-xs font-black shadow-xs">
                      #{pt.number}
                    </span>
                    <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded text-[10px] font-black uppercase">
                      {pt.badge}
                    </span>
                  </div>

                  {/* Real Mini Thumbnail Preview */}
                  <div
                    className={`w-full overflow-hidden border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] bg-neutral-100 flex items-center justify-center p-2 relative ${
                      currentOrientation === 'landscape' ? 'h-36' : 'h-48'
                    }`}
                  >
                    <div
                      className="origin-top pointer-events-none select-none"
                      style={{
                        transform: currentOrientation === 'landscape' ? 'scale(0.32)' : 'scale(0.32)',
                        width: currentOrientation === 'landscape' ? '297mm' : '210mm',
                        height: currentOrientation === 'landscape' ? '210mm' : '297mm',
                      }}
                    >
                      {renderSinglePosterA4(pt.id, currentStyle, currentOrientation, currentRoomItem, false)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black uppercase text-neutral-900 group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>{pt.title}</span>
                    </h3>
                    <p className="text-xs font-bold text-neutral-700 mt-1 line-clamp-2">
                      {pt.description}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                      {pt.subtext}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200">
                  <div className="w-full py-2 bg-purple-100 group-hover:bg-purple-200 text-purple-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Buka &amp; Cetak Poster</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk Action Bar */}
        <div className="bg-neutral-900 text-white border-3 border-black rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 text-black border border-black flex items-center justify-center font-black shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-yellow-300">
                Pencetakan Massal Seluruh Paket Poster
              </h4>
              <p className="text-[11px] text-neutral-300">
                Cetak sekaligus 6 jenis poster asesmen lengkap sesuai desain terpilih.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTriggerPrint('all_types')}
            className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            Cetak Paket Lengkap (6 Lembar A4)
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: HALAMAN PREVIEW CETAK SPESIFIK (TANPA PILIHAN DESAIN)
  // =========================================================================
  const currentPosterMeta = POSTER_TYPES.find((pt) => pt.id === activePosterType) || POSTER_TYPES[0];

  return (
    <div className="space-y-6">
      <style>{printPageStyle}</style>

      {/* Top Toolbar (No Design Options Here) */}
      <div className="no-print bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActivePosterType(null)}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-purple-700 hover:underline cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Pilihan Poster
          </button>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
            <currentPosterMeta.icon className="w-5 h-5 text-purple-700" />
            Pratinjau Cetak: {currentPosterMeta.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-neutral-600 font-semibold">
            <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-black text-black uppercase">
              Gaya: {STYLE_NAMES[currentStyle]}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-black text-black uppercase">
              Orientasi: {currentOrientation.toUpperCase()}
            </span>
            {onNavigateToDesigner && (
              <button
                type="button"
                onClick={onNavigateToDesigner}
                className="text-purple-700 hover:underline font-bold ml-2 cursor-pointer"
              >
                (Ubah di Desain Poster)
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActivePosterType(null)}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Pilih Poster Lain
          </button>

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

      {/* Sub-selector for Nama Ruang (Kelas 1 - 6) */}
      {activePosterType === 'room_name' && (
        <div className="no-print bg-purple-50 border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
              <DoorClosed className="w-4 h-4 text-purple-700" />
              Pilih Ruangan Kelas:
            </span>
            <p className="text-[11px] text-neutral-600">
              Total {roomItems.length} ruangan terdata (bebas duplikat dari sheet data_siswa).
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
              Cetak Semua Ruang ({roomItems.length} Lembar A4)
            </button>
          </div>
        </div>
      )}

      {/* On-Screen A4 Sheet Preview */}
      <div className="no-print w-full flex flex-col items-center">
        <A4SheetContainer
          pageNumber={1}
          totalPages={1}
          orientation={currentOrientation}
          marginMm={0}
        >
          {renderSinglePosterA4(
            activePosterType,
            currentStyle,
            currentOrientation,
            currentRoomItem,
            false
          )}
        </A4SheetContainer>
      </div>

      {/* Print-Only Container (Rendered during window.print()) */}
      <div className="hidden print:block print-only-container">
        {printableList.map((item, idx) => (
          <div
            key={`print-poster-${item.type}-${idx}`}
            className="a4-page p-0 m-0 box-border bg-white"
            style={{
              pageBreakAfter: 'always',
              breakAfter: 'page',
              width: currentOrientation === 'landscape' ? '297mm' : '210mm',
              height: currentOrientation === 'landscape' ? '210mm' : '297mm',
              minHeight: currentOrientation === 'landscape' ? '210mm' : '297mm',
            }}
          >
            {renderSinglePosterA4(item.type, currentStyle, currentOrientation, item.roomItem, true)}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <PrintConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmPrint}
        cardType={`Poster ${currentPosterMeta.title} (${currentOrientation.toUpperCase()})`}
        itemCount={printableList.length}
        estimatedSheets={printableList.length}
        orientation={currentOrientation}
      />
    </div>
  );
};
