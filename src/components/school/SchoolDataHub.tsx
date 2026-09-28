import React, { useState } from 'react';
import {
  Student,
  Teacher,
  School,
  Exam,
  CardDesignSettings,
  GoogleSheetsConfig,
  UserAccount,
} from '../../types';
import { StudentList } from '../students/StudentList';
import { TeacherList } from '../teachers/TeacherList';
import { SchoolIdentityForm } from './SchoolIdentityForm';
import { AssessmentList } from './AssessmentList';
import {
  Users,
  Briefcase,
  Building2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

export type SchoolDataSection = 'menu' | 'students' | 'teachers' | 'identity' | 'exams';

interface SchoolDataHubProps {
  students: Student[];
  teachers: Teacher[];
  school: School;
  exam: Exam;
  exams?: Exam[];
  design: CardDesignSettings;
  selectedStudentIds: string[];
  selectedTeacherIds: string[];
  onToggleStudentSelect: (id: string) => void;
  onSelectAllStudents: (selected: boolean) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void | Promise<void>;
  onBulkDeleteStudents: (ids: string[]) => void | Promise<void>;
  onBatchAddStudents: (students: Student[]) => void;
  onApplyPhotos: (matchedMap: Record<string, string>) => void;
  onToggleTeacherSelect: (id: string) => void;
  onSelectAllTeachers: (selected: boolean) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void | Promise<void>;
  onBulkDeleteTeachers: (ids: string[]) => void | Promise<void>;
  onBatchAddTeachers: (teachers: Teacher[]) => void;
  onUpdateSchool: (school: School) => void;
  onUpdateExam: (exam: Exam) => void;
  onSelectActiveExam?: (exam: Exam) => void;
  onAddExam?: (exam: Exam) => void;
  onDeleteExam?: (id: string) => void;
  onSaveSchoolAndExam?: (school: School, exam: Exam) => Promise<void> | void;
  googleSheets?: GoogleSheetsConfig;
  currentUser?: UserAccount | null;
  onNavigateToPrint: () => void;
  onNavigateToPrintProctor?: () => void;
  initialSection?: SchoolDataSection;
}

export const SchoolDataHub: React.FC<SchoolDataHubProps> = ({
  students,
  teachers,
  school,
  exam,
  exams,
  onSelectActiveExam,
  onAddExam,
  onDeleteExam,
  design,
  selectedStudentIds,
  selectedTeacherIds,
  onToggleStudentSelect,
  onSelectAllStudents,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkDeleteStudents,
  onBatchAddStudents,
  onApplyPhotos,
  onToggleTeacherSelect,
  onSelectAllTeachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onBulkDeleteTeachers,
  onBatchAddTeachers,
  onUpdateSchool,
  onUpdateExam,
  onSaveSchoolAndExam,
  googleSheets,
  currentUser,
  onNavigateToPrint,
  onNavigateToPrintProctor,
  initialSection = 'menu',
}) => {
  const [activeSection, setActiveSection] = useState<SchoolDataSection>(initialSection);

  // Top navigation bar for sub-views
  const renderTopSubNav = () => (
    <div className="no-print bg-white border-2 border-black rounded-xl p-2.5 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSection('menu')}
          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#000]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Menu Data</span>
        </button>

        <span className="text-neutral-300 font-bold hidden sm:inline">|</span>

        {/* Section Pills */}
        <button
          type="button"
          onClick={() => setActiveSection('students')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeSection === 'students'
              ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-yellow-50 text-neutral-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Data Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('teachers')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeSection === 'teachers'
              ? 'bg-emerald-400 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-emerald-50 text-neutral-700'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Data Guru</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('exams')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeSection === 'exams'
              ? 'bg-purple-300 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-purple-50 text-neutral-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Data Asesmen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('identity')}
          className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeSection === 'identity'
              ? 'bg-sky-300 text-black shadow-[2px_2px_0px_#000]'
              : 'bg-white hover:bg-sky-50 text-neutral-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Data Sekolah</span>
        </button>
      </div>

      <div className="text-[11px] font-mono font-bold text-neutral-500 hidden md:block">
        {school.name || 'PORTAL SEKOLAH'}
      </div>
    </div>
  );

  // 1. SUB-VIEW: MENU KOTAK DATA UTAMA
  if (activeSection === 'menu') {
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Top Header Banner */}
        <div className="bg-yellow-300 border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase">
                <Layers className="w-3 h-3 text-yellow-300" />
                Pusat Administrasi & Basis Data
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
                Data Sekolah & Tenaga Kependidikan
              </h2>
              <p className="text-xs sm:text-sm text-neutral-800 font-medium max-w-2xl">
                Pilih menu di bawah ini untuk mengelola peserta didik, data guru & pengawas ruang, atau profil identitas sekolah.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Kotak Menu Data (Data Siswa, Data Guru, Data Asesmen, Data Sekolah) - 2 Menu per Baris */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Kotak 1: Data Siswa */}
          <div
            onClick={() => setActiveSection('students')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-amber-800 transition-colors">
                  Data Siswa
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Kelola peserta ujian, NISN, NIS, kelas, opsi agama (avatar hijab & kepang), import Excel, dan upload foto ZIP.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Opsi Agama Siswa
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Avatar Hijab & Kepang
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Import Excel
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Data Siswa</span>
              <div className="w-7 h-7 rounded-lg bg-yellow-300 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Kotak 2: Data Guru */}
          <div
            onClick={() => setActiveSection('teachers')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-emerald-800 transition-colors">
                  Data Guru
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Data tenaga pendidik, NIP, mata pelajaran, penugasan pengawas ruang, panitia ujian, dan import berkas Excel massal.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Sheet GURU
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Pengawas Ruang
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Input Lengkap
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Data Guru</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-400 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Kotak 3: Data Asesmen & Jadwal Ujian */}
          <div
            onClick={() => setActiveSection('exams')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-purple-800 transition-colors">
                  Data Asesmen
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Kelola nama asesmen, semester, tahun ajaran, jadwal mata pelajaran, waktu dan tempat pelaksanaan ujian.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Jadwal Ujian
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Semester & TA
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Kop Kartu
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Data Asesmen</span>
              <div className="w-7 h-7 rounded-lg bg-purple-300 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Kotak 4: Data Sekolah */}
          <div
            onClick={() => setActiveSection('identity')}
            className="group relative bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-5 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-black" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight group-hover:text-sky-800 transition-colors">
                  Data Sekolah
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Identitas resmi lembaga sekolah, alamat lengkap, logo resmi, kepala sekolah, dan NIP.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Logo Sekolah
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  Kepala Sekolah
                </span>
                <span className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] font-bold text-neutral-600 border border-neutral-300">
                  NIP & Jabatan
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-black text-black">
              <span>Buka Identitas Sekolah</span>
              <div className="w-7 h-7 rounded-lg bg-sky-300 border border-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. SUB-VIEW: DATA SISWA
  if (activeSection === 'students') {
    return (
      <div className="space-y-4">
        {renderTopSubNav()}
        <StudentList
          students={students}
          school={school}
          exam={exam}
          design={design}
          selectedStudentIds={selectedStudentIds}
          onToggleSelect={onToggleStudentSelect}
          onSelectAll={onSelectAllStudents}
          onAddStudent={onAddStudent}
          onUpdateStudent={onUpdateStudent}
          onDeleteStudent={onDeleteStudent}
          onBulkDelete={onBulkDeleteStudents}
          onBatchAddStudents={onBatchAddStudents}
          onApplyPhotos={onApplyPhotos}
          onNavigateToPrint={onNavigateToPrint}
        />
      </div>
    );
  }

  // 3. SUB-VIEW: DATA GURU
  if (activeSection === 'teachers') {
    return (
      <div className="space-y-4">
        {renderTopSubNav()}
        <TeacherList
          teachers={teachers}
          school={school}
          exam={exam}
          selectedTeacherIds={selectedTeacherIds}
          onToggleSelect={onToggleTeacherSelect}
          onSelectAll={onSelectAllTeachers}
          onAddTeacher={onAddTeacher}
          onUpdateTeacher={onUpdateTeacher}
          onDeleteTeacher={onDeleteTeacher}
          onBulkDelete={onBulkDeleteTeachers}
          onBatchAddTeachers={onBatchAddTeachers}
          onNavigateToPrintProctor={onNavigateToPrintProctor}
        />
      </div>
    );
  }

  // 4. SUB-VIEW: DATA ASESMEN
  if (activeSection === 'exams') {
    return (
      <div className="space-y-4">
        {renderTopSubNav()}
        <AssessmentList
          exams={exams || [exam]}
          activeExam={exam}
          onSelectActiveExam={onSelectActiveExam || onUpdateExam}
          onAddExam={onAddExam || onUpdateExam}
          onUpdateExam={onUpdateExam}
          onDeleteExam={onDeleteExam || (() => {})}
        />
      </div>
    );
  }

  // 5. SUB-VIEW: DATA SEKOLAH (IDENTITAS)
  return (
    <div className="space-y-4">
      {renderTopSubNav()}
      <SchoolIdentityForm
        school={school}
        exam={exam}
        onSaveSchool={onUpdateSchool}
        onSaveExam={onUpdateExam}
        onSaveSchoolAndExam={onSaveSchoolAndExam}
        googleSheets={googleSheets}
        currentUser={currentUser}
      />
    </div>
  );
};
