import React, { useState } from 'react';
import { School, Exam, Student, Teacher, AnswerSheetDesignSettings } from '../../types';
import { DEFAULT_ANSWER_SHEET_DESIGN } from '../../data/mockData';
import {
  parseExamSchedule,
  formatScheduleDateIndo,
  formatReadableIndonesianDate,
} from '../../utils/scheduleHelper';
import {
  FileText,
  Building2,
  Lock,
  Award,
  Users,
  Calendar,
  ShieldCheck,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  BookmarkCheck,
  ArrowLeft,
  ArrowRight,
  Printer,
  Sparkles,
  School as SchoolIcon,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export type ExamAdminDocType =
  | 'cover'
  | 'school_profile'
  | 'confidentiality_statement'
  | 'committee_decree'
  | 'participant_count'
  | 'assessment_schedule'
  | 'room_proctors'
  | 'committee_attendance'
  | 'participant_attendance'
  | 'student_rules'
  | 'proctor_rules'
  | 'bulk_all';

interface ExamAdminPrintProps {
  school: School;
  exam: Exam;
  students: Student[];
  teachers: Teacher[];
  answerSheetDesign?: AnswerSheetDesignSettings;
  onBackToMenu: () => void;
  renderGlobalCategorySwitcher?: () => React.ReactNode;
}

interface AdminDocItem {
  id: ExamAdminDocType;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
}

export const ADMIN_DOCUMENTS: AdminDocItem[] = [
  {
    id: 'cover',
    number: 1,
    title: 'COVER',
    subtitle: 'Sampul Dokumen Portofolio Ujian',
    description: 'Halaman sampul resmi bundel dokumen administrasi pelaksanaan asesmen lengkap dengan logo sekolah, nama ujian, dan tahun ajaran.',
    icon: FileText,
    color: 'bg-rose-100 text-rose-950 border-rose-300',
    badge: 'Dokumen Utama',
  },
  {
    id: 'school_profile',
    number: 2,
    title: 'PROFIL SEKOLAH',
    subtitle: 'Identitas & Data Satuan Pendidikan',
    description: 'Lembar profil resmi memuat NPSN, NSS, alamat lengkap, kontak sekolah, serta kepala sekolah penanggung jawab asesmen.',
    icon: Building2,
    color: 'bg-blue-100 text-blue-950 border-blue-300',
    badge: 'Identitas',
  },
  {
    id: 'confidentiality_statement',
    number: 3,
    title: 'SURAT PERNYATAAN KERAHASIAAN',
    subtitle: 'Pakta Integritas Pengamanan Naskah & Nilai',
    description: 'Surat pernyataan integritas dan komitmen menjaga kerahasiaan naskah soal serta dokumen asesmen tanpa materai.',
    icon: Lock,
    color: 'bg-amber-100 text-amber-950 border-amber-300',
    badge: 'Pakta Integritas',
  },
  {
    id: 'committee_decree',
    number: 4,
    title: 'SURAT KEPUTUSAN PANITIA',
    subtitle: 'SK Penetapan Panitia Asesmen',
    description: 'Surat Keputusan (SK) Kepala Sekolah tentang susunan panitia, pembagian tugas penanggung jawab, ketua, sekretaris, dan bendahara.',
    icon: Award,
    color: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    badge: 'Legalitas',
  },
  {
    id: 'participant_count',
    number: 5,
    title: 'JUMLAH PESERTA',
    subtitle: 'Rekapitulasi Data Peserta Asesmen',
    description: 'Tabel rekapitulasi jumlah siswa laki-laki, perempuan, total per rombel/kelas, serta distribusi per ruang ujian.',
    icon: Users,
    color: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    badge: 'Data Statistik',
  },
  {
    id: 'assessment_schedule',
    number: 6,
    title: 'JADWAL ASESMEN',
    subtitle: 'Jadwal Pelaksanaan Mata Pelajaran & Waktu',
    description: 'Tabel matriks jadwal pelaksanaan ujian per hari, tanggal, sesi waktu, dan mata pelajaran yang diujikan secara resmi.',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-950 border-purple-300',
    badge: 'Jadwal Resmi',
  },
  {
    id: 'room_proctors',
    number: 7,
    title: 'PENGAWAS RUANG',
    subtitle: 'Daftar & Penugasan Pengawas Ruang',
    description: 'Matriks pembagian tugas guru pengawas ruang ujian per sesi, nomor ruang, tanggal pelaksanaan, dan tanda tangan penugasan.',
    icon: ShieldCheck,
    color: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    badge: 'Penugasan',
  },
  {
    id: 'committee_attendance',
    number: 8,
    title: 'DAFTAR HADIR PANITIA',
    subtitle: 'Presensi Harian Panitia Penyelenggara',
    description: 'Formulir presensi tanda tangan harian panitia pelaksana ujian lengkap dengan jabatan, waktu hadir, dan keterangan tugas.',
    icon: ClipboardList,
    color: 'bg-teal-100 text-teal-950 border-teal-300',
    badge: 'Presensi Panitia',
  },
  {
    id: 'participant_attendance',
    number: 9,
    title: 'DAFTAR HADIR PESERTA',
    subtitle: 'Presensi Siswa per Ruang Ujian',
    description: 'Lembar absensi tanda tangan peserta ujian per ruang, mencakup nomor meja, NISN, nama lengkap, dan status kehadiran.',
    icon: ListChecks,
    color: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    badge: 'Presensi Siswa',
  },
  {
    id: 'student_rules',
    number: 10,
    title: 'TATA TERTIB PESERTA',
    subtitle: 'Peraturan & Larangan Siswa Selama Ujian',
    description: 'Petunjuk tata tertib peserta ujian, kewajiban membawa kartu, larangan membawa alat komunikasi, dan sanksi pelanggaran.',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-950 border-orange-300',
    badge: 'Tata Tertib',
  },
  {
    id: 'proctor_rules',
    number: 11,
    title: 'TATA TERTIB PENGAWAS',
    subtitle: 'Panduan & Kode Etik Pengawas Ruang',
    description: 'Pedoman operasional standar pengawas ruang sebelum, saat, dan sesudah ujian berlangsung demi kelancaran dan integritas asesmen.',
    icon: BookmarkCheck,
    color: 'bg-pink-100 text-pink-950 border-pink-300',
    badge: 'Kode Etik',
  },
];

/**
 * Deteksi otomatis jenjang pendidikan berdasarkan nama sekolah
 */
export function detectEducationLevel(schoolName?: string): string {
  if (!schoolName) return 'Sekolah Dasar (SD)';
  const s = schoolName.toUpperCase();
  if (s.includes('SD') || s.includes('SEKOLAH DASAR') || s.includes('UPTD SD') || s.includes('SDN')) {
    return 'Sekolah Dasar (SD)';
  }
  if (s.includes('MI') || s.includes('MADRASAH IBTIDAIYAH') || s.includes('MIN')) {
    return 'Madrasah Ibtidaiyah (MI)';
  }
  if (s.includes('SMP') || s.includes('SEKOLAH MENENGAH PERTAMA') || s.includes('SMPN')) {
    return 'Sekolah Menengah Pertama (SMP)';
  }
  if (s.includes('MTS') || s.includes('MADRASAH TSANAWIYAH') || s.includes('MTSN')) {
    return 'Madrasah Tsanawiyah (MTs)';
  }
  if (s.includes('SMA') || s.includes('SEKOLAH MENENGAH ATAS') || s.includes('SMAN')) {
    return 'Sekolah Menengah Atas (SMA)';
  }
  if (s.includes('SMK') || s.includes('SEKOLAH MENENGAH KEJURUAN') || s.includes('SMKN')) {
    return 'Sekolah Menengah Kejuruan (SMK)';
  }
  if (s.includes('MA') || s.includes('MADRASAH ALIYAH') || s.includes('MAN')) {
    return 'Madrasah Aliyah (MA)';
  }
  if (s.includes('TK') || s.includes('PAUD') || s.includes('RA')) {
    return 'Pendidikan Anak Usia Dini (PAUD / TK)';
  }
  return 'Sekolah Dasar (SD)';
}

/**
 * Deteksi otomatis status sekolah (Negeri / Swasta)
 */
export function detectSchoolStatus(schoolName?: string): string {
  if (!schoolName) return 'Negeri';
  const s = schoolName.toUpperCase();
  if (
    s.includes('NEGERI') ||
    s.includes('UPTD') ||
    s.includes('MIN') ||
    s.includes('MTSN') ||
    s.includes('MAN') ||
    s.includes('SDN') ||
    s.includes('SMPN') ||
    s.includes('SMAN') ||
    s.includes('SMKN')
  ) {
    return 'Negeri';
  }
  return 'Swasta';
}

export const ExamAdminPrint: React.FC<ExamAdminPrintProps> = ({
  school,
  exam,
  students,
  teachers,
  answerSheetDesign,
  onBackToMenu,
  renderGlobalCategorySwitcher,
}) => {
  const [activeDoc, setActiveDoc] = useState<ExamAdminDocType | null>(null);

  const docInfo = activeDoc && activeDoc !== 'bulk_all' ? ADMIN_DOCUMENTS.find((d) => d.id === activeDoc) : null;
  const scheduleItems = parseExamSchedule(exam?.scheduleInfo);

  // Email resmi: jika tidak ada data email maka tampilkan '-' (jangan diisi otomatis)
  const schoolEmail =
    school?.email && school.email.trim().length > 0 ? school.email.trim() : '-';

  // Format tanggal titimangsa yang bersih dan rapi (bebas dari format raw Date JS seperti GMT+0700)
  const cleanSignatureDate =
    formatReadableIndonesianDate(exam?.signatureDate) ||
    formatReadableIndonesianDate(exam?.dateText ? exam.dateText.split('-')[0].trim() : '') ||
    '01 Desember 2026';

  const titimangsaLocation = exam?.location || school?.regency || 'Kediri';

  // Handler untuk print dokumen aktif
  const handlePrint = () => {
    window.print();
  };

  // ========================================================
  // DATA KOP SEKOLAH RESMI DARI DATABASE (Terintegrasi Penuh dengan Desain / Database)
  // ========================================================
  const activeKopSettings = answerSheetDesign?.kop || DEFAULT_ANSWER_SHEET_DESIGN.kop;
  const rawRegency = school?.regency ? school.regency.toUpperCase().trim() : '';
  const cleanRegencyName = rawRegency.replace(/^(PEMERINTAH\s+)?(KABUPATEN|KOTA)?\s*/i, '').trim() || 'KEDIRI';
  const defaultLine1 = `PEMERINTAH KABUPATEN ${cleanRegencyName}`;

  const kopLine1 =
    activeKopSettings?.line1 && activeKopSettings.line1.trim().length > 0
      ? activeKopSettings.line1
      : defaultLine1;

  const kopLine2 =
    activeKopSettings?.line2 && activeKopSettings.line2.trim().length > 0
      ? activeKopSettings.line2
      : 'DINAS PENDIDIKAN';

  const kopLine3 =
    activeKopSettings?.line3 && activeKopSettings.line3.trim().length > 0
      ? activeKopSettings.line3
      : (school?.name || 'SD NEGERI MEDOWO 1');

  const defaultLine4 = [
    school?.address,
    school?.village ? `Ds. ${school.village}` : '',
    school?.district ? `Kec. ${school.district}` : '',
    school?.regency ? `Kab. ${cleanRegencyName}` : '',
    (school as any)?.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const kopLine4 =
    activeKopSettings?.line4 && activeKopSettings.line4.trim().length > 0
      ? activeKopSettings.line4
      : (defaultLine4 || 'Jl Raya Medowo Ds. Medowo, Kec. Kandangan, Kab. Kediri 64294');

  const defaultLine5 = `Telepon : ${(school as any)?.phone || '-'} , Pos-el : ${schoolEmail}`;
  const kopLine5 =
    activeKopSettings?.line5 && activeKopSettings.line5.trim().length > 0
      ? activeKopSettings.line5
      : defaultLine5;

  const kopLogo = activeKopSettings?.logoUrl || school?.logoUrl || '';
  const showLogo = activeKopSettings?.showLogo !== false;

  // Garis ganda pembatas kop resmi
  const renderKopDivider = () => (
    <div className="w-full my-2">
      <div className="border-b-[2.5px] border-black w-full" />
      <div className="border-b border-black w-full mt-[1.5px]" />
    </div>
  );

  // Komponen KOP Surat Resmi Sekolah (Berdasarkan Database)
  const renderOfficialSchoolKop = () => (
    <div className="w-full pb-1">
      <div className="flex items-center gap-3.5">
        {showLogo && (
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            {kopLogo ? (
              <img
                src={kopLogo}
                alt="Logo Sekolah"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-neutral-400 rounded flex items-center justify-center text-[10px] text-neutral-400 font-bold uppercase">
                Logo
              </div>
            )}
          </div>
        )}
        <div className="flex-1 text-center space-y-0.5">
          {kopLine1 && (
            <div className="text-[11pt] font-bold tracking-wider uppercase leading-snug">
              {kopLine1}
            </div>
          )}
          {kopLine2 && (
            <div className="text-[12pt] font-bold tracking-wider uppercase leading-snug">
              {kopLine2}
            </div>
          )}
          {kopLine3 && (
            <div className="text-[14pt] font-black tracking-wide uppercase leading-tight text-neutral-950">
              {kopLine3}
            </div>
          )}
          {kopLine4 && (
            <div className="text-[9.5pt] leading-tight text-neutral-800">
              {kopLine4}
            </div>
          )}
          {kopLine5 && (
            <div className="text-[9pt] leading-tight text-neutral-700">
              {kopLine5}
            </div>
          )}
        </div>
      </div>
      {renderKopDivider()}
    </div>
  );

  // Komponen Tanda Tangan Resmi (Dilengkapi break-inside avoid agar utuh berpindah ke halaman kedua bila melampaui batas 3cm margin bawah)
  const renderSignatureBlock = (title = 'Kepala Sekolah', showDate = true) => (
    <div
      className="admin-signature-block pt-6 flex justify-end"
      style={{
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
      }}
    >
      <div className="w-[75mm] text-center" style={{ fontSize: '12pt', lineHeight: 1.5 }}>
        {showDate && (
          <p>
            {titimangsaLocation}, {cleanSignatureDate}
          </p>
        )}
        <p className="font-bold">
          {school?.headTitle || title},
        </p>

        {/* Area Tanda Tangan / Scan */}
        <div className="h-[22mm] flex items-center justify-center my-1 relative">
          {school?.principalSignatureUrl ? (
            <img
              src={school.principalSignatureUrl}
              alt="Tanda Tangan Kepala Sekolah"
              className="h-[20mm] object-contain mx-auto"
            />
          ) : null}
        </div>

        <p className="font-bold underline uppercase">
          {school?.principalName || 'NAMA KEPALA SEKOLAH'}
        </p>
        <p className="font-mono text-[11pt]">
          NIP. {school?.principalNip || '-'}
        </p>
      </div>
    </div>
  );

  // Base styling untuk lembar A4 Administrasi (Margin 3cm Atas, 4cm Kiri, 3cm Kanan, 3cm Bawah, Tanpa Kotak Border/Scrollbar)
  const basePageStyle: React.CSSProperties = {
    width: '210mm',
    minHeight: '297mm',
    paddingTop: '30mm',
    paddingLeft: '40mm',
    paddingRight: '30mm',
    paddingBottom: '30mm',
    fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
    fontSize: '12pt',
    lineHeight: 1.5,
    boxSizing: 'border-box',
    borderRadius: '0px',
    border: 'none',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    backgroundColor: '#ffffff',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    overflow: 'visible',
  };

  // ========================================================
  // 1. RENDER COVER (Ukuran 20pt Atas/Sekolah, 16pt Asesmen/Semester/Tahun, Center Vertikal & Horizontal, Frame 3-4-3-3cm)
  // ========================================================
  const renderCoverPage = (key = 'cover_page') => (
    <div
      key={key}
      className="a4-admin-page bg-white text-black relative no-scrollbar"
      style={{
        ...basePageStyle,
        height: '297mm',
      }}
    >
      {/* 
        Frame Garis Mengikuti Batas Margin Dokumen dari Kertas (Pas 3cm atas, 4cm kiri, 3cm kanan, 3cm bawah)
        Ukuran: Lebar 140mm (210-40-30), Tinggi 237mm (297-30-30)
        Isi Cover Dibuat Pas di Tengah Secara Vertikal & Horizontal
      */}
      <div
        className="cover-border-frame border-[2.5px] border-black w-full flex flex-col justify-center items-center text-center p-6 relative"
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          minHeight: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Garis Dalam Tipis Resmi Portofolio */}
        <div className="absolute inset-[3.5mm] border border-black pointer-events-none" />

        {/* Konten Terpusat di Tengah */}
        <div className="flex flex-col justify-center items-center text-center w-full my-auto space-y-7">
          {/* Teks Atas: Ukuran 20pt Bold Huruf Besar */}
          <div className="space-y-2 w-full">
            <h1
              className="font-bold uppercase tracking-wider text-black leading-snug"
              style={{ fontSize: '20pt', lineHeight: 1.35 }}
            >
              BERKAS ADMINISTRASI
            </h1>
            <h2
              className="font-bold uppercase tracking-wider text-black leading-snug"
              style={{ fontSize: '20pt', lineHeight: 1.35 }}
            >
              PELAKSANAAN ASESMEN
            </h2>
          </div>

          {/* Logo Sekolah di Tengah dengan Jarak Cukup */}
          <div className="py-2 flex flex-col items-center justify-center">
            {school?.logoUrl ? (
              <img
                src={school.logoUrl}
                alt={`Logo ${school.name}`}
                className="w-36 h-36 object-contain"
              />
            ) : (
              <div className="w-36 h-36 border-2 border-dashed border-neutral-400 flex flex-col items-center justify-center p-4 text-neutral-400">
                <Building2 className="w-16 h-16 mb-2" />
                <span className="text-xs font-bold uppercase">Logo Sekolah</span>
              </div>
            )}
          </div>

          {/* Teks Bawah: Nama Asesmen (16pt), Semester (16pt), Nama Sekolah (20pt), Tahun Pelajaran (16pt) */}
          <div className="space-y-3 w-full">
            {/* Nama Asesmen: Ukuran 16pt */}
            <div
              className="font-bold uppercase tracking-wide text-black leading-snug"
              style={{ fontSize: '16pt', lineHeight: 1.35 }}
            >
              {exam?.name || 'ASESMEN SUMATIF AKHIR SEMESTER'}
            </div>

            {/* Semester: Ukuran 16pt */}
            <div
              className="font-bold uppercase tracking-wide text-black leading-snug"
              style={{ fontSize: '16pt', lineHeight: 1.35 }}
            >
              {exam?.semester || 'SEMESTER GANJIL'}
            </div>

            {/* Khusus Nama Sekolah: Ukuran 20pt */}
            <div
              className="font-bold uppercase tracking-wider text-black leading-snug pt-1"
              style={{ fontSize: '20pt', lineHeight: 1.35 }}
            >
              {school?.name || 'NAMA SATUAN PENDIDIKAN'}
            </div>

            {/* Tahun Pelajaran: Ukuran 16pt */}
            <div
              className="font-bold uppercase tracking-wide text-black leading-snug"
              style={{ fontSize: '16pt', lineHeight: 1.35 }}
            >
              TAHUN PELAJARAN {exam?.academicYear || '2026/2027'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================================
  // 2. RENDER PROFIL SEKOLAH (Ukuran 14pt Bold Judul 3 Baris, Font 12pt Jarak 1.5, Tanpa Kotak Border/Rounded)
  // ========================================================
  const renderSchoolProfilePage = (key = 'school_profile_page') => (
    <div
      key={key}
      className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
      style={basePageStyle}
    >
      <div>
        {/* Judul: PROFIL SEKOLAH PENYELENGGARA, NAMA ASESMEN, TAHUN PELAJARAN (Ukuran 14pt Bold) */}
        <div className="text-center pb-5 border-b-2 border-black space-y-1">
          <h1
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: '14pt', lineHeight: 1.4 }}
          >
            PROFIL SEKOLAH PENYELENGGARA
          </h1>
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: '14pt', lineHeight: 1.4 }}
          >
            {exam?.name || 'ASESMEN SUMATIF'}
          </h2>
          <p
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: '14pt', lineHeight: 1.4 }}
          >
            TAHUN PELAJARAN {exam?.academicYear || '2026/2027'}
          </p>
        </div>

        {/* Isian Data Profil Sekolah (Font 12pt, Jarak 1.5) */}
        <div className="my-6">
          <table className="w-full text-left" style={{ fontSize: '12pt', lineHeight: 1.5 }}>
            <tbody>
              <tr>
                <td className="w-[180px] font-bold py-1 align-top">Nama Sekolah</td>
                <td className="w-[20px] font-bold py-1 align-top">:</td>
                <td className="py-1 uppercase font-bold text-neutral-900">{school?.name || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">NPSN</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1 font-mono">{school?.npsn || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Jenjang Pendidikan</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{detectEducationLevel(school?.name)}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Status Sekolah</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{detectSchoolStatus(school?.name)}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Alamat</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{school?.address || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Desa / Kelurahan</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{school?.village || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Kecamatan</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{school?.district || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Kabupaten / Kota</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{school?.regency || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Provinsi</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{school?.province || '-'}</td>
              </tr>
              <tr>
                <td className="font-bold py-1 align-top">Email</td>
                <td className="font-bold py-1 align-top">:</td>
                <td className="py-1">{schoolEmail}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kolom Tanda Tangan Kepala Sekolah (Bawah Kanan) */}
      {renderSignatureBlock()}
    </div>
  );

  // ========================================================
  // 3. RENDER SURAT PERNYATAAN KERAHASIAAN (KOP Resmi Database, Tanpa Kotak Materai, Margin 3-4-3-3cm)
  // ========================================================
  const renderConfidentialityStatementPage = (key = 'confidentiality_page') => (
    <div
      key={key}
      className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
      style={basePageStyle}
    >
      <div>
        {/* Kop Resmi Sekolah dari Database */}
        {renderOfficialSchoolKop()}

        {/* Judul Surat: SURAT PERNYATAAN MENJAGA KERAHASIAAN (Bold, Underline) */}
        <div className="text-center my-3">
          <h1 className="font-bold uppercase tracking-wider text-[13pt] underline">
            SURAT PERNYATAAN MENJAGA KERAHASIAAN
          </h1>
        </div>

        {/* Pembuka */}
        <p className="mb-1.5 text-justify">Yang bertanda tangan di bawah ini :</p>

        {/* Tabel Identitas Kepala Sekolah */}
        <table className="w-full text-left mb-2.5" style={{ fontSize: '11.5pt', lineHeight: 1.45 }}>
          <tbody>
            <tr>
              <td className="w-[140px] font-semibold py-0.5 align-top">Nama</td>
              <td className="w-[20px] font-semibold py-0.5 align-top">:</td>
              <td className="py-0.5 font-bold uppercase">{school?.principalName || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-0.5 align-top">NIP</td>
              <td className="font-semibold py-0.5 align-top">:</td>
              <td className="py-0.5 font-mono">{school?.principalNip || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-0.5 align-top">Jabatan</td>
              <td className="font-semibold py-0.5 align-top">:</td>
              <td className="py-0.5">{school?.headTitle || 'Kepala Sekolah'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-0.5 align-top">Alamat Instansi</td>
              <td className="font-semibold py-0.5 align-top">:</td>
              <td className="py-0.5">
                {[school?.address, school?.village, school?.district, school?.regency]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Paragraf Inti */}
        <p className="text-justify mb-2 leading-[1.45]">
          Dalam rangka Pelaksanaan dan Penyelenggaraan{' '}
          <strong>
            {exam?.name || 'Asesmen Sumatif'} {exam?.semester || 'Semester Ganjil'}
          </strong>{' '}
          Tahun Pelajaran {exam?.academicYear || '2026/2027'} , dengan ini menyatakan bahwa saya :
        </p>

        {/* Poin Butir 1, 2, 3 */}
        <ol className="list-decimal pl-6 space-y-1.5 mb-2.5 text-justify leading-[1.45]">
          <li>
            Menyadari Hakekat dan Kerahasiaan{' '}
            <strong>
              {exam?.name || 'Asesmen Sumatif'} {exam?.semester || 'Semester Ganjil'}
            </strong>{' '}
            sebagai tugas negara yang pelaksanaannya diserahkan kepada saya.
          </li>
          <li>Akan memegang teguh kerahasiaan tersebut.</li>
          <li>
            Tidak akan memberitahukan / menyampaikan atau membocorkan kepada siapapun, segala sesuatu
            yang telah saya ketahui dan saya kerjakan dalam melaksanakan tugas tersebut di atas, baik
            secara langsung ataupun tidak langsung.
          </li>
        </ol>

        {/* Paragraf Penutup */}
        <p className="text-justify leading-[1.45]">
          Pernyataan ini saya buat dan tanda tangani dengan sebenarnya, dalam keadaan sadar, tanpa
          paksaan oleh pihak lain, serta penuh rasa tanggung jawab. Apabila saya melakukan
          perbuatan-perbuatan yang bertentangan dengan pernyataan di atas, saya bersedia dituntut dan
          diberi sanksi sesuai perundang-undangan hukum yang berlaku.
        </p>
      </div>

      {/* Kolom Tanda Tangan Bawah Kanan (Tanpa Kotak Materai) */}
      {renderSignatureBlock('Yang membuat pernyataan')}
    </div>
  );

  // ========================================================
  // 6. RENDER JADWAL ASESMEN (KOP Resmi Database, Matriks Jadwal, Format 3-4-3-3cm)
  // Sesuai aturan: jika melebihi batas 3cm margin bawah, geser ke halaman kedua secara utuh
  // ========================================================
  const renderAssessmentSchedulePage = (key = 'assessment_schedule_page') => {
    // Jika data jadwal lebih dari 7 hari, pecah otomatis menjadi 2 halaman agar mematuhi margin bawah 3cm
    const needsSecondPage = scheduleItems.length > 7;
    const page1Items = needsSecondPage ? scheduleItems.slice(0, 7) : scheduleItems;
    const page2Items = needsSecondPage ? scheduleItems.slice(7) : [];

    const renderScheduleTableRows = (items: typeof scheduleItems, startIdx = 0) => {
      if (items.length === 0) {
        return (
          <tr>
            <td colSpan={5} className="p-3 text-center text-neutral-500 italic border-b border-black">
              Data jadwal pelaksanaan asesmen belum dikonfigurasi pada menu Data Asesmen.
            </td>
          </tr>
        );
      }
      return items.map((it, idx) => (
        <tr key={it.id || idx} className="border-b border-black">
          <td className="p-2 border-r border-black text-center">{startIdx + idx + 1}</td>
          <td className="p-2 border-r border-black font-semibold">
            {it.day}{it.date ? `, ${formatScheduleDateIndo(it.date)}` : ''}
          </td>
          <td className="p-2 border-r border-black font-mono text-center">{it.time || '07.30 - 09.30'}</td>
          <td className="p-2 border-r border-black font-semibold">{it.subject || '-'}</td>
          <td className="p-2 text-center text-xs text-neutral-600">{(it as any).notes || it.subject2 || '-'}</td>
        </tr>
      ));
    };

    return (
      <React.Fragment key={key}>
        {/* HALAMAN 1 JADWAL ASESMEN */}
        <div
          className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
          style={basePageStyle}
        >
          <div>
            {/* Kop Resmi Sekolah dari Database */}
            {renderOfficialSchoolKop()}

            {/* Judul Dokumen */}
            <div className="text-center my-4 space-y-1">
              <h1 className="font-bold uppercase tracking-wider text-[13pt] underline">
                JADWAL PELAKSANAAN ASESMEN
              </h1>
              <h2 className="font-bold uppercase text-[12pt]">
                {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? `• ${exam.semester.toUpperCase()}` : ''}
              </h2>
              <p className="font-bold uppercase text-[11pt]">
                TAHUN PELAJARAN {exam?.academicYear || '2026/2027'}
              </p>
            </div>

            {/* Tabel Jadwal Resmi */}
            <div className="my-4">
              <table className="w-full text-left border border-black" style={{ fontSize: '11pt', lineHeight: 1.4 }}>
                <thead>
                  <tr className="bg-neutral-100 border-b border-black font-bold text-center">
                    <th className="p-2 border-r border-black w-10">No</th>
                    <th className="p-2 border-r border-black w-44">Hari &amp; Tanggal</th>
                    <th className="p-2 border-r border-black w-36">Waktu</th>
                    <th className="p-2 border-r border-black">Mata Pelajaran</th>
                    <th className="p-2 w-28">Keterangan</th>
                  </tr>
                </thead>
                <tbody>{renderScheduleTableRows(page1Items, 0)}</tbody>
              </table>
            </div>
          </div>

          {/* Jika tidak membutuhkan halaman 2, tanda tangan langsung di bawah halaman 1 */}
          {!needsSecondPage && renderSignatureBlock()}
        </div>

        {/* HALAMAN 2 (Bila jadwal melebihi batas 3cm margin bawah kertas, kolom ttd digeser ke halaman kedua) */}
        {needsSecondPage && (
          <div
            className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
            style={basePageStyle}
          >
            <div>
              {/* Lanjutan Tabel Jadwal */}
              <div className="mb-4">
                <p className="text-xs italic text-neutral-600 mb-2 font-semibold">
                  (Lanjutan Jadwal Pelaksanaan Asesmen)
                </p>
                <table className="w-full text-left border border-black" style={{ fontSize: '11pt', lineHeight: 1.4 }}>
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black font-bold text-center">
                      <th className="p-2 border-r border-black w-10">No</th>
                      <th className="p-2 border-r border-black w-44">Hari &amp; Tanggal</th>
                      <th className="p-2 border-r border-black w-36">Waktu</th>
                      <th className="p-2 border-r border-black">Mata Pelajaran</th>
                      <th className="p-2 w-28">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>{renderScheduleTableRows(page2Items, 7)}</tbody>
                </table>
              </div>
            </div>

            {/* Kolom Tanda Tangan Utuh di Halaman 2 */}
            {renderSignatureBlock()}
          </div>
        )}
      </React.Fragment>
    );
  };

  // ========================================================
  // 4. RENDER BERKAS DOKUMEN LAINNYA (SK Panitia, Rekap Peserta, Pengawas Ruang, Presensi, Tata Tertib)
  // Seluruh dokumen menggunakan KOP Resmi Sekolah dari Database & Format 3-4-3-3cm
  // ========================================================
  const renderPlaceholderDocPage = (targetDoc: AdminDocItem, key: string) => {
    // Jadwal Asesmen dialihkan ke renderer khusus jadwal
    if (targetDoc.id === 'assessment_schedule') {
      return renderAssessmentSchedulePage(key);
    }

    return (
      <div
        key={key}
        className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
        style={basePageStyle}
      >
        <div>
          {/* Header Kop Resmi Sekolah dari Database */}
          {renderOfficialSchoolKop()}

          {/* Judul Dokumen Resmi */}
          <div className="text-center my-3 space-y-1">
            <h1 className="font-bold uppercase tracking-wide text-[13pt] underline">
              {targetDoc.title}
            </h1>
            <h2 className="font-bold text-[11.5pt] uppercase">
              {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? `• ${exam.semester.toUpperCase()}` : ''}
            </h2>
            <p className="font-semibold text-[10.5pt] text-neutral-800 uppercase">
              TAHUN PELAJARAN {exam?.academicYear || '2026/2027'}
            </p>
          </div>

          {/* ========================================================
              ISI DOKUMEN SPESIFIK SESUAI JENIS DOKUMEN ADMINISTRASI
             ======================================================== */}
          {/* 4. SURAT KEPUTUSAN PANITIA */}
          {targetDoc.id === 'committee_decree' && (
            <div className="my-4 space-y-3" style={{ fontSize: '11.5pt', lineHeight: 1.45 }}>
              <div className="text-center font-bold text-xs uppercase mb-2">
                Nomor: 421.2 / {exam?.id ? String(exam.id).slice(-4) : '048'} / PAN-AS / {new Date().getFullYear()}
              </div>
              <p className="text-justify">
                Kepala {school?.name || 'Satuan Pendidikan'}, menimbang perlunya kelancaran dan ketertiban pelaksanaan{' '}
                <strong>{exam?.name}</strong> Tahun Pelajaran {exam?.academicYear} :
              </p>
              <div className="space-y-1 text-justify">
                <p><strong>MEMUTUSKAN :</strong></p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Menetapkan susunan panitia pelaksana asesmen sebagaimana terlampir dalam keputusan ini.</li>
                  <li>Panitia bertugas mempersiapkan administrasi, naskah soal, ruang asesmen, dan pelaporan hasil.</li>
                  <li>Segala biaya yang timbul dibebankan pada anggaran kegiatan sekolah yang sesuai.</li>
                </ol>
              </div>

              {/* Tabel Susunan Panitia */}
              <div className="pt-2">
                <table className="w-full text-left border border-black" style={{ fontSize: '10.5pt', lineHeight: 1.35 }}>
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-center font-bold">
                      <th className="p-1.5 border-r border-black w-10">No</th>
                      <th className="p-1.5 border-r border-black w-44">Jabatan Kepanitiaan</th>
                      <th className="p-1.5 border-r border-black">Nama Lengkap</th>
                      <th className="p-1.5 w-32">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">1</td>
                      <td className="p-1.5 border-r border-black font-semibold">Penanggung Jawab</td>
                      <td className="p-1.5 border-r border-black font-bold uppercase">{school?.principalName || 'Kepala Sekolah'}</td>
                      <td className="p-1.5 text-center text-xs">Kepala Sekolah</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">2</td>
                      <td className="p-1.5 border-r border-black font-semibold">Ketua Panitia</td>
                      <td className="p-1.5 border-r border-black">{teachers[0]?.name || 'Guru Senior / Wakasek'}</td>
                      <td className="p-1.5 text-center text-xs">Pendidik</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">3</td>
                      <td className="p-1.5 border-r border-black font-semibold">Sekretaris</td>
                      <td className="p-1.5 border-r border-black">{teachers[1]?.name || 'Guru Pelaksana'}</td>
                      <td className="p-1.5 text-center text-xs">Pendidik</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">4</td>
                      <td className="p-1.5 border-r border-black font-semibold">Bendahara</td>
                      <td className="p-1.5 border-r border-black">{teachers[2]?.name || 'Bendahara Sekolah'}</td>
                      <td className="p-1.5 text-center text-xs">Pendidik</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">5</td>
                      <td className="p-1.5 border-r border-black font-semibold">Seksi Penggandaan &amp; Naskah</td>
                      <td className="p-1.5 border-r border-black">{teachers[3]?.name || 'Tenaga Kependidikan'}</td>
                      <td className="p-1.5 text-center text-xs">Tenaga Kependidikan</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. JUMLAH PESERTA */}
          {targetDoc.id === 'participant_count' && (
            <div className="my-4 space-y-3" style={{ fontSize: '11.5pt', lineHeight: 1.45 }}>
              <p className="text-justify">
                Rekapitulasi resmi data jumlah siswa peserta <strong>{exam?.name}</strong> di lingkungan{' '}
                <strong>{school?.name}</strong> terdata sebagai berikut :
              </p>
              <table className="w-full text-left border border-black" style={{ fontSize: '11pt', lineHeight: 1.4 }}>
                <thead>
                  <tr className="bg-neutral-100 border-b border-black text-center font-bold">
                    <th className="p-2 border-r border-black w-12">No</th>
                    <th className="p-2 border-r border-black">Rombel / Kelas</th>
                    <th className="p-2 border-r border-black w-24">Laki-laki</th>
                    <th className="p-2 border-r border-black w-24">Perempuan</th>
                    <th className="p-2 border-r border-black w-28">Jumlah</th>
                    <th className="p-2 w-32">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-2 border-r border-black text-center">1</td>
                    <td className="p-2 border-r border-black font-semibold">Peserta Terdaftar Keseluruhan</td>
                    <td className="p-2 border-r border-black text-center font-mono">
                      {students.filter((s) => s.gender === 'L').length}
                    </td>
                    <td className="p-2 border-r border-black text-center font-mono">
                      {students.filter((s) => s.gender === 'P').length}
                    </td>
                    <td className="p-2 border-r border-black text-center font-bold font-mono">
                      {students.length}
                    </td>
                    <td className="p-2 text-center text-xs">Siswa Aktif</td>
                  </tr>
                  <tr className="bg-neutral-50 font-bold border-b border-black">
                    <td colSpan={4} className="p-2 border-r border-black text-center uppercase">
                      Total Peserta Asesmen
                    </td>
                    <td className="p-2 border-r border-black text-center font-bold font-mono">
                      {students.length} Siswa
                    </td>
                    <td className="p-2 text-center text-xs">Lengkap</td>
                  </tr>
                </tbody>
              </table>
              <div className="pt-2 text-xs text-neutral-600">
                * Distribusi ruang ujian disesuaikan dengan kapasitas standar rombel dan protokol pelaksanaan sekolah.
              </div>
            </div>
          )}

          {/* 7. PENGAWAS RUANG */}
          {targetDoc.id === 'room_proctors' && (
            <div className="my-4 space-y-3" style={{ fontSize: '11pt', lineHeight: 1.4 }}>
              <p className="text-justify">
                Daftar penetapan tugas guru pengawas ruang ujian <strong>{exam?.name}</strong> :
              </p>
              <table className="w-full text-left border border-black" style={{ fontSize: '10.5pt', lineHeight: 1.35 }}>
                <thead>
                  <tr className="bg-neutral-100 border-b border-black text-center font-bold">
                    <th className="p-2 border-r border-black w-10">No</th>
                    <th className="p-2 border-r border-black w-24">Ruang</th>
                    <th className="p-2 border-r border-black">Nama Guru Pengawas</th>
                    <th className="p-2 border-r border-black w-36">NIP</th>
                    <th className="p-2 w-28">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {(teachers.length > 0 ? teachers.slice(0, 6) : [1, 2, 3, 4]).map((t, idx) => (
                    <tr key={typeof t === 'object' ? t.id || idx : idx} className="border-b border-black">
                      <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-black text-center font-bold">Ruang {idx + 1}</td>
                      <td className="p-2 border-r border-black font-semibold">
                        {typeof t === 'object' ? t.name : `Guru Pengawas ${idx + 1}`}
                      </td>
                      <td className="p-2 border-r border-black font-mono text-center text-xs">
                        {typeof t === 'object' ? t.nip || '-' : '-'}
                      </td>
                      <td className="p-2 text-center text-xs">
                        <div className="h-6 flex items-center justify-center font-mono text-neutral-400">
                          {idx + 1}. .........
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 8. DAFTAR HADIR PANITIA */}
          {targetDoc.id === 'committee_attendance' && (
            <div className="my-4 space-y-3" style={{ fontSize: '11pt', lineHeight: 1.4 }}>
              <p className="text-justify">
                Presensi kehadiran harian panitia penyelenggara ujian <strong>{exam?.name}</strong> :
              </p>
              <table className="w-full text-left border border-black" style={{ fontSize: '10.5pt', lineHeight: 1.35 }}>
                <thead>
                  <tr className="bg-neutral-100 border-b border-black text-center font-bold">
                    <th className="p-2 border-r border-black w-10">No</th>
                    <th className="p-2 border-r border-black">Nama Panitia</th>
                    <th className="p-2 border-r border-black w-40">Jabatan</th>
                    <th className="p-2 border-r border-black w-24">Waktu</th>
                    <th className="p-2 w-28">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {(teachers.length > 0 ? teachers.slice(0, 6) : [1, 2, 3, 4]).map((t, idx) => (
                    <tr key={typeof t === 'object' ? t.id || idx : idx} className="border-b border-black">
                      <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-black font-semibold">
                        {typeof t === 'object' ? t.name : `Panitia ${idx + 1}`}
                      </td>
                      <td className="p-2 border-r border-black text-xs font-medium">
                        {idx === 0 ? 'Ketua Panitia' : idx === 1 ? 'Sekretaris' : idx === 2 ? 'Bendahara' : 'Anggota Panitia'}
                      </td>
                      <td className="p-2 border-r border-black text-center font-mono text-xs">07.00 WIB</td>
                      <td className="p-2 text-center text-xs">
                        <div className="h-6 flex items-center justify-center font-mono text-neutral-400">
                          {idx + 1}. .........
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 9. DAFTAR HADIR PESERTA */}
          {targetDoc.id === 'participant_attendance' && (
            <div className="my-4 space-y-3" style={{ fontSize: '11pt', lineHeight: 1.4 }}>
              <div className="flex justify-between text-xs font-bold border-b border-black pb-1.5 mb-2">
                <span>Ruang : 01</span>
                <span>Mata Pelajaran : ....................</span>
                <span>Sesi : 1 (07.30 - 09.30)</span>
              </div>
              <table className="w-full text-left border border-black" style={{ fontSize: '10.5pt', lineHeight: 1.35 }}>
                <thead>
                  <tr className="bg-neutral-100 border-b border-black text-center font-bold">
                    <th className="p-2 border-r border-black w-10">No</th>
                    <th className="p-2 border-r border-black w-24">No Meja</th>
                    <th className="p-2 border-r border-black w-28">NISN</th>
                    <th className="p-2 border-r border-black">Nama Siswa</th>
                    <th className="p-2 w-28">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {(students.length > 0 ? students.slice(0, 7) : [1, 2, 3, 4, 5, 6, 7]).map((s, idx) => (
                    <tr key={typeof s === 'object' ? s.id || idx : idx} className="border-b border-black">
                      <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-black text-center font-mono font-bold">
                        {typeof s === 'object' ? s.examSeat || (s as any).seatNumber || `01-${String(idx + 1).padStart(2, '0')}` : `01-${String(idx + 1).padStart(2, '0')}`}
                      </td>
                      <td className="p-2 border-r border-black font-mono text-center text-xs">
                        {typeof s === 'object' ? s.nisn || '-' : '-'}
                      </td>
                      <td className="p-2 border-r border-black font-semibold uppercase">
                        {typeof s === 'object' ? s.name : `Peserta Asesmen ${idx + 1}`}
                      </td>
                      <td className="p-2 text-center text-xs">
                        <div className="h-6 flex items-center justify-center font-mono text-neutral-400">
                          {idx + 1}. .........
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 10. TATA TERTIB PESERTA */}
          {targetDoc.id === 'student_rules' && (
            <div className="my-4 space-y-2 text-justify" style={{ fontSize: '11pt', lineHeight: 1.45 }}>
              <p className="font-bold underline mb-1">A. KEWAJIBAN PESERTA :</p>
              <ol className="list-decimal pl-6 space-y-1 mb-2">
                <li>Memasuki ruangan setelah tanda masuk dibunyikan, yakni 15 (lima belas) menit sebelum ujian dimulai.</li>
                <li>Membawa Kartu Tanda Peserta Ujian dan alat tulis yang diperlukan (pensil 2B, pulpen, penghapus).</li>
                <li>Mengisi daftar hadir peserta ujian dengan menggunakan pulpen yang disediakan atau dibawa sendiri.</li>
                <li>Mengerjakan soal asesmen secara jujur, mandiri, dan tidak bekerja sama dengan peserta lain.</li>
                <li>Memeriksa keutuhan dan kelengkapan lembar soal serta lembar jawaban asesmen.</li>
              </ol>

              <p className="font-bold underline mb-1">B. LARANGAN PESERTA :</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Dilarang membawa perangkat komunikasi elektronik (HP, kamera, smartwatch) ke dalam ruang ujian.</li>
                <li>Dilarang membawa buku, catatan, atau contekan dalam bentuk apapun ke tempat duduk peserta.</li>
                <li>Dilarang bertanya atau meminjam alat tulis kepada peserta lain selama ujian berlangsung.</li>
                <li>Dilarang meninggalkan ruangan ujian sebelum batas waktu minimal ujian berakhir tanpa izin pengawas.</li>
              </ol>
            </div>
          )}

          {/* 11. TATA TERTIB PENGAWAS */}
          {targetDoc.id === 'proctor_rules' && (
            <div className="my-4 space-y-2 text-justify" style={{ fontSize: '11pt', lineHeight: 1.45 }}>
              <p className="font-bold underline mb-1">A. PERSIAPAN PENGAWAS :</p>
              <ol className="list-decimal pl-6 space-y-1 mb-2">
                <li>Hadir di ruang panitia ujian sekurang-kurangnya 30 (tiga puluh) menit sebelum ujian dimulai.</li>
                <li>Menerima naskah soal, lembar jawaban, daftar hadir, dan berita acara dari panitia pelaksana.</li>
                <li>Memeriksa kelengkapan administrasi ruang ujian sebelum mengizinkan peserta memasuki ruangan.</li>
              </ol>

              <p className="font-bold underline mb-1">B. PELAKSANAAN PENGAWASAN :</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Membacakan tata tertib peserta ujian dan memastikan setiap peserta menempati nomor meja yang tepat.</li>
                <li>Mengedarkan daftar hadir peserta dan memeriksa kecocokan identitas kartu peserta.</li>
                <li>Menjaga ketenangan, ketertiban, dan kewaspadaan suasana ruang ujian secara profesional.</li>
                <li>Menghitung kelengkapan lembar jawaban setelah ujian selesai sebelum peserta meninggalkan ruangan.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer Tanda Tangan Resmi */}
        {renderSignatureBlock()}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Dynamic CSS untuk Print A4 Presisi (100% WYSIWYG) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Utilitas Penghilang Scrollbar di Layar */
          .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 30mm 30mm 30mm 40mm !important; /* Standar Resmi: Atas 3cm, Kanan 3cm, Bawah 3cm, Kiri 4cm */
            }
            html, body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .print-only-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: transparent !important;
            }
            .a4-admin-page {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              padding: 0 !important; /* Margin 3-4-3-3cm ditangani langsung secara presisi oleh @page */
              box-sizing: border-box !important;
              width: 100% !important;
              min-height: 0 !important;
              height: auto !important;
              max-height: none !important;
              margin: 0 !important;
              page-break-after: always !important;
              break-after: page !important;
              font-family: "Times New Roman", Times, "Liberation Serif", serif !important;
              line-height: 1.5 !important;
              overflow: visible !important;
              background: white !important;
            }
            .a4-admin-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            /* Aturan Penyelamat TTD: Jangan pernah memotong kolom tanda tangan di tengah */
            .admin-signature-block {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            /* Frame Sampul Cover Pas 3cm atas, 4cm kiri, 3cm kanan, 3cm bawah */
            .cover-border-frame {
              width: 100% !important;
              height: 237mm !important;
              min-height: 237mm !important;
              max-height: 237mm !important;
              box-sizing: border-box !important;
            }
          }
        `,
        }}
      />

      {/* 
        LOGIKA TAB BAR ATAS:
        - Jika activeDoc === null (di halaman 11 kartu): render category switcher global cetak
        - Jika activeDoc !== null (sedang membuka berkas / cetak masal): render sub-menu tab bar Administrasi Ujian!
      */}
      {activeDoc === null ? (
        renderGlobalCategorySwitcher && renderGlobalCategorySwitcher()
      ) : (
        <div className="no-print bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-[3px_3px_0px_#000] flex items-center gap-1.5 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            type="button"
            onClick={() => setActiveDoc(null)}
            className="px-3 py-1.5 rounded-lg border-2 border-black bg-neutral-100 hover:bg-yellow-200 text-neutral-800 text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 shrink-0 cursor-pointer transition-transform active:translate-y-0.5"
            title="Kembali ke Galeri 11 Menu Berkas"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>11 Berkas</span>
          </button>

          <div className="h-5 w-px bg-neutral-300 mx-1 shrink-0" />

          {/* Tombol Cetak Masal Tab */}
          <button
            type="button"
            onClick={() => setActiveDoc('bulk_all')}
            className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
              activeDoc === 'bulk_all'
                ? 'bg-rose-500 text-white shadow-[2px_2px_0px_#000]'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-950 shadow-[1px_1px_0px_#000]'
            }`}
            title="Cetak Seluruh Berkas Administrasi Sekaligus dalam 1 File"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cetak Masal (Semua Berkas)</span>
          </button>

          <div className="h-5 w-px bg-neutral-300 mx-1 shrink-0" />

          {/* 11 Sub-Menu Tabs Administrasi Ujian */}
          {ADMIN_DOCUMENTS.map((doc) => {
            const isSelected = activeDoc === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActiveDoc(doc.id)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white hover:bg-yellow-50 text-neutral-700 shadow-[1px_1px_0px_#000]'
                }`}
              >
                <span className="w-4 h-4 rounded bg-black text-white text-[9.5px] font-black flex items-center justify-center">
                  {doc.number}
                </span>
                <span>{doc.title}</span>
              </button>
            );
          })}

          <div className="h-5 w-px bg-neutral-300 mx-1 shrink-0" />

          <button
            type="button"
            onClick={onBackToMenu}
            className="px-3 py-1.5 rounded-lg border-2 border-black bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 shrink-0 cursor-pointer active:translate-y-0.5 ml-auto"
            title="Kembali ke Pusat Percetakan Kartu"
          >
            <span>Pusat Cetak</span>
          </button>
        </div>
      )}

      {/* ========================================================
          JIKA activeDoc !== null: TAMPILKAN PREVIEW DOKUMEN / CETAK MASAL
         ======================================================== */}
      {activeDoc ? (
        <div className="space-y-5">
          {/* Action Header Bar (No Print) */}
          <div className="no-print bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="p-2 bg-neutral-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5 shrink-0"
                title="Kembali ke 11 Berkas"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-200 text-rose-950 border border-black rounded text-[10px] font-black uppercase mb-1">
                  <span>
                    {activeDoc === 'bulk_all' ? 'Mode Cetak Masal' : `Dokumen #${docInfo?.number}`}
                  </span>
                  <span>•</span>
                  <span>
                    {activeDoc === 'bulk_all' ? '11 Berkas dalam 1 File' : docInfo?.badge}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-900">
                  {activeDoc === 'bulk_all' ? 'Cetak Masal Administrasi Ujian' : docInfo?.title}
                </h2>
                <p className="text-xs text-neutral-600 font-medium">
                  {activeDoc === 'bulk_all'
                    ? 'Mencetak keseluruhan 11 dokumen administrasi dalam 1 file PDF / printer.'
                    : `${docInfo?.subtitle} • Margin: 3cm Atas, 4cm Kiri, 3cm Kanan, 3cm Bawah`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
              {activeDoc !== 'bulk_all' && (
                <button
                  type="button"
                  onClick={() => setActiveDoc('bulk_all')}
                  className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-black rounded-xl text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
                >
                  <Layers className="w-4 h-4" />
                  <span>Cetak Masal</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {activeDoc === 'bulk_all' ? 'Cetak Semua Berkas (1 File)' : 'Cetak Dokumen (A4)'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Context Strip (No Print) */}
          <div className="no-print bg-neutral-50 border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-neutral-700">
              <SchoolIcon className="w-4 h-4 text-neutral-500" />
              <span>{school?.name || 'Sekolah Terdaftar'}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-900 uppercase">{exam?.name || 'Asesmen Ujian'}</span>
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              Tahun Pelajaran: {exam?.academicYear || '-'} • Semester: {exam?.semester || '-'}
            </div>
          </div>

          {/* ========================================================
              1. TAMPILAN PREVIEW DI LAYAR (NO-PRINT)
              Dilengkapi pembungkus responsif, info halaman, dan bebas dari scrollbar apapun
             ======================================================== */}
          <div
            className="no-print flex flex-col items-center justify-center py-6 px-2 sm:px-4 space-y-6 overflow-x-auto no-scrollbar bg-neutral-100/70 rounded-2xl border border-neutral-200"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Tips Cetak Presisi WYSIWYG */}
            <div className="w-full max-w-[210mm] bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2.5 shadow-xs">
              <Printer className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Panduan Cetak Presisi (WYSIWYG):</strong> Pada jendela cetak browser/PDF, pastikan pilih <strong>Ukuran: A4</strong>, <strong>Margin: None / Minimum</strong>, dan centang <strong>Grafik Latar Belakang (Background graphics)</strong> agar tampilan cetak sama persis dengan preview.
              </span>
            </div>

            {/* JIKA MODE CETAK MASAL: RENDER SELURUH 11 DOKUMEN SECARA BERURUTAN DI SCREEN */}
            {activeDoc === 'bulk_all' ? (
              <div className="w-full flex flex-col items-center space-y-8">
                {/* 1. Cover */}
                <div className="w-full flex flex-col items-center">
                  <div className="mb-2 text-xs font-bold text-neutral-500 uppercase flex items-center gap-1">
                    <span>Halaman 1:</span>
                    <strong className="text-black">COVER</strong>
                  </div>
                  {renderCoverPage('screen_bulk_1')}
                </div>

                {/* 2. Profil Sekolah */}
                <div className="w-full flex flex-col items-center">
                  <div className="mb-2 text-xs font-bold text-neutral-500 uppercase flex items-center gap-1">
                    <span>Halaman 2:</span>
                    <strong className="text-black">PROFIL SEKOLAH</strong>
                  </div>
                  {renderSchoolProfilePage('screen_bulk_2')}
                </div>

                {/* 3. Surat Pernyataan Kerahasiaan */}
                <div className="w-full flex flex-col items-center">
                  <div className="mb-2 text-xs font-bold text-neutral-500 uppercase flex items-center gap-1">
                    <span>Halaman 3:</span>
                    <strong className="text-black">SURAT PERNYATAAN MENJAGA KERAHASIAAN</strong>
                  </div>
                  {renderConfidentialityStatementPage('screen_bulk_3')}
                </div>

                {/* 4 - 11. Dokumen Lainnya */}
                {ADMIN_DOCUMENTS.slice(3).map((d) => (
                  <div key={d.id} className="w-full flex flex-col items-center">
                    <div className="mb-2 text-xs font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <span>Dokumen {d.number}:</span>
                      <strong className="text-black">{d.title}</strong>
                    </div>
                    {d.id === 'assessment_schedule'
                      ? renderAssessmentSchedulePage(`screen_bulk_${d.number}`)
                      : renderPlaceholderDocPage(d, `screen_bulk_${d.number}`)}
                  </div>
                ))}
              </div>
            ) : (
              /* JIKA MODE SINGLE DOKUMEN DI SCREEN */
              <>
                {activeDoc === 'cover' && renderCoverPage('screen_single_cover')}
                {activeDoc === 'school_profile' && renderSchoolProfilePage('screen_single_school_profile')}
                {activeDoc === 'confidentiality_statement' &&
                  renderConfidentialityStatementPage('screen_single_confidentiality')}
                {activeDoc === 'assessment_schedule' &&
                  renderAssessmentSchedulePage('screen_single_schedule')}
                {activeDoc !== 'cover' &&
                  activeDoc !== 'school_profile' &&
                  activeDoc !== 'confidentiality_statement' &&
                  activeDoc !== 'assessment_schedule' &&
                  docInfo &&
                  renderPlaceholderDocPage(docInfo, 'screen_single_placeholder')}
              </>
            )}
          </div>

          {/* ========================================================
              2. WADAH KHUSUS CETAK RESMI (PRINT-ONLY CONTAINER)
              Tersembunyi di layar, HANYA AKTIF saat dialog cetak / print dipanggil.
              Bebas dari padding/margin/background pembungkus aplikasi (100% WYSIWYG)!
             ======================================================== */}
          <div className="hidden print:block print-only-container">
            {activeDoc === 'bulk_all' ? (
              <>
                {renderCoverPage('print_bulk_1')}
                {renderSchoolProfilePage('print_bulk_2')}
                {renderConfidentialityStatementPage('print_bulk_3')}
                {ADMIN_DOCUMENTS.slice(3).map((d) =>
                  d.id === 'assessment_schedule'
                    ? renderAssessmentSchedulePage(`print_bulk_${d.number}`)
                    : renderPlaceholderDocPage(d, `print_bulk_${d.number}`)
                )}
              </>
            ) : (
              <>
                {activeDoc === 'cover' && renderCoverPage('print_single_cover')}
                {activeDoc === 'school_profile' && renderSchoolProfilePage('print_single_school_profile')}
                {activeDoc === 'confidentiality_statement' &&
                  renderConfidentialityStatementPage('print_single_confidentiality')}
                {activeDoc === 'assessment_schedule' &&
                  renderAssessmentSchedulePage('print_single_schedule')}
                {activeDoc !== 'cover' &&
                  activeDoc !== 'school_profile' &&
                  activeDoc !== 'confidentiality_statement' &&
                  activeDoc !== 'assessment_schedule' &&
                  docInfo &&
                  renderPlaceholderDocPage(docInfo, 'print_single_placeholder')}
              </>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
            TAMPILAN UTAMA: GRID 11 KARTU ADMINISTRASI UJIAN
           ======================================================== */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-rose-100 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Koleksi Cetak Administrasi Ujian Resmi
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-rose-700" />
                  Administrasi Pelaksanaan Ujian
                </h2>
                <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl font-medium mt-1">
                  Pusat pencetakan bundel portofolio administrasi ujian untuk <strong>{exam?.name || 'Asesmen Ujian'}</strong> di <strong>{school?.name || 'Sekolah'}</strong>. Standar margin: 3cm atas, 4cm kiri, 3cm kanan, 3cm bawah • Font: Times New Roman (1,5 spasi).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDoc('bulk_all')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                >
                  <Layers className="w-4 h-4 text-yellow-300" />
                  <span>Cetak Masal (1 File)</span>
                </button>
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="px-4 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Menu Utama</span>
                </button>
              </div>
            </div>

            {/* Quick Banner Action untuk Cetak Masal */}
            <div className="pt-3 border-t-2 border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tersedia fitur cetak seluruh 11 berkas sekaligus dalam satu kali cetak (1 file PDF).</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc('bulk_all')}
                className="inline-flex items-center gap-1 text-xs font-black text-rose-800 hover:underline uppercase self-start sm:self-auto cursor-pointer"
              >
                <span>Buka Pratinjau Cetak Masal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid 11 Sub-menu Dokumen Administrasi Ujian: 2 menu per baris di Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Card Utama: CETAK MASAL SELURUH BERKAS (1 FILE) */}
            <div
              onClick={() => setActiveDoc('bulk_all')}
              className="group bg-gradient-to-r from-rose-50 via-amber-50/60 to-rose-50 hover:from-rose-100 hover:to-amber-100/80 border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 md:col-span-2"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl border-2 border-black bg-rose-600 text-white flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
                  <Layers className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black uppercase tracking-wider">
                      FITUR CETAK MASAL
                    </span>
                    <span className="text-xs font-bold text-neutral-500 uppercase">
                      11 Berkas dalam 1 File PDF
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 group-hover:text-rose-700 transition-colors">
                    Cetak Masal Seluruh Berkas Administrasi Ujian
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                    Cetak keseluruhan 11 dokumen administrasi ujian (Cover, Profil Sekolah, Surat Kerahasiaan, SK Panitia, Jadwal Asesmen, Daftar Hadir, hingga Tata Tertib) berurutan dalam satu kali cetak (1 file PDF).
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-300 group-hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] transition-all shrink-0">
                <Printer className="w-4 h-4" />
                <span>Buka Cetak Masal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

            {ADMIN_DOCUMENTS.map((doc) => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className="group bg-white hover:bg-rose-50/40 border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all duration-150 flex flex-col justify-between cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  <div className="space-y-3">
                    {/* Header Card: Nomor & Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shadow-[1.5px_1.5px_0px_#FFE600]">
                          {doc.number}
                        </span>
                        <span className="px-2.5 py-0.5 bg-neutral-100 border border-black rounded text-[10px] font-bold text-neutral-700 uppercase">
                          {doc.badge}
                        </span>
                      </div>

                      <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center ${doc.color} shadow-[1.5px_1.5px_0px_#000]`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 group-hover:text-rose-700 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                        {doc.subtitle}
                      </p>
                      <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Format A4 (Times New Roman)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 group-hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] transition-all">
                      <span>Buka Berkas</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
