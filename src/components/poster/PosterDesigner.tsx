import React, { useState } from 'react';
import { School, Exam, Student, PosterDesignSettings, PosterStyleId, PosterOrientation } from '../../types';
import { A4SheetContainer } from '../print/A4SheetContainer';
import { SchoolLogo, normalizeImageUrl } from '../common/SchoolLogo';
import {
  Palette,
  Sparkles,
  CheckCircle2,
  Sliders,
  Building2,
  Smartphone,
  DoorClosed,
  VolumeX,
  Users,
  Award,
  Save,
  Compass,
  ArrowRight,
  AlertTriangle,
  GraduationCap,
  Ban,
  ShieldAlert,
} from 'lucide-react';

interface PosterDesignerProps {
  school: School;
  exam: Exam;
  students?: Student[];
  posterDesign: PosterDesignSettings;
  onUpdatePosterDesign: (design: PosterDesignSettings) => void;
  onSaveToCloud?: (design: PosterDesignSettings) => Promise<void>;
  onNavigateToPrint: () => void;
}

export const PosterDesigner: React.FC<PosterDesignerProps> = ({
  school,
  exam,
  posterDesign,
  onUpdatePosterDesign,
  onSaveToCloud,
  onNavigateToPrint,
}) => {
  // Local active settings
  const [activeStyle, setActiveStyle] = useState<PosterStyleId>(posterDesign.styleId || 'neobrutal');
  const [orientation, setOrientation] = useState<PosterOrientation>(posterDesign.orientation || 'portrait');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(
    posterDesign.watermarkOpacity !== undefined ? posterDesign.watermarkOpacity : 14
  );
  const [showAddress, setShowAddress] = useState<boolean>(
    posterDesign.showSchoolAddressInFooter !== false
  );

  // Active poster type for live previewing
  const [previewType, setPreviewType] = useState<
    'quiet' | 'room_name' | 'communication' | 'committee' | 'principal' | 'guest_proctor'
  >('quiet');

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Update helper
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const updated: PosterDesignSettings = {
      styleId: activeStyle,
      orientation,
      watermarkOpacity,
      showSchoolAddressInFooter: showAddress,
      updatedAt: new Date().toISOString(),
    };

    onUpdatePosterDesign(updated);

    if (onSaveToCloud) {
      try {
        await onSaveToCloud(updated);
      } catch (err) {
        console.error('Failed to sync poster design to cloud:', err);
      }
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // 5 Style Configurations
  const STYLES_LIST = [
    {
      id: 'neobrutal' as PosterStyleId,
      name: 'Neobrutalism Bold',
      desc: 'Border hitam tebal 5px, bayangan tegas, dan warna kuning kontras tinggi.',
      badgeColor: 'bg-yellow-300 text-black border-2 border-black',
    },
    {
      id: 'modern' as PosterStyleId,
      name: 'Modern Minimalist',
      desc: 'Sudut membulat halus, aksen navy & cobalt blue elegan berwibawa.',
      badgeColor: 'bg-slate-900 text-white border-2 border-indigo-400',
    },
    {
      id: 'hazard' as PosterStyleId,
      name: 'Hazard Caution',
      desc: 'Pita garis kuning-hitam standar keselamatan dengan visibilitas tinggi.',
      badgeColor: 'bg-amber-400 text-black border-2 border-black',
    },
    {
      id: 'classic_academic' as PosterStyleId,
      name: 'Formal Akademik',
      desc: 'Bingkai ganda sertifikat kedinasan dengan aksen emerald & emas.',
      badgeColor: 'bg-emerald-800 text-amber-200 border-2 border-amber-400',
    },
    {
      id: 'playful_friendly' as PosterStyleId,
      name: 'Ramah Anak Ceria',
      desc: 'Nuansa pastel teal & coral orange yang ramah dan edukatif untuk SD/MI.',
      badgeColor: 'bg-teal-500 text-white border-2 border-teal-800',
    },
  ];

  // Preview Poster Types
  const PREVIEW_TYPES = [
    { id: 'quiet', title: 'Harap Tenang', icon: VolumeX },
    { id: 'room_name', title: 'Nama Ruang', icon: DoorClosed },
    { id: 'communication', title: 'Bebas Gadget', icon: Smartphone },
    { id: 'committee', title: 'Ruang Panitia', icon: Users },
    { id: 'principal', title: 'Ruang Kepala', icon: Building2 },
    { id: 'guest_proctor', title: 'Ruang Tamu', icon: Award },
  ] as const;

  // Poster content generator
  const getPosterData = (type: typeof previewType) => {
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
      case 'room_name':
        return {
          categoryTag: 'RUANG 01',
          categorySub: exam?.name || 'ASESMEN SUMATIF',
          mainHeadline: 'RUANGAN ASESMEN',
          subHeadline: 'KELAS 1',
          bodyNotice: 'Selamat Mengerjakan Asesmen • Utamakan Kejujuran & Kemandirian',
          rulesNote: 'Peserta wajib menempati kursi sesuai kartu peserta asesmen.',
        };
      case 'communication':
        return {
          categoryTag: 'PERINGATAN TATA TERTIB UJIAN',
          categorySub: 'INTEGRITAS ASESMEN',
          mainHeadline: 'DILARANG MEMBAWA',
          subHeadline: 'PERALATAN KOMUNIKASI, KAMERA, DAN SEJENISNYA',
          bodyNotice: 'KEDALAM RUANGAN.',
          rulesNote: 'Ponsel (HP), kamera, dan jam pintar dilarang dibawa ke dalam ruang ujian.',
        };
      case 'committee':
        return {
          categoryTag: 'AREA RESMI ASESMEN',
          categorySub: 'PANITIA PELAKSANA ASESMEN',
          mainHeadline: 'RUANGAN PANITIA',
          subHeadline: 'dan GURU',
          bodyNotice: 'Pusat Distribusi Soal & Administrasi Asesmen',
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

  const data = getPosterData(previewType);
  const schoolName = school?.name || 'SD NEGERI CONTOH';
  const examTitle = exam?.name || 'ASESMEN SUMATIF';
  const academicYear = exam?.academicYear || '2026/2027';
  const normalizedLogo = normalizeImageUrl(school?.logoUrl);

  // Common Watermark component - HANYA LOGO (TANPA TEKS DI WATERMARK)
  const Watermark = () => (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none select-none z-0"
      style={{ opacity: watermarkOpacity / 100 }}
    >
      {normalizedLogo ? (
        <img
          src={normalizedLogo}
          alt="Watermark Logo"
          className="w-48 h-48 sm:w-56 sm:h-56 object-contain grayscale filter"
        />
      ) : (
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-neutral-600 flex items-center justify-center">
          <GraduationCap className="w-28 h-28 text-neutral-600" />
        </div>
      )}
    </div>
  );

  // Common Official Footer (Menggunakan SchoolLogo yang sudah dinormalisasi)
  const Footer = ({ borderClass, textClass }: { borderClass: string; textClass: string }) => (
    <div className={`relative z-10 w-full pt-3 mt-auto border-t-2 ${borderClass} flex items-center justify-between gap-4 text-left`}>
      <div className="flex items-center gap-3">
        <SchoolLogo url={school?.logoUrl} name={schoolName} sizeMm={12} className="shrink-0" />
        <div>
          <h4 className="text-xs font-black uppercase text-neutral-900 leading-tight">
            {schoolName}
          </h4>
          <div className={`text-[10px] ${textClass} font-semibold leading-tight mt-0.5`}>
            {school?.npsn && <span>NPSN: {school.npsn} • </span>}
            <span>{examTitle} TA {academicYear}</span>
          </div>
          {showAddress && school?.address && (
            <div className={`text-[9px] ${textClass} truncate max-w-md mt-0.5`}>
              {[school.address, school.village, school.district, school.regency].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="inline-block px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase rounded">
          Dokumen Resmi
        </span>
        <div className="text-[9px] font-bold text-neutral-500 mt-0.5">
          Portal Asesmen A4
        </div>
      </div>
    </div>
  );

  // Visual icon helper
  const renderVisualIcon = (className: string) => {
    switch (previewType) {
      case 'quiet':
        return activeStyle === 'hazard' ? <ShieldAlert className={className} /> : <VolumeX className={className} />;
      case 'room_name':
        return <DoorClosed className={className} />;
      case 'communication':
        return (
          <div className="relative flex items-center justify-center">
            <Smartphone className={className} />
            <Ban className="w-16 h-16 sm:w-20 sm:h-20 text-red-600 absolute inset-0 m-auto" />
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

  // Render Content based on Orientation & Style
  const renderPosterContent = () => {
    const isLandscape = orientation === 'landscape';

    // ==========================================
    // 1. NEOBRUTALISM BOLD
    // ==========================================
    if (activeStyle === 'neobrutal') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FFFDF5] border-[5px] border-black shadow-[10px_10px_0px_#000] overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <Watermark />

          {/* Top Bar */}
          <div className="relative z-10 border-b-4 border-black pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                {data.categoryTag}
              </span>
              <span className="text-[11px] font-black uppercase text-neutral-800">
                {data.categorySub}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-300 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A4 {isLandscape ? 'LANDSCAPE' : 'PORTRAIT'}</span>
            </div>
          </div>

          {/* Center Main Content */}
          {isLandscape ? (
            /* Landscape: ILUSTRASI DI KIRI, KESELURUHAN TEKS DI KANAN (LEBIH BESAR & PADAT) */
            <div className="relative z-10 grid grid-cols-12 gap-8 items-center my-auto py-4">
              {/* Kolom Kiri: Ilustrasi Proporsional */}
              <div className="col-span-4 flex items-center justify-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-yellow-400 border-[4.5px] border-black rounded-3xl flex items-center justify-center shadow-[8px_8px_0px_#000] shrink-0">
                  {renderVisualIcon('w-20 h-20 sm:w-24 sm:h-24 text-black')}
                </div>
              </div>

              {/* Kolom Kanan: Keseluruhan Teks Besar & Jelas */}
              <div className="col-span-8 space-y-4 text-left">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-[1.02]">
                    {data.mainHeadline}
                  </h1>
                  {data.subHeadline && (
                    <div className="inline-block mt-3 px-5 py-2 bg-black text-white border-3 border-black text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wide rounded-xl shadow-[4px_4px_0px_#FFE600]">
                      {data.subHeadline}
                    </div>
                  )}
                </div>

                {data.bodyNotice && (
                  <div className="p-4 sm:p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000]">
                    <p className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-neutral-900 leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}

                {data.rulesNote && (
                  <p className="text-xs sm:text-sm lg:text-base font-bold text-neutral-800 leading-relaxed">
                    {data.rulesNote}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Portrait: Susunan Vertikal Seimbang */
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

          <Footer borderClass="border-black" textClass="text-neutral-700" />
        </div>
      );
    }

    // ==========================================
    // 2. MODERN MINIMALIST
    // ==========================================
    if (activeStyle === 'modern') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 border-2 border-indigo-200 shadow-xl rounded-3xl overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <Watermark />

          <div className="relative z-10 border-b border-indigo-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-black uppercase text-blue-900">{data.categoryTag}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600 uppercase">{data.categorySub}</span>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase border border-blue-200">
              A4 {isLandscape ? 'Landscape' : 'Portrait'}
            </span>
          </div>

          {isLandscape ? (
            /* Landscape: ILUSTRASI DI KIRI, KESELURUHAN TEKS DI KANAN */
            <div className="relative z-10 grid grid-cols-12 gap-8 items-center my-auto py-4">
              <div className="col-span-4 flex items-center justify-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 shrink-0">
                  {renderVisualIcon('w-20 h-20 sm:w-24 sm:h-24')}
                </div>
              </div>

              <div className="col-span-8 space-y-4 text-left">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-slate-900 leading-tight">
                    {data.mainHeadline}
                  </h1>
                  {data.subHeadline && (
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-700 uppercase tracking-wide mt-2">
                      {data.subHeadline}
                    </div>
                  )}
                </div>

                {data.bodyNotice && (
                  <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-base sm:text-lg lg:text-xl font-bold uppercase text-slate-800 leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}

                {data.rulesNote && (
                  <p className="text-xs sm:text-sm lg:text-base font-medium text-slate-500 leading-relaxed">
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
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-slate-900 leading-tight">
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

          <Footer borderClass="border-indigo-100" textClass="text-slate-500" />
        </div>
      );
    }

    // ==========================================
    // 3. HAZARD CAUTION
    // ==========================================
    if (activeStyle === 'hazard') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FFFBEB] border-[6px] border-black shadow-xl overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <Watermark />

          {/* Top Hazard Stripes */}
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

          {/* Center Content */}
          {isLandscape ? (
            /* Landscape: ILUSTRASI DI KIRI, KESELURUHAN TEKS DI KANAN */
            <div className="relative z-10 grid grid-cols-12 gap-8 items-center my-auto py-3">
              <div className="col-span-4 flex items-center justify-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-amber-400 border-[5px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_#000] shrink-0">
                  {renderVisualIcon('w-20 h-20 sm:w-24 sm:h-24 text-black')}
                </div>
              </div>

              <div className="col-span-8 space-y-3.5 text-left">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-black leading-tight">
                    {data.mainHeadline}
                  </h1>
                  {data.subHeadline && (
                    <div className="inline-block mt-2 px-4 py-2 bg-amber-400 text-black border-4 border-black text-2xl sm:text-3xl font-black uppercase rounded-md shadow-[4px_4px_0px_#000]">
                      {data.subHeadline}
                    </div>
                  )}
                </div>

                {data.bodyNotice && (
                  <div className="p-4 bg-black text-amber-300 border-3 border-black rounded-lg shadow-[4px_4px_0px_#F59E0B]">
                    <p className="text-base sm:text-lg lg:text-xl font-black uppercase leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}

                {data.rulesNote && (
                  <p className="text-xs sm:text-sm lg:text-base font-extrabold text-neutral-900 bg-amber-200/80 px-3.5 py-1.5 rounded border border-amber-400">
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
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-black leading-[1.05]">
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

          {/* Bottom Hazard Stripes */}
          <div className="relative z-10 -mx-6 sm:-mx-8 mb-3">
            <div
              className="h-3.5 w-full border-t-2 border-b-2 border-black"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000, #000 12px, #FBBF24 12px, #FBBF24 24px)',
              }}
            />
          </div>

          <Footer borderClass="border-black" textClass="text-neutral-700" />
        </div>
      );
    }

    // ==========================================
    // 4. FORMAL AKADEMIK
    // ==========================================
    if (activeStyle === 'classic_academic') {
      return (
        <div
          className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FCFDFE] border-4 border-[#064E3B] shadow-xl overflow-hidden select-none box-border ${
            isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
          }`}
        >
          <Watermark />
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
            /* Landscape: ILUSTRASI DI KIRI, KESELURUHAN TEKS DI KANAN */
            <div className="relative z-10 grid grid-cols-12 gap-8 items-center my-auto py-4">
              <div className="col-span-4 flex items-center justify-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-[#B45309] bg-emerald-50 text-[#064E3B] flex items-center justify-center shadow-lg shrink-0">
                  {renderVisualIcon('w-20 h-20 sm:w-24 sm:h-24')}
                </div>
              </div>

              <div className="col-span-8 space-y-3.5 text-left">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-[#064E3B] leading-tight font-serif">
                    {data.mainHeadline}
                  </h1>
                  {data.subHeadline && (
                    <div className="text-2xl sm:text-3xl font-black text-[#B45309] uppercase tracking-wide mt-2">
                      {data.subHeadline}
                    </div>
                  )}
                </div>

                {data.bodyNotice && (
                  <div className="p-4 bg-emerald-50/70 border-2 border-[#064E3B] rounded-lg">
                    <p className="text-base sm:text-lg lg:text-xl font-bold uppercase text-[#064E3B] leading-snug">
                      {data.bodyNotice}
                    </p>
                  </div>
                )}

                {data.rulesNote && (
                  <p className="text-xs sm:text-sm lg:text-base font-semibold text-neutral-600 italic">
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
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-[#064E3B] leading-tight font-serif">
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

          <Footer borderClass="border-[#064E3B]" textClass="text-emerald-900" />
        </div>
      );
    }

    // ==========================================
    // 5. RAMAH ANAK CERIA
    // ==========================================
    return (
      <div
        className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-[#FEFCE8] border-[4px] border-teal-800 shadow-xl rounded-[36px] overflow-hidden select-none box-border ${
          isLandscape ? 'min-h-[210mm]' : 'min-h-[297mm]'
        }`}
      >
        <Watermark />

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
          /* Landscape: ILUSTRASI DI KIRI, KESELURUHAN TEKS DI KANAN */
          <div className="relative z-10 grid grid-cols-12 gap-8 items-center my-auto py-4">
            <div className="col-span-4 flex items-center justify-center">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[32px] bg-teal-600 text-white flex items-center justify-center shadow-xl transform rotate-[-2deg] shrink-0">
                {renderVisualIcon('w-20 h-20 sm:w-24 sm:h-24')}
              </div>
            </div>

            <div className="col-span-8 space-y-3.5 text-left">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-teal-950 leading-tight">
                  {data.mainHeadline}
                </h1>
                {data.subHeadline && (
                  <div className="inline-block mt-2 px-5 py-2 bg-orange-500 text-white text-2xl sm:text-3xl font-black uppercase rounded-2xl shadow-md">
                    {data.subHeadline}
                  </div>
                )}
              </div>

              {data.bodyNotice && (
                <div className="p-4 bg-white border-2 border-teal-600 rounded-2xl shadow-sm">
                  <p className="text-base sm:text-lg lg:text-xl font-bold uppercase text-teal-900 leading-snug">
                    {data.bodyNotice}
                  </p>
                </div>
              )}

              {data.rulesNote && (
                <p className="text-xs sm:text-sm lg:text-base font-semibold text-teal-800 leading-relaxed">
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

        <Footer borderClass="border-teal-300" textClass="text-teal-800" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER (NO PRINT BUTTON HERE) */}
      <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded shadow-xs">
              Studio Desain Poster
            </span>
            <span className="text-xs font-bold text-neutral-500 uppercase">
              Sinkronisasi Cloud • Sheet data_poster
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-700" />
            Pengaturan &amp; Desain Poster Asesmen
          </h2>
          <p className="text-xs text-neutral-600 max-w-xl">
            Pilih gaya visual, tentukan orientasi lembar (Portrait / Landscape), dan atur watermark logo sekolah. Pengaturan ini akan otomatis diterapkan ke seluruh cetak poster ujian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>Tersimpan ke Database!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Desain Poster'}</span>
              </>
            )}
          </button>

          {/* Quick Jump to Print Page */}
          <button
            type="button"
            onClick={onNavigateToPrint}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>Buka Halaman Cetak</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: CONTROLS & LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CONTROLS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Orientasi Lembar */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-700" />
                Orientasi Lembar Kertas A4
              </h3>
              <span className="text-[10px] font-bold text-neutral-500 uppercase">
                {orientation === 'portrait' ? '210 x 297 mm' : '297 x 210 mm'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  orientation === 'portrait'
                    ? 'bg-yellow-100 border-black shadow-[3px_3px_0px_#000] ring-2 ring-black'
                    : 'bg-neutral-50 hover:bg-white border-neutral-300 hover:border-black'
                }`}
              >
                <div className="w-7 h-10 border-2 border-black rounded-sm bg-white shadow-xs flex items-center justify-center text-[9px] font-black">
                  A4
                </div>
                <div>
                  <div className="text-xs font-black uppercase">Portrait (Tegak)</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Susunan vertikal seimbang</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  orientation === 'landscape'
                    ? 'bg-yellow-100 border-black shadow-[3px_3px_0px_#000] ring-2 ring-black'
                    : 'bg-neutral-50 hover:bg-white border-neutral-300 hover:border-black'
                }`}
              >
                <div className="w-10 h-7 border-2 border-black rounded-sm bg-white shadow-xs flex items-center justify-center text-[9px] font-black">
                  A4
                </div>
                <div>
                  <div className="text-xs font-black uppercase">Landscape (Mendatar)</div>
                  <div className="text-[10px] text-neutral-500 font-medium">Teks kanan, ilustrasi kiri</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card 2: Pilihan 5 Gaya Desain */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Pilih Gaya Visual Poster (5 Gaya Unik)
              </h3>
            </div>

            <div className="space-y-2.5">
              {STYLES_LIST.map((st) => {
                const isSelected = activeStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveStyle(st.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-yellow-50 border-black shadow-[3px_3px_0px_#000] ring-2 ring-black'
                        : 'bg-neutral-50 hover:bg-white border-neutral-300 hover:border-black'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-neutral-900">
                          {st.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-black shrink-0" />}
                      </div>
                      <p className="text-[10px] text-neutral-600 leading-tight">
                        {st.desc}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase shrink-0 ${st.badgeColor}`}>
                      Contoh
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Pengaturan Watermark & Footer */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-neutral-700" />
              Pengaturan Watermark &amp; Footer
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-neutral-700 mb-1.5">
                  <span>Kepekatan Watermark Logo (Tengah Bawah):</span>
                  <span className="font-mono font-black text-black">{watermarkOpacity}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[10, 14, 20, 26].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setWatermarkOpacity(op)}
                      className={`flex-1 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                        watermarkOpacity === op
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                      }`}
                    >
                      {op}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={showAddress}
                    onChange={(e) => setShowAddress(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-2 border-black focus:ring-0 cursor-pointer"
                  />
                  <span>Tampilkan Alamat Lengkap Sekolah di Footer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 4: Switcher Pratinjau Jenis Poster */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-black uppercase text-purple-950 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-purple-700" />
              Uji Coba Tampilan pada Jenis Poster:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PREVIEW_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isSelected = previewType === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setPreviewType(pt.id)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
                      isSelected
                        ? 'bg-purple-600 text-white border-black shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{pt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE A4 PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black uppercase text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Pratinjau Hasil Desain ({orientation.toUpperCase()})
            </span>
            <span className="text-[10px] font-bold text-neutral-500">
              *Tampilan cetak presisi 100% ukuran A4
            </span>
          </div>

          <A4SheetContainer
            pageNumber={1}
            totalPages={1}
            orientation={orientation}
            marginMm={0}
          >
            {renderPosterContent()}
          </A4SheetContainer>
        </div>
      </div>
    </div>
  );
};
