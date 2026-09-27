import React from 'react';
import { School, Exam, Student } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { QrCodeImage } from '../common/QrCodeImage';
import { CARD_THEMES, getThemeById, resolveThemeStyles, CardThemeItem } from '../../config/cardThemes';

export const DESK_THEMES = CARD_THEMES;

interface DeskCardProps {
  student: Student;
  school: School;
  exam: Exam;
  cardSize?: 'standard' | 'compact';
  orientation?: 'landscape' | 'portrait';
  themeId?: string;
  themeColor?: string; // Kustomisasi warna dasar
  className?: string;
}

export const DeskCard: React.FC<DeskCardProps> = ({
  student,
  school,
  exam,
  cardSize = 'standard',
  orientation = 'landscape',
  themeId = 'neobrutal',
  themeColor,
  className = '',
}) => {
  const isCompact = cardSize === 'compact';
  const isPortrait = orientation === 'portrait';

  const theme: CardThemeItem = getThemeById(themeId);
  const themeStyles = resolveThemeStyles(theme, themeColor);

  const isNeobrutal = theme.id === 'neobrutal';
  const isModern = theme.id === 'modern';
  const isClassic = theme.id === 'classic';
  const isMadrasah = theme.id === 'madrasah';
  const isCyber = theme.id === 'cyber';
  const isRoyal = theme.id === 'royal';
  const isMinimalist = theme.id === 'minimalist';
  const isAurora = theme.id === 'aurora';
  const isVintage = theme.id === 'vintage';
  const isCorporate = theme.id === 'corporate';

  const fontClass = themeStyles.fontFamilyClass;

  // Dimensions: Disesuaikan presisi agar 2 kolom muat sempurna di dalam lembar A4 (lebar 210mm)
  const widthMm = isPortrait ? (isCompact ? 68 : 95) : 95;
  const heightMm = isPortrait ? (isCompact ? 95 : 130) : (isCompact ? 68 : 92);

  const cardBgColor = isCyber ? '#090D16' : isVintage ? '#FFFDF5' : isRoyal ? '#FFFDF9' : '#FFFFFF';
  const effectiveBorderColor = isCyber ? '#0EA5E9' : (themeColor || themeStyles.borderColor);
  const effectiveHeaderBg = themeColor || themeStyles.headerBg;

  // QR Validation Value for Student Data
  const qrValidationValue = `VALIDASI|SISWA|NISN:${student.nisn || '-'}|NAMA:${student.name || '-'}|RUANG:${student.examRoom || '01'}|MEJA:${student.examSeat || '01'}|SEKOLAH:${school?.npsn || ''}`;

  // =========================================================================
  // MODEL POTRAIT UNTUK ID BANGKU
  // =========================================================================
  if (isPortrait) {
    return (
      <div
        style={{
          width: `${widthMm}mm`,
          height: `${heightMm}mm`,
          backgroundColor: cardBgColor,
          borderColor: effectiveBorderColor,
        }}
        className={`relative rounded-2xl p-2.5 flex flex-col justify-between overflow-hidden select-none print-card-item ${fontClass} ${
          isCyber
            ? 'border-2 shadow-[0_0_14px_rgba(14,165,233,0.4)] text-cyan-50'
            : isModern || isAurora
            ? 'border-2 shadow-[0_6px_18px_rgba(0,0,0,0.08)] text-neutral-900'
            : isRoyal
            ? 'border-2 shadow-[0_4px_12px_rgba(180,83,9,0.25)] text-neutral-900'
            : 'border-3 shadow-[4px_4px_0px_#000] text-black'
        } ${className}`}
      >
        {/* KOP SEKOLAH POTRAIT */}
        <div
          style={{ backgroundColor: effectiveHeaderBg, color: themeStyles.headerText }}
          className={`p-1.5 -mx-2.5 -mt-2.5 mb-1.5 flex items-center justify-between gap-1.5 text-center ${
            isCyber
              ? 'border-b-2 border-cyan-500'
              : isClassic || isRoyal
              ? 'border-b-2 border-amber-600'
              : 'border-b-2 border-black'
          }`}
        >
          <SchoolLogo
            url={school?.logoUrl}
            name={school?.name || 'Sekolah'}
            sizeMm={isCompact ? 9 : 11}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className={`text-[9px] font-black uppercase tracking-tight truncate ${isClassic || isRoyal ? 'font-serif text-amber-200' : ''}`}>
              {school?.name || 'KARTU MEJA UJIAN'}
            </div>
            <div className="text-[7.5px] font-extrabold uppercase opacity-90 truncate">
              {exam?.name || 'ASESMEN SEKOLAH'}
            </div>
          </div>
          <div
            style={{ backgroundColor: themeStyles.badgeBg, color: themeStyles.badgeText }}
            className={`shrink-0 border rounded px-1.5 py-0.5 text-[7px] font-black uppercase ${
              isCyber ? 'border-cyan-400 font-mono' : isModern || isAurora ? 'border-teal-300 rounded-full' : 'border-black'
            }`}
          >
            MEJA
          </div>
        </div>

        {/* FOKUS UTAMA: BLOK RUANG UJIAN & NOMOR MEJA JUMBO */}
        <div
          style={{ backgroundColor: themeStyles.bannerBg }}
          className={`text-white p-2.5 flex flex-col items-center justify-center my-0.5 ${
            isCyber
              ? 'border-2 border-cyan-400 rounded shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : isModern || isAurora
              ? 'rounded-2xl border-2 border-teal-400/50 shadow-md'
              : isClassic || isRoyal
              ? 'border-2 border-amber-500 rounded-md shadow-md'
              : isMadrasah
              ? 'border-2 border-amber-500 rounded-xl shadow-md'
              : 'border-3 border-black rounded-xl shadow-[3px_3px_0px_#000]'
          }`}
        >
          {/* RUANG UJIAN DIBESARKAN SEBAGAI FOKUS */}
          <div
            style={{ backgroundColor: themeStyles.badgeBg, color: themeStyles.badgeText }}
            className="px-3 py-0.5 rounded-full border border-current text-[9.5px] uppercase tracking-widest font-black shadow-xs mb-1"
          >
            {student.examRoom || 'RUANG 01'}
          </div>

          {/* NOMOR TEMPAT DUDUK JUMBO SANGAT BESAR */}
          <div className="flex items-baseline justify-center gap-1 my-0.5">
            <span className="text-[11px] uppercase tracking-wider text-neutral-300 font-black">NO.</span>
            <span
              style={{ color: themeStyles.accentColor }}
              className={`text-5xl sm:text-6xl font-black leading-none tracking-tight ${isClassic || isRoyal ? 'font-serif' : 'font-mono'}`}
            >
              {student.examSeat || '01'}
            </span>
          </div>

          <div className="text-[7.5px] font-mono text-neutral-300 font-bold uppercase tracking-wider">
            NOMOR TEMPAT DUDUK PESERTA
          </div>
        </div>

        {/* DATA BIODATA SISWA (DIPERBESAR & LEBIH JELAS MENGISI RUANG KOSONG) */}
        <div className="space-y-2 py-1.5 flex-1 flex flex-col justify-center">
          <div className={`p-2 rounded-xl border text-center ${
            isCyber
              ? 'bg-slate-900/80 border-cyan-500/50'
              : 'bg-neutral-50 border-neutral-300 shadow-xs'
          }`}>
            <div className={`text-[8px] font-black uppercase tracking-wider mb-0.5 ${isCyber ? 'text-cyan-400' : 'text-neutral-500'}`}>
              Nama Peserta Didik
            </div>
            <div className={`text-sm sm:text-base uppercase leading-tight font-black ${isClassic || isRoyal ? 'font-serif text-amber-950' : 'text-neutral-950'}`}>
              {student.name || 'NAMA PESERTA'}
            </div>
          </div>

          <div
            className={`grid grid-cols-2 gap-2 text-center rounded-xl p-2 border ${
              isCyber
                ? 'bg-slate-900 border-slate-800 text-cyan-200'
                : 'bg-white border-neutral-300 text-neutral-800 shadow-xs'
            }`}
          >
            <div>
              <span className="block text-[7.5px] uppercase font-bold text-neutral-500">NISN</span>
              <span className="font-black font-mono text-xs sm:text-sm">{student.nisn || '-'}</span>
            </div>
            <div>
              <span className="block text-[7.5px] uppercase font-bold text-neutral-500">Kelas</span>
              <span className="font-black uppercase text-xs sm:text-sm">{student.className || '-'}</span>
            </div>
          </div>
        </div>

        {/* FOOTER BARIS POTRAIT: QR VALIDASI SISWA */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
          <div className="text-[6.5px] text-neutral-500 italic max-w-[65%] truncate">
            *Tempel kartu di sudut meja ujian
          </div>
          <div className="flex items-center gap-1">
            <div className={`p-0.5 rounded ${isCyber ? 'bg-cyan-950 border border-cyan-400' : 'bg-white border border-black'}`}>
              <QrCodeImage value={qrValidationValue} sizeMm={11} />
            </div>
            <div className="text-[6px] font-mono leading-none">
              <div className="font-bold text-emerald-700">QR</div>
              <div>VALID</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODEL LANSKAP UNTUK ID BANGKU
  // =========================================================================
  return (
    <div
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        backgroundColor: cardBgColor,
        borderColor: effectiveBorderColor,
      }}
      className={`relative rounded-2xl p-3 flex flex-col justify-between overflow-hidden select-none print-card-item ${fontClass} ${
        isCyber
          ? 'border-2 shadow-[0_0_14px_rgba(14,165,233,0.4)] text-cyan-50'
          : isModern || isAurora
          ? 'border-2 shadow-[0_6px_18px_rgba(0,0,0,0.08)] text-neutral-900'
          : isRoyal
          ? 'border-2 shadow-[0_4px_12px_rgba(180,83,9,0.25)] text-neutral-900'
          : 'border-3 shadow-[4px_4px_0px_#000] text-black'
      } ${className}`}
    >
      {/* 1. KOP SEKOLAH & STATUS MEJA */}
      <div
        style={{ backgroundColor: effectiveHeaderBg, color: themeStyles.headerText }}
        className={`p-2 -mx-3 -mt-3 mb-2 flex items-center justify-between gap-2 ${
          isCyber
            ? 'border-b-2 border-cyan-500'
            : isClassic || isRoyal
            ? 'border-b-2 border-amber-600'
            : 'border-b-2 border-black'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <SchoolLogo
            url={school?.logoUrl}
            name={school?.name || 'Sekolah'}
            sizeMm={isCompact ? 9 : 12}
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className={`text-[10px] font-black uppercase tracking-tight truncate ${isClassic || isRoyal ? 'font-serif text-amber-200' : ''}`}>
              {school?.name || 'KARTU TEMPAT DUDUK PESERTA'}
            </div>
            <div className="text-[8px] font-bold uppercase opacity-90 truncate">
              {exam?.name || 'ASESMEN UJIAN SEKOLAH'}
            </div>
          </div>
        </div>

        <div
          style={{ backgroundColor: themeStyles.badgeBg, color: themeStyles.badgeText }}
          className={`shrink-0 border rounded px-2 py-0.5 text-[8px] font-black uppercase ${
            isCyber ? 'border-cyan-400 font-mono' : isModern || isAurora ? 'border-teal-300 rounded-full' : 'border-black'
          }`}
        >
          KARTU MEJA
        </div>
      </div>

      {/* 2. BODY KARTU MEJA: JUMBO SEAT & ROOM HERO + BIODATA + QR */}
      <div className="flex items-center justify-between gap-3 flex-1 min-h-0">
        {/* BLOK NOMOR MEJA & RUANG JUMBO (FOKUS UTAMA) */}
        <div
          style={{ backgroundColor: themeStyles.bannerBg }}
          className={`text-white px-3.5 py-2 flex flex-col items-center justify-center shrink-0 min-w-[105px] sm:min-w-[120px] ${
            isCyber
              ? 'border-2 border-cyan-400 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : isModern || isAurora
              ? 'rounded-2xl border-2 border-teal-400/50 shadow-md'
              : isClassic || isRoyal
              ? 'border-2 border-amber-500 rounded-md shadow-md'
              : isMadrasah
              ? 'border-2 border-amber-500 rounded-xl shadow-md'
              : 'border-3 border-black rounded-xl shadow-[3px_3px_0px_#000]'
          }`}
        >
          {/* RUANG UJIAN BESAR & TEGAS */}
          <div
            style={{ backgroundColor: themeStyles.badgeBg, color: themeStyles.badgeText }}
            className="px-2.5 py-0.5 rounded-full border border-current text-[8.5px] uppercase tracking-wider font-black shadow-xs mb-0.5"
          >
            {student.examRoom || 'RUANG 01'}
          </div>

          {/* NOMOR MEJA JUMBO GIGANTIS */}
          <div className="flex items-baseline justify-center gap-1 my-0.5">
            <span className="text-[11px] uppercase tracking-wider text-neutral-300 font-black">NO.</span>
            <span
              style={{ color: themeStyles.accentColor }}
              className={`text-5xl sm:text-6xl font-black leading-none tracking-tight ${isClassic || isRoyal ? 'font-serif' : 'font-mono'}`}
            >
              {student.examSeat || '01'}
            </span>
          </div>

          <div className="text-[7px] font-mono text-neutral-300 font-bold uppercase tracking-wider">
            NOMOR TEMPAT DUDUK
          </div>
        </div>

        {/* DETAIL BIODATA SISWA (DIPERBESAR & LEBIH JELAS MENGISI RUANG KOSONG) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 px-1">
          <div className={`p-2 rounded-xl border ${
            isCyber
              ? 'bg-slate-900/90 border-cyan-500/50'
              : isModern || isAurora
              ? 'bg-teal-50/70 border-teal-200'
              : isClassic || isRoyal
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-neutral-50 border-neutral-300 shadow-xs'
          }`}>
            <div className={`text-[8.5px] uppercase font-black tracking-wider mb-0.5 ${isCyber ? 'text-cyan-400' : 'text-neutral-500'}`}>
              Nama Peserta Didik:
            </div>
            <div
              className={`font-black uppercase leading-tight tracking-tight break-words line-clamp-2 ${
                isClassic || isRoyal ? 'font-serif text-amber-950' : isCyber ? 'text-cyan-100 font-mono' : 'text-neutral-950'
              } ${(student.name || '').length > 25 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}
              title={student.name}
            >
              {student.name || 'NAMA PESERTA DIDIK'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2 rounded-xl border flex flex-col justify-center ${
              isCyber
                ? 'bg-slate-900/60 border-slate-700'
                : 'bg-white border-neutral-300 shadow-xs'
            }`}>
              <span className={`text-[8px] uppercase font-black tracking-wider ${isCyber ? 'text-cyan-400' : 'text-neutral-500'}`}>
                NISN
              </span>
              <span className={`text-xs sm:text-sm font-black font-mono tracking-wide ${isCyber ? 'text-white' : 'text-neutral-900'}`}>
                {student.nisn || '-'}
              </span>
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-center ${
              isCyber
                ? 'bg-slate-900/60 border-slate-700'
                : 'bg-white border-neutral-300 shadow-xs'
            }`}>
              <span className={`text-[8px] uppercase font-black tracking-wider ${isCyber ? 'text-cyan-400' : 'text-neutral-500'}`}>
                Kelas
              </span>
              <span className={`text-xs sm:text-sm font-black uppercase ${isCyber ? 'text-white' : 'text-neutral-900'}`}>
                {student.className || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* QR CODE VALIDASI DATA SISWA */}
        <div className="shrink-0 flex flex-col items-center justify-center pl-2.5 border-l border-neutral-200">
          <div className={`p-0.5 rounded ${isCyber ? 'bg-cyan-950 border border-cyan-400' : 'bg-white border border-black'}`}>
            <QrCodeImage value={qrValidationValue} sizeMm={isCompact ? 14 : 17} />
          </div>
          <span className={`text-[6.5px] font-mono font-bold mt-1 uppercase ${isCyber ? 'text-cyan-300' : 'text-emerald-700'}`}>
            QR VALIDASI
          </span>
        </div>
      </div>

      {/* 3. FOOTER CATATAN */}
      <div
        className={`pt-1 border-t flex items-center justify-between text-[7px] text-neutral-500 shrink-0 ${
          isCyber ? 'border-slate-800 text-cyan-400' : 'border-neutral-200'
        }`}
      >
        <span className="italic">*Tempel kartu ini di sudut kanan atas meja peserta ujian</span>
        <span className="font-mono font-bold">
          {student.examRoom || 'Ruang 01'} • Meja {student.examSeat || '01'}
        </span>
      </div>
    </div>
  );
};
