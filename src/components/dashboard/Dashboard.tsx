import React from 'react';
import { School, Exam, Student, Teacher, CardDesignSettings, UserAccount, GoogleSheetsConfig } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { DEFAULT_SCHOOL, DEFAULT_EXAM } from '../../data/mockData';
import {
  Users,
  Image as ImageIcon,
  UserCheck,
  Printer,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  UploadCloud,
  Palette,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Database,
  Link,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

interface DashboardProps {
  currentUser: UserAccount | null;
  school: School;
  exam: Exam;
  students: Student[];
  teachers?: Teacher[];
  selectedCount: number;
  design: CardDesignSettings;
  onNavigate: (tab: 'dashboard' | 'students' | 'designer' | 'print' | 'settings') => void;
  onOpenImportModal: () => void;
  onOpenPhotoModal: () => void;
  onOpenTeacherImportModal?: () => void;
  onResetDemoData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  school,
  exam,
  students,
  teachers = [],
  selectedCount,
  design,
  onNavigate,
  onOpenImportModal,
  onOpenPhotoModal,
  onOpenTeacherImportModal,
  onResetDemoData,
}) => {
  const safeSchool = school || DEFAULT_SCHOOL;
  const safeExam = exam || DEFAULT_EXAM;
  const safeStudents = (students || []).filter(Boolean);
  const safeTeachers = (teachers || []).filter(Boolean);

  const studentsWithPhoto = safeStudents.filter((s) => Boolean(s.photoUrl)).length;
  const studentsWithoutPhoto = safeStudents.length - studentsWithPhoto;
  const photoPercentage = safeStudents.length > 0 ? Math.round((studentsWithPhoto / safeStudents.length) * 100) : 0;
  const proctorCount = safeTeachers.filter((t) => t.roleType === 'pengawas').length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO SECTION (NEOBRUTALISM RESPONSIVE BANNER) */}
      <div className="relative bg-[#FFE600] border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-4 sm:p-6 overflow-hidden">
        {/* Playful background decorative shapes */}
        <div className="hidden sm:block absolute -right-8 -bottom-8 w-36 h-36 bg-[#00F0FF] rounded-full border-3 border-black opacity-30 pointer-events-none" />
        <div className="hidden sm:block absolute right-32 -top-6 w-20 h-20 bg-[#FF4365] rounded-xl border-3 border-black rotate-12 opacity-25 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border-2 border-black rounded-lg text-[10px] sm:text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-3 h-3 text-yellow-600" />
              Sistem Generator Kartu Ujian
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
              SELAMAT DATANG, {currentUser?.username || 'OPERATOR'} 👋
            </h1>
            <p className="text-xs sm:text-sm font-bold text-neutral-800 leading-snug">
              Kelola dan cetak kartu ujian untuk <strong>{safeSchool.name || 'Sekolah'}</strong> secara mudah, cepat, dan siap cetak A4.
            </p>

            <div className="pt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="px-3.5 sm:px-4 py-2 bg-black hover:bg-neutral-800 text-white text-[11px] sm:text-xs font-black uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#FFF] flex items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                Mulai Kelola Siswa <ArrowRight className="w-3.5 h-3.5 text-yellow-300" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('print')}
                className="px-3.5 sm:px-4 py-2 bg-white hover:bg-neutral-100 text-black text-[11px] sm:text-xs font-black uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                Cetak A4 ({safeStudents.length} Siswa)
              </button>
            </div>
          </div>

          {/* Active School Snapshot Card */}
          <div className="w-full lg:w-72 bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-3 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-black">
              <SchoolLogo url={safeSchool.logoUrl} name={safeSchool.name || 'Sekolah'} sizeMm={12} className="shadow-[2px_2px_0px_#000]" />
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-black uppercase text-neutral-500">Sekolah Aktif</div>
                <div className="text-xs font-black truncate">{safeSchool.name || 'Belum diatur'}</div>
                <div className="text-[10px] font-mono font-bold text-neutral-600">NPSN: {safeSchool.npsn || '-'}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="mt-3 w-full py-2 text-xs font-black uppercase bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-center shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              Kelola Data Sekolah →
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS (SUSUNAN 2 KOTAK 1 BARIS DI MOBILE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total Siswa */}
        <div className="bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden group hover:bg-yellow-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-300 border-2 border-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <span className="px-1.5 py-0.2 bg-neutral-100 border border-black rounded text-[9px] sm:text-[10px] font-bold uppercase">
              Roster
            </span>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black tracking-tight">{students.length}</div>
            <div className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase mt-0.5 truncate">Total Siswa</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-neutral-200 flex justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600">
            <span>Status</span>
            <span className="font-bold text-emerald-600">100% Valid</span>
          </div>
        </div>

        {/* Card 2: Jumlah Guru */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden group hover:bg-emerald-50 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-400 border-2 border-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-black rounded text-[9px] sm:text-[10px] font-bold uppercase">
              {proctorCount} Pengawas
            </span>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black tracking-tight text-emerald-800">{safeTeachers.length}</div>
            <div className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase mt-0.5 truncate">Jumlah Guru</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-neutral-200 flex justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600">
            <span>Tugas Jaga</span>
            <span className="font-bold text-emerald-700">{proctorCount} Pengawas Ruang</span>
          </div>
        </div>

        {/* Card 3: Avatar Gender Fallback */}
        <div className="bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden group hover:bg-cyan-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-300 border-2 border-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <span className="px-1.5 py-0.2 bg-cyan-100 text-cyan-800 border border-black rounded text-[9px] sm:text-[10px] font-bold uppercase">
              Auto
            </span>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black tracking-tight text-cyan-800">{studentsWithoutPhoto}</div>
            <div className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase mt-0.5 truncate">Avatar Siswa</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-neutral-200 flex justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600">
            <span>Default</span>
            <span className="font-bold">L/P Vektor</span>
          </div>
        </div>

        {/* Card 4: Kartu Siap Cetak */}
        <div className="bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden group hover:bg-yellow-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-300 border-2 border-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <span className="px-1.5 py-0.2 bg-yellow-100 text-black border border-black rounded text-[9px] sm:text-[10px] font-bold uppercase">
              A4
            </span>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-3xl font-black tracking-tight">{students.length}</div>
            <div className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase mt-0.5 truncate">Siap Cetak</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-neutral-200 flex justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600">
            <span>Kertas</span>
            <span className="font-bold text-black font-mono">
              ~{Math.ceil(students.length / 8)} Lembar
            </span>
          </div>
        </div>
      </div>

      {/* 3. STEP-BY-STEP ONBOARDING WORKFLOW (2 KOTAK 1 BARIS DI MOBILE) */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 pb-2.5 border-b-2 border-black flex items-center justify-between">
          <span>Alur Cepat Cetak Kartu Ujian</span>
          <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500">4 Langkah Mudah</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mt-3.5 sm:mt-4">
          {/* Step 1 */}
          <div
            onClick={() => onNavigate('settings')}
            className="p-3 sm:p-3.5 bg-neutral-50 hover:bg-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 bg-black text-white rounded text-[10px] font-black flex items-center justify-center">
                1
              </span>
              <Building2 className="w-4 h-4 text-neutral-600 group-hover:text-black" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-black uppercase truncate">Profil Sekolah</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
              Atur nama sekolah, NPSN, kop ujian & logo.
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigate('students')}
            className="p-3 sm:p-3.5 bg-neutral-50 hover:bg-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 bg-black text-white rounded text-[10px] font-black flex items-center justify-center">
                2
              </span>
              <FileSpreadsheet className="w-4 h-4 text-neutral-600 group-hover:text-black" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-black uppercase truncate">Import Siswa</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
              Unduh template Excel atau input data siswa.
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigate('designer')}
            className="p-3 sm:p-3.5 bg-neutral-50 hover:bg-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 bg-black text-white rounded text-[10px] font-black flex items-center justify-center">
                3
              </span>
              <Palette className="w-4 h-4 text-neutral-600 group-hover:text-black" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-black uppercase truncate">Desain Kartu</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
              Pilih gaya, ukuran mm, warna, & live preview.
            </p>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => onNavigate('print')}
            className="p-3 sm:p-3.5 bg-neutral-50 hover:bg-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 bg-emerald-500 text-black border border-black rounded text-[10px] font-black flex items-center justify-center">
                4
              </span>
              <Printer className="w-4 h-4 text-neutral-600 group-hover:text-black" />
            </div>
            <h4 className="text-[11px] sm:text-xs font-black uppercase truncate">Cetak A4</h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
              Pratinjau lembar A4 & simpan sebagai PDF.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAST SHORTCUTS */}
      <div className="bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-3 sm:mb-4">
          Aksi Cepat Operator
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="p-3 sm:p-3.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-left group transition-all active:scale-98 cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-800 mb-1.5" />
            <div className="text-xs font-black uppercase">Import Masal Siswa</div>
            <div className="text-[10px] text-neutral-600 mt-0.5">XLSX, XLS, atau CSV</div>
          </button>

          <button
            type="button"
            onClick={onOpenPhotoModal}
            className="p-3 sm:p-3.5 bg-cyan-100 hover:bg-cyan-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-left group transition-all active:scale-98 cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-800 mb-1.5" />
            <div className="text-xs font-black uppercase">Import Foto Siswa</div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Berkas ZIP Foto Siswa</div>
          </button>

          <button
            type="button"
            onClick={onOpenTeacherImportModal || onOpenImportModal}
            className="p-3 sm:p-3.5 bg-indigo-100 hover:bg-indigo-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-left group transition-all active:scale-98 cursor-pointer"
          >
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-800 mb-1.5" />
            <div className="text-xs font-black uppercase">Import Masal Guru</div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Template Sheet Guru</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('designer')}
            className="p-3 sm:p-3.5 bg-yellow-100 hover:bg-yellow-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-left group transition-all active:scale-98 cursor-pointer"
          >
            <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-800 mb-1.5" />
            <div className="text-xs font-black uppercase">Studio Desain</div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Live Preview 5 Tema</div>
          </button>
        </div>
      </div>
    </div>
  );
};
