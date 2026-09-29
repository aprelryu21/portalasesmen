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
  FileText,
  UserPlus,
  Camera,
  Trash2,
  CheckCheck,
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
  name: 'ASESMEN SUMATIF TENGAH SEMESTER (ASTS 1)',
  semester: 'Semester 1 (Ganjil)',
  academicYear: '2026 / 2027',
  dateText: '29 September - 04 Oktober 2026',
  location: 'Kediri',
  extraNote: 'Harap hadir 15 menit sebelum ujian dimulai & membawa kartu ini.',
};

type PreviewCardType = 'student' | 'desk' | 'proctor' | 'guest' | 'doc';

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
                  Sistem Administrasi &amp; Generator Kartu Asesmen Sekolah
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
              <span>Sistem Administrasi Ujian &amp; Generator Dokumen Sekolah Terintegrasi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-neutral-900">
              KELOLA DATA &amp; CETAK PERLENGKAPAN UJIAN{' '}
              <span className="bg-yellow-300 px-2.5 py-0.5 border-3 border-black rounded-xl inline-block shadow-[4px_4px_0px_#000] rotate-1">
                SECARA OTOMATIS
              </span>
            </h1>

            <p className="text-sm sm:text-base font-bold text-neutral-700 leading-relaxed max-w-2xl">
              Solusi satu pintu bagi operator sekolah di Indonesia: Kelola identitas lembaga, database siswa &amp; avatar hijab otomatis, penugasan guru pengawas ruang, serta cetak otomatis <strong>Kartu Peserta Ujian</strong>, <strong>Label Nomor Meja</strong>, <strong>ID Pengawas</strong>, <strong>ID Tamu</strong>, dan <strong>Paket Dokumen Administrasi Resmi (SK Panitia, Daftar Hadir Peserta ber-Kop, Berita Acara, &amp; Tata Tertib)</strong> dengan tata letak lembar A4 presisi siap pakai.
            </p>

            {/* Quick Key Badges (6 Badges) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-black">
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">Siswa &amp; Avatar Hijab</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">SK Panitia &amp; Presensi</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Guru &amp; Pengawas Ruang</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <Armchair className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Label Nomor Meja</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="truncate">Pendaftaran Mandiri</span>
              </div>
              <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">Log Presensi Kamera</span>
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

                {/* 5 Multi-card switcher tabs */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActivePreviewType('student')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'student'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-3 h-3 shrink-0" />
                    <span className="truncate">Siswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePreviewType('desk')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'desk'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <Armchair className="w-3 h-3 shrink-0" />
                    <span className="truncate">Meja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePreviewType('proctor')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
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
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      activePreviewType === 'guest'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <UserCheck className="w-3 h-3 shrink-0" />
                    <span className="truncate">Tamu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePreviewType('doc')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 cursor-pointer transition-colors col-span-2 sm:col-span-1 ${
                      activePreviewType === 'doc'
                        ? 'bg-yellow-300 shadow-[2px_2px_0px_#000]'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">Dokumen</span>
                  </button>
                </div>
              </div>

              {/* Showcase Canvas */}
              <div className="p-3 sm:p-4 bg-[#F7F4EB] border-2 border-dashed border-neutral-400 rounded-xl flex items-center justify-center overflow-hidden min-h-[310px]">
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
                      <div className="text-[7.5px] font-bold text-neutral-600 uppercase">ASESMEN SUMATIF 2026/2027</div>
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
                      <div className="text-[7.5px] font-bold text-neutral-600 uppercase">ASESMEN SUMATIF 2026/2027</div>
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

                {activePreviewType === 'doc' && (
                  <div className="w-full max-w-[340px] bg-white border-3 border-black rounded-xl p-3.5 shadow-[4px_4px_0px_#000] space-y-2 animate-in fade-in duration-200">
                    {/* Official Kop Mini */}
                    <div className="flex items-center gap-2 border-b-2 border-black pb-1.5">
                      <SchoolLogo url={previewSchool.logoUrl} name={previewSchool.name} sizeMm={10} />
                      <div className="flex-1 text-center min-w-0">
                        <div className="text-[7.5px] font-bold text-neutral-600 uppercase leading-none">DINAS PENDIDIKAN KABUPATEN KEDIRI</div>
                        <div className="text-[9px] font-black uppercase text-neutral-900 leading-tight truncate">{previewSchool.name}</div>
                        <div className="text-[7px] text-neutral-500 font-mono leading-none">TAHUN PELAJARAN 2026/2027</div>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center pt-0.5">
                      <div className="text-[9.5px] font-black uppercase text-neutral-900 tracking-tight">DAFTAR HADIR PESERTA ASESMEN</div>
                      <div className="text-[7px] font-bold text-indigo-700 uppercase">ASESMEN SUMATIF TENGAH SEMESTER (ASTS 1)</div>
                    </div>

                    {/* Meta info grid */}
                    <div className="grid grid-cols-2 gap-x-2 text-[7.5px] font-mono bg-neutral-50 p-1.5 border border-black rounded">
                      <div><span className="font-bold">Kelas:</span> Kelas VI-A</div>
                      <div><span className="font-bold">Ruang:</span> Ruang 01</div>
                      <div><span className="font-bold">Mapel:</span> Matematika</div>
                      <div><span className="font-bold">Waktu:</span> 07.30 - 09.30 WIB</div>
                    </div>

                    {/* Mini Attendance Table */}
                    <div className="border border-black rounded overflow-hidden text-[7.5px]">
                      <table className="w-full text-left">
                        <thead className="bg-yellow-200 border-b border-black font-black">
                          <tr>
                            <th className="py-0.5 px-1 w-5 text-center">No</th>
                            <th className="py-0.5 px-1">Nama Peserta</th>
                            <th className="py-0.5 px-1 text-center w-16">Tanda Tangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 font-medium">
                          <tr>
                            <td className="py-0.5 px-1 text-center font-bold">1</td>
                            <td className="py-0.5 px-1 uppercase font-bold text-[7px] truncate max-w-[120px]">M. RIZKY PRATAMA</td>
                            <td className="py-0.5 px-1 text-[6.5px] font-mono text-neutral-500 italic">1. ............</td>
                          </tr>
                          <tr className="bg-neutral-50">
                            <td className="py-0.5 px-1 text-center font-bold">2</td>
                            <td className="py-0.5 px-1 uppercase font-bold text-[7px] truncate max-w-[120px]">AISYAH NUR AZIZAH</td>
                            <td className="py-0.5 px-1 text-[6.5px] font-mono text-neutral-500 italic text-right">2. ............</td>
                          </tr>
                          <tr>
                            <td className="py-0.5 px-1 text-center font-bold">3</td>
                            <td className="py-0.5 px-1 uppercase font-bold text-[7px] truncate max-w-[120px]">BUDI SANTOSO</td>
                            <td className="py-0.5 px-1 text-[6.5px] font-mono text-neutral-500 italic">3. ............</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Signature footer */}
                    <div className="flex justify-between items-end pt-1 text-[6.5px]">
                      <div>
                        <div className="font-bold">Pengawas Ruang,</div>
                        <div className="mt-2.5 font-bold uppercase underline">SUPARMAN, S.Pd.</div>
                      </div>
                      <div className="text-right">
                        <div>Kepala Sekolah,</div>
                        <div className="mt-2.5 font-black uppercase underline">{previewSchool.principalName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitle description */}
              <div className="mt-3.5 pt-3 border-t-2 border-black flex items-center justify-between text-xs font-bold text-neutral-600">
                <span className="truncate pr-2">
                  {activePreviewType === 'student' && 'Kartu Peserta Ujian (Kop, QR, & Foto/Avatar Hijab)'}
                  {activePreviewType === 'desk' && 'Nomor Meja Siap Tempel di Meja Kelas'}
                  {activePreviewType === 'proctor' && 'ID Card Pengawas Ruang (Format Lanyard)'}
                  {activePreviewType === 'guest' && 'Tanda Pengenal Tamu / Monev Dinas'}
                  {activePreviewType === 'doc' && 'Dokumen Administrasi Ujian Resmi (SK Panitia & Presensi)'}
                </span>
                <span className="text-emerald-700 font-mono font-bold shrink-0">Siap Cetak PDF</span>
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
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">All-in-One</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Kartu &amp; Berkas Administrasi
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">100% Presisi</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Format Lembar A4 Siap Cetak
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">Excel &amp; ZIP</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Impor Data &amp; Foto Instan
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="text-2xl sm:text-3xl font-black text-neutral-900">Cloud Sync</div>
              <div className="text-[11px] sm:text-xs font-bold text-neutral-700 uppercase mt-0.5">
                Multi-Sekolah &amp; Log Kamera
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 6 PILLARS OF EXAMINATION ADMINISTRATION */}
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
              Dirancang untuk memangkas jam kerja operator sekolah dari hitungan hari menjadi hitungan menit. Seluruh data lembaga, siswa, panitia, pengawas, dan dokumen cetak terpadu tanpa software grafis terpisah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pilar 1 */}
            <div className="p-6 bg-yellow-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Building2 className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">1. Profil Lembaga &amp; Ujian</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Kelola identitas resmi sekolah (NPSN, NSS, Alamat lengkap, logo lembaga, Kepala Sekolah &amp; NIP). Dilengkapi konfigurasi nama asesmen (PTS, PAS, ASTS, ASAS, ANBK, PAT), semester, dan jadwal pelaksanaan.
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
                <h3 className="text-base font-black uppercase tracking-tight">2. Siswa &amp; Avatar Hijab</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Pusat pendataan siswa per rombel/kelas, NISN, NIS, tempat tanggal lahir, ruang &amp; nomor meja. Dilengkapi kolom agama serta generator avatar cerdas (siswi muslim otomatis berhijab, siswi lainnya rambut rapi terurai).
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
                  Modul master data guru pengajar dan tenaga kependidikan lengkap dengan NIP/NUPTK, gelar, mapel, no. HP, dan plotting penugasan ruang pengawas ujian lengkap dengan ID Card gantungan (lanyard).
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Import Excel data guru &amp; sheet GURU
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Distribusi ruang jaga &amp; ID Lanyard
                </li>
              </ul>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 bg-rose-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-rose-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <FileText className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">4. Dokumen Administrasi Resmi</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Cetak paket berkas ujian resmi: Surat Keputusan (SK) Panitia &amp; Uraian Tugas, Daftar Hadir Peserta per ruang (kop surat di lembar pertama), Daftar Hadir Pengawas, Berita Acara, dan Tata Tertib.
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  SK Panitia &amp; rincian tugas lengkap
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Daftar hadir presisi siap tanda tangan
                </li>
              </ul>
            </div>

            {/* Pilar 5 */}
            <div className="p-6 bg-emerald-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Printer className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">5. Generator Kartu &amp; Meja A4</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Pusat pencetakan atribut fisik ujian: Kartu Peserta Ujian (pilihan 1 kolom / 2 kolom hemat kertas), Label Nomor Meja Peserta, ID Card Pengawas Ruang, dan ID Tamu Monev dengan batas garis potong rapi.
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Pilihan mode 2 kolom hemat kertas
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Garis potong putus-putus presisi
                </li>
              </ul>
            </div>

            {/* Pilar 6 */}
            <div className="p-6 bg-amber-50 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <Camera className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">6. Pendaftaran &amp; Log Kamera</h3>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Pendaftaran mandiri sekolah baru dengan persetujuan admin. Dilengkapi audit log login dengan potret kamera pengguna tersimpan di Google Drive, serta fitur hapus masal pembersih kuota.
                </p>
              </div>
              <ul className="text-[11px] font-bold text-neutral-800 space-y-1.5 pt-2 border-t-2 border-black/20">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Approval pendaftar sekolah baru
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Audit log foto &amp; hapus masal drive
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
              Dari data mentah hingga ratusan kartu ujian dan paket berkas administrasi siap cetak hanya dalam 5 tahapan praktis:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-yellow-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                1
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase text-neutral-900">Daftar &amp; Koneksi</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Daftarkan lembaga baru atau login operator. Otomatis terhubung ke database cloud Google Spreadsheet.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-[#00F0FF] border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                2
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase text-neutral-900">Isi Template Excel</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Unduh template resmi siswa dan guru. Isi data kelas, NISN, ruang, nomor meja, dan agama tanpa format rumit.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-pink-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                3
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase text-neutral-900">Upload Data &amp; ZIP</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Upload file Excel dengan auto-validasi duplikasi. Upload arsip ZIP foto siswa untuk pemasangan otomatis.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-purple-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                4
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase text-neutral-900">Atur SK &amp; Jadwal</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Sesuaikan nama asesmen, susunan SK panitia, penugasan ruang pengawas, dan pilih tema kartu ujian.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] relative">
              <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-emerald-300 border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                5
              </span>
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase text-neutral-900">Cetak A4 / Ekspor PDF</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Cetak Kartu Ujian, Label Meja, ID Pengawas, SK Panitia, dan Daftar Hadir ber-kop langsung siap edar.
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
            {/* Feature 1: Administrasi Lengkap */}
            <div className="p-5 bg-rose-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-rose-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Administrasi Ujian Siap Cetak</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Mencetak SK Panitia lengkap dengan rincian tugas, Daftar Hadir Peserta per ruang/kelas ber-kop resmi, Daftar Hadir Pengawas, Berita Acara, dan Tata Tertib.
              </p>
            </div>

            {/* Feature 2: Pendaftaran Mandiri */}
            <div className="p-5 bg-cyan-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-cyan-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <UserPlus className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Pendaftaran Mandiri &amp; Approval</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Sekolah baru dapat mendaftar mandiri. Akun pendaftar masuk antrean verifikasi di Portal Admin untuk disetujui (approve) sebelum dapat login ke sistem.
              </p>
            </div>

            {/* Feature 3: Keamanan & Log Kamera */}
            <div className="p-5 bg-amber-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-amber-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Camera className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Audit Log &amp; Presensi Kamera</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Setiap login terekam lengkap dengan foto kamera pengguna di Google Drive. Dilengkapi tombol hapus masal untuk membersihkan kuota penyimpanan secara aman.
              </p>
            </div>

            {/* Feature 4: Avatar Hijab */}
            <div className="p-5 bg-yellow-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Avatar Hijab Cerdas Otomatis</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Mendeteksi kolom agama Islam secara otomatis pada data siswi untuk menampilkan ilustrasi jilbab rapi tanpa perlu operator mengedit atau memotong foto manual.
              </p>
            </div>

            {/* Feature 5: Cloud Sync */}
            <div className="p-5 bg-emerald-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-emerald-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Database className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Sinkron Cloud Spreadsheet</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Database multi-sekolah mandiri terintegrasi langsung dengan Google Spreadsheet melalui Google Apps Script Web App tanpa instalasi server rumit.
              </p>
            </div>

            {/* Feature 6: Presisi A4 & 2 Kolom */}
            <div className="p-5 bg-purple-50 border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl space-y-3">
              <div className="w-12 h-12 bg-purple-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Printer className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-base font-black uppercase">Presisi A4 &amp; Mode Hemat Kertas</h3>
              <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                Dilengkapi opsi tata letak 2 kolom hemat kertas, garis potong putus-putus presisi, serta ekspor PDF beresolusi tajam tanpa pecah saat dicetak.
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
            Mulai Kelola Administrasi &amp; Cetak Atribut Ujian Sekolah Sekarang!
          </h2>
          <p className="text-xs sm:text-sm font-medium text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Tinggalkan cara manual yang memakan waktu. Kelola data siswa, pengawas, ruang, SK panitia, daftar hadir, dan cetak kartu ujian dengan rapi, presisi, dan terpadu.
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
            <span className="text-neutral-400 hidden sm:inline">• Sistem Administrasi &amp; Generator Kartu Asesmen Sekolah</span>
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
