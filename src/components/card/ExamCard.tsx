import React from 'react';
import { School, Exam, Student, CardDesignSettings } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { GenderAvatar } from '../common/GenderAvatar';
import { QrCodeImage } from '../common/QrCodeImage';
import { getThemeById, resolveThemeStyles } from '../../config/cardThemes';

const DEFAULT_STUDENT_PREVIEW: Student = {
  id: 'preview',
  name: 'NAMA PESERTA DIDIK',
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

const DEFAULT_SCHOOL_PREVIEW: School = {
  id: 'sch_preview',
  name: 'SEKOLAH CONTOH',
  npsn: '20512345',
  nss: '',
  address: '',
  village: '',
  district: '',
  regency: '',
  province: '',
  logoUrl: '',
  principalName: 'KEPALA SEKOLAH, S.Pd., M.M.',
  principalNip: '19750810 200003 1 005',
  headTitle: 'Kepala Sekolah',
};

const DEFAULT_EXAM_PREVIEW: Exam = {
  id: '',
  name: '',
  semester: '',
  academicYear: '',
  dateText: '',
  location: '',
  extraNote: '',
};

interface ExamCardProps {
  student?: Student;
  school?: School;
  exam?: Exam;
  design: CardDesignSettings;
  scale?: number;
  className?: string;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  student,
  school,
  exam,
  design,
  scale = 1,
  className = '',
}) => {
  const safeStudent = student || DEFAULT_STUDENT_PREVIEW;
  const safeSchool = school || DEFAULT_SCHOOL_PREVIEW;
  const safeExam = exam || DEFAULT_EXAM_PREVIEW;

  const studentName = safeStudent.name || 'NAMA PESERTA DIDIK';
  const nameLength = studentName.length;

  const formattedBirthDate = React.useMemo(() => {
    if (!safeStudent.birthDate) return '';
    try {
      const d = new Date(safeStudent.birthDate);
      if (isNaN(d.getTime())) return safeStudent.birthDate;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return safeStudent.birthDate;
    }
  }, [safeStudent.birthDate]);

  const isPortrait = design.cardOrientation === 'portrait';
  const widthMm = isPortrait ? Math.min(design.widthMm, design.heightMm) : Math.max(design.widthMm, design.heightMm);
  const heightMm = isPortrait ? Math.max(design.widthMm, design.heightMm) : Math.min(design.widthMm, design.heightMm);

  const effectiveSignDate =
    safeExam.signatureDate && safeExam.signatureDate.trim().length > 0
      ? safeExam.signatureDate.trim()
      : safeExam.dateText
      ? safeExam.dateText.split('-')[0].trim()
      : '2026';

  // 10 Distinct Themes System
  const theme = getThemeById(design.templatePreset);
  const customBaseColor = design.themeBaseColor;
  const themeStyles = resolveThemeStyles(theme, customBaseColor);

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
  const cardBgColor = isCyber ? '#090D16' : isVintage ? '#FFFDF5' : isRoyal ? '#FFFDF9' : design.cardBgColor || '#FFFFFF';
  const textColorClass = isCyber ? 'text-cyan-50' : 'text-neutral-900';

  const containerStyle: React.CSSProperties = {
    width: `${widthMm}mm`,
    height: `${heightMm}mm`,
    backgroundColor: cardBgColor,
    borderColor: isCyber ? '#0EA5E9' : design.showBorder ? (customBaseColor || themeStyles.borderColor) : 'transparent',
    borderWidth: design.showBorder ? `${design.borderWidthPx || 2}px` : 0,
    borderRadius: isCyber ? '4px' : isClassic ? '3px' : `${design.borderRadiusPx || 8}px`,
    boxShadow: design.showShadow
      ? isCyber
        ? '0 0 14px rgba(14, 165, 233, 0.4)'
        : isModern || isAurora
        ? '0 6px 18px rgba(0, 0, 0, 0.08)'
        : isRoyal
        ? '0 4px 12px rgba(180, 83, 9, 0.25)'
        : `3px 3px 0px ${design.shadowColor || '#000000'}`
      : 'none',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };

  // Helper for Theme-Specific Distinct Photo Frame
  const renderPhotoFrame = (width: number, height: number) => {
    const photoContent = (
      <>
        {safeStudent.photoUrl && safeStudent.photoUrl.trim().length > 0 ? (
          <img
            src={safeStudent.photoUrl}
            alt={studentName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <GenderAvatar
            gender={safeStudent.gender || 'L'}
            religion={safeStudent.religion}
            shape={design.photoShape}
            className="w-full h-full"
          />
        )}
      </>
    );

    // 1. NEOBRUTAL: Chunky 3px black border + hard drop shadow + PESERTA corner tag
    if (isNeobrutal) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="relative shrink-0 border-3 border-black rounded-lg shadow-[3px_3px_0px_#000] overflow-hidden bg-yellow-100 flex items-center justify-center"
        >
          {photoContent}
          <div className="absolute top-0 right-0 bg-black text-yellow-300 font-mono text-[6px] font-black px-1 leading-tight uppercase border-b border-l border-black">
            PESERTA
          </div>
        </div>
      );
    }

    // 2. MODERN: Dual-ring halo gradient frame with rounded squircle
    if (isModern) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 p-0.5 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-300 to-emerald-400 shadow-sm flex items-center justify-center ring-2 ring-teal-100"
        >
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-white border border-white flex items-center justify-center">
            {photoContent}
          </div>
        </div>
      );
    }

    // 3. CLASSIC: Ornate traditional double-line gold & navy academic border
    if (isClassic) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 p-1 border-2 border-slate-900 bg-amber-50/80 shadow-xs flex items-center justify-center"
        >
          <div className="w-full h-full border border-amber-600/90 overflow-hidden flex items-center justify-center bg-white shadow-inner">
            {photoContent}
          </div>
        </div>
      );
    }

    // 4. MADRASAH: Arched dome / mihrab silhouette with emerald and gold frame
    if (isMadrasah) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 p-1 rounded-t-full rounded-b-md border-2 border-emerald-700 bg-amber-50/70 shadow-xs flex items-center justify-center"
        >
          <div className="w-full h-full rounded-t-full rounded-b-sm overflow-hidden border border-amber-500/80 flex items-center justify-center bg-white">
            {photoContent}
          </div>
        </div>
      );
    }

    // 5. CYBER: Tech HUD chamfered corner brackets with cyan glowing border
    if (isCyber) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
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

    // 6. ROYAL: Octagonal luxury gold beveled frame
    if (isRoyal) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 p-1 border-2 border-amber-600 bg-gradient-to-b from-amber-100 to-amber-200/60 shadow-md flex items-center justify-center rounded-lg"
        >
          <div className="w-full h-full border border-amber-500 rounded overflow-hidden flex items-center justify-center bg-white">
            {photoContent}
          </div>
        </div>
      );
    }

    // 7. MINIMALIST: Scandinavian studio square frame with ID tag
    if (isMinimalist) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 border border-slate-400 bg-white p-0.5 shadow-xs flex flex-col items-center justify-between"
        >
          <div className="w-full flex-1 overflow-hidden bg-slate-50 flex items-center justify-center">
            {photoContent}
          </div>
          <div className="w-full text-center bg-slate-800 text-white font-mono text-[5.5px] uppercase font-bold py-0.5">
            ID-SISWA
          </div>
        </div>
      );
    }

    // 8. AURORA: Modern organic rounded frame with glowing gradient border
    if (isAurora) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 p-0.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-400 to-pink-500 shadow-md flex items-center justify-center ring-2 ring-purple-100"
        >
          <div className="w-full h-full rounded-[14px] overflow-hidden bg-white flex items-center justify-center">
            {photoContent}
          </div>
        </div>
      );
    }

    // 9. VINTAGE: Stitched dashed border with warm retro feel
    if (isVintage) {
      return (
        <div
          style={{ width: `${width}mm`, height: `${height}mm` }}
          className="shrink-0 p-1 border-2 border-dashed border-amber-800 bg-[#FEF9C3]/50 shadow-xs flex items-center justify-center rounded"
        >
          <div className="w-full h-full border border-amber-700/60 overflow-hidden flex items-center justify-center bg-white">
            {photoContent}
          </div>
        </div>
      );
    }

    // 10. CORPORATE: Executive ID badge frame with bottom security line
    return (
      <div
        style={{ width: `${width}mm`, height: `${height}mm` }}
        className="shrink-0 border-2 border-sky-700 rounded-md bg-white p-0.5 shadow-sm flex flex-col items-center justify-between"
      >
        <div className="w-full flex-1 overflow-hidden bg-sky-50 flex items-center justify-center rounded-sm">
          {photoContent}
        </div>
        <div className="w-full bg-sky-900 text-sky-100 text-[5px] font-mono text-center uppercase tracking-widest py-0.2">
          OFFICIAL ID
        </div>
      </div>
    );
  };

  // Header background computation
  const effectiveHeaderBg = customBaseColor || (isCyber ? '#0A1120' : design.headerBgColor || themeStyles.headerBg);
  const effectiveHeaderText = isCyber ? '#38BDF8' : isRoyal ? '#FDE68A' : design.headerTextColor || themeStyles.headerText;

  // =========================================================================
  // 1. TAMPILAN ID SISWA: MODEL POTRAIT (VERTIKAL)
  // =========================================================================
  if (isPortrait) {
    return (
      <div
        style={containerStyle}
        className={`relative flex flex-col justify-between overflow-hidden select-none print-card-item ${fontClass} ${textColorClass} ${className}`}
      >
        {/* HEADER POTRAIT */}
        <div
          style={{
            backgroundColor: effectiveHeaderBg,
            color: effectiveHeaderText,
            borderBottom: isCyber
              ? '2px solid #0EA5E9'
              : isClassic
              ? '2px double #D97706'
              : isMadrasah
              ? '2px solid #F59E0B'
              : isRoyal
              ? '2px solid #F59E0B'
              : design.showBorder
              ? `${Math.min(design.borderWidthPx || 2, 2)}px solid #111`
              : 'none',
          }}
          className="px-2.5 py-1.5 flex items-center gap-2 shrink-0 relative"
        >
          {isCyber && (
            <div className="absolute top-1 right-2 text-[6.5px] font-mono text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              ONLINE
            </div>
          )}

          {design.showLogo && (
            <SchoolLogo
              url={safeSchool.logoUrl}
              name={safeSchool.name || 'Sekolah'}
              sizeMm={Math.min(design.logoSizeMm, 11)}
              className="shrink-0"
            />
          )}

          <div className="flex-1 min-w-0 text-center">
            {design.showSchoolName && (
              <div
                className={`text-[9px] font-black uppercase tracking-tight leading-tight truncate ${
                  isClassic || isRoyal ? 'font-serif tracking-wider text-amber-200' : ''
                }`}
              >
                {safeSchool.name || 'NAMA SEKOLAH'}
              </div>
            )}
            {design.showExamName && (
              <div
                className={`text-[8px] font-extrabold uppercase leading-tight truncate opacity-95 ${
                  isMadrasah ? 'text-amber-300 font-semibold' : ''
                }`}
              >
                {safeExam.name || 'KARTU PESERTA UJIAN'}
              </div>
            )}
            <div className="flex items-center justify-center gap-1.5 text-[6.5px] font-medium leading-none opacity-85 mt-0.5">
              {design.showSemesterYear && <span>{safeExam.academicYear || '2026/2027'}</span>}
              {design.showNpsn && safeSchool.npsn && (
                <span className="font-mono font-semibold">• NPSN: {safeSchool.npsn}</span>
              )}
            </div>
          </div>
        </div>

        {/* BODY POTRAIT: KOMPOSISI SEIMBANG & TIDAK TERPOTONG */}
        <div className="flex-1 px-2.5 py-1.5 flex flex-col justify-between min-h-0">
          {/* BARIS ATAS: FOTO DI KIRI & NAMA/KELAS/RUANG DI KANAN */}
          <div className="flex items-center gap-2.5 shrink-0">
            {design.showPhoto && (
              <div className="shrink-0">
                {renderPhotoFrame(21, 26)}
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              {design.showStudentName !== false && (
                <div
                  className={`uppercase font-black leading-tight line-clamp-2 ${
                    isClassic || isRoyal
                      ? 'font-serif text-slate-900 tracking-wide text-[10.5px]'
                      : isCyber
                      ? 'font-mono text-cyan-200 tracking-tight text-[10.5px]'
                      : 'text-neutral-900 text-[10.5px]'
                  }`}
                  title={studentName}
                >
                  {studentName}
                </div>
              )}

              {design.showClass && (
                <div>
                  <span
                    className={`inline-block px-1.5 py-0.2 text-[7px] font-black uppercase tracking-wider ${
                      isCyber
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 rounded font-mono'
                        : isModern
                        ? 'bg-teal-50 text-teal-800 border border-teal-200 rounded-full'
                        : isClassic || isRoyal
                        ? 'bg-amber-100 text-amber-950 border border-amber-700 rounded-sm font-serif'
                        : isMadrasah
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-600 rounded'
                        : isAurora
                        ? 'bg-purple-100 text-purple-900 border border-purple-300 rounded-full'
                        : isCorporate
                        ? 'bg-sky-100 text-sky-900 border border-sky-300 rounded'
                        : 'bg-neutral-900 text-white border border-black rounded'
                    }`}
                  >
                    {safeStudent.className || 'Kelas -'}
                  </span>
                </div>
              )}

              {design.showRoomSeat && (
                <div
                  className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-tight flex items-center justify-between ${
                    isCyber
                      ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-200'
                      : isModern
                      ? 'bg-teal-50 border border-teal-300 text-teal-950 rounded-lg'
                      : isClassic || isRoyal
                      ? 'bg-amber-50 border border-amber-600 text-amber-950 rounded-sm'
                      : isMadrasah
                      ? 'bg-emerald-50 border border-emerald-600 text-emerald-950'
                      : 'bg-yellow-200 border border-black text-black shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  <span>{safeStudent.examRoom || 'Ruang 01'}</span>
                  <span>•</span>
                  <span>{safeStudent.examSeat ? `Meja ${safeStudent.examSeat}` : 'Meja 01'}</span>
                </div>
              )}
            </div>
          </div>

          {/* BARIS TENGAH: TABEL LENGKAP BIODATA SISWA (TIDAK AKAN TERPOTONG) */}
          <div
            className={`my-1 p-1.5 rounded-lg border text-[7.5px] leading-tight space-y-0.5 ${
              isCyber
                ? 'bg-slate-900/60 border-slate-800'
                : isClassic || isRoyal
                ? 'bg-amber-50/40 border-amber-200'
                : 'bg-neutral-50/70 border-neutral-200'
            }`}
          >
            {design.showNisn && (
              <div className="flex items-center justify-between">
                <span className={`uppercase font-bold ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500'}`}>
                  NISN
                </span>
                <span className={`font-mono font-black ${isCyber ? 'text-white' : 'text-neutral-900'}`}>
                  {safeStudent.nisn || '-'}
                </span>
              </div>
            )}

            {design.showNis && safeStudent.nis && (
              <div className="flex items-center justify-between">
                <span className={`uppercase font-bold ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500'}`}>
                  NIS
                </span>
                <span className={`font-mono font-bold ${isCyber ? 'text-cyan-100' : 'text-neutral-900'}`}>
                  {safeStudent.nis}
                </span>
              </div>
            )}

            {design.showBirthDate && (safeStudent.birthPlace || safeStudent.birthDate) && (
              <div className="flex items-center justify-between">
                <span className={`uppercase font-bold ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500'}`}>
                  TTL
                </span>
                <span className={`truncate max-w-[125px] font-medium text-right ${isCyber ? 'text-cyan-100' : 'text-neutral-900'}`}>
                  {[safeStudent.birthPlace, formattedBirthDate].filter(Boolean).join(', ') || '-'}
                </span>
              </div>
            )}

            {design.showReligion && safeStudent.religion && (
              <div className="flex items-center justify-between">
                <span className={`uppercase font-bold ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500'}`}>
                  Agama
                </span>
                <span className={`font-medium ${isCyber ? 'text-cyan-100' : 'text-neutral-900'}`}>
                  {safeStudent.religion}
                </span>
              </div>
            )}
          </div>

          {/* BARIS BAWAH: QR CODE & TANDA TANGAN KEPALA SEKOLAH */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-200 gap-2 shrink-0">
            {design.showQrCode && (
              <div className="shrink-0 flex items-center gap-1.5">
                <div
                  className={`p-0.5 rounded ${
                    isCyber
                      ? 'bg-slate-900 border border-cyan-400'
                      : isClassic || isRoyal
                      ? 'bg-white border border-amber-700'
                      : 'bg-white border border-black'
                  }`}
                >
                  <QrCodeImage
                    value={`VALID|${safeStudent.nisn || ''}|${safeStudent.name || ''}|${safeStudent.examRoom || ''}|${safeStudent.examSeat || ''}`}
                    sizeMm={12}
                  />
                </div>
                <div className="text-[5.5px] font-mono leading-tight opacity-80">
                  <div className="font-bold text-emerald-700">QR</div>
                  <div>VALID</div>
                </div>
              </div>
            )}

            {design.showPrincipalSign && (
              <div className="text-right flex-1 min-w-0">
                <div className="text-[5.5px] opacity-75 leading-none truncate">
                  {safeSchool.regency || 'Kediri'}, {effectiveSignDate}
                </div>
                <div className="text-[6px] font-bold leading-tight truncate mt-0.2">
                  {design.principalTitle || 'Kepala Sekolah'}
                </div>

                {/* TTD: QR ATAU DIGITAL */}
                {design.signatureType === 'digital' ? (
                  safeSchool.principalSignatureUrl && safeSchool.principalSignatureUrl.trim().length > 0 ? (
                    <div className="h-5 flex items-center justify-end my-0.5">
                      <img
                        src={safeSchool.principalSignatureUrl}
                        alt="TTD Kepala Sekolah"
                        className="max-h-5 max-w-[65px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-4 flex items-center justify-end my-0.5">
                      <span className="text-[5px] text-neutral-400 italic border-b border-dashed border-neutral-300 px-1">
                        (Ttd Digital)
                      </span>
                    </div>
                  )
                ) : (
                  <div className="my-0.5 flex justify-end">
                    <div
                      className={`p-0.5 rounded ${
                        isCyber
                          ? 'bg-slate-900 border border-cyan-400'
                          : isClassic || isRoyal
                          ? 'bg-white border border-amber-700'
                          : 'bg-white border border-black'
                      }`}
                    >
                      <QrCodeImage
                        value={`TTD-KEPSEK|${safeSchool.name || ''}|${safeSchool.principalName || ''}|${safeSchool.principalNip || ''}|${effectiveSignDate}`}
                        sizeMm={6.5}
                      />
                    </div>
                  </div>
                )}

                <div className="text-[6.5px] font-black underline uppercase truncate">
                  {safeSchool.principalName || 'Nama Kepala'}
                </div>
                {safeSchool.principalNip && (
                  <div className="text-[5px] font-mono opacity-80 leading-none truncate">
                    NIP. {safeSchool.principalNip}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER CATATAN KECIL POTRAIT */}
        <div
          className={`px-2 py-0.5 text-[5.5px] border-t flex items-center justify-between opacity-80 shrink-0 ${
            isCyber ? 'border-slate-800 text-cyan-400' : 'border-neutral-200 text-neutral-600'
          }`}
        >
          <span>*Wajib dibawa saat ujian</span>
          <span className="font-mono font-bold">{safeExam.semester || 'Semester Ganjil'}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TAMPILAN ID SISWA: MODEL LANSKAP (HORIZONTAL)
  // =========================================================================
  return (
    <div
      style={containerStyle}
      className={`relative flex flex-col justify-between overflow-hidden select-none print-card-item ${fontClass} ${textColorClass} ${className}`}
    >
      {/* HEADER LANSKAP */}
      <div
        style={{
          backgroundColor: effectiveHeaderBg,
          color: effectiveHeaderText,
          borderBottom: isCyber
            ? '2px solid #0EA5E9'
            : isClassic || isRoyal
            ? '2px double #D97706'
            : isMadrasah
            ? '2px solid #F59E0B'
            : design.showBorder
            ? `${Math.min(design.borderWidthPx || 2, 2)}px solid #111`
            : 'none',
        }}
        className="px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0 relative"
      >
        <div className="flex items-center gap-2 min-w-0">
          {design.showLogo && (
            <SchoolLogo
              url={safeSchool.logoUrl}
              name={safeSchool.name || 'Sekolah'}
              sizeMm={Math.min(design.logoSizeMm, 12)}
              className="shrink-0"
            />
          )}

          <div className="min-w-0">
            {design.showSchoolName && (
              <div
                className={`text-[9.5px] font-black uppercase tracking-tight leading-tight truncate ${
                  isClassic || isRoyal ? 'font-serif tracking-wider text-amber-200' : ''
                }`}
              >
                {safeSchool.name || 'NAMA SEKOLAH'}
              </div>
            )}
            {design.showExamName && (
              <div
                className={`text-[8px] font-extrabold uppercase leading-tight truncate opacity-95 ${
                  isMadrasah ? 'text-amber-300' : ''
                }`}
              >
                {safeExam.name || 'KARTU PESERTA ASESMEN'}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[7px] font-medium leading-none opacity-85 mt-0.5">
              {design.showSemesterYear && <span>{safeExam.academicYear || '2026/2027'}</span>}
              {design.showNpsn && safeSchool.npsn && (
                <span className="font-mono font-semibold">• NPSN: {safeSchool.npsn}</span>
              )}
            </div>
          </div>
        </div>

        {/* STATUS BADGE KANAN HEADER */}
        <div className="shrink-0 flex items-center gap-1">
          <div
            className={`border rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${
              isCyber
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-mono'
                : isModern
                ? 'bg-teal-100 text-teal-900 border-teal-300 rounded-full'
                : isClassic || isRoyal
                ? 'bg-amber-100 text-amber-900 border-amber-600 rounded-sm font-serif'
                : isMadrasah
                ? 'bg-emerald-100 text-emerald-900 border-emerald-500 rounded'
                : 'bg-black text-yellow-300 border-black shadow-[1px_1px_0px_#000]'
            }`}
          >
            PESERTA
          </div>
        </div>
      </div>

      {/* BODY LANSKAP: SUSUNAN 3 KOLOM SEIMBANG (DATA SISWA TIDAK TERPOTONG) */}
      <div className="flex-1 px-3 py-1 flex items-center justify-between gap-2.5 min-h-0">
        {/* KOLOM 1: FOTO & KELAS */}
        {design.showPhoto && (
          <div className="shrink-0 flex flex-col items-center justify-center">
            {renderPhotoFrame(21, 26)}
            {design.showClass && (
              <span
                className={`mt-1 px-1.5 py-0.2 text-[7px] font-black uppercase tracking-wider text-center max-w-[65px] truncate ${
                  isCyber
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 rounded font-mono'
                    : isModern
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 rounded-full'
                    : isClassic || isRoyal
                    ? 'bg-amber-100 text-amber-950 border border-amber-700 rounded-sm font-serif'
                    : isMadrasah
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-600 rounded'
                    : 'bg-neutral-900 text-white border border-black rounded'
                }`}
              >
                {safeStudent.className || 'Kelas -'}
              </span>
            )}
          </div>
        )}

        {/* KOLOM 2: BIODATA LENGKAP SISWA (LUAS, JELAS, BEBAS DARI CLIPPING) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5 py-0.5">
          {/* NAMA SISWA */}
          {design.showStudentName !== false && (
            <div
              className={`pb-0.5 mb-0.5 ${
                isCyber
                  ? 'border-b border-cyan-800/60'
                  : isClassic || isRoyal
                  ? 'border-b border-amber-600/50'
                  : 'border-b border-neutral-300'
              }`}
            >
              <div
                className={`uppercase leading-tight truncate ${
                  isClassic || isRoyal
                    ? 'font-serif font-black text-slate-900'
                    : isCyber
                    ? 'font-mono font-black text-cyan-200'
                    : 'font-black text-neutral-900'
                } ${nameLength > 28 ? 'text-[9.5px]' : nameLength > 20 ? 'text-[10.5px]' : 'text-[11.5px]'}`}
                title={studentName}
              >
                {studentName}
              </div>
            </div>
          )}

          {/* TABEL DATA SISWA */}
          <div className="space-y-0.5 text-[7.5px] leading-tight">
            {design.showNisn && (
              <div className="flex items-center gap-1.5">
                <span className={`w-11 text-[7px] uppercase shrink-0 ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500 font-bold'}`}>
                  NISN
                </span>
                <span className="text-neutral-400 font-bold shrink-0">:</span>
                <span className={`font-mono font-black ${isCyber ? 'text-white' : 'text-neutral-900'}`}>
                  {safeStudent.nisn || '-'}
                </span>
              </div>
            )}

            {design.showNis && safeStudent.nis && (
              <div className="flex items-center gap-1.5">
                <span className={`w-11 text-[7px] uppercase shrink-0 ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500 font-bold'}`}>
                  NIS
                </span>
                <span className="text-neutral-400 font-bold shrink-0">:</span>
                <span className={`font-mono font-bold ${isCyber ? 'text-cyan-100' : 'text-neutral-900'}`}>
                  {safeStudent.nis}
                </span>
              </div>
            )}

            {design.showBirthDate && (safeStudent.birthPlace || safeStudent.birthDate) && (
              <div className="flex items-center gap-1.5">
                <span className={`w-11 text-[7px] uppercase shrink-0 ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500 font-bold'}`}>
                  TTL
                </span>
                <span className="text-neutral-400 font-bold shrink-0">:</span>
                <span className={`truncate font-medium ${isCyber ? 'text-cyan-100' : 'text-neutral-900'}`}>
                  {[safeStudent.birthPlace, formattedBirthDate].filter(Boolean).join(', ') || '-'}
                </span>
              </div>
            )}

            {design.showReligion && safeStudent.religion && (
              <div className="flex items-center gap-1.5">
                <span className={`w-11 text-[7px] uppercase shrink-0 ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500 font-bold'}`}>
                  Agama
                </span>
                <span className="text-neutral-400 font-bold shrink-0">:</span>
                <span className={`font-medium ${isCyber ? 'text-cyan-100' : 'text-neutral-900'}`}>
                  {safeStudent.religion}
                </span>
              </div>
            )}

            {/* RUANG & NOMOR MEJA DI DALAM TABEL */}
            {design.showRoomSeat && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`w-11 text-[7px] uppercase shrink-0 ${isCyber ? 'text-cyan-400 font-mono' : 'text-neutral-500 font-bold'}`}>
                  Ruang/Meja
                </span>
                <span className="text-neutral-400 font-bold shrink-0">:</span>
                <span className={`font-black font-mono text-[8px] ${
                  isCyber ? 'text-cyan-300' : 'text-black'
                }`}>
                  {safeStudent.examRoom || 'Ruang 01'} • {safeStudent.examSeat ? `Meja ${safeStudent.examSeat}` : 'Meja 01'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM 3: QR CODE & TANDA TANGAN KEPALA SEKOLAH */}
        <div className="shrink-0 flex flex-col items-center justify-between h-full pl-2 border-l border-neutral-200 w-[72px]">
          {design.showQrCode && (
            <div className="flex flex-col items-center">
              <div
                className={`p-0.5 rounded ${
                  isCyber
                    ? 'bg-slate-900 border border-cyan-400'
                    : isClassic || isRoyal
                    ? 'bg-white border border-amber-700'
                    : 'bg-white border border-black'
                }`}
              >
                <QrCodeImage
                  value={`VALID|${safeStudent.nisn || ''}|${safeStudent.name || ''}|${safeStudent.examRoom || ''}|${safeStudent.examSeat || ''}`}
                  sizeMm={12}
                />
              </div>
              <span className="text-[5px] font-mono opacity-80 mt-0.5 font-bold">VALIDASI</span>
            </div>
          )}

          {design.showPrincipalSign && (
            <div className="text-center w-full mt-0.5">
              <div className="text-[5px] opacity-75 leading-none truncate">
                {safeSchool.regency || 'Kediri'}, {effectiveSignDate}
              </div>
              <div className="text-[5.5px] font-bold leading-tight truncate">
                {design.principalTitle || 'Kepala Sekolah'}
              </div>

              {/* TTD: QR ATAU DIGITAL */}
              {design.signatureType === 'digital' ? (
                safeSchool.principalSignatureUrl && safeSchool.principalSignatureUrl.trim().length > 0 ? (
                  <div className="h-4.5 flex items-center justify-center my-0.5">
                    <img
                      src={safeSchool.principalSignatureUrl}
                      alt="TTD"
                      className="max-h-4.5 max-w-[55px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-3.5 flex items-center justify-center my-0.5">
                    <span className="text-[4.5px] text-neutral-400 italic border-b border-dotted border-neutral-300">
                      (Ttd Digital)
                    </span>
                  </div>
                )
              ) : (
                <div className="my-0.5 flex justify-center">
                  <div
                    className={`p-0.5 rounded ${
                      isCyber
                        ? 'bg-slate-900 border border-cyan-400'
                        : isClassic || isRoyal
                        ? 'bg-white border border-amber-700'
                        : 'bg-white border border-black'
                    }`}
                  >
                    <QrCodeImage
                      value={`TTD-KEPSEK|${safeSchool.name || ''}|${safeSchool.principalName || ''}|${safeSchool.principalNip || ''}|${effectiveSignDate}`}
                      sizeMm={6}
                    />
                  </div>
                </div>
              )}

              <div className="text-[6px] font-black underline uppercase truncate max-w-[70px]">
                {safeSchool.principalName || 'Nama Kepala'}
              </div>
              {safeSchool.principalNip && (
                <div className="text-[5px] font-mono opacity-75 leading-none truncate">
                  NIP. {safeSchool.principalNip}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER CATATAN KECIL */}
      <div
        className={`px-2 py-0.5 text-[5.5px] border-t flex items-center justify-between opacity-80 shrink-0 ${
          isCyber ? 'border-slate-800 text-cyan-400' : 'border-neutral-200 text-neutral-600'
        }`}
      >
        <span>*Wajib dibawa dan ditempelkan di meja saat ujian</span>
        <span className="font-mono font-bold">{safeExam.semester || 'Semester Ganjil'}</span>
      </div>
    </div>
  );
};
