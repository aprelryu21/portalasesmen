import React, { useState } from 'react';
import { School, Exam, Student, CardDesignSettings } from '../../types';
import { ExamCard } from '../card/ExamCard';
import { SchoolLogo } from '../common/SchoolLogo';
import { QrCodeImage } from '../common/QrCodeImage';
import { GenderAvatar } from '../common/GenderAvatar';
import { PortalAsesmenLogo } from '../common/PortalAsesmenLogo';
import { DEFAULT_CARD_DESIGN, PRESET_TEMPLATES } from '../../data/mockData';
import {
  CreditCard,
  Sparkles,
  FileSpreadsheet,
  UploadCloud,
  Printer,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Layers,
  FileCheck,
  UserCheck,
  Armchair,
  BookOpen,
  CalendarCheck,
  Award,
  Smartphone,
  ChevronRight,
  SunMoon,
} from 'lucide-react';

const PREVIEW_SAMPLE_STUDENT: Student = {
  id: 'sample_std_01',
  nisn: '0012345678',
  nis: '2024001',
  name: 'MUHAMMAD RIZKY PRATAMA',
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

const PREVIEW_SAMPLE_FEMALE_STUDENT: Student = {
  id: 'sample_std_02',
  nisn: '0023456789',
  nis: '2024002',
  name: 'AISYAH NUR AZIZAH',
  gender: 'P',
  religion: 'Islam',
  className: 'Kelas VI-A',
  birthPlace: 'Surabaya',
  birthDate: '2012-08-20',
  examRoom: 'Ruang 01',
  examSeat: 'Meja 14',
  photoUrl: '',
  createdAt: '',
  updatedAt: '',
};

const PREVIEW_SAMPLE_SCHOOL: School = {
  id: 'sample_sch_01',
  name: 'SD NEGERI 1 MEDOWO',
  npsn: '20512345',
  nss: '101051308001',
  address: 'Jl. Raya Medowo No. 12',
  village: 'Medowo',
  district: 'Kandangan',
  regency: 'Kabupaten Kediri',
  province: 'Jawa Timur',
  logoUrl: '',
  principalName: 'BAMBANG SUTRISNO, S.Pd., M.M.',
  principalNip: '19750812 200003 1 005',
  headTitle: 'Kepala Sekolah',
};

const PREVIEW_SAMPLE_EXAM: Exam = {
  id: 'sample_exam_01',
  name: 'ASESMEN SUMATIF AKHIR SEMESTER (ASAS)',
  semester: 'Semester 1 (Ganjil)',
  academicYear: '2024 / 2025',
  dateText: '01 - 06 Desember 2024',
  location: 'Kediri',
  extraNote: 'Harap hadir 15 menit sebelum ujian dimulai & membawa kartu ini.',
};

type PreviewCardType = 'student' | 'desk' | 'proctor' | 'guest';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  sampleSchool?: School;
  sampleExam?: Exam;
  sampleStudent?: Student;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  sampleSchool,
  sampleExam,
  sampleStudent,
}) => {
  const [activePreviewType, setActivePreviewType] = useState<PreviewCardType>('student');
  const [activePreviewPreset, setActivePreviewPreset] = useState<'playful' | 'classic' | 'modern'>('playful');

  const previewStudent = sampleStudent || PREVIEW_SAMPLE_STUDENT;
  const previewSchool = sampleSchool?.name ? sampleSchool : PREVIEW_SAMPLE_SCHOOL;
  const previewExam = sampleExam?.name ? sampleExam : PREVIEW_SAMPLE_EXAM;

  const previewDesign: CardDesignSettings = {
    ...DEFAULT_CARD_DESIGN,
    ...(PRESET_TEMPLATES[activePreviewPreset] || {}),
    templatePreset: activePreviewPreset,
    showReligion: true,
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-neutral-900 flex flex-col font-sans selection:bg-yellow-300 selection:text-black">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white border-b-3 border-black shadow-[0_4px_0_#000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Identity */}
            <div className="flex items-center gap-3">
              <PortalAsesmenLogo size="md" variant="icon-only" />
              <div>
                <span className="text-base sm:text-lg font-black uppercase tracking-tight block leading-none">
                  PORTAL ASESMEN
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-600 uppercase tracking-wider block mt-0.5">
                  Aplikasi Administrasi &amp; Generator Kartu Asesmen Sekolah
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-black uppercase bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="hidden sm:flex px-4 py-2 text-xs sm:text-sm font-black uppercase bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Daftar Sekolah Baru
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative py-10 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 bg-[#00F0FF] border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000]">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>Sistem Administrasi Ujian &amp; Generator Dokumen Sekolah Lengkap</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-neutral-900">
              KELOLA DATA &amp; CETAK PERLENGKAPAN UJIAN{' '}
              <span className="bg-yellow-300 px-2.5 py-0.5 border-3 border-black rounded-xl inline-block shadow-[4px_4px_0px_#000] rotate-1">
                SECARA OTOMATIS
              </span>
            </h1>

            <p className="text-sm sm:text-base font-bold text-neutral-700 leading-relaxed max-w-2xl">
              Solusi satu pintu bagi operator sekolah di Indonesia: Kelola identitas lembaga, database siswa &amp; agama, penugasan guru pengawas ruang, serta cetak otomatis <strong>Kartu Peserta Ujian</strong>, <strong>Label Nomor Meja</strong>, <strong>ID Pengawas</strong>, dan <strong>ID Tamu / Asesor</strong> dengan tata letak lembar A4 presisi siap potong.
            </p>

            {/* Quick Key Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-black">
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">Siswa &amp; Avatar Agama</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Guru &amp; Pengawas Ruang</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2 col-span-2 sm:col-span-1">
                <Printer className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">4 Jenis ID Siap Cetak</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-6 py-3.5 bg-yellow-300 hover:bg-yellow-200 text-black text-xs sm:text-sm font-black uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Masuk ke Aplikasi <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="px-6 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-black uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_#FFE600] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Daftarkan Sekolah Anda <ArrowRight className="w-4 h-4 text-yellow-300" />
              </button>
            </div>
          </div>

          {/* Right Live Interactive Showcase (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl p-5 sm:p-6 relative">
              {/* Header Box */}
              <div className="space-y-3 pb-3 border-b-2 border-black mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-neutral-900">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Pusat Generator Percetakan
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 border border-black rounded text-emerald-800">
                    Format Presisi A4
                  </span>
                </div>

                {/* 4 Multi-card switcher tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActivePreviewType('student')}
                    className={`px-2 py-1.5 rounded-lg text-[10.5px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'student'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-3 h-3 shrink-0" />
                    <span className="truncate">ID Siswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePreviewType('desk')}
                    className={`px-2 py-1.5 rounded-lg text-[10.5px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'desk'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Armchair className="w-3 h-3 shrink-0" />
                    <span className="truncate">No. Meja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePreviewType('proctor')}
                    className={`px-2 py-1.5 rounded-lg text-[10.5px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'proctor'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">Pengawas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePreviewType('guest')}
                    className={`px-2 py-1.5 rounded-lg text-[10.5px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'guest'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">Tamu</span>
                  </button>
                </div>
              </div>

              {/* Showcase Canvas */}
              <div className="p-3 sm:p-4 bg-[#F7F4EB] border-2 border-dashed border-neutral-400 rounded-xl flex items-center justify-center overflow-hidden min-h-[290px]">
                {activePreviewType === 'student' && (
                  <div className="scale-90 sm:scale-100 origin-center transition-all">
                    <ExamCard
                      student={previewStudent}
                      school={previewSchool}
                      exam={previewExam}
                      design={previewDesign}
                      scale={1}
                    />
                  </div>
                )}

                {activePreviewType === 'desk' && (
                  <div className="w-full max-w-[340px] bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b-2 border-black pb-2">
                      <div className="flex items-center gap-2">
                        <SchoolLogo url={previewSchool.logoUrl} name={previewSchool.name} sizeMm={11} />
                        <div>
                          <div className="text-[10px] font-black uppercase leading-tight">{previewSchool.name}</div>
                          <div className="text-[8px] font-bold text-neutral-600 uppercase">NOMOR TEMPAT DUDUK PESERTA</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-yellow-300 border-2 border-black rounded text-[10px] font-black">
                        RUANG 01
                      </div>
                    </div>
                    <div className="text-center py-2 bg-neutral-50 border-2 border-black rounded-lg">
                      <div className="text-[10px] font-mono font-bold text-neutral-500 uppercase">NOMOR MEJA PESERTA</div>
                      <div className="text-3xl font-black tracking-tight text-neutral-900 mt-0.5">MEJA 12</div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-xs font-black uppercase text-neutral-900">{previewStudent.name}</div>
                        <div className="text-[10px] font-mono text-neutral-600">NISN: {previewStudent.nisn} • {previewStudent.className}</div>
                      </div>
                      <QrCodeImage value={`MEJA|${previewStudent.nisn}|${previewStudent.name}`} sizeMm={11} />
                    </div>
                  </div>
                )}

                {activePreviewType === 'proctor' && (
                  <div className="w-[72mm] max-w-full bg-white border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-center space-y-2 animate-in fade-in duration-200">
                    <div className="w-10 h-2.5 mx-auto bg-neutral-200 border-2 border-black rounded-full" />
                    <div className="border-b-2 border-black pb-1.5 space-y-0.5">
                      <div className="text-[9.5px] font-black uppercase truncate">{previewSchool.name}</div>
                      <div className="text-[7.5px] font-bold text-neutral-600 uppercase">ASESMEN SUMATIF 2024/2025</div>
                    </div>
                    <div className="py-0.5 px-2 bg-indigo-600 text-white border-2 border-black rounded-md text-[9px] font-black uppercase tracking-wider">
                      PENGAWAS RUANG UJIAN
                    </div>
                    <div className="flex flex-col items-center justify-center my-1">
                      <div className="w-16 h-20 bg-neutral-100 border-2 border-black rounded-lg overflow-hidden flex items-center justify-center">
                        <GenderAvatar gender="L" className="w-full h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-900">SUPARMAN, S.Pd.</div>
                      <div className="text-[8px] font-mono font-bold text-neutral-600">NIP. 19820415 200902 1 003</div>
                      <div className="text-[7.5px] font-bold text-indigo-900">Guru Matematika</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-200 border border-black rounded text-[8px] font-black uppercase">
                        Tugas Jaga: Ruang 01
                      </span>
                    </div>
                    <div className="pt-1.5 border-t-2 border-black flex items-center justify-between text-[7px]">
                      <QrCodeImage value="PENGAWAS|198204152009021003" sizeMm={9} />
                      <div className="text-right">
                        <span className="font-bold">Kepala Sekolah</span>
                        <div className="font-black underline mt-2">{previewSchool.principalName}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewType === 'guest' && (
                  <div className="w-[72mm] max-w-full bg-white border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-center space-y-2 animate-in fade-in duration-200">
                    <div className="w-10 h-2.5 mx-auto bg-neutral-200 border-2 border-black rounded-full" />
                    <div className="border-b-2 border-black pb-1.5 space-y-0.5">
                      <div className="text-[9.5px] font-black uppercase truncate">{previewSchool.name}</div>
                      <div className="text-[7.5px] font-bold text-neutral-600 uppercase">ASESMEN SUMATIF 2024/2025</div>
                    </div>
                    <div className="py-0.5 px-2 bg-emerald-600 text-white border-2 border-black rounded-md text-[9px] font-black uppercase tracking-wider">
                      TAMU &amp; MONEV UJIAN
                    </div>
                    <div className="flex flex-col items-center justify-center my-1">
                      <div className="w-16 h-20 bg-neutral-100 border-2 border-black rounded-lg overflow-hidden flex items-center justify-center">
                        <GenderAvatar gender="L" className="w-full h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-900">Drs. H. Mulyadi, M.Pd.</div>
                      <div className="text-[8px] font-bold text-neutral-600">Pengawas Pembina Dinas Pendidikan</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 border border-black rounded text-[8px] font-black uppercase text-emerald-900">
                        Akses: Seluruh Ruangan Ujian
                      </span>
                    </div>
                    <div className="pt-1.5 border-t-2 border-black flex items-center justify-between text-[7px]">
                      <QrCodeImage value="TAMU|MONEV|DINAS_PENDIDIKAN" sizeMm={9} />
                      <div className="text-right">
                        <span className="font-bold">Ketua Panitia Ujian</span>
                        <div className="font-black underline mt-2">{previewSchool.principalName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitle description */}
              <div className="mt-3.5 pt-3 border-t-2 border-black flex items-center justify-between text-xs font-bold text-neutral-600">
                <span>
                  {activePreviewType === 'student' && 'Kartu Peserta Ujian (Kop, QR, & Foto/Avatar)'}
                  {activePreviewType === 'desk' && 'Nomor Meja Siap Tempel di Meja Kelas'}
                  {activePreviewType === 'proctor' && 'ID Card Pengawas Ruang (Format Lanyard)'}
                  {activePreviewType === 'guest' && 'Tanda Pengenal Tamu / Monev Dinas'}
                </span>
                <span className="text-emerald-700 font-mono font-bold">Siap Cetak PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUE PROPOSITION STATS BAR */}
      <section className="bg-yellow-300 border-t-3 border-b-3 border-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">4-in-1</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Output Berkas Cetak
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">100%</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Presisi Format A4
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">Excel &amp; ZIP</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Import Massal Instan
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">Cloud Sync</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Multi-Sekolah Mandiri
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 4 PILLARS OF EXAMINATION ADMINISTRATION */}
      <section className="py-14 bg-white border-b-3 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-block px-3 py-1 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
              Ekosistem Administrasi Ujian Terintegrasi
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
              Bukan Sekadar Kartu, Ini Manajemen Ujian Lengkap
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-600">
              Dirancang untuk memangkas jam kerja operator sekolah dari hitungan hari menjadi hitungan menit. Seluruh data lembaga, siswa, pengawas, dan dokumen cetak terpadu tanpa software grafis terpisah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pilar 1 */}
            <div className="p-6 bg-yellow-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Building2 className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">1. Profil Lembaga &amp; Ujian</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Kelola identitas resmi sekolah (NPSN, NSS, Alamat lengkap, logo lembaga, Kepala Sekolah &amp; NIP). Dilengkapi konfigurasi nama asesmen (PTS, PAS, ASAS, ANBK, PAT), semester, dan jadwal ujian.
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Kop surat sekolah otomatis
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Logo resolusi tinggi &amp; tanda tangan
                </li>
              </ul>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 bg-cyan-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-cyan-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">2. Data Siswa &amp; Agama</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Pusat pendataan siswa per rombel/kelas, NISN, NIS, tempat tanggal lahir, ruang &amp; nomor meja. Dilengkapi kolom agama serta avatar cerdas (siswi muslim otomatis berhijab, siswi lainnya rambut rapi terurai).
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Import template Excel tanpa error
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Upload foto ZIP otomatis via NISN
                </li>
              </ul>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 bg-purple-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <ShieldCheck className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">3. Guru &amp; Pengawas Ruang</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Modul master data guru pengajar dan tenaga kependidikan lengkap dengan NIP/NUPTK, gelar, mapel, no. HP, dan plotting penugasan ruang pengawas ujian secara transparan dan teratur.
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Import Excel data guru &amp; sheet GURU
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Distribusi ruang jaga pengawas
                </li>
              </ul>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 bg-emerald-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Printer className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">4. Generator Cetak A4</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Pusat pencetakan seluruh atribut ujian: Kartu Peserta Ujian (1 kolom / 2 kolom hemat kertas), Label Nomor Meja Peserta, ID Card Pengawas Ruang ber-QR code, serta ID Tamu Asesor Monev.
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Garis potong putus-putus presisi
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Ekspor PDF vektor tajam &amp; jelas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW STEP-BY-STEP */}
      <section className="py-14 bg-[#FAF7EE] border-b-3 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
              Alur Kerja Cepat untuk Operator Sekolah
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-600">
              Dari spreadsheet data mentah hingga ratusan kartu ujian dan atribut meja siap edar hanya dalam 4 tahapan ringkas:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-yellow-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                1
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-black uppercase text-neutral-900">Unduh &amp; Isi Template</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Unduh template Excel resmi untuk Siswa dan Guru. Isi data kelas, NISN, ruang ujian, dan agama tanpa format rumit.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-[#00F0FF] border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                2
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-black uppercase text-neutral-900">Upload Data &amp; Foto</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Upload file Excel siswa &amp; guru dengan auto-validasi duplikasi. Upload arsip ZIP foto siswa untuk pemasangan instan.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-pink-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                3
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-black uppercase text-neutral-900">Atur Kop &amp; Parameter</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Sesuaikan nama asesmen, semester, logo sekolah, serta tanda tangan kepala sekolah. Pilih tema desain kartu yang diinginkan.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-emerald-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                4
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-black uppercase text-neutral-900">Cetak A4 / Ekspor PDF</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Pilih cetak ID Siswa, Label Meja, ID Pengawas, atau ID Tamu. Cetak langsung ke printer atau simpan sebagai PDF siap gunting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ADVANCED FEATURES GRID */}
      <section className="py-14 bg-white border-b-3 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
              Fitur Lengkap Menunjang Ketertiban Ujian
            </h2>
            <p className="text-xs sm:text-sm font-bold text-neutral-600">
              Dirancang dengan standar administrasi pendidikan nasional untuk SD, SMP, SMA, SMK, dan Madrasah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-5 bg-yellow-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Building2 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Multi-Sekolah &amp; Multi-Akun</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Setiap operator sekolah memiliki database terisolasi. Data siswa, guru, logo, dan riwayat ujian masing-masing sekolah tidak akan bercampur.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 bg-emerald-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-emerald-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Database className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Sinkronisasi Cloud Realtime</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Terintegrasi dengan database cloud spreadsheet. Setiap penambahan atau pembaruan siswa dan guru otomatis tersimpan aman di cloud.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 bg-cyan-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-cyan-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <FileSpreadsheet className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Validasi Excel Cerdas</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Mendeteksi duplikasi NISN, kesalahan kolom agama, serta kelengkapan data otomatis saat impor file `.xlsx`, mencegah kartu ganda tercetak.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 bg-pink-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-pink-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <UploadCloud className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Auto-Extract ZIP Foto Siswa</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Kemasi ratusan foto siswa dengan nama file NISN ke dalam satu file `.zip`. Sistem otomatis memasangkan foto ke profil siswa yang tepat.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 bg-amber-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <SunMoon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Mode Gelap &amp; Tema Fleksibel</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Dilengkapi toggle Mode Gelap / Terang yang nyaman di mata untuk lembur input data malam hari, serta 6 pilihan tema warna UI aplikasi.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 bg-purple-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-purple-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Smartphone className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Responsif Mobile &amp; Desktop</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Bisa diakses dari laptop TU maupun smartphone saat pengawas keliling memeriksa nomor meja dan kehadiran peserta di setiap ruang kelas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA SECTION */}
      <section className="py-14 bg-neutral-900 text-white border-b-3 border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-yellow-300 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[3px_3px_0px_#FFE600]">
            Siap Menghadapi Musim Asesmen &amp; Ujian Sekolah
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
            Mulai Cetak Seluruh Atribut Ujian Sekolah Anda Sekarang!
          </h2>
          <p className="text-xs sm:text-sm font-medium text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Tinggalkan cara manual yang memakan waktu. Kelola data siswa, pengawas, ruang, dan cetak kartu ujian dengan rapi, presisi, dan hemat biaya.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-6 py-3.5 bg-yellow-300 hover:bg-yellow-200 text-black text-xs sm:text-sm font-black uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_#FFF] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              Masuk Akun Operator <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenRegister}
              className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-black text-xs sm:text-sm font-black uppercase rounded-xl border-3 border-black shadow-[4px_4px_0px_#FFE600] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              Daftarkan Sekolah Anda Baru <ArrowRight className="w-4 h-4 text-neutral-900" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="mt-auto py-8 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <PortalAsesmenLogo size="xs" variant="icon-only" />
            <span className="font-black uppercase tracking-wider text-sm">PORTAL ASESMEN</span>
            <span className="text-neutral-400 hidden sm:inline">• Aplikasi Administrasi &amp; Generator Kartu Asesmen Sekolah</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-neutral-300 hover:text-white font-bold underline cursor-pointer"
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={onOpenRegister}
              className="px-3.5 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black font-black uppercase rounded-lg border-2 border-black text-[11px] shadow-[2px_2px_0px_#FFE600] cursor-pointer"
            >
              Daftar Sekolah
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
