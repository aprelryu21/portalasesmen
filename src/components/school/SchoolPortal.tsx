import React, { useState } from 'react';
import {
  UserAccount,
  School,
  Exam,
  Student,
  Teacher,
  CardDesignSettings,
  PrintSettings,
  PosterDesignSettings,
  AnswerSheetDesignSettings,
  GoogleSheetsConfig,
  LoginLogEntry,
} from '../../types';
import { DEFAULT_POSTER_DESIGN, DEFAULT_ANSWER_SHEET_DESIGN } from '../../data/mockData';
import { SchoolLogo } from '../common/SchoolLogo';
import { Dashboard } from '../dashboard/Dashboard';
import { SchoolDataHub } from './SchoolDataHub';
import { CardDesigner, DesignerMenuId } from '../card/CardDesigner';
import { PrintPreview, PrintCardCategory } from '../print/PrintPreview';
import { SchoolSettings } from '../settings/SchoolSettings';
import {
  LayoutDashboard,
  Database,
  Palette,
  Sparkles,
  Printer,
  Settings,
  Building2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export type SchoolTabId = 'dashboard' | 'students' | 'designer' | 'print' | 'settings';

interface SchoolPortalProps {
  currentUser: UserAccount;
  school: School;
  exam: Exam;
  students: Student[];
  teachers?: Teacher[];
  cardDesign: CardDesignSettings;
  posterDesign?: PosterDesignSettings;
  answerSheetDesign?: AnswerSheetDesignSettings;
  printSettings: PrintSettings;
  selectedStudentIds: string[];
  selectedTeacherIds?: string[];
  googleSheets: GoogleSheetsConfig;
  activeTab: SchoolTabId;
  onNavigate: (tab: SchoolTabId) => void;
  onToggleStudentSelect: (id: string) => void;
  onSelectAllStudents: (selectAll: boolean) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onBulkDeleteStudents: (ids: string[]) => void;
  onBatchAddStudents: (students: Student[]) => void;
  onApplyPhotos: (matchedMap: Record<string, string>) => void;
  onToggleTeacherSelect?: (id: string) => void;
  onSelectAllTeachers?: (selectAll: boolean) => void;
  onAddTeacher?: (teacher: Teacher) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (id: string) => void;
  onBulkDeleteTeachers?: (ids: string[]) => void;
  onBatchAddTeachers?: (teachers: Teacher[]) => void;
  onUpdateAccount?: (updated: UserAccount) => Promise<{ success: boolean; message?: string }>;
  onResetPassword?: (username: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  onUpdateCardDesign: (design: CardDesignSettings) => void;
  onUpdatePosterDesign?: (design: PosterDesignSettings) => void;
  onSavePosterDesignToCloud?: (design: PosterDesignSettings) => Promise<void>;
  onUpdateAnswerSheetDesign?: (design: AnswerSheetDesignSettings) => void;
  onSaveAnswerSheetDesignToCloud?: (design: AnswerSheetDesignSettings) => Promise<void>;
  onUpdatePrintSettings: (settings: PrintSettings) => void;
  onUpdateSchool: (school: School) => void;
  onUpdateExam: (exam: Exam) => void;
  exams?: Exam[];
  onSelectActiveExam?: (exam: Exam) => void;
  onAddExam?: (exam: Exam) => void;
  onDeleteExam?: (id: string) => void;
  onSaveSchoolAndExam?: (school: School, exam: Exam) => Promise<void> | void;
  onReloadAllData: () => void;
  isReloading: boolean;
  onLogout: () => void;
  onOpenImportModal: () => void;
  onOpenPhotoModal: () => void;
  onOpenTeacherImportModal?: () => void;
  onResetDemoData: () => void;
  isAdmin?: boolean;
  onSwitchToAdmin?: () => void;
  loginLogs?: LoginLogEntry[];
  autoLogoutMinutes?: number;
  onChangeAutoLogoutMinutes?: (minutes: number) => void;
}

interface SchoolNavTab {
  id: SchoolTabId;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const SchoolPortal: React.FC<SchoolPortalProps> = ({
  currentUser,
  school,
  exam,
  students,
  teachers = [],
  cardDesign,
  posterDesign,
  answerSheetDesign,
  printSettings,
  selectedStudentIds,
  selectedTeacherIds = [],
  googleSheets,
  activeTab,
  onNavigate,
  onToggleStudentSelect,
  onSelectAllStudents,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkDeleteStudents,
  onBatchAddStudents,
  onApplyPhotos,
  onToggleTeacherSelect = () => {},
  onSelectAllTeachers = () => {},
  onAddTeacher = () => {},
  onUpdateTeacher = () => {},
  onDeleteTeacher = () => {},
  onBulkDeleteTeachers = () => {},
  onBatchAddTeachers = () => {},
  onUpdateAccount,
  onResetPassword,
  onUpdateCardDesign,
  onUpdatePosterDesign,
  onSavePosterDesignToCloud,
  onUpdateAnswerSheetDesign,
  onSaveAnswerSheetDesignToCloud,
  onUpdatePrintSettings,
  onUpdateSchool,
  onUpdateExam,
  exams,
  onSelectActiveExam,
  onAddExam,
  onDeleteExam,
  onSaveSchoolAndExam,
  onReloadAllData,
  isReloading,
  onLogout,
  onOpenImportModal,
  onOpenPhotoModal,
  onOpenTeacherImportModal,
  onResetDemoData,
  isAdmin = false,
  onSwitchToAdmin,
  loginLogs = [],
  autoLogoutMinutes = 15,
  onChangeAutoLogoutMinutes,
}) => {
  const [designerInitialMenu, setDesignerInitialMenu] = useState<DesignerMenuId>('menu');
  const [printInitialCategory, setPrintInitialCategory] = useState<PrintCardCategory>('menu');

  const handleNavTabClick = (tabId: SchoolTabId) => {
    if (tabId === 'designer') {
      setDesignerInitialMenu('menu');
    }
    if (tabId === 'print') {
      setPrintInitialCategory('menu');
    }
    onNavigate(tabId);
  };

  const navTabs: SchoolNavTab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      mobileLabel: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Data Sekolah',
      mobileLabel: 'Data',
      icon: Database,
    },
    {
      id: 'designer',
      label: 'Desain',
      mobileLabel: 'Desain',
      icon: Palette,
    },
    {
      id: 'print',
      label: 'Preview & Cetak',
      mobileLabel: 'Cetak',
      icon: Printer,
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      mobileLabel: 'Atur',
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full w-full overflow-hidden pb-20 lg:pb-0">
      {/* 1. DESKTOP SIDEBAR - FIXED SIZE CONTAINER (MELAYANG DI KIRI & TIDAK KESCROLL) */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full overflow-hidden sticky top-0 self-stretch">
        <div className="bg-[#18181B] text-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 flex flex-col justify-between h-full overflow-hidden">
          {/* Top Section */}
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Header Info */}
            <div className="space-y-2 border-b border-neutral-700/80 pb-3.5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-300 text-black border border-black rounded text-[10px] font-black uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-black" />
                  Portal Sekolah
                </div>
              </div>

              {/* School Logo & Title */}
              <div className="flex items-center gap-3 pt-1">
                <SchoolLogo
                  url={school.logoUrl}
                  name={school.name || 'Sekolah'}
                  sizeMm={12}
                  className="shadow-[2px_2px_0px_#FFF] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-sm font-black uppercase tracking-tight text-white leading-tight truncate"
                    title={school.name || 'Belum diatur'}
                  >
                    {school.name || 'NAMA SEKOLAH BELUM DIATUR'}
                  </h1>
                  <div className="text-[10px] font-mono font-bold text-neutral-400">
                    NPSN: {school.npsn || '-'}
                  </div>
                </div>
              </div>

              {/* User / Operator Badge */}
              <div className="flex items-center justify-between text-[11px] bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5">
                <span className="text-neutral-400 font-bold">Operator:</span>
                <span className="font-mono text-yellow-300 font-black">@{currentUser.username}</span>
              </div>
            </div>

            {/* Navigation Menu in Sidebar */}
            <nav className="flex flex-col gap-1.5">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavTabClick(tab.id)}
                    className={`w-full px-3.5 py-3 rounded-xl border-2 flex items-center justify-between text-xs font-black uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-yellow-300 text-black border-black shadow-[3px_3px_0px_#000] translate-x-1'
                        : 'border-transparent text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                      {tab.label}
                    </span>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isActive ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Quick Actions & Logout */}
          <div className="pt-3 border-t border-neutral-700/80 space-y-2 shrink-0">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-3 bg-neutral-900 hover:bg-rose-950/50 border border-neutral-700 hover:border-rose-900/60 rounded-xl text-xs font-bold text-neutral-300 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar Akun
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE FLOATING BOTTOM BAR (MELAYANG DI BAWAH DENGAN PENAMAAN SINGKAT: "Data") */}
      <div className="no-print lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-md border-3 border-black shadow-[4px_4px_0px_#000] rounded-2xl p-1.5 flex items-center justify-around gap-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleNavTabClick(tab.id)}
              className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-neutral-600 hover:bg-neutral-100 border-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[65px]">{tab.mobileLabel}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-2 px-1 text-[8px] bg-black text-white rounded font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN CONTENT AREA - SCROLLS INDEPENDENTLY */}
      <div className="flex-1 min-w-0 w-full h-full overflow-y-auto pr-1 sm:pr-3 space-y-6 pb-24 lg:pb-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            school={school}
            exam={exam}
            students={students}
            teachers={teachers}
            selectedCount={selectedStudentIds.length}
            design={cardDesign}
            onNavigate={(tab) => onNavigate(tab)}
            onOpenImportModal={onOpenImportModal}
            onOpenPhotoModal={onOpenPhotoModal}
            onOpenTeacherImportModal={onOpenTeacherImportModal}
            onResetDemoData={onResetDemoData}
          />
        )}

        {/* SUB-MENU DATA SEKOLAH (DATA SISWA, DATA GURU, DATA ASESMEN, DATA SEKOLAH) */}
        {activeTab === 'students' && (
          <SchoolDataHub
            students={students}
            teachers={teachers}
            school={school}
            exam={exam}
            exams={exams}
            onSelectActiveExam={onSelectActiveExam}
            onAddExam={onAddExam}
            onDeleteExam={onDeleteExam}
            design={cardDesign}
            selectedStudentIds={selectedStudentIds}
            selectedTeacherIds={selectedTeacherIds}
            onToggleStudentSelect={onToggleStudentSelect}
            onSelectAllStudents={onSelectAllStudents}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
            onBulkDeleteStudents={onBulkDeleteStudents}
            onBatchAddStudents={onBatchAddStudents}
            onApplyPhotos={onApplyPhotos}
            onToggleTeacherSelect={onToggleTeacherSelect}
            onSelectAllTeachers={onSelectAllTeachers}
            onAddTeacher={onAddTeacher}
            onUpdateTeacher={onUpdateTeacher}
            onDeleteTeacher={onDeleteTeacher}
            onBulkDeleteTeachers={onBulkDeleteTeachers}
            onBatchAddTeachers={onBatchAddTeachers}
            onUpdateSchool={onUpdateSchool}
            onUpdateExam={onUpdateExam}
            onSaveSchoolAndExam={onSaveSchoolAndExam}
            googleSheets={googleSheets}
            currentUser={currentUser}
            onNavigateToPrint={() => onNavigate('print')}
            onNavigateToPrintProctor={() => onNavigate('print')}
          />
        )}

        {activeTab === 'designer' && (
          <CardDesigner
            school={school}
            exam={exam}
            students={students}
            teachers={teachers}
            design={cardDesign}
            posterDesign={posterDesign || DEFAULT_POSTER_DESIGN}
            answerSheetDesign={answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN}
            onUpdateDesign={onUpdateCardDesign}
            onUpdatePosterDesign={onUpdatePosterDesign}
            onSavePosterDesignToCloud={onSavePosterDesignToCloud}
            onUpdateAnswerSheetDesign={onUpdateAnswerSheetDesign}
            onSaveAnswerSheetDesignToCloud={onSaveAnswerSheetDesignToCloud}
            onNavigateToPrint={(category) => {
              if (category === 'exam_poster') {
                setPrintInitialCategory('exam_poster');
              } else if (category === 'answer_sheet') {
                setPrintInitialCategory('answer_sheet');
              } else {
                setPrintInitialCategory('menu');
              }
              onNavigate('print');
            }}
            initialMenu={designerInitialMenu}
          />
        )}

        {activeTab === 'print' && (
          <PrintPreview
            school={school}
            exam={exam}
            exams={exams}
            onSelectActiveExam={onSelectActiveExam}
            students={students}
            teachers={teachers}
            selectedStudentIds={selectedStudentIds}
            onToggleStudentSelect={onToggleStudentSelect}
            onSelectAllStudents={onSelectAllStudents}
            design={cardDesign}
            posterDesign={posterDesign || DEFAULT_POSTER_DESIGN}
            answerSheetDesign={answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN}
            printSettings={printSettings}
            onUpdatePrintSettings={onUpdatePrintSettings}
            initialCategory={printInitialCategory}
            onBackToDesigner={() => {
              setDesignerInitialMenu('menu');
              onNavigate('designer');
            }}
            onNavigateToPosterDesigner={() => {
              setDesignerInitialMenu('poster');
              onNavigate('designer');
            }}
            onNavigateToAnswerSheetDesigner={() => {
              setDesignerInitialMenu('answersheet');
              onNavigate('designer');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SchoolSettings
            currentUser={currentUser}
            onUpdateAccount={onUpdateAccount}
            onResetPassword={onResetPassword}
            googleSheets={googleSheets}
            onResetDemoData={onResetDemoData}
            loginLogs={loginLogs}
            autoLogoutMinutes={autoLogoutMinutes}
            onChangeAutoLogoutMinutes={onChangeAutoLogoutMinutes}
          />
        )}
      </div>
    </div>
  );
};
