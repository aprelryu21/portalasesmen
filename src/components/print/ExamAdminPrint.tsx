import React, { useState, useMemo } from 'react';
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
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<string>('ALL');

  const docInfo = activeDoc && activeDoc !== 'bulk_all' ? ADMIN_DOCUMENTS.find((d) => d.id === activeDoc) : null;
  const scheduleItems = parseExamSchedule(exam?.scheduleInfo);

  // Daftar hari ujian dari jadwal asesmen untuk kolom daftar hadir
  const examScheduleDays = useMemo(() => {
    if (scheduleItems && scheduleItems.length > 0) {
      return scheduleItems.map((it, idx) => ({
        dayName: it.day ? it.day.toUpperCase() : `HARI ${idx + 1}`,
        dateShort: it.date ? formatScheduleDateIndo(it.date).split(' ').slice(0, 2).join(' ') : `H-${idx + 1}`,
      }));
    }
    return [
      { dayName: 'SENIN', dateShort: 'Hari 1' },
      { dayName: 'SELASA', dateShort: 'Hari 2' },
      { dayName: 'RABU', dateShort: 'Hari 3' },
      { dayName: 'KAMIS', dateShort: 'Hari 4' },
      { dayName: 'JUMAT', dateShort: 'Hari 5' },
    ];
  }, [scheduleItems]);

  // Daftar kelas / rombel unik siswa untuk lembar presensi terpisah (Kelas 1 s.d 6)
  const studentClasses = useMemo(() => {
    const defaultClasses = ['KELAS 1', 'KELAS 2', 'KELAS 3', 'KELAS 4', 'KELAS 5', 'KELAS 6'];
    const classSet = new Set<string>(defaultClasses);
    if (students && students.length > 0) {
      students.forEach((s) => {
        let rawClass = (s.className || '').trim();
        if (!rawClass) return;
        if (/^\d+$/.test(rawClass)) rawClass = `KELAS ${rawClass}`;
        else if (!rawClass.toUpperCase().startsWith('KELAS')) rawClass = `KELAS ${rawClass.toUpperCase()}`;
        else rawClass = rawClass.toUpperCase();
        classSet.add(rawClass);
      });
    }
    return Array.from(classSet).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [students]);

  // Helper mendapatkan daftar siswa untuk kelas tertentu
  const getStudentsForClass = (targetClass: string) => {
    if (!students || students.length === 0) return [];
    return students.filter((s) => {
      let rawClass = (s.className || '').trim();
      if (!rawClass) return false;
      if (/^\d+$/.test(rawClass)) rawClass = `KELAS ${rawClass}`;
      else if (!rawClass.toUpperCase().startsWith('KELAS')) rawClass = `KELAS ${rawClass.toUpperCase()}`;
      else rawClass = rawClass.toUpperCase();
      return rawClass === targetClass;
    });
  };

  // Daftar susunan panitia untuk daftar hadir panitia: menampilkan penanggung jawab dan SEMUA nama guru dari database
  const committeeMembers = useMemo(() => {
    const list: { role: string; name: string }[] = [];
    list.push({
      role: 'Penanggung Jawab (Kepala Sekolah)',
      name: school?.principalName || 'Kepala Sekolah',
    });

    if (teachers && teachers.length > 0) {
      teachers.forEach((t, idx) => {
        let role = '';
        if (idx === 0) role = 'Ketua Panitia';
        else if (idx === 1) role = 'Sekretaris';
        else if (idx === 2) role = 'Bendahara';
        else if (idx === 3) role = 'Seksi Naskah / Penggandaan';
        else if (idx === 4) role = 'Seksi Konsumsi';
        else if (idx === 5) role = 'Seksi Perlengkapan & Ruang';
        else role = t.subject ? `Guru ${t.subject}` : 'Anggota Panitia';

        list.push({
          role,
          name: t.name || `Guru ${idx + 1}`,
        });
      });
    } else {
      [
        { role: 'Ketua Panitia', name: 'Guru Senior / Pendidik' },
        { role: 'Sekretaris', name: 'Guru Pelaksana / Pendidik' },
        { role: 'Bendahara', name: 'Bendahara Sekolah' },
        { role: 'Seksi Naskah & Penggandaan', name: 'Tenaga Kependidikan' },
        { role: 'Seksi Konsumsi', name: 'Guru Pelaksana' },
        { role: 'Seksi Perlengkapan & Ruang', name: 'Tenaga Kependidikan' },
      ].forEach((m) => list.push(m));
    }
    return list;
  }, [school, teachers]);

  // Email resmi: jika tidak ada data email maka tampilkan '-' (jangan diisi otomatis)
  const schoolEmail =
    school?.email && school.email.trim().length > 0 ? school.email.trim() : '-';

  // Format tanggal titimangsa yang bersih dan rapi (bebas dari format raw Date JS seperti GMT+0700)
  const cleanSignatureDate =
    formatReadableIndonesianDate(exam?.signatureDate) ||
    formatReadableIndonesianDate(exam?.dateText ? exam.dateText.split('-')[0].trim() : '') ||
    '01 Desember 2026';

  // Format tanggal pelaksanaan asesmen untuk teks pengantar dokumen
  const examExecutionDate = useMemo(() => {
    if (exam?.dateText && exam.dateText.trim().length > 0) return exam.dateText.trim();
    if (scheduleItems && scheduleItems.length > 0) {
      const first = scheduleItems[0];
      const last = scheduleItems[scheduleItems.length - 1];
      if (first.date && last.date) {
        if (first.date === last.date) return formatScheduleDateIndo(first.date);
        return `${formatScheduleDateIndo(first.date)} s.d. ${formatScheduleDateIndo(last.date)}`;
      }
    }
    return cleanSignatureDate;
  }, [exam?.dateText, scheduleItems, cleanSignatureDate]);

  // Format durasi hari pelaksanaan asesmen
  const examDurationDaysText = useMemo(() => {
    const n = examScheduleDays.length || 6;
    const words = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];
    const word = words[n] || String(n);
    return `${n} (${word}) hari`;
  }, [examScheduleDays]);

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
  const renderSignatureBlock = (customTitle?: string, showDate = true, ptClass = 'pt-5') => {
    const isStatement = customTitle === 'Yang membuat pernyataan';
    const headLine = customTitle
      ? `${customTitle},`
      : `${school?.headTitle || 'Kepala'} ${school?.name || ''}`;
    const districtLine = !isStatement && school?.district ? `Kecamatan ${school.district}` : '';

    return (
      <div
        className={`admin-signature-block ${ptClass} flex justify-end`}
        style={{
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <div className="w-[80mm] text-center" style={{ fontSize: '11pt', lineHeight: 1.3 }}>
          {showDate && (
            <p>
              {titimangsaLocation}, {cleanSignatureDate}
            </p>
          )}
          <p className="font-semibold">{headLine}</p>
          {districtLine && <p className="font-semibold">{districtLine}</p>}

          {/* Area Tanda Tangan / Scan */}
          <div className="h-[18mm] flex items-center justify-center my-1 relative">
            {school?.principalSignatureUrl ? (
              <img
                src={school.principalSignatureUrl}
                alt="Tanda Tangan Kepala Sekolah"
                className="h-[16mm] object-contain mx-auto"
              />
            ) : null}
          </div>

          <p className="font-bold underline uppercase">
            {school?.principalName || 'NAMA KEPALA SEKOLAH'}
          </p>
          <p className="font-mono text-[10.5pt]">
            NIP. {school?.principalNip || '-'}
          </p>
        </div>
      </div>
    );
  };

  // Komponen Tanda Tangan Ganda: Kiri Mengetahui Kepala Sekolah, Kanan Guru Pengawas Ruang (Nama dan NIP Beda Baris)
  const renderDualSignatureBlock = (ptClass = 'pt-3') => {
    return (
      <div
        className={`admin-signature-block ${ptClass} flex justify-between items-start w-full`}
        style={{
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        {/* Kiri: Mengetahui, Kepala Sekolah */}
        <div className="w-[72mm] text-center" style={{ fontSize: '10.5pt', lineHeight: 1.25 }}>
          <p className="font-semibold">Mengetahui,</p>
          <p className="font-semibold">
            {school?.headTitle || 'Kepala'} {school?.name || ''}
          </p>
          {school?.district && <p className="font-semibold">Kecamatan {school.district}</p>}
          <div className="h-[15mm] flex items-center justify-center my-1 relative">
            {school?.principalSignatureUrl ? (
              <img
                src={school.principalSignatureUrl}
                alt="Tanda Tangan Kepala Sekolah"
                className="h-[14mm] object-contain mx-auto"
              />
            ) : null}
          </div>
          <p className="font-bold text-[10pt] underline uppercase">
            {school?.principalName || 'NAMA KEPALA SEKOLAH'}
          </p>
          <p className="font-mono text-[9.5pt]">
            NIP. {school?.principalNip || '-'}
          </p>
        </div>

        {/* Kanan: Guru Pengawas Ruang */}
        <div className="w-[72mm] text-center" style={{ fontSize: '10.5pt', lineHeight: 1.25 }}>
          <p>
            {titimangsaLocation}, {cleanSignatureDate}
          </p>
          <p className="font-semibold">Guru Pengawas Ruang,</p>
          <div className="h-[15mm] flex items-center justify-center my-1 relative" />
          <p className="font-bold text-[10pt] underline whitespace-nowrap">
            ( ........................................ )
          </p>
          <p className="font-mono text-[9.5pt] whitespace-nowrap">
            NIP. ....................
          </p>
        </div>
      </div>
    );
  };

  // Base styling untuk lembar A4 Administrasi (Margin Standar Resmi: 3cm Atas, 4cm Kiri, 3cm Kanan, 3cm Bawah)
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
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)',
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

        {/* Konten Terpusat di Tengah dengan Jarak Proporsional */}
        <div className="flex flex-col justify-center items-center text-center w-full my-auto space-y-10 sm:space-y-12">
          {/* Teks Atas: Ukuran 20pt Bold Huruf Besar */}
          <div className="space-y-2.5 w-full">
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

          {/* Logo Sekolah di Tengah: Ukuran Lebih Besar dan Jarak Lebih Luas */}
          <div className="py-4 my-2 flex flex-col items-center justify-center">
            {school?.logoUrl ? (
              <img
                src={school.logoUrl}
                alt={`Logo ${school.name}`}
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
            ) : (
              <div className="w-48 h-48 border-2 border-dashed border-neutral-400 flex flex-col items-center justify-center p-4 text-neutral-400">
                <Building2 className="w-20 h-20 mb-2" />
                <span className="text-xs font-bold uppercase">Logo Sekolah</span>
              </div>
            )}
          </div>

          {/* Teks Bawah: Nama Asesmen (16pt), Semester (16pt), Nama Sekolah (20pt), Tahun Pelajaran (16pt) */}
          <div className="space-y-3.5 w-full">
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

      {/* Kolom Tanda Tangan Kepala Sekolah (Bawah Kanan dengan Jarak Ekstra ke Bawah) */}
      {renderSignatureBlock(undefined, true, 'pt-16 sm:pt-20')}
    </div>
  );

  // ========================================================
  // ========================================================
  // 3. RENDER SURAT PERNYATAAN KERAHASIAAN (Spasi 1 Agar Pas 1 Halaman)
  // ========================================================
  const renderConfidentialityStatementPage = (key = 'confidentiality_page') => (
    <div
      key={key}
      className="a4-admin-page confidentiality-page bg-white text-black flex flex-col justify-between no-scrollbar"
      style={{
        ...basePageStyle,
        fontSize: '11pt',
        lineHeight: 1.15,
      }}
    >
      <div>
        {/* Kop Resmi Sekolah dari Database */}
        {renderOfficialSchoolKop()}

        {/* Judul Surat: SURAT PERNYATAAN MENJAGA KERAHASIAAN (Bold, Underline) */}
        <div className="text-center my-2">
          <h1 className="font-bold uppercase tracking-wider text-[12.5pt] underline">
            SURAT PERNYATAAN MENJAGA KERAHASIAAN
          </h1>
        </div>

        {/* Pembuka */}
        <p className="mb-1 text-justify" style={{ lineHeight: 1.15 }}>
          Yang bertanda tangan di bawah ini :
        </p>

        {/* Tabel Identitas Kepala Sekolah */}
        <table className="w-full text-left mb-2" style={{ fontSize: '11pt', lineHeight: 1.2 }}>
          <tbody>
            <tr>
              <td className="w-[140px] font-semibold py-0.5 align-top">Nama</td>
              <td className="w-[15px] font-semibold py-0.5 align-top">:</td>
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
        <p className="text-justify mb-1.5" style={{ lineHeight: 1.15 }}>
          Dalam rangka Pelaksanaan dan Penyelenggaraan{' '}
          <strong>
            {exam?.name || 'Asesmen Sumatif'} {exam?.semester || 'Semester Ganjil'}
          </strong>{' '}
          Tahun Pelajaran {exam?.academicYear || '2026/2027'} , dengan ini menyatakan bahwa saya :
        </p>

        {/* Poin Butir 1, 2, 3 */}
        <ol className="list-decimal pl-6 space-y-1 mb-2 text-justify" style={{ lineHeight: 1.15 }}>
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
        <p className="text-justify" style={{ lineHeight: 1.15 }}>
          Pernyataan ini saya buat dan tanda tangani dengan sebenarnya, dalam keadaan sadar, tanpa
          paksaan oleh pihak lain, serta penuh rasa tanggung jawab. Apabila saya melakukan
          perbuatan-perbuatan yang bertentangan dengan pernyataan di atas, saya bersedia dituntut dan
          diberi sanksi sesuai perundang-undangan hukum yang berlaku.
        </p>
      </div>

      {/* Kolom Tanda Tangan Bawah Kanan (Tanpa Kotak Materai) */}
      {renderSignatureBlock('Yang membuat pernyataan', true, 'pt-3')}
    </div>
  );

  // ========================================================
  // 5. RENDER JUMLAH PESERTA (Sesuai Foto Acuan User: media_1790609768921.png)
  // Teks Pengantar Ukuran 12pt, Tabel Rombel Spasi 1.5, Garis Kanan Keterangan Utuh
  // ========================================================
  const renderParticipantCountPage = (key = 'participant_count_page') => {
    // 1. Ekstrak data rombel dari siswa di database
    const classMap = new Map<string, { male: number; female: number; total: number }>();

    if (students && students.length > 0) {
      students.forEach((s) => {
        let rawClass = (s.className || '').trim();
        if (!rawClass) rawClass = 'KELAS -';
        if (/^\d+$/.test(rawClass)) {
          rawClass = `KELAS ${rawClass}`;
        } else if (/^kelas\s+/i.test(rawClass)) {
          rawClass = rawClass.toUpperCase();
        } else if (!rawClass.toUpperCase().startsWith('KELAS')) {
          rawClass = `KELAS ${rawClass.toUpperCase()}`;
        }
        const current = classMap.get(rawClass) || { male: 0, female: 0, total: 0 };
        if (s.gender === 'L') {
          current.male += 1;
        } else if (s.gender === 'P') {
          current.female += 1;
        }
        current.total += 1;
        classMap.set(rawClass, current);
      });
    }

    // Urutkan kelas secara logis (misal KELAS 1 s.d KELAS 6)
    const sortedClasses = Array.from(classMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' })
    );

    // Jika di database belum ada data siswa, berikan baris default dengan tanda -
    const displayRows =
      sortedClasses.length > 0
        ? sortedClasses.map(([className, stat], idx) => ({
            no: idx + 1,
            className,
            male: String(stat.male),
            female: String(stat.female),
            total: String(stat.total),
            notes: '',
          }))
        : [1, 2, 3, 4, 5, 6].map((num) => ({
            no: num,
            className: `KELAS ${num}`,
            male: '-',
            female: '-',
            total: '-',
            notes: '',
          }));

    const totalMale =
      sortedClasses.length > 0
        ? String(sortedClasses.reduce((acc, [, s]) => acc + s.male, 0))
        : '-';
    const totalFemale =
      sortedClasses.length > 0
        ? String(sortedClasses.reduce((acc, [, s]) => acc + s.female, 0))
        : '-';
    const grandTotal =
      sortedClasses.length > 0
        ? String(sortedClasses.reduce((acc, [, s]) => acc + s.total, 0))
        : '-';

    return (
      <div
        key={key}
        className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
        style={{
          ...basePageStyle,
          lineHeight: 1.5,
        }}
      >
        <div>
          {/* Kop Resmi Sekolah dari Database */}
          {renderOfficialSchoolKop()}

          {/* Judul Dokumen (Sesuai Foto Acuan) */}
          <div className="text-center my-3 space-y-0.5">
            <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
              JUMLAH PESERTA
            </h1>
            <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: '12.5pt', lineHeight: 1.3 }}>
              {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? exam.semester.toUpperCase() : ''}
            </h2>
            <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12.5pt', lineHeight: 1.3 }}>
              TAHUN PELAJARAN {exam?.academicYear || '2025 / 2026'}
            </p>
          </div>

          {/* Teks Pengantar Ukuran 12pt, Jarak Spasi 1.5 */}
          <p className="text-[12pt] text-justify mb-3" style={{ lineHeight: 1.5 }}>
            Kegiatan {exam?.name || 'Asesmen'} dilaksanakan di {school?.name || 'Satuan Pendidikan'} pada tanggal {examExecutionDate} dengan rincian jumlah peserta asesmen sebagai berikut :
          </p>

          {/* Tabel Jumlah Peserta (admin-table-wrap pr-[3px] agar garis kanan tidak terpotong) */}
          <div className="my-3 w-full admin-table-wrap pr-[3px] box-border">
            <table
              className="admin-table-safe w-full text-center border-collapse border border-black table-fixed box-border"
              style={{ fontSize: '11pt', lineHeight: 1.5 }}
            >
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '32%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#E8EDE5] border-b border-black font-bold">
                  <th rowSpan={2} className="p-2 border-r border-black align-middle text-center">
                    NO
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-black align-middle text-center">
                    ROMBEL
                  </th>
                  <th colSpan={3} className="p-1.5 border-b border-r border-black align-middle text-center">
                    PESERTA
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-black align-middle text-center">
                    KET
                  </th>
                </tr>
                <tr className="bg-[#E8EDE5] border-b border-black font-bold">
                  <th className="p-1.5 border-r border-black text-center">L</th>
                  <th className="p-1.5 border-r border-black text-center">P</th>
                  <th className="p-1.5 border-r border-black text-center">JUMLAH</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.no} className="border-b border-black">
                    <td className="p-2 border-r border-black text-center">{row.no}</td>
                    <td className="p-2 border-r border-black font-semibold text-center uppercase">
                      {row.className}
                    </td>
                    <td className="p-2 border-r border-black font-mono text-center">{row.male}</td>
                    <td className="p-2 border-r border-black font-mono text-center">{row.female}</td>
                    <td className="p-2 border-r border-black font-mono font-bold text-center">
                      {row.total}
                    </td>
                    <td className="p-2 border-r border-black text-center text-xs">{row.notes}</td>
                  </tr>
                ))}
                {/* Baris Total / Jumlah */}
                <tr className="border-t-2 border-black font-bold">
                  <td colSpan={2} className="p-2 border-r border-black text-center font-bold">
                    JUMLAH
                  </td>
                  <td className="p-2 border-r border-black font-mono text-center">{totalMale}</td>
                  <td className="p-2 border-r border-black font-mono text-center">{totalFemale}</td>
                  <td className="p-2 border-r border-black font-mono text-center">{grandTotal}</td>
                  <td className="p-2 border-r border-black"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Tanda Tangan Resmi Kepala Sekolah */}
        {renderSignatureBlock(undefined, true, 'pt-3')}
      </div>
    );
  };

  // ========================================================
  // 6. RENDER JADWAL ASESMEN (Tanpa KET, Lebar Waktu & Mapel Proporsional, Spasi 1.5)
  // ========================================================
  const renderAssessmentSchedulePage = (key = 'assessment_schedule_page') => {
    // Tampilkan seluruh jadwal dengan spasi 1.5
    const displayScheduleItems =
      scheduleItems && scheduleItems.length > 0
        ? scheduleItems
        : [1, 2, 3, 4, 5, 6].map((num) => ({
            id: `sch_${num}`,
            day: num === 1 ? 'SENIN' : num === 2 ? 'SELASA' : num === 3 ? 'RABU' : num === 4 ? 'KAMIS' : num === 5 ? 'JUMAT' : 'SABTU',
            date: '',
            time: '07.30 - 09.30',
            subject: '-',
          }));

    return (
      <div
        key={key}
        className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
        style={{
          ...basePageStyle,
          lineHeight: 1.5,
        }}
      >
        <div>
          {/* Kop Resmi Sekolah dari Database */}
          {renderOfficialSchoolKop()}

          {/* Judul Dokumen */}
          <div className="text-center my-3 space-y-0.5">
            <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
              JADWAL ASESMEN
            </h1>
            <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: '12.5pt', lineHeight: 1.3 }}>
              {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? exam.semester.toUpperCase() : ''}
            </h2>
            <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12.5pt', lineHeight: 1.3 }}>
              TAHUN PELAJARAN {exam?.academicYear || '2025 / 2026'}
            </p>
          </div>

          {/* Teks Pengantar Ukuran 12pt, Jarak Spasi 1.5 */}
          <p className="text-[12pt] text-justify mb-3" style={{ lineHeight: 1.5 }}>
            Berdasarkan hasil Rapat Panitia Pelaksana Asesmen, Kegiatan {exam?.name || 'Asesmen'} yang dilaksanakan di {school?.name || 'Satuan Pendidikan'} pada tanggal {examExecutionDate} dilaksanakan selama {examDurationDaysText} dengan rincian jadwal asesmen sebagai berikut :
          </p>

          {/* Tabel Jadwal Resmi (Kolom Hari/Tgl Diperkecil, Waktu & Mapel Lebih Lebar, Garis Kanan Aman) */}
          <div className="my-3 w-full admin-table-wrap pr-[3px] box-border">
            <table
              className="admin-table-safe w-full text-center border-collapse border border-black table-fixed box-border"
              style={{ fontSize: '10.5pt', lineHeight: 1.5 }}
            >
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '40%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#E8EDE5] border-b border-black font-bold">
                  <th className="p-2 border-r border-black align-middle text-center">NO</th>
                  <th className="p-2 border-r border-black align-middle text-center">HARI / TANGGAL</th>
                  <th className="p-2 border-r border-black align-middle text-center">WAKTU</th>
                  <th className="p-2 border-r border-black align-middle text-center">MATA PELAJARAN</th>
                </tr>
              </thead>
              <tbody>
                {displayScheduleItems.map((it, idx) => (
                  <tr key={it.id || idx} className="border-b border-black">
                    <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-black font-semibold text-center uppercase text-[10pt]">
                      {it.day}{it.date ? `, ${formatScheduleDateIndo(it.date)}` : ''}
                    </td>
                    <td className="p-2 border-r border-black font-mono text-center text-[10pt]">
                      {it.time || '07.30 - 09.30'}
                    </td>
                    <td className="p-2 border-r border-black font-semibold text-center uppercase text-[10pt]">
                      {it.subject || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Tanda Tangan Resmi Kepala Sekolah */}
        {renderSignatureBlock(undefined, true, 'pt-3')}
      </div>
    );
  };

  // ========================================================
  // 7. RENDER PENGAWAS RUANG (Hanya Kolom NO, NAMA PENGAWAS Rata Kiri, TUGAS KEPENGAWASAN)
  // ========================================================
  const renderRoomProctorsPage = (key = 'room_proctors_page') => {
    // 1. Ekstrak data guru pengawas dari database
    const proctorTeachers =
      teachers && teachers.length > 0
        ? teachers.filter((t) => t.roleType === 'pengawas')
        : [];
    const sourceTeachers = proctorTeachers.length > 0 ? proctorTeachers : (teachers || []);

    // Format data baris sesuai database, atau fallback jika belum ada
    const proctorRows =
      sourceTeachers.length > 0
        ? sourceTeachers.map((t, idx) => ({
            no: idx + 1,
            name: t.name ? t.name.toUpperCase() : '-',
            duty:
              t.roomDuty ||
              (t.subject && t.subject.toLowerCase().includes('kelas')
                ? t.subject.toUpperCase()
                : `RUANG 01 / KELAS ${idx + 1}`),
          }))
        : [1, 2, 3, 4, 5, 6].map((num) => ({
            no: num,
            name: '-',
            duty: `RUANG 01 / KELAS ${num}`,
          }));

    return (
      <div
        key={key}
        className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
        style={{
          ...basePageStyle,
          lineHeight: 1.5,
        }}
      >
        <div>
          {/* Kop Resmi Sekolah dari Database */}
          {renderOfficialSchoolKop()}

          {/* Judul Dokumen (Sesuai Foto Acuan) */}
          <div className="text-center my-3 space-y-0.5">
            <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
              JADWAL KEPENGAWASAN RUANG
            </h1>
            <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: '12.5pt', lineHeight: 1.3 }}>
              {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? exam.semester.toUpperCase() : ''}
            </h2>
            <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12.5pt', lineHeight: 1.3 }}>
              TAHUN PELAJARAN {exam?.academicYear || '2025 / 2026'}
            </p>
          </div>

          {/* Teks Pengantar Ukuran 12pt, Jarak Spasi 1.5 */}
          <p className="text-[12pt] text-justify mb-3" style={{ lineHeight: 1.5 }}>
            Berdasarkan hasil Rapat Panitia Pelaksana Asesmen, Berikut adalah Jadwal Kepengawasan Ruang {exam?.name || 'Asesmen'} {exam?.semester ? exam.semester.toUpperCase() : ''} {exam?.academicYear ? `Tahun Pelajaran ${exam.academicYear}` : ''} yang dilaksanakan pada tanggal {examExecutionDate} :
          </p>

          {/* Tabel Pengawas Ruang (admin-table-wrap pr-[3px] agar garis kanan tidak terpotong) */}
          <div className="my-3 w-full admin-table-wrap pr-[3px] box-border">
            <table
              className="admin-table-safe w-full border-collapse border border-black table-fixed box-border"
              style={{ fontSize: '11pt', lineHeight: 1.5 }}
            >
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '52%' }} />
                <col style={{ width: '38%' }} />
              </colgroup>
              <thead>
                <tr className="bg-[#E8EDE5] border-b border-black font-bold">
                  <th className="p-2 border-r border-black align-middle text-center">NO</th>
                  <th className="p-2 border-r border-black align-middle text-left pl-3">NAMA PENGAWAS</th>
                  <th className="p-2 border-r border-black align-middle text-center">TUGAS KEPENGAWASAN</th>
                </tr>
              </thead>
              <tbody>
                {proctorRows.map((row) => (
                  <tr key={row.no} className="border-b border-black">
                    <td className="p-2.5 border-r border-black text-center">{row.no}</td>
                    <td className="p-2.5 border-r border-black font-semibold text-left pl-3 uppercase">
                      {row.name}
                    </td>
                    <td className="p-2.5 border-r border-black text-center font-semibold uppercase">
                      {row.duty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Tanda Tangan Resmi Kepala Sekolah */}
        {renderSignatureBlock(undefined, true, 'pt-3')}
      </div>
    );
  };

  // ========================================================
  // 8. RENDER DAFTAR HADIR PANITIA (Hari Awal s.d Akhir Sesuai Jadwal dalam 1 Baris)
  // Menampilkan Semua Guru, Kolom TTD Tanpa Nomor Urut, Spasi 1.5
  // ========================================================
  const renderCommitteeAttendancePage = (key = 'committee_attendance_page') => {
    const daysCount = examScheduleDays.length || 5;
    const dayWidthPercent = 60 / daysCount;

    return (
      <div
        key={key}
        className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
        style={{
          ...basePageStyle,
          lineHeight: 1.5,
        }}
      >
        <div>
          {/* Kop Resmi Sekolah dari Database */}
          {renderOfficialSchoolKop()}

          {/* Judul Dokumen */}
          <div className="text-center my-3 space-y-0.5">
            <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
              DAFTAR HADIR PANITIA ASESMEN
            </h1>
            <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
              {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? exam.semester.toUpperCase() : ''}
            </h2>
            <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
              TAHUN PELAJARAN {exam?.academicYear || '2025 / 2026'}
            </p>
          </div>

          {/* Tabel Daftar Hadir Panitia (admin-table-wrap pr-[3px] agar seluruh garis kanan presisi) */}
          <div className="my-3 w-full admin-table-wrap pr-[3px] box-border">
            <table
              className="admin-table-safe w-full text-center border-collapse border border-black table-fixed box-border"
              style={{ fontSize: '10pt', lineHeight: 1.5 }}
            >
              <colgroup>
                <col style={{ width: '7%' }} />
                <col style={{ width: '33%' }} />
                {examScheduleDays.map((_, i) => (
                  <col key={i} style={{ width: `${dayWidthPercent}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-[#E8EDE5] border-b border-black font-bold">
                  <th className="p-2 border-r border-black align-middle text-center">NO</th>
                  <th className="p-2 border-r border-black align-middle text-center">NAMA PANITIA</th>
                  {examScheduleDays.map((d, i) => (
                    <th
                      key={i}
                      className="p-1.5 border-r border-black align-middle text-center uppercase leading-tight"
                      style={{ fontSize: '9pt' }}
                    >
                      <div>{d.dayName}</div>
                      <div className="text-[8pt] font-normal">{d.dateShort}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {committeeMembers.map((m, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="p-2 border-r border-black text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-black text-left">
                      <div className="font-bold uppercase text-[9.5pt]">{m.name}</div>
                      <div className="text-[8pt] text-neutral-600 font-medium">{m.role}</div>
                    </td>
                    {examScheduleDays.map((_, dayIdx) => (
                      <td
                        key={dayIdx}
                        className="p-1.5 border-r border-black text-center align-middle"
                      >
                        <div className="h-7 flex items-center justify-center text-[8pt] font-mono text-neutral-300">
                          ........
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Tanda Tangan Kepala Sekolah */}
        {renderSignatureBlock(undefined, true, 'pt-3')}
      </div>
    );
  };

  // ========================================================
  // 9. RENDER DAFTAR HADIR PESERTA (Lembar per Kelas 1 s.d 6, Kolom TTD Siswa Tanpa Nomor)
  // Dilengkapi Paginasi Otomatis (Maks 16 Siswa per Lembar) agar Tidak Pernah Bertumpuk
  // Tanda Tangan Ganda: Nama & NIP Beda Baris, Halaman Terisolasi
  // ========================================================
  const renderParticipantAttendancePages = (keyPrefix: string, classFilter = 'ALL') => {
    const targetClasses =
      classFilter === 'ALL'
        ? studentClasses
        : studentClasses.filter((c) => c === classFilter);

    const daysCount = examScheduleDays.length || 5;
    const dayWidthPercent = 58 / daysCount;
    const isScreen = keyPrefix.includes('screen');
    const STUDENTS_PER_PAGE = 16;

    const content = targetClasses.flatMap((className, classIdx) => {
      const classStudents = getStudentsForClass(className);
      // Jika belum ada data siswa untuk kelas ini, sediakan 10 baris kosong tertata
      const displayStudents =
        classStudents.length > 0
          ? classStudents
          : Array.from({ length: 10 }).map((_, idx) => ({
              id: `dummy_${className}_${idx}`,
              name: '-',
              nisn: '',
              className,
              gender: 'L' as const,
            }));

      // Paginasi: pecah menjadi beberapa lembar jika siswa lebih dari 16 orang
      const studentChunks: (typeof displayStudents)[] = [];
      if (displayStudents.length <= STUDENTS_PER_PAGE) {
        studentChunks.push(displayStudents);
      } else {
        for (let i = 0; i < displayStudents.length; i += STUDENTS_PER_PAGE) {
          studentChunks.push(displayStudents.slice(i, i + STUDENTS_PER_PAGE));
        }
      }

      const totalClassPages = studentChunks.length;

      return studentChunks.map((chunk, pageIdx) => {
        const pageNumber = pageIdx + 1;
        const isLastPage = pageIdx === totalClassPages - 1;
        const startNumber = pageIdx * STUDENTS_PER_PAGE + 1;

        return (
          <div
            key={`${keyPrefix}_${className}_${classIdx}_p${pageNumber}`}
            className="a4-admin-page bg-white text-black flex flex-col justify-between no-scrollbar"
            style={{
              ...basePageStyle,
              lineHeight: 1.5,
            }}
          >
            <div>
              {/* Kop Resmi Sekolah dari Database */}
              {renderOfficialSchoolKop()}

              {/* Judul Dokumen */}
              <div className="text-center my-2.5 space-y-0.5">
                <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
                  DAFTAR HADIR PESERTA ASESMEN
                  {totalClassPages > 1 && pageNumber > 1 ? ' (LANJUTAN)' : ''}
                </h1>
                <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
                  {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? exam.semester.toUpperCase() : ''}
                </h2>
                <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
                  TAHUN PELAJARAN {exam?.academicYear || '2025 / 2026'}
                </p>
              </div>

              {/* Baris Identitas Kelas & Ruang */}
              <div className="flex justify-between items-center text-[10.5pt] font-bold border-b border-black pb-1 mb-3">
                <span>ROMBEL : {className}</span>
                <span>RUANG : 01</span>
                <span>SESI : 1 (07.30 - 09.30)</span>
                {totalClassPages > 1 && (
                  <span className="text-[9.5pt] font-bold text-neutral-800 uppercase">
                    (Lembar {pageNumber} dari {totalClassPages})
                  </span>
                )}
              </div>

              {/* Tabel Presensi Siswa per Kelas (admin-table-wrap pr-[3px] agar seluruh garis kanan presisi) */}
              <div className="my-2 w-full admin-table-wrap pr-[3px] box-border">
                <table
                  className="admin-table-safe w-full text-center border-collapse border border-black table-fixed box-border"
                  style={{ fontSize: '9.5pt', lineHeight: 1.4 }}
                >
                  <colgroup>
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '35%' }} />
                    {examScheduleDays.map((_, i) => (
                      <col key={i} style={{ width: `${dayWidthPercent}%` }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-[#E8EDE5] border-b border-black font-bold">
                      <th className="p-1.5 border-r border-black align-middle text-center">NO</th>
                      <th className="p-1.5 border-r border-black align-middle text-center">NAMA PESERTA</th>
                      {examScheduleDays.map((d, i) => (
                        <th
                          key={i}
                          className="p-1 border-r border-black align-middle text-center uppercase leading-tight"
                          style={{ fontSize: '8.5pt' }}
                        >
                          <div>{d.dayName}</div>
                          <div className="text-[7.5pt] font-normal">{d.dateShort}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((s, idx) => {
                      const studentNo = startNumber + idx;
                      return (
                        <tr key={(s as any).id || `${className}_${studentNo}`} className="border-b border-black">
                          <td className="p-1.5 border-r border-black text-center">{studentNo}</td>
                          <td className="p-1.5 border-r border-black text-left">
                            <div className="font-bold uppercase text-[9pt] leading-snug">
                              {s.name}
                            </div>
                            {s.nisn && (
                              <div className="text-[7.5pt] font-mono font-normal text-neutral-600">
                                NISN: {s.nisn}
                              </div>
                            )}
                          </td>
                          {examScheduleDays.map((_, dayIdx) => (
                            <td
                              key={dayIdx}
                              className="p-1 border-r border-black align-middle"
                            >
                              <div
                                className={`text-[7.5pt] font-mono text-neutral-300 ${
                                  studentNo % 2 === 1 ? 'text-left pl-1' : 'text-right pr-1'
                                }`}
                              >
                                ........
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Teks Penanda Halaman Bersambung jika Bukan Lembar Terakhir */}
              {!isLastPage && (
                <div className="text-right text-[9pt] italic font-semibold text-neutral-500 pt-2">
                  * Bersambung ke Lembar {pageNumber + 1}
                </div>
              )}
            </div>

            {/* Tanda Tangan Ganda: Hanya Tampil di Lembar Terakhir Rombel / Kelas */}
            {isLastPage ? (
              renderDualSignatureBlock('pt-3')
            ) : (
              <div className="pt-4 text-center text-[9pt] text-neutral-400 font-medium">
                — Lembar {pageNumber} dari {totalClassPages} —
              </div>
            )}
          </div>
        );
      });
    });

    if (!isScreen) {
      return <React.Fragment key={keyPrefix}>{content}</React.Fragment>;
    }

    return (
      <div key={keyPrefix} className="w-full flex flex-col items-center space-y-6">
        {content}
      </div>
    );
  };

  // ========================================================
  // 10. RENDER TATA TERTIB PESERTA (Lampiran 1: 14 Poin, Spasi 1.5, Tanpa Kolom TTD)
  // Tercetak di Halaman Tersendiri
  // ========================================================
  const renderStudentRulesPage = (key = 'student_rules_page') => (
    <div
      key={key}
      className="a4-admin-page rules-page bg-white text-black flex flex-col justify-between no-scrollbar"
      style={{
        ...basePageStyle,
        fontSize: '9.5pt',
        lineHeight: 1.32,
      }}
    >
      <div>
        {/* Kop Resmi Sekolah dari Database */}
        {renderOfficialSchoolKop()}

        {/* Judul Dokumen */}
        <div className="text-center my-2 space-y-0.5">
          <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
            TATA TERTIB PESERTA UJIAN
          </h1>
          <h2 className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
            {exam?.name || 'ASESMEN SUMATIF'} {exam?.semester ? exam.semester.toUpperCase() : ''}
          </h2>
          <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
            TAHUN PELAJARAN {exam?.academicYear || '2026 / 2027'}
          </p>
        </div>

        {/* 14 Poin Tata Tertib Sesuai Lampiran 1 (Didesain Pas 1 Halaman Rapi) */}
        <div className="my-2 text-justify" style={{ fontSize: '9.5pt', lineHeight: 1.32 }}>
          <ol className="list-decimal pl-5 space-y-0.5">
            <li>
              Peserta ujian memasuki ruangan setelah tanda masuk dibunyikan, yakni 15 (lima belas) menit sebelum Ujian dimulai.
            </li>
            <li>
              Peserta ujian yang terlambat hadir hanya diperkenankan mengikuti Ujian setelah mendapat izin dari Ketua Penyelenggara ujian Tingkat Sekolah/Madrasah, tanpa diberi perpanjangan waktu.
            </li>
            <li>
              Peserta ujian dilarang membawa alat komunikasi elektronik, kalkulator, tas, buku dan catatan dalam bentuk apapun ke dalam ruang ujian.
            </li>
            <li>
              Peserta ujian membawa alat tulis menulis berupa pensil 2B, penghapus, penggaris, dan bolpoin berwarna hitam/biru serta kartu tanda peserta ujian.
            </li>
            <li>Peserta ujian mengisi Daftar Hadir.</li>
            <li>Peserta ujian mulai mengerjakan soal setelah ada tanda waktu mulai ujian.</li>
            <li>Peserta ujian yang mengisi identitas pada lembar jawaban secara lengkap dan benar.</li>
            <li>
              Peserta ujian yang memerlukan penjelasan cara pengisian identitas pada LJLUS dapat bertanya kepada Pengawas Ruang dengan cara mengacungkan tangan terlebih dahulu.
            </li>
            <li>
              Selama ujian berlangsung, Peserta ujian hanya dapat meninggalkan ruangan dengan izin dan pengawasan dari Pengawas Ruang Ujian, serta tidak melakukannya berulang kali.
            </li>
            <li>
              Peserta ujian yang memperoleh naskah soal yang cacat atau rusak, pengerjaan soal tetap dilakukan sambil menunggu penggantian naskah soal.
            </li>
            <li>
              Peserta ujian yang meninggalkan ruangan setelah membaca soal dan tidak kembali lagi sampai tanda selesai dibunyikan, dinyatakan telah selesai menempuh / mengikuti ujian pada mata pelajaran yang terkait.
            </li>
            <li>
              Peserta ujian yang telah selesai mengerjakan soal sebelum waktu ujian berakhir tidak diperbolehkan meninggalkan ruangan sebelum berakhirnya waktu ujian.
            </li>
            <li>Peserta ujian berhenti mengerjakan soal setelah ada tanda berakhirnya waktu ujian.</li>
            <li>
              Selama ujian berlangsung, Peserta dilarang :
              <div className="pl-6 pt-1 space-y-0.5">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">A.</span>
                  <span>menanyakan jawaban soal kepada siapa pun serta bekerja sama dengan peserta lain;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">B.</span>
                  <span>memberi atau menerima bantuan dalam menjawab soal;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">C.</span>
                  <span>memperlihatkan pekerjaan sendiri kepada peserta lain atau melihat pekerjaan peserta lain;</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">D.</span>
                  <span>membawa Naskah Soal dan Lembar Jawaban keluar dari ruang ujian;</span>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
      {/* Tanpa Kolom Tanda Tangan Sesuai Instruksi User */}
    </div>
  );

  // ========================================================
  // 11. RENDER TATA TERTIB PENGAWAS RUANG (Lampiran 2: 3 Tahap, Spasi 1.5, Tanpa Kolom TTD)
  // Tercetak di Halaman Tersendiri
  // ========================================================
  const renderProctorRulesPage = (key = 'proctor_rules_page') => (
    <div
      key={key}
      className="a4-admin-page proctor-rules-page bg-white text-black flex flex-col justify-between no-scrollbar"
      style={{
        ...basePageStyle,
        fontSize: '10.5pt',
        lineHeight: 1.4,
      }}
    >
      <div>
        {/* Kop Resmi Sekolah dari Database */}
        {renderOfficialSchoolKop()}

        {/* Judul Dokumen (Sesuai Foto Acuan Lampiran 2) */}
        <div className="text-center my-3 space-y-1">
          <h1 className="font-bold uppercase tracking-wide" style={{ fontSize: '13pt', lineHeight: 1.3 }}>
            TATA TERTIB PENGAWAS RUANG
          </h1>
          <p className="font-bold uppercase tracking-wide" style={{ fontSize: '12pt', lineHeight: 1.3 }}>
            TAHUN PELAJARAN {exam?.academicYear || '2026 / 2027'}
          </p>
        </div>

        {/* 3 Tahap Pengawasan Sesuai Lampiran 2 */}
        <div className="my-3 space-y-3.5 text-justify" style={{ fontSize: '10.5pt', lineHeight: 1.4 }}>
          {/* 1. Tahap Persiapan */}
          <div>
            <h2 className="font-bold mb-1.5 text-[11.5pt]">
              Tahap Persiapan (Sebelum Asesmen)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                Hadir 30 menit sebelum jadwal untuk mengisi presensi dan mengambil kelengkapan berkas (amplop soal tersegel, lembar jawaban, berita acara, dan daftar hadir).
              </li>
            </ol>
          </div>

          {/* 2. Tahap Pelaksanaan */}
          <div>
            <h2 className="font-bold mb-1.5 text-[11.5pt]">
              Tahap Pelaksanaan (Saat Asesmen)
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Masuk ruangan 15 menit sebelum mulai untuk mengatur barang bawaan dan posisi duduk peserta.
              </li>
              <li>
                Membacakan tata tertib peserta, membagikan soal/lembar jawaban, dan memandu pengisian identitas.
              </li>
              <li>
                Menjaga ketertiban ujian. Pengawas dilarang menggunakan gawai/HP, mengobrol, membaca hal di luar asesmen, atau memberi petunjuk jawaban.
              </li>
              <li>
                Memberikan peringatan sisa waktu (10 menit dan 5 menit sebelum selesai).
              </li>
            </ol>
          </div>

          {/* 3. Tahap Penyelesaian */}
          <div>
            <h2 className="font-bold mb-1.5 text-[11.5pt]">
              Tahap Penyelesaian (Setelah Asesmen)
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Menghentikan seluruh aktivitas peserta tepat saat waktu habis.
              </li>
              <li>
                Mengumpulkan, menghitung, dan mengurutkan lembar jawaban serta naskah soal.
              </li>
              <li>
                Memasukkan seluruh dokumen (berita acara, daftar hadir, soal, dan jawaban) ke dalam amplop, menyegel dengan lem dan tanda tangan silang, lalu menyerahkannya kepada panitia.
              </li>
            </ol>
          </div>
        </div>
      </div>
      {/* Tanpa Kolom Tanda Tangan Sesuai Instruksi User */}
    </div>
  );

  // ========================================================
  // RENDER BERKAS DOKUMEN LAINNYA (SK Panitia, dll.)
  // Seluruh dokumen menggunakan KOP Resmi Sekolah dari Database & Format 3-4-3-3cm
  // ========================================================
  const renderPlaceholderDocPage = (targetDoc: AdminDocItem, key: string) => {
    // Pengalihan dokumen spesifik ke renderer khususnya
    if (targetDoc.id === 'participant_count') {
      return renderParticipantCountPage(key);
    }
    if (targetDoc.id === 'assessment_schedule') {
      return renderAssessmentSchedulePage(key);
    }
    if (targetDoc.id === 'room_proctors') {
      return renderRoomProctorsPage(key);
    }
    if (targetDoc.id === 'committee_attendance') {
      return renderCommitteeAttendancePage(key);
    }
    if (targetDoc.id === 'participant_attendance') {
      return renderParticipantAttendancePages(key, selectedAttendanceClass);
    }
    if (targetDoc.id === 'student_rules') {
      return renderStudentRulesPage(key);
    }
    if (targetDoc.id === 'proctor_rules') {
      return renderProctorRulesPage(key);
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

          {/* 4. SURAT KEPUTUSAN PANITIA */}
          {targetDoc.id === 'committee_decree' && (
            <div className="my-4 space-y-3" style={{ fontSize: '11.5pt', lineHeight: 1.5 }}>
              <div className="text-center font-bold text-xs uppercase mb-2">
                Nomor: 421.2 / {exam?.id ? String(exam.id).slice(-4) : '048'} / PAN-AS / {new Date().getFullYear()}
              </div>
              <p className="text-justify" style={{ lineHeight: 1.5 }}>
                Kepala {school?.name || 'Satuan Pendidikan'}, menimbang perlunya kelancaran dan ketertiban pelaksanaan{' '}
                <strong>{exam?.name}</strong> Tahun Pelajaran {exam?.academicYear} :
              </p>
              <div className="space-y-1 text-justify" style={{ lineHeight: 1.5 }}>
                <p><strong>MEMUTUSKAN :</strong></p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Menetapkan susunan panitia pelaksana asesmen sebagaimana terlampir dalam keputusan ini.</li>
                  <li>Panitia bertugas mempersiapkan administrasi, naskah soal, ruang asesmen, dan pelaporan hasil.</li>
                  <li>Segala biaya yang timbul dibebankan pada anggaran kegiatan sekolah yang sesuai.</li>
                </ol>
              </div>

              {/* Tabel Susunan Panitia (admin-table-wrap pr-[3px] agar seluruh garis kanan presisi) */}
              <div className="pt-2 w-full admin-table-wrap pr-[3px] box-border">
                <table className="admin-table-safe w-full text-left border border-black table-fixed box-border" style={{ fontSize: '10.5pt', lineHeight: 1.5 }}>
                  <colgroup>
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '37%' }} />
                    <col style={{ width: '35%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-neutral-100 border-b border-black text-center font-bold">
                      <th className="p-1.5 border-r border-black">No</th>
                      <th className="p-1.5 border-r border-black">Jabatan Kepanitiaan</th>
                      <th className="p-1.5 border-r border-black">Nama Lengkap</th>
                      <th className="p-1.5 border-r border-black">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">1</td>
                      <td className="p-1.5 border-r border-black font-semibold">Penanggung Jawab</td>
                      <td className="p-1.5 border-r border-black font-bold uppercase">{school?.principalName || 'Kepala Sekolah'}</td>
                      <td className="p-1.5 border-r border-black text-center text-xs">Kepala Sekolah</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">2</td>
                      <td className="p-1.5 border-r border-black font-semibold">Ketua Panitia</td>
                      <td className="p-1.5 border-r border-black">{teachers[0]?.name || 'Guru Senior / Wakasek'}</td>
                      <td className="p-1.5 border-r border-black text-center text-xs">Pendidik</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">3</td>
                      <td className="p-1.5 border-r border-black font-semibold">Sekretaris</td>
                      <td className="p-1.5 border-r border-black">{teachers[1]?.name || 'Guru Pelaksana'}</td>
                      <td className="p-1.5 border-r border-black text-center text-xs">Pendidik</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">4</td>
                      <td className="p-1.5 border-r border-black font-semibold">Bendahara</td>
                      <td className="p-1.5 border-r border-black">{teachers[2]?.name || 'Bendahara Sekolah'}</td>
                      <td className="p-1.5 border-r border-black text-center text-xs">Pendidik</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="p-1.5 border-r border-black text-center">5</td>
                      <td className="p-1.5 border-r border-black font-semibold">Seksi Penggandaan &amp; Naskah</td>
                      <td className="p-1.5 border-r border-black">{teachers[3]?.name || 'Tenaga Kependidikan'}</td>
                      <td className="p-1.5 border-r border-black text-center text-xs">Tenaga Kependidikan</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Tanda Tangan Resmi */}
        {renderSignatureBlock()}
      </div>
    );
  };

  // Helper Dispatcher untuk Merender Dokumen Administrasi berdasarkan Jenis Dokumen
  const renderDocById = (docId: ExamAdminDocType, docKeyPrefix: string) => {
    switch (docId) {
      case 'cover':
        return renderCoverPage(`${docKeyPrefix}_cover`);
      case 'school_profile':
        return renderSchoolProfilePage(`${docKeyPrefix}_profile`);
      case 'confidentiality_statement':
        return renderConfidentialityStatementPage(`${docKeyPrefix}_confidentiality`);
      case 'committee_decree': {
        const doc = ADMIN_DOCUMENTS.find((d) => d.id === 'committee_decree');
        return doc ? renderPlaceholderDocPage(doc, `${docKeyPrefix}_committee_decree`) : null;
      }
      case 'participant_count':
        return renderParticipantCountPage(`${docKeyPrefix}_participants`);
      case 'assessment_schedule':
        return renderAssessmentSchedulePage(`${docKeyPrefix}_schedule`);
      case 'room_proctors':
        return renderRoomProctorsPage(`${docKeyPrefix}_proctors`);
      case 'committee_attendance':
        return renderCommitteeAttendancePage(`${docKeyPrefix}_committee_attendance`);
      case 'participant_attendance':
        return renderParticipantAttendancePages(
          `${docKeyPrefix}_participant_attendance`,
          docKeyPrefix.includes('bulk') ? 'ALL' : selectedAttendanceClass
        );
      case 'student_rules':
        return renderStudentRulesPage(`${docKeyPrefix}_student_rules`);
      case 'proctor_rules':
        return renderProctorRulesPage(`${docKeyPrefix}_proctor_rules`);
      default: {
        const doc = ADMIN_DOCUMENTS.find((d) => d.id === docId);
        return doc ? renderPlaceholderDocPage(doc, `${docKeyPrefix}_${docId}`) : null;
      }
    }
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

          /* Styling Tabel Administrasi Presisi di Layar dan Cetak (Garis Kanan Tidak Terpotong) */
          .admin-table-wrap {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            padding-right: 3px;
          }
          .admin-table-wrap table,
          table.admin-table-safe {
            width: 100%;
            max-width: 100%;
            border-collapse: collapse;
            box-sizing: border-box;
            border: 1.5px solid black;
          }
          .admin-table-wrap th:last-child,
          .admin-table-wrap td:last-child,
          table.admin-table-safe th:last-child,
          table.admin-table-safe td:last-child {
            border-right: 1.5px solid black !important;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 30mm 30mm 30mm 40mm; /* Standar Resmi: Atas 3cm, Kanan 3cm, Bawah 3cm, Kiri 4cm */
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
            .fixed:not(.print-fixed) {
              display: none !important;
            }
            *, *::before, *::after {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            *::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              background: transparent !important;
            }
            .print-only-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: transparent !important;
              overflow: visible !important;
            }
            .a4-admin-page {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              box-sizing: border-box !important;
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              min-height: 236mm !important;
              max-height: none !important;
              padding: 0 !important; /* Margin 3cm atas, 4cm kiri, 3cm kanan, 3cm bawah ditangani langsung oleh @page di setiap lembar cetak */
              margin: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              page-break-after: always !important;
              break-after: page !important;
              font-family: "Times New Roman", Times, "Liberation Serif", serif !important;
              line-height: 1.5 !important;
              overflow: visible !important;
              background: white !important;
            }
            .print-only-container > .a4-admin-page:last-child,
            .print-only-container > *:last-child .a4-admin-page:last-child,
            .print-only-container > *:last-child > .a4-admin-page:last-child,
            .a4-admin-page:last-of-type {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .a4-admin-page.confidentiality-page,
            .a4-admin-page.confidentiality-page * {
              line-height: 1.15 !important;
            }
            .a4-admin-page.rules-page,
            .a4-admin-page.rules-page * {
              line-height: 1.32 !important;
            }
            .a4-admin-page.proctor-rules-page,
            .a4-admin-page.proctor-rules-page * {
              line-height: 1.4 !important;
            }
            /* Menjamin seluruh tabel dan kolom presisi tidak melebihi batas halaman */
            .admin-table-wrap {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              padding-right: 3px !important;
              overflow: visible !important;
            }
            .admin-table-wrap table,
            table.admin-table-safe {
              width: 100% !important;
              max-width: 100% !important;
              border-collapse: collapse !important;
              box-sizing: border-box !important;
              border: 1.5px solid black !important;
            }
            .admin-table-wrap th:last-child,
            .admin-table-wrap td:last-child,
            table.admin-table-safe th:last-child,
            table.admin-table-safe td:last-child {
              border-right: 1.5px solid black !important;
            }
            th, td {
              box-sizing: border-box !important;
            }
            /* Cegah pemotongan baris tabel di tengah halaman */
            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            /* Aturan Penyelamat TTD: Jangan pernah memotong kolom tanda tangan di tengah */
            /* Jika menyentuh batas bawah 3cm, seluruh kolom tanda tangan otomatis pindah utuh ke halaman baru */
            .admin-signature-block {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              break-before: auto !important;
            }
            /* Frame Sampul Cover Pas 3cm atas, 4cm kiri, 3cm kanan, 3cm bawah */
            .cover-border-frame {
              width: 100% !important;
              height: 236mm !important;
              min-height: 236mm !important;
              max-height: 236mm !important;
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
                <strong>Panduan Cetak Presisi (WYSIWYG):</strong> Aturan kertas pratinjau telah disinkronkan 100% dengan hasil cetak. Pada dialog cetak browser / Simpan PDF, pastikan pilih <strong>Ukuran: A4</strong>, <strong>Margin: None / Default</strong>, dan centang <strong>Grafik Latar Belakang (Background graphics)</strong> agar hasil cetak sama persis dengan preview.
              </span>
            </div>

            {/* Filter Lembar Kelas Khusus Daftar Hadir Peserta di Layar */}
            {activeDoc === 'participant_attendance' && (
              <div className="w-full max-w-[210mm] bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-neutral-800 mr-1">
                  Pilih Lembar Kelas:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAttendanceClass('ALL')}
                  className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase cursor-pointer transition-transform active:translate-y-0.5 ${
                    selectedAttendanceClass === 'ALL'
                      ? 'bg-yellow-300 text-black shadow-[1.5px_1.5px_0px_#000]'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  Semua Kelas ({studentClasses.length})
                </button>
                {studentClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedAttendanceClass(cls)}
                    className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase cursor-pointer transition-transform active:translate-y-0.5 ${
                      selectedAttendanceClass === cls
                        ? 'bg-yellow-300 text-black shadow-[1.5px_1.5px_0px_#000]'
                        : 'bg-white hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}

            {/* JIKA MODE CETAK MASAL: RENDER SELURUH 11 DOKUMEN SECARA BERURUTAN DI SCREEN */}
            {activeDoc === 'bulk_all' ? (
              <div className="w-full flex flex-col items-center space-y-8">
                {ADMIN_DOCUMENTS.map((d) => (
                  <div key={d.id} className="w-full flex flex-col items-center">
                    <div className="mb-2 text-xs font-bold text-neutral-500 uppercase flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">
                        {d.number}
                      </span>
                      <strong className="text-black">{d.title}</strong>
                      <span className="text-neutral-400">•</span>
                      <span className="text-[11px] text-neutral-600 font-medium">Kertas A4 (210×297mm) • Margin: 3cm Atas, 4cm Kiri, 3cm Kanan, 3cm Bawah</span>
                    </div>
                    {renderDocById(d.id, `screen_bulk_${d.number}`)}
                  </div>
                ))}
              </div>
            ) : (
              /* JIKA MODE SINGLE DOKUMEN DI SCREEN */
              <div className="w-full flex flex-col items-center">
                <div className="mb-2 text-xs font-bold text-neutral-500 uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">
                    {docInfo?.number || 1}
                  </span>
                  <strong className="text-black">{docInfo?.title || 'Dokumen Administrasi'}</strong>
                  <span className="text-neutral-400">•</span>
                  <span className="text-[11px] text-neutral-600 font-medium">Kertas A4 (210×297mm) • Margin: 3cm Atas, 4cm Kiri, 3cm Kanan, 3cm Bawah</span>
                </div>
                {renderDocById(activeDoc, 'screen_single')}
              </div>
            )}
          </div>

          {/* ========================================================
              2. WADAH KHUSUS CETAK RESMI (PRINT-ONLY CONTAINER)
              Tersembunyi di layar, HANYA AKTIF saat dialog cetak / print dipanggil.
              Bebas dari padding/margin/background pembungkus aplikasi (100% WYSIWYG)!
             ======================================================== */}
          <div className="hidden print:block print-only-container">
            {activeDoc === 'bulk_all'
              ? ADMIN_DOCUMENTS.map((d) => renderDocById(d.id, `print_bulk_${d.number}`))
              : renderDocById(activeDoc, 'print_single')}
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
