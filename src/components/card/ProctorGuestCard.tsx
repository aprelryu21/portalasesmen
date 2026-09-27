import React from 'react';
import { School, Exam, Teacher, GuestCardData, Gender } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { GenderAvatar } from '../common/GenderAvatar';
import { QrCodeImage } from '../common/QrCodeImage';
import { CARD_THEMES, getThemeById, resolveThemeStyles, CardThemeItem } from '../../config/cardThemes';

export type CardThemeId = string;
export const PROCTOR_GUEST_THEMES = CARD_THEMES;

interface ProctorGuestCardProps {
  type: 'proctor' | 'guest';
  themeId?: CardThemeId;
  themeColor?: string; // Kustomisasi warna dasar
  orientation?: 'portrait' | 'landscape';
  school: School;
  exam: Exam;
  teacher?: Teacher;
  guestData?: GuestCardData;
  showLanyard?: boolean;
  roleBadgeText?: string;
  className?: string;
}

export const ProctorGuestCard: React.FC<ProctorGuestCardProps> = ({
  type,
  themeId = 'neobrutal',
  themeColor,
  orientation = 'portrait',
  school,
  exam,
  teacher,
  guestData,
  showLanyard = true,
  roleBadgeText,
  className = '',
}) => {
  const isProctor = type === 'proctor';
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

  // Card Dimensions (in mm): Disesuaikan presisi agar 6 kartu (2 kolom x 3 baris) muat sempurna di dalam lembar A4 (210 x 297mm)
  const widthMm = isPortrait ? 68 : 95;
  const heightMm = isPortrait ? 90 : 66;

  // Person Data normalization
  const personName = isProctor
    ? teacher?.name || 'NAMA PENGAWAS RUANG'
    : guestData?.name || 'NAMA TAMU & MONEV';

  const personNip = isProctor
    ? teacher?.nip || '-'
    : guestData?.nip || '-';

  const personGender: Gender = isProctor
    ? teacher?.gender || 'L'
    : guestData?.gender || 'L';

  const personPhoto = isProctor ? teacher?.photoUrl : guestData?.photoUrl;

  const personRoleOrAgency = isProctor
    ? teacher?.subject || 'Guru Pengawas'
    : guestData?.position || 'Instansi / Dinas Pendidikan';

  const personDutyOrAccess = isProctor
    ? teacher?.roomDuty || 'Ruang 01'
    : guestData?.label || 'Akses Seluruh Ruangan';

  const badgeText =
    roleBadgeText ||
    (isProctor
      ? teacher?.roleType === 'panitia'
        ? '★ PANITIA UJIAN SEKOLAH ★'
        : '★ PENGAWAS RUANG UJIAN ★'
      : guestData?.label || '★ TAMU / MONEV UJIAN ★');

  const qrValue = isProctor
    ? `PENGAWAS|NIP:${personNip}|NAMA:${personName}|SEKOLAH:${school?.npsn || '0000'}|TUGAS:${personDutyOrAccess}`
    : `TAMU|NIP:${personNip}|NAMA:${personName}|INSTANSI:${personRoleOrAgency}|STATUS:${personDutyOrAccess}`;

  // Render Theme-Specific Distinct Photo Frame
  const renderPhotoFrame = (widthPx: number, heightPx: number) => {
    const photoContent = (
      <>
        {personPhoto && personPhoto.trim().length > 0 ? (
          <img
            src={personPhoto}
            alt={personName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <GenderAvatar
            gender={personGender}
            religion={teacher?.religion}
            isAdult={true}
            role={isProctor ? 'teacher' : 'guest'}
            className="w-full h-full"
          />
        )}
      </>
    );

    // 1. Neobrutal: Chunky 3px black border + drop shadow + tag
    if (isNeobrutal) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="relative shrink-0 border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] overflow-hidden bg-yellow-100 flex items-center justify-center"
        >
          {photoContent}
          <div className="absolute top-0 right-0 bg-black text-yellow-300 font-mono text-[6px] font-black px-1 leading-tight uppercase border-b border-l border-black">
            {isProctor ? 'PENGAWAS' : 'TAMU VIP'}
          </div>
        </div>
      );
    }

    // 2. Modern: Dual-ring halo teal gradient
    if (isModern) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 p-0.5 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-300 to-emerald-400 shadow-sm flex items-center justify-center ring-2 ring-teal-100"
        >
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-white border border-white flex items-center justify-center">
            {photoContent}
          </div>
        </div>
      );
    }

    // 3. Classic: Formal double-border gold & navy
    if (isClassic) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 p-1 border-2 border-slate-900 bg-amber-50/80 shadow-xs flex items-center justify-center"
        >
          <div className="w-full h-full border border-amber-600/90 overflow-hidden flex items-center justify-center bg-white shadow-inner">
            {photoContent}
          </div>
        </div>
      );
    }

    // 4. Madrasah: Arched dome mihrab top
    if (isMadrasah) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 p-1 rounded-t-full rounded-b-md border-2 border-emerald-700 bg-amber-50/70 shadow-xs flex items-center justify-center"
        >
          <div className="w-full h-full rounded-t-full rounded-b-sm overflow-hidden border border-amber-500/80 flex items-center justify-center bg-white">
            {photoContent}
          </div>
        </div>
      );
    }

    // 5. Cyber: Dark HUD chamfered tech corners
    if (isCyber) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="relative shrink-0 p-1 bg-slate-950 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.45)] flex items-center justify-center overflow-visible"
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
          <div className="w-full h-full overflow-hidden bg-slate-900 border border-cyan-500/50 flex items-center justify-center">
            {photoContent}
          </div>
        </div>
      );
    }

    // 6. Royal: Luxury octagonal gold beveled
    if (isRoyal) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 p-1 border-2 border-amber-600 bg-gradient-to-b from-amber-100 to-amber-200/60 shadow-md flex items-center justify-center rounded-lg"
        >
          <div className="w-full h-full border border-amber-500 rounded overflow-hidden flex items-center justify-center bg-white">
            {photoContent}
          </div>
        </div>
      );
    }

    // 7. Minimalist: Clean square Scandinavian studio
    if (isMinimalist) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 border border-slate-400 bg-white p-0.5 shadow-xs flex flex-col items-center justify-between"
        >
          <div className="w-full flex-1 overflow-hidden bg-slate-50 flex items-center justify-center">
            {photoContent}
          </div>
          <div className="w-full text-center bg-slate-800 text-white font-mono text-[5.5px] uppercase font-bold py-0.5">
            {isProctor ? 'ID-GURU' : 'ID-TAMU'}
          </div>
        </div>
      );
    }

    // 8. Aurora: Modern rounded with glowing purple/pink gradient
    if (isAurora) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 p-0.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-400 to-pink-500 shadow-md flex items-center justify-center ring-2 ring-purple-100"
        >
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-white flex items-center justify-center">
            {photoContent}
          </div>
        </div>
      );
    }

    // 9. Vintage: Stitched dashed border
    if (isVintage) {
      return (
        <div
          style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
          className="shrink-0 p-1 border-2 border-dashed border-amber-800 bg-[#FEF9C3]/50 shadow-xs flex items-center justify-center rounded"
        >
          <div className="w-full h-full border border-amber-700/60 overflow-hidden flex items-center justify-center bg-white">
            {photoContent}
          </div>
        </div>
      );
    }

    // 10. Corporate: Executive ID clip frame with barcode
    return (
      <div
        style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
        className="shrink-0 border-2 border-sky-700 rounded-md bg-white p-0.5 shadow-sm flex flex-col items-center justify-between"
      >
        <div className="w-full flex-1 overflow-hidden bg-sky-50 flex items-center justify-center rounded-sm">
          {photoContent}
        </div>
        <div className="w-full bg-sky-900 text-sky-100 text-[5px] font-mono text-center uppercase tracking-widest py-0.2">
          {isProctor ? 'OFFICIAL PROCTOR' : 'OFFICIAL GUEST'}
        </div>
      </div>
    );
  };

  // Base background & border colors
  const cardBgColor = isCyber ? '#090D16' : isVintage ? '#FFFDF5' : isRoyal ? '#FFFDF9' : '#FFFFFF';
  const effectiveBorderColor = isCyber ? '#0EA5E9' : (themeColor || themeStyles.borderColor);
  const effectiveHeaderBg = themeColor || themeStyles.headerBg;

  // =========================================================================
  // MODEL POTRAIT: TAMPILAN ID CARD VERTIKAL LANYARD
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
        className={`relative rounded-2xl flex flex-col justify-between overflow-hidden select-none print-card-item ${fontClass} ${
          isCyber
            ? 'border-2 shadow-[0_0_14px_rgba(14,165,233,0.4)] text-cyan-50'
            : isModern || isAurora
            ? 'border-2 shadow-[0_6px_18px_rgba(0,0,0,0.08)] text-neutral-900'
            : isRoyal
            ? 'border-2 shadow-[0_4px_12px_rgba(180,83,9,0.25)] text-neutral-900'
            : 'border-3 shadow-[4px_4px_0px_#000] text-black'
        } ${className}`}
      >
        {/* LUBANG TALI LANYARD (Slot Punch Hole) */}
        {showLanyard && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
            <div
              style={{ borderColor: isCyber ? '#06B6D4' : '#111111' }}
              className="w-10 h-2 bg-neutral-200/90 rounded-full border border-black/40 flex items-center justify-center shadow-inner"
            >
              <div className="w-6 h-1 bg-black/70 rounded-full" />
            </div>
          </div>
        )}

        {/* 1. KOP HEADER ID CARD */}
        <div
          style={{ backgroundColor: effectiveHeaderBg, color: themeStyles.headerText }}
          className={`pt-3.5 pb-2 px-2.5 text-center relative ${
            isCyber
              ? 'border-b-2 border-cyan-500'
              : isClassic || isRoyal
              ? 'border-b-2 border-amber-600'
              : 'border-b-2 border-black'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <SchoolLogo
              url={school?.logoUrl}
              name={school?.name || 'Sekolah'}
              sizeMm={10}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div
                className={`text-[9px] font-black uppercase tracking-tight truncate leading-tight ${
                  isClassic || isRoyal ? 'font-serif text-amber-200' : ''
                }`}
              >
                {school?.name || 'LEMBAGA PENDIDIKAN'}
              </div>
              <div className="text-[7.5px] font-extrabold uppercase opacity-95 truncate">
                {exam?.name || 'ASESMEN UJIAN SEKOLAH'}
              </div>
            </div>
          </div>

          {/* BADGE BESAR JABATAN / PERAN */}
          <div
            style={{ backgroundColor: themeStyles.badgeBg, color: themeStyles.badgeText }}
            className={`mt-1 py-0.5 px-2 rounded-full border text-[7.5px] font-black uppercase tracking-wider mx-auto inline-block shadow-sm ${
              isCyber
                ? 'border-cyan-400 font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : isModern || isAurora
                ? 'border-teal-300'
                : isClassic || isRoyal
                ? 'border-amber-600 font-serif'
                : 'border-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            {badgeText}
          </div>
        </div>

        {/* 2. BODY TENGAH: FOTO BESAR & BIODATA */}
        <div className="flex-1 px-3 py-1 flex flex-col items-center justify-between min-h-0">
          {/* FOTO PROKTOR / GUEST */}
          <div className="my-1 shrink-0">
            {renderPhotoFrame(80, 96)}
          </div>

          {/* NAMA LENGKAP & NIP */}
          <div className="w-full text-center px-1">
            <div
              className={`text-[12px] font-black uppercase leading-tight truncate ${
                isClassic || isRoyal
                  ? 'font-serif text-slate-900 tracking-wide'
                  : isCyber
                  ? 'font-mono text-cyan-200'
                  : 'text-neutral-900'
              }`}
              title={personName}
            >
              {personName}
            </div>

            <div className="text-[8px] font-mono font-bold text-neutral-600 mt-0.5">
              NIP: <span className={isCyber ? 'text-cyan-300' : 'text-neutral-900'}>{personNip}</span>
            </div>
          </div>

          {/* KOTAK INFORMASI PENUGASAN */}
          <div
            style={{ backgroundColor: themeStyles.bannerBg }}
            className={`w-full text-white p-1.5 rounded-xl text-center shrink-0 my-1 ${
              isCyber
                ? 'border border-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.3)]'
                : isModern || isAurora
                ? 'border border-teal-400/40 rounded-2xl'
                : isClassic || isRoyal
                ? 'border-2 border-amber-600/80 rounded-sm'
                : 'border-2 border-black shadow-[2px_2px_0px_#000]'
            }`}
          >
            <div className="text-[7px] uppercase font-bold tracking-wider opacity-85">
              {isProctor ? 'TUGAS / RUANG UJIAN:' : 'JABATAN / INSTANSI:'}
            </div>
            <div className="text-[10px] font-black uppercase truncate mt-0.5">
              {isProctor ? `${personRoleOrAgency} • ${personDutyOrAccess}` : personRoleOrAgency}
            </div>
          </div>
        </div>

        {/* 3. FOOTER: QR VALIDASI PENGAWAS / TAMU */}
        <div
          className={`px-3 py-1.5 border-t flex items-center justify-between text-[7px] shrink-0 ${
            isCyber ? 'border-slate-800 text-cyan-400' : 'border-neutral-200 text-neutral-600'
          }`}
        >
          <div className="min-w-0 pr-1 leading-tight">
            <div className="font-bold uppercase truncate">
              {isProctor ? 'Tanda Pengenal Resmi' : 'Izin Monitoring Asesmen'}
            </div>
            <div className="text-[6px] opacity-75 font-mono">
              {exam?.semester || '2026/2027'} • Berlaku Selama Ujian
            </div>
          </div>

          <div
            className={`p-0.5 rounded shrink-0 ${
              isCyber
                ? 'bg-slate-900 border border-cyan-400'
                : isClassic || isRoyal
                ? 'bg-white border border-amber-700'
                : 'bg-white border border-black'
            }`}
          >
            <QrCodeImage value={qrValue} sizeMm={11} />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODEL LANSKAP: TAMPILAN ID CARD HORIZONTAL
  // =========================================================================
  return (
    <div
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        backgroundColor: cardBgColor,
        borderColor: effectiveBorderColor,
      }}
      className={`relative rounded-2xl flex flex-col justify-between overflow-hidden select-none print-card-item ${fontClass} ${
        isCyber
          ? 'border-2 shadow-[0_0_14px_rgba(14,165,233,0.4)] text-cyan-50'
          : isModern || isAurora
          ? 'border-2 shadow-[0_6px_18px_rgba(0,0,0,0.08)] text-neutral-900'
          : isRoyal
          ? 'border-2 shadow-[0_4px_12px_rgba(180,83,9,0.25)] text-neutral-900'
          : 'border-3 shadow-[4px_4px_0px_#000] text-black'
      } ${className}`}
    >
      {/* 1. KOP HEADER LANSKAP */}
      <div
        style={{ backgroundColor: effectiveHeaderBg, color: themeStyles.headerText }}
        className={`px-3 py-1.5 flex items-center justify-between gap-2 shrink-0 ${
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
            sizeMm={11}
            className="shrink-0"
          />
          <div className="min-w-0">
            <div
              className={`text-[9.5px] font-black uppercase tracking-tight truncate leading-tight ${
                isClassic || isRoyal ? 'font-serif text-amber-200' : ''
              }`}
            >
              {school?.name || 'LEMBAGA PENDIDIKAN'}
            </div>
            <div className="text-[7.5px] font-extrabold uppercase opacity-95 truncate">
              {exam?.name || 'ASESMEN UJIAN SEKOLAH'}
            </div>
          </div>
        </div>

        {/* BADGE PERAN */}
        <div
          style={{ backgroundColor: themeStyles.badgeBg, color: themeStyles.badgeText }}
          className={`py-0.5 px-2 rounded-full border text-[7.5px] font-black uppercase tracking-wider shrink-0 shadow-sm ${
            isCyber
              ? 'border-cyan-400 font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : isModern || isAurora
              ? 'border-teal-300'
              : isClassic || isRoyal
              ? 'border-amber-600 font-serif'
              : 'border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          {badgeText}
        </div>
      </div>

      {/* 2. BODY LANSKAP: FOTO, BIODATA, QR */}
      <div className="flex-1 px-3 py-1.5 flex items-center justify-between gap-3 min-h-0">
        {/* FOTO */}
        <div className="shrink-0">
          {renderPhotoFrame(72, 88)}
        </div>

        {/* BIODATA */}
        <div className="flex-1 min-w-0 space-y-1">
          <div>
            <div className="text-[6.5px] uppercase font-bold text-neutral-500">
              {isProctor ? 'Nama Pengawas Ruang' : 'Nama Tamu / Monev'}
            </div>
            <div
              className={`text-[12px] font-black uppercase leading-tight truncate ${
                isClassic || isRoyal
                  ? 'font-serif text-slate-900 tracking-wide'
                  : isCyber
                  ? 'font-mono text-cyan-200'
                  : 'text-neutral-900'
              }`}
              title={personName}
            >
              {personName}
            </div>
          </div>

          <div className="text-[8px] font-mono">
            <span className="text-neutral-500 font-bold">NIP:</span>{' '}
            <span className={`font-black ${isCyber ? 'text-cyan-300' : 'text-neutral-900'}`}>
              {personNip}
            </span>
          </div>

          {/* KOTAK PENUGASAN */}
          <div
            style={{ backgroundColor: themeStyles.bannerBg }}
            className={`text-white p-1.5 rounded-lg text-left ${
              isCyber
                ? 'border border-cyan-400'
                : isModern || isAurora
                ? 'border border-teal-400/40 rounded-xl'
                : isClassic || isRoyal
                ? 'border border-amber-600 rounded-sm'
                : 'border border-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            <div className="text-[6.5px] uppercase font-bold opacity-80">
              {isProctor ? 'Tugas / Ruang Ujian:' : 'Jabatan / Instansi:'}
            </div>
            <div className="text-[9px] font-black uppercase truncate">
              {isProctor ? `${personRoleOrAgency} • ${personDutyOrAccess}` : personRoleOrAgency}
            </div>
          </div>
        </div>

        {/* QR VALIDASI */}
        <div className="shrink-0 flex flex-col items-center justify-center pl-2 border-l border-neutral-200">
          <div
            className={`p-0.5 rounded ${
              isCyber
                ? 'bg-slate-900 border border-cyan-400'
                : isClassic || isRoyal
                ? 'bg-white border border-amber-700'
                : 'bg-white border border-black'
            }`}
          >
            <QrCodeImage value={qrValue} sizeMm={13} />
          </div>
          <span className="text-[6px] font-mono mt-0.5 text-neutral-500 font-bold">
            VALIDASI
          </span>
        </div>
      </div>

      {/* 3. FOOTER LANSKAP */}
      <div
        className={`px-3 py-1 border-t flex items-center justify-between text-[6.5px] shrink-0 ${
          isCyber ? 'border-slate-800 text-cyan-400' : 'border-neutral-200 text-neutral-600'
        }`}
      >
        <span className="italic">*Wajib dikalungkan / dikenakan selama kegiatan ujian berlangsung</span>
        <span className="font-mono font-bold">{exam?.academicYear || '2026/2027'}</span>
      </div>
    </div>
  );
};
