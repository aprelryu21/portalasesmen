import React from 'react';
import { Gender } from '../../types';

interface GenderAvatarProps {
  gender: Gender;
  religion?: string;
  className?: string;
  shape?: 'square' | 'rounded' | 'circle';
  role?: 'student' | 'teacher' | 'guest';
  isAdult?: boolean;
}

export const GenderAvatar: React.FC<GenderAvatarProps> = ({
  gender,
  religion,
  className = 'w-full h-full',
  shape = 'rounded',
  role = 'student',
  isAdult = false,
}) => {
  const shapeClass =
    shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-lg' : 'rounded-none';

  const isTeacherOrGuest = isAdult || role === 'teacher' || role === 'guest';
  const isIslam = !religion || religion.trim().toLowerCase() === 'islam';

  // =========================================================================
  // 1. AVATAR DEWASA: GURU PENGAWAS & TAMU RESMI (LAKI-LAKI & PEREMPUAN)
  // =========================================================================
  if (isTeacherOrGuest) {
    if (gender === 'L') {
      // Pria Dewasa: Guru / Pengawas Ruang / Pejabat Tamu
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-b from-slate-100 to-indigo-100 flex items-center justify-center border-2 border-black ${shapeClass} ${className} shadow-xs select-none`}
          title="Avatar Guru / Pengawas Laki-laki"
        >
          <svg viewBox="0 0 100 120" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="120" fill="#F8FAFC" />
            <circle cx="50" cy="52" r="44" fill="#E2E8F0" />

            {/* Rambut Belakang Dewasa Rapi */}
            <path
              d="M 23 48 C 22 20, 78 20, 77 48 C 77 58, 74 62, 72 65 C 72 45, 68 28, 50 28 C 32 28, 28 45, 28 65 C 26 62, 23 58, 23 48 Z"
              fill="#0F172A"
            />

            {/* Telinga */}
            <circle cx="26" cy="57" r="6" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
            <circle cx="26" cy="57" r="2.5" fill="#F59E0B" />
            <circle cx="74" cy="57" r="6" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
            <circle cx="74" cy="57" r="2.5" fill="#F59E0B" />

            {/* Leher Dewasa Kokoh */}
            <path d="M 42 68 L 42 84 L 58 84 L 58 68 Z" fill="#F59E0B" stroke="#000000" strokeWidth="2" />

            {/* Wajah Dewasa Berwibawa */}
            <path
              d="M 29 46 C 29 70, 71 70, 71 46 C 71 31, 29 31, 29 46 Z"
              fill="#FDE68A"
              stroke="#000000"
              strokeWidth="2.5"
            />

            {/* Gaya Rambut Dewasa Sisir Samping Profesional */}
            <path
              d="M 25 43 C 25 22, 75 19, 75 39 C 64 30, 48 29, 39 34 C 32 37, 28 40, 25 43 Z"
              fill="#1E293B"
              stroke="#000000"
              strokeWidth="2.2"
            />
            <path d="M 42 30 C 50 26, 62 25, 70 32" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

            {/* Alis Dewasa Tegas */}
            <path d="M 33 46 Q 40 43 46 46" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 54 46 Q 60 43 67 46" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

            {/* Kacamata Formal Profesional */}
            <rect x="33" y="49" width="14" height="10" rx="2.5" fill="#FFFFFF" fillOpacity="0.3" stroke="#0F172A" strokeWidth="2" />
            <rect x="53" y="49" width="14" height="10" rx="2.5" fill="#FFFFFF" fillOpacity="0.3" stroke="#0F172A" strokeWidth="2" />
            <line x1="47" y1="53" x2="53" y2="53" stroke="#0F172A" strokeWidth="2" />
            <line x1="27" y1="52" x2="33" y2="52" stroke="#0F172A" strokeWidth="1.8" />
            <line x1="67" y1="52" x2="73" y2="52" stroke="#0F172A" strokeWidth="1.8" />

            {/* Mata Dewasa Ramah */}
            <circle cx="40" cy="54" r="3" fill="#0F172A" />
            <circle cx="60" cy="54" r="3" fill="#0F172A" />
            <circle cx="39" cy="53" r="1" fill="#FFFFFF" />
            <circle cx="59" cy="53" r="1" fill="#FFFFFF" />

            {/* Hidung Berkarakter */}
            <path d="M 50 54 L 49 61 L 53 61" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />

            {/* Senyum Bijaksana */}
            <path d="M 43 65 Q 50 70 57 65" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

            {/* Baju Kemeja Batik / Safari Dinas Guru Dewasa */}
            <path d="M 12 120 L 20 84 L 80 84 L 88 120 Z" fill="#1E3A8A" stroke="#000000" strokeWidth="2.5" />
            {/* Kerah Kemeja Resmi */}
            <polygon points="34,84 48,102 50,88 42,84" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            <polygon points="66,84 52,102 50,88 58,84" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            {/* Dasi Formal */}
            <polygon points="47,88 53,88 56,110 50,120 44,110" fill="#F59E0B" stroke="#000000" strokeWidth="2" />
            {/* Lencana Pin ASN / Guru di Dada Kiri */}
            <circle cx="28" cy="98" r="3" fill="#FBBF24" stroke="#000000" strokeWidth="1" />
          </svg>
        </div>
      );
    }

    // Perempuan Dewasa: Guru / Pengawas Ruang / Pejabat Tamu
    if (isIslam) {
      // Guru Perempuan Berhijab Resmi
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-b from-rose-50 to-amber-50 flex items-center justify-center border-2 border-black ${shapeClass} ${className} shadow-xs select-none`}
          title="Avatar Guru / Pengawas Perempuan (Hijab Resmi)"
        >
          <svg viewBox="0 0 100 120" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="120" fill="#FFFBEB" />
            <circle cx="50" cy="52" r="44" fill="#FEF3C7" />

            {/* Hijab Luar Guru Warna Khaki / Cream Resmi */}
            <path
              d="M 18 120 C 18 78, 22 42, 28 32 C 34 22, 66 22, 72 32 C 78 42, 82 78, 82 120 Z"
              fill="#D97706"
              stroke="#000000"
              strokeWidth="2.5"
            />
            {/* Hijab Lipatan Luar */}
            <path
              d="M 22 120 C 22 80, 26 44, 32 35 C 38 26, 62 26, 68 35 C 74 44, 78 80, 78 120 Z"
              fill="#F59E0B"
              stroke="#000000"
              strokeWidth="2"
            />

            {/* Bukaan Muka Hijab */}
            <ellipse cx="50" cy="54" rx="19" ry="24" fill="#FDE68A" stroke="#000000" strokeWidth="2.2" />

            {/* Ciput / Dalaman Kerudung */}
            <path d="M 33 42 C 40 37, 60 37, 67 42 C 64 38, 56 36, 50 36 C 44 36, 36 38, 33 42 Z" fill="#78350F" />

            {/* Alis Lembut Dewasa */}
            <path d="M 36 46 Q 41 43 46 45" fill="none" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
            <path d="M 54 45 Q 59 43 64 46" fill="none" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />

            {/* Mata Indah Ramah */}
            <circle cx="41" cy="52" r="3.2" fill="#1C1917" />
            <circle cx="59" cy="52" r="3.2" fill="#1C1917" />
            <circle cx="39.8" cy="50.8" r="1.2" fill="#FFFFFF" />
            <circle cx="57.8" cy="50.8" r="1.2" fill="#FFFFFF" />
            {/* Bulu Mata */}
            <line x1="37" y1="50" x2="39" y2="51" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="63" y1="50" x2="61" y2="51" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hidung Halus */}
            <circle cx="50" cy="56.5" r="1.2" fill="#D97706" />

            {/* Senyum Ramah Guru */}
            <path d="M 44 61 Q 50 66 56 61" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="37" cy="58" rx="2.5" ry="1.5" fill="#FB7185" opacity="0.6" />
            <ellipse cx="63" cy="58" rx="2.5" ry="1.5" fill="#FB7185" opacity="0.6" />

            {/* Peniti / Bros Guru Emas di Dagu */}
            <circle cx="50" cy="74" r="3" fill="#FDE047" stroke="#000000" strokeWidth="1.5" />
            <circle cx="50" cy="74" r="1.2" fill="#DC2626" />

            {/* Pakaian Blazer / Kemeja Batik Guru */}
            <path d="M 14 120 L 24 94 L 76 94 L 86 120 Z" fill="#047857" stroke="#000000" strokeWidth="2.5" />
            {/* Kerah Blazer Hijau / Formal */}
            <polygon points="34,94 48,110 50,96 42,94" fill="#065F46" stroke="#000000" strokeWidth="1.8" />
            <polygon points="66,94 52,110 50,96 58,94" fill="#065F46" stroke="#000000" strokeWidth="1.8" />
          </svg>
        </div>
      );
    } else {
      // Guru Perempuan Non-Hijab (Rambut Sanggul / Bob Rapi Formal)
      return (
        <div
          className={`relative overflow-hidden bg-gradient-to-b from-slate-100 to-rose-100 flex items-center justify-center border-2 border-black ${shapeClass} ${className} shadow-xs select-none`}
          title="Avatar Guru / Pengawas Perempuan (Formal)"
        >
          <svg viewBox="0 0 100 120" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="120" fill="#F8FAFC" />
            <circle cx="50" cy="52" r="44" fill="#E2E8F0" />

            {/* Rambut Sanggul / Bob Belakang */}
            <ellipse cx="50" cy="30" rx="16" ry="12" fill="#1C1917" stroke="#000000" strokeWidth="2" />
            <path
              d="M 23 48 C 21 24, 79 24, 77 48 C 77 66, 75 75, 73 80 L 27 80 C 25 75, 23 66, 23 48 Z"
              fill="#1C1917"
              stroke="#000000"
              strokeWidth="2.5"
            />

            {/* Telinga & Anting Mutiara */}
            <circle cx="26" cy="56" r="6" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
            <circle cx="26" cy="60" r="2.2" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
            <circle cx="74" cy="56" r="6" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
            <circle cx="74" cy="60" r="2.2" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />

            {/* Leher & Kalung Mutiara Halus */}
            <path d="M 43 68 L 43 84 L 57 84 L 57 68 Z" fill="#F59E0B" stroke="#000000" strokeWidth="2" />

            {/* Wajah Dewasa */}
            <path
              d="M 29 46 C 29 70, 71 70, 71 46 C 71 31, 29 31, 29 46 Z"
              fill="#FDE68A"
              stroke="#000000"
              strokeWidth="2.5"
            />

            {/* Poni Samping Dewasa Elegan */}
            <path
              d="M 25 40 C 25 22, 75 22, 75 40 C 66 32, 54 36, 44 30 C 35 34, 29 36, 25 40 Z"
              fill="#292524"
              stroke="#000000"
              strokeWidth="2.2"
            />

            {/* Alis Lembut */}
            <path d="M 35 44 Q 41 42 46 44" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
            <path d="M 54 44 Q 59 42 65 44" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />

            {/* Mata & Bulu Mata */}
            <circle cx="41" cy="52" r="3.2" fill="#1C1917" />
            <circle cx="59" cy="52" r="3.2" fill="#1C1917" />
            <circle cx="39.8" cy="50.8" r="1.2" fill="#FFFFFF" />
            <circle cx="57.8" cy="50.8" r="1.2" fill="#FFFFFF" />
            <line x1="36" y1="50" x2="38" y2="51" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="64" y1="50" x2="62" y2="51" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hidung & Senyum */}
            <circle cx="50" cy="56" r="1.2" fill="#D97706" />
            <path d="M 44 61 Q 50 66 56 61" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

            {/* Baju Blazer Guru Biru Tua / Maroon */}
            <path d="M 12 120 L 22 84 L 78 84 L 88 120 Z" fill="#881337" stroke="#000000" strokeWidth="2.5" />
            <polygon points="34,84 48,102 50,88 42,84" fill="#FFF" stroke="#000000" strokeWidth="2" />
            <polygon points="66,84 52,102 50,88 58,84" fill="#FFF" stroke="#000000" strokeWidth="2" />
          </svg>
        </div>
      );
    }
  }

  // =========================================================================
  // 2. AVATAR SISWA: ANAK SEKOLAH (LAKI-LAKI & PEREMPUAN)
  // =========================================================================
  if (gender === 'L') {
    // Boy Student Avatar (Crisp, High Quality Vector Illustration)
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-b from-sky-50 to-sky-100 flex items-center justify-center border-2 border-black ${shapeClass} ${className} shadow-xs select-none`}
        title="Avatar Siswa Laki-laki"
      >
        <svg viewBox="0 0 100 120" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="120" fill="#F0F9FF" />
          <circle cx="50" cy="50" r="42" fill="#E0F2FE" />

          {/* Hair Back */}
          <path
            d="M 24 45 C 22 18, 78 18, 76 45 C 76 56, 73 60, 71 64 C 71 45, 68 30, 50 30 C 32 30, 29 45, 29 64 C 27 60, 24 56, 24 45 Z"
            fill="#1E293B"
          />

          {/* Ears */}
          <circle cx="27" cy="56" r="6.5" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
          <circle cx="27" cy="56" r="3" fill="#F59E0B" />
          <circle cx="73" cy="56" r="6.5" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
          <circle cx="73" cy="56" r="3" fill="#F59E0B" />

          {/* Neck */}
          <path d="M 43 68 L 43 82 L 57 82 L 57 68 Z" fill="#F59E0B" stroke="#000000" strokeWidth="2" />

          {/* Face Base */}
          <path
            d="M 30 46 C 30 68, 70 68, 70 46 C 70 32, 30 32, 30 46 Z"
            fill="#FDE68A"
            stroke="#000000"
            strokeWidth="2.5"
          />

          {/* Hair Front */}
          <path
            d="M 26 40 C 26 22, 74 20, 74 38 C 66 32, 54 36, 44 29 C 36 34, 30 35, 26 40 Z"
            fill="#0F172A"
            stroke="#000000"
            strokeWidth="2.2"
          />
          <path d="M 36 28 C 44 24, 60 24, 66 31" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d="M 35 44 Q 41 42 45 45" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
          <path d="M 55 45 Q 59 42 65 44" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

          {/* Eyes */}
          <circle cx="41" cy="52" r="4" fill="#0F172A" />
          <circle cx="59" cy="52" r="4" fill="#0F172A" />
          <circle cx="39.5" cy="50.5" r="1.5" fill="#FFFFFF" />
          <circle cx="57.5" cy="50.5" r="1.5" fill="#FFFFFF" />
          <circle cx="42.5" cy="53.5" r="0.8" fill="#FFFFFF" />
          <circle cx="60.5" cy="53.5" r="0.8" fill="#FFFFFF" />

          {/* Nose & Smile */}
          <circle cx="50" cy="56" r="1.5" fill="#D97706" />
          <path d="M 44 60 Q 50 66 56 60" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

          {/* Cheeks */}
          <ellipse cx="35" cy="57" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />
          <ellipse cx="65" cy="57" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />

          {/* School Uniform */}
          <path d="M 16 120 L 22 82 L 78 82 L 84 120 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
          <polygon points="34,82 48,96 50,84 42,82" fill="#F1F5F9" stroke="#000000" strokeWidth="2" />
          <polygon points="66,82 52,96 50,84 58,82" fill="#F1F5F9" stroke="#000000" strokeWidth="2" />
          <polygon points="47,84 53,84 56,100 50,114 44,100" fill="#DC2626" stroke="#000000" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // Girl Student Avatar: Check if Muslim (Hijab) or Non-Muslim (Braids)
  if (isIslam) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-b from-rose-50 to-pink-100 flex items-center justify-center border-2 border-black ${shapeClass} ${className} shadow-xs select-none`}
        title="Avatar Siswa Perempuan (Hijab Putih)"
      >
        <svg viewBox="0 0 100 120" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="120" fill="#FFF1F2" />
          <circle cx="50" cy="50" r="42" fill="#FCE7F3" />

          {/* Hijab Base */}
          <path
            d="M 22 120 C 22 76, 26 40, 32 30 C 38 20, 62 20, 68 30 C 74 40, 78 76, 78 120 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2.5"
          />

          {/* Face Area */}
          <ellipse cx="50" cy="52" rx="18" ry="22" fill="#FDE68A" stroke="#000000" strokeWidth="2.2" />

          {/* Inner Hijab Ciput */}
          <path d="M 34 40 C 40 35, 60 35, 66 40 C 64 36, 56 34, 50 34 C 44 34, 36 36, 34 40 Z" fill="#E2E8F0" />

          {/* Eyebrows */}
          <path d="M 36 44 Q 41 42 45 44" fill="none" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 55 44 Q 59 42 64 44" fill="none" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />

          {/* Eyes */}
          <circle cx="41" cy="51" r="3.8" fill="#1C1917" />
          <circle cx="59" cy="51" r="3.8" fill="#1C1917" />
          <circle cx="39.5" cy="49.5" r="1.5" fill="#FFFFFF" />
          <circle cx="57.5" cy="49.5" r="1.5" fill="#FFFFFF" />
          <circle cx="42.5" cy="52.5" r="0.7" fill="#FFFFFF" />
          <circle cx="60.5" cy="52.5" r="0.7" fill="#FFFFFF" />
          <line x1="36" y1="48" x2="38" y2="49.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="64" y1="48" x2="62" y2="49.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />

          {/* Nose & Smile */}
          <circle cx="50" cy="55.5" r="1.3" fill="#D97706" />
          <path d="M 44 59 Q 50 65 56 59" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="36" cy="56" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
          <ellipse cx="64" cy="56" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />

          {/* Hijab Pin Under Chin */}
          <circle cx="50" cy="72" r="2.5" fill="#F43F5E" stroke="#000000" strokeWidth="1.2" />

          {/* School Uniform Shoulders */}
          <path d="M 18 120 L 26 90 L 74 90 L 82 120 Z" fill="#F8FAFC" stroke="#000000" strokeWidth="2.5" />
          <polygon points="46,88 54,88 57,104 50,116 43,104" fill="#DC2626" stroke="#000000" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // Non-Muslim Girl: Braided Hair
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center border-2 border-black ${shapeClass} ${className} shadow-xs select-none`}
      title="Avatar Siswa Perempuan (Rambut Kepang)"
    >
      <svg viewBox="0 0 100 120" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="120" fill="#FFFBEB" />
        <circle cx="50" cy="50" r="42" fill="#FEF3C7" />

        {/* Back Hair */}
        <path
          d="M 22 46 C 20 20, 80 20, 78 46 C 78 72, 84 100, 84 116 L 16 116 C 16 100, 22 72, 22 46 Z"
          fill="#1C1917"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Ears */}
        <circle cx="26" cy="54" r="6" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
        <circle cx="26" cy="58" r="1.8" fill="#F43F5E" stroke="#000000" strokeWidth="1" />
        <circle cx="74" cy="54" r="6" fill="#FBBF24" stroke="#000000" strokeWidth="2" />
        <circle cx="74" cy="58" r="1.8" fill="#F43F5E" stroke="#000000" strokeWidth="1" />

        {/* Neck */}
        <path d="M 43 66 L 43 82 L 57 82 L 57 66 Z" fill="#F59E0B" stroke="#000000" strokeWidth="2" />

        {/* Face */}
        <path
          d="M 29 46 C 29 68, 71 68, 71 46 C 71 31, 29 31, 29 46 Z"
          fill="#FDE68A"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Bangs */}
        <path
          d="M 24 40 C 25 22, 75 22, 76 40 C 72 32, 60 36, 50 30 C 40 36, 28 32, 24 40 Z"
          fill="#292524"
          stroke="#000000"
          strokeWidth="2.2"
        />
        <circle cx="29" cy="34" r="3.5" fill="#F43F5E" stroke="#000000" strokeWidth="1.2" />

        {/* Eyes & Lashes */}
        <circle cx="41" cy="51" r="3.8" fill="#1C1917" />
        <circle cx="59" cy="51" r="3.8" fill="#1C1917" />
        <circle cx="39.5" cy="49.5" r="1.5" fill="#FFFFFF" />
        <circle cx="57.5" cy="49.5" r="1.5" fill="#FFFFFF" />
        <line x1="36" y1="48" x2="38" y2="49.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="64" y1="48" x2="62" y2="49.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />

        {/* Smile */}
        <circle cx="50" cy="55.5" r="1.3" fill="#D97706" />
        <path d="M 44 59 Q 50 65 56 59" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="35" cy="56" rx="3.5" ry="2" fill="#FB7185" opacity="0.7" />
        <ellipse cx="65" cy="56" rx="3.5" ry="2" fill="#FB7185" opacity="0.7" />

        {/* Uniform */}
        <path d="M 16 120 L 22 82 L 78 82 L 84 120 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
        <polygon points="34,82 48,96 50,84 42,82" fill="#F8FAFC" stroke="#000000" strokeWidth="2" />
        <polygon points="66,82 52,96 50,84 58,82" fill="#F8FAFC" stroke="#000000" strokeWidth="2" />
        <polygon points="46,84 54,84 57,100 50,113 43,100" fill="#DC2626" stroke="#000000" strokeWidth="2" />

        {/* Braids Left & Right */}
        <g id="left-braid">
          <path d="M 21 58 Q 17 66 22 72 Q 27 66 21 58 Z" fill="#292524" stroke="#000000" strokeWidth="2" />
          <path d="M 18 69 Q 14 78 19 84 Q 24 78 18 69 Z" fill="#1C1917" stroke="#000000" strokeWidth="2" />
          <path d="M 16 81 Q 12 90 17 96 Q 22 90 16 81 Z" fill="#292524" stroke="#000000" strokeWidth="2" />
          <rect x="11" y="98" width="9" height="4" rx="2" fill="#F43F5E" stroke="#000000" strokeWidth="1.5" />
        </g>

        <g id="right-braid">
          <path d="M 79 58 Q 83 66 78 72 Q 73 66 79 58 Z" fill="#292524" stroke="#000000" strokeWidth="2" />
          <path d="M 82 69 Q 86 78 81 84 Q 76 78 82 69 Z" fill="#1C1917" stroke="#000000" strokeWidth="2" />
          <path d="M 84 81 Q 88 90 83 96 Q 78 90 84 81 Z" fill="#292524" stroke="#000000" strokeWidth="2" />
          <rect x="80" y="98" width="9" height="4" rx="2" fill="#F43F5E" stroke="#000000" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
