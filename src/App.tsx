import React, { useState, useEffect, useRef } from 'react';
import {
  School,
  Exam,
  Student,
  Teacher,
  CardDesignSettings,
  PosterDesignSettings,
  AnswerSheetDesignSettings,
  PrintSettings,
  UserAccount,
  GoogleSheetsConfig,
  UserSchoolData,
  LoginLogEntry,
} from './types';
import {
  loadStoredState,
  saveStoredState,
  resetStoredState,
  deduplicateStudents,
  deduplicateTeachers,
  DEFAULT_ACCOUNTS,
  saveLoginLogLocally,
  getStoredLoginLogs,
} from './utils/storage';
import { LandingPage } from './components/auth/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { ImportExcelModal } from './components/students/ImportExcelModal';
import { BulkPhotoModal } from './components/students/BulkPhotoModal';
import { ImportTeacherExcelModal } from './components/teachers/ImportTeacherExcelModal';
import { GoogleAppsScriptModal } from './components/settings/GoogleAppsScriptModal';
import { AdminPortal, AdminTab } from './components/admin/AdminPortal';
import { SchoolPortal } from './components/school/SchoolPortal';
import { SchoolLogo } from './components/common/SchoolLogo';
import { PortalAsesmenLogo } from './components/common/PortalAsesmenLogo';
import { CameraPermissionNoticeModal } from './components/common/CameraPermissionNoticeModal';
import { CameraLoginConfirmationModal } from './components/common/CameraLoginConfirmationModal';
import { AutoLogoutModal } from './components/common/AutoLogoutModal';
import { detectBrowserInfo } from './utils/browserDetection';
import {
  DEFAULT_SCHOOL,
  DEFAULT_EXAM,
  DEFAULT_CARD_DESIGN,
  DEFAULT_POSTER_DESIGN,
  DEFAULT_ANSWER_SHEET_DESIGN,
  DEFAULT_PRINT_SETTINGS,
  DEFAULT_TEACHERS,
} from './data/mockData';
import { getActiveGasUrl } from './config/appConfig';
import {
  gasSaveAllData,
  testGasConnection,
  gasGetAllData,
  gasAddAccount,
  gasUpdateAccount,
  gasResetPassword,
  gasDeleteAccount,
  gasSaveSchoolSettings,
  gasSaveCardDesign,
  gasSavePosterDesign,
  gasSaveAnswerSheetDesign,
  gasAddStudent,
  gasUpdateStudent,
  gasDeleteStudent,
  gasBulkDeleteStudents,
  gasBatchStudents,
  gasAddTeacher,
  gasUpdateTeacher,
  gasDeleteTeacher,
  gasBulkDeleteTeachers,
  gasBatchTeachers,
  gasAddExam,
  gasUpdateExam,
  gasDeleteExam,
  gasSetActiveExam,
  gasRecordLoginLog,
  SpreadsheetCapacity,
  DriveDatabaseInfo,
} from './utils/gasApi';
import {
  LayoutDashboard,
  Users,
  Palette,
  Printer,
  Building2,
  Menu,
  X,
  CreditCard,
  FileSpreadsheet,
  UploadCloud,
  RotateCcw,
  LogOut,
  User,
  ShieldCheck,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cloud,
} from 'lucide-react';

type NavTab = 'dashboard' | 'students' | 'designer' | 'print' | 'settings';
type PortalMode = 'school' | 'admin';

export default function App() {
  // Application persistent state
  const [state, setState] = useState(() => {
    const loaded = loadStoredState();
    // Initialize schoolDataMap if empty
    if (!loaded.schoolDataMap) {
      loaded.schoolDataMap = {};
    }
    // Admin Nagata bukan sekolah, bersihkan dari daftar sekolah jika ada
    delete loaded.schoolDataMap['Nagata'];
    delete loaded.schoolDataMap['nagata'];
    return loaded;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [adminTab, setAdminTab] = useState<AdminTab>('insights');
  const [portalMode, setPortalMode] = useState<PortalMode>(() => 
    (state.currentUser?.role === 'admin' || state.currentUser?.username?.toLowerCase() === 'nagata') ? 'admin' : 'school'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);
  const [isGlobalImportOpen, setIsGlobalImportOpen] = useState<boolean>(false);
  const [isGlobalPhotoOpen, setIsGlobalPhotoOpen] = useState<boolean>(false);
  const [isGlobalTeacherImportOpen, setIsGlobalTeacherImportOpen] = useState<boolean>(false);
  const [showCameraPermissionNotice, setShowCameraPermissionNotice] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('portal_asesmen_camera_permission_prompted');
    } catch {
      return false;
    }
  });

  // Capacity & Drive state from Google Apps Script
  const [spreadsheetCapacity, setSpreadsheetCapacity] = useState<SpreadsheetCapacity | undefined>(undefined);
  const [driveInfo, setDriveInfo] = useState<DriveDatabaseInfo | undefined>(undefined);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Keamanan Akun: Konfirmasi Kamera Login & Auto Logout Sekolah
  const [pendingLoginUser, setPendingLoginUser] = useState<UserAccount | null>(null);
  const [isAutoLoggedOutOpen, setIsAutoLoggedOutOpen] = useState<boolean>(false);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(() => {
    try {
      const val = localStorage.getItem('portal_asesmen_auto_logout_minutes');
      return val ? parseInt(val, 10) || 15 : 15;
    } catch {
      return 15;
    }
  });
  const lastActivityTimeRef = useRef<number>(Date.now());

  // Status sinkronisasi database cloud otomatis
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const debouncedSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync state to localStorage on changes
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // ATURAN KEAMANAN: Auto-Logout KHUSUS SEKOLAH (Admin TIDAK terkena auto logout)
  useEffect(() => {
    const isUserAdmin =
      state.currentUser?.role === 'admin' ||
      state.currentUser?.username?.toLowerCase() === 'nagata';

    // Auto logout HANYA untuk akun sekolah yang sedang login
    if (!state.currentUser || isUserAdmin) return;

    lastActivityTimeRef.current = Date.now();

    const recordUserActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    const userEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    userEvents.forEach((evt) => {
      window.addEventListener(evt, recordUserActivity, { passive: true });
    });

    // Pengecekan berkala setiap 10 detik
    const idleCheckInterval = setInterval(() => {
      const idleMs = Date.now() - lastActivityTimeRef.current;
      const timeoutLimitMs = autoLogoutMinutes * 60 * 1000;

      if (idleMs >= timeoutLimitMs) {
        // Keluarkan pengguna sekolah secara otomatis
        setState((prev) => ({
          ...prev,
          currentUser: null,
        }));
        setPortalMode('school');
        setActiveTab('dashboard');
        setIsAutoLoggedOutOpen(true);
      }
    }, 10000);

    return () => {
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, recordUserActivity);
      });
      clearInterval(idleCheckInterval);
    };
  }, [state.currentUser, autoLogoutMinutes]);

  // Fungsi memuat ulang seluruh data dari Google Spreadsheet (Sheet AKUN, INFORMASI_SEKOLAH, DATA_SISWA, DESAIN_KARTU)
  const loadDatabaseFromGas = async (
    url?: string,
    showNotification = false,
    targetUser?: UserAccount
  ) => {
    const activeUrl = url || getActiveGasUrl(state.googleSheets?.webAppUrl);
    if (!activeUrl || !activeUrl.trim().startsWith('http')) return;

    try {
      setIsReloading(true);
      const res = await gasGetAllData(activeUrl);

      if (res.status === 'success') {
        if (res.capacity) setSpreadsheetCapacity(res.capacity);
        if (res.driveDatabase) setDriveInfo(res.driveDatabase);

        const rawAccounts = res.data?.accounts || [];
        const schoolsMap = res.data?.schoolsMap || {};
        const studentsMap = res.data?.studentsMap || {};
        const teachersMap = res.data?.teachersMap || {};
        const examsMap = res.data?.examsMap || {};
        const designsMap = res.data?.designsMap || {};
        const posterDesignsMap = res.data?.posterDesignsMap || {};
        const answerSheetsMap = res.data?.answerSheetsMap || {};

        // Pastikan akun admin Nagata selalu ada
        let mergedAccounts = [...rawAccounts];
        if (!mergedAccounts.some((a) => a.username.toLowerCase() === 'nagata')) {
          mergedAccounts = [DEFAULT_ACCOUNTS[0], ...mergedAccounts];
        }

        // Kumpulkan SEMUA username unik dari Sheet AKUN, INFORMASI_SEKOLAH, DATA_SISWA, DATA_GURU, DATA_ASESMEN, dan DESAIN_KARTU
        const allUsernames = new Set<string>();
        mergedAccounts.forEach((a) => allUsernames.add(a.username));
        Object.keys(schoolsMap).forEach((k) => allUsernames.add(k));
        Object.keys(studentsMap).forEach((k) => allUsernames.add(k));
        Object.keys(teachersMap).forEach((k) => allUsernames.add(k));
        Object.keys(examsMap).forEach((k) => allUsernames.add(k));
        Object.keys(designsMap).forEach((k) => allUsernames.add(k));
        Object.keys(posterDesignsMap).forEach((k) => allUsernames.add(k));
        Object.keys(answerSheetsMap).forEach((k) => allUsernames.add(k));

        // Susun schoolDataMap lengkap dari seluruh data spreadsheet
        const newSchoolDataMap: Record<string, UserSchoolData> = {};
        for (const rawU of allUsernames) {
          const u = rawU.toLowerCase();
          const acc = mergedAccounts.find((a) => a.username.toLowerCase() === u);
          const schInfo = schoolsMap[u] || schoolsMap[rawU];
          const studs = deduplicateStudents(studentsMap[u] || studentsMap[rawU] || []);
          const teachs = deduplicateTeachers(teachersMap[u] || teachersMap[rawU] || DEFAULT_TEACHERS);
          const rawExams = examsMap[u] || examsMap[rawU] || [];
          const userExams: Exam[] = Array.isArray(rawExams) && rawExams.length > 0
            ? rawExams
            : (schInfo?.exam ? [schInfo.exam] : [DEFAULT_EXAM]);
          const activeExam = userExams.find((e) => e.isActive) || schInfo?.exam || userExams[0] || DEFAULT_EXAM;
          const existingSchoolData = state.schoolDataMap?.[u] || state.schoolDataMap?.[rawU];
          const des = designsMap[u] || designsMap[rawU];

          const userSchoolData: UserSchoolData = {
            school: schInfo?.school || {
              ...DEFAULT_SCHOOL,
              id: `sch_${u}`,
              name: acc?.schoolName || schInfo?.school?.name || '',
              npsn: acc?.npsn || schInfo?.school?.npsn || '',
            },
            exam: activeExam,
            exams: userExams,
            students: studs,
            teachers: teachs,
            cardDesign: des?.cardDesign || DEFAULT_CARD_DESIGN,
            posterDesign: posterDesignsMap[u] || posterDesignsMap[rawU] || existingSchoolData?.posterDesign || DEFAULT_POSTER_DESIGN,
            answerSheetDesign: answerSheetsMap[u] || answerSheetsMap[rawU] || existingSchoolData?.answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN,
            printSettings: des?.printSettings || DEFAULT_PRINT_SETTINGS,
            selectedStudentIds: studs.map((s) => s.id),
          };


          newSchoolDataMap[rawU] = userSchoolData;
          newSchoolDataMap[u] = userSchoolData;
        }

        setState((prev) => {
          const effectiveUser = targetUser || prev.currentUser;
          let currentSchool = prev.school || DEFAULT_SCHOOL;
          let currentExam = prev.exam || DEFAULT_EXAM;
          let currentExams = prev.exams && prev.exams.length > 0 ? prev.exams : [DEFAULT_EXAM];
          let currentStudents = prev.students || [];
          let currentTeachers = prev.teachers || DEFAULT_TEACHERS;
          let currentDesign = prev.cardDesign || DEFAULT_CARD_DESIGN;
          let currentPosterDesign = prev.posterDesign || DEFAULT_POSTER_DESIGN;
          let currentAnswerSheetDesign = prev.answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN;
          let currentPrint = prev.printSettings || DEFAULT_PRINT_SETTINGS;
          let currentSelected = prev.selectedStudentIds || [];

          if (effectiveUser && effectiveUser.role !== 'admin') {
            const userKey = effectiveUser.username.toLowerCase();
            let userSchool = newSchoolDataMap[effectiveUser.username] || newSchoolDataMap[userKey];

            // Jika belum ada data dengan username persis, cari via NPSN atau nama sekolah
            if (!userSchool && effectiveUser.npsn) {
              const matchByNpsn = Object.values(newSchoolDataMap).find(
                (sd) => sd.school?.npsn && sd.school.npsn === effectiveUser.npsn
              );
              if (matchByNpsn) userSchool = matchByNpsn;
            }

            if (userSchool) {
              currentSchool = userSchool.school || currentSchool;
              currentExam = userSchool.exam || currentExam;
              currentExams = userSchool.exams && userSchool.exams.length > 0 ? userSchool.exams : [userSchool.exam || DEFAULT_EXAM];
              currentStudents = userSchool.students || [];
              currentTeachers = userSchool.teachers && userSchool.teachers.length > 0 ? userSchool.teachers : currentTeachers;
              currentDesign = userSchool.cardDesign || currentDesign;
              currentPosterDesign = userSchool.posterDesign || currentPosterDesign;
              currentAnswerSheetDesign = userSchool.answerSheetDesign || currentAnswerSheetDesign;
              currentPrint = userSchool.printSettings || currentPrint;
              currentSelected = userSchool.selectedStudentIds || [];
            }
          }

          return {
            ...prev,
            accounts: mergedAccounts,
            schoolDataMap: newSchoolDataMap,
            school: currentSchool,
            exam: currentExam,
            exams: currentExams,
            students: currentStudents,
            teachers: currentTeachers,
            cardDesign: currentDesign,
            posterDesign: currentPosterDesign,
            answerSheetDesign: currentAnswerSheetDesign,
            printSettings: currentPrint,
            selectedStudentIds: currentSelected,
            loginLogs:
              Array.isArray(res.data?.loginLogs) && res.data.loginLogs.length > 0
                ? res.data.loginLogs
                : prev.loginLogs || getStoredLoginLogs(),
            googleSheets: {
              ...prev.googleSheets,
              webAppUrl: activeUrl,
              spreadsheetId: res.spreadsheetId || prev.googleSheets.spreadsheetId,
              spreadsheetName: res.spreadsheetName || prev.googleSheets.spreadsheetName,
              isConnected: true,
              lastSyncedAt: new Date().toISOString(),
            },
          };
        });

        if (showNotification) {
          alert(`✓ Data berhasil dimuat ulang dari Google Spreadsheet!\n• ${mergedAccounts.length} Akun Terdaftar\n• Sisa Kuota Sel: ${res.capacity?.availableCells.toLocaleString('id-ID') || '9.990.000'} Sel`);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data dari spreadsheet:', err);
      if (showNotification) {
        alert('Gagal memuat data dari spreadsheet. Periksa koneksi internet atau status penerapan Web App Google Apps Script.');
      }
    } finally {
      setIsReloading(false);
    }
  };

  // Otomatis verifikasi dan muat data real dari Google Apps Script saat startup
  useEffect(() => {
    const url = getActiveGasUrl(state.googleSheets?.webAppUrl);
    if (url && url.trim().startsWith('http')) {
      loadDatabaseFromGas(url, false);
    }
  }, []);

  // Active working username (for multi-school data mapping)
  const isAdmin = state.currentUser?.role === 'admin' || state.currentUser?.username.toLowerCase() === 'nagata';
  const activeUsername = state.currentUser?.username || 'Nagata';

  // URL aktif Google Apps Script
  const activeGasUrl = getActiveGasUrl(state.googleSheets?.webAppUrl);

  const showSyncToast = (msg: string, status: 'saved' | 'syncing' | 'error' = 'saved') => {
    setSyncStatus(status);
    setSyncToastMessage(msg);
    if (status !== 'syncing') {
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncToastMessage(null);
      }, 3500);
    }
  };

  // Helper untuk memperbarui state sekolah lokal secara instan & sinkron ke schoolDataMap
  const updateLocalSchoolData = (dataUpdater: (prev: UserSchoolData) => UserSchoolData) => {
    setState((prev) => {
      const currentData: UserSchoolData =
        prev.schoolDataMap?.[activeUsername] ||
        prev.schoolDataMap?.[activeUsername.toLowerCase()] || {
          school: prev.school,
          exam: prev.exam,
          exams: prev.exams || [prev.exam],
          students: prev.students,
          teachers: prev.teachers,
          cardDesign: prev.cardDesign,
          posterDesign: prev.posterDesign,
          answerSheetDesign: prev.answerSheetDesign,
          printSettings: prev.printSettings,
          selectedStudentIds: prev.selectedStudentIds,
        };

      const updated = dataUpdater(currentData);
      const cleanStudents = deduplicateStudents(updated.students);
      const cleanTeachers = deduplicateTeachers(updated.teachers || prev.teachers || []);
      const cleanExams = Array.isArray(updated.exams) && updated.exams.length > 0
        ? updated.exams
        : (updated.exam ? [updated.exam] : prev.exams);

      return {
        ...prev,
        school: updated.school,
        exam: updated.exam,
        exams: cleanExams,
        students: cleanStudents,
        teachers: cleanTeachers,
        cardDesign: updated.cardDesign,
        posterDesign: updated.posterDesign !== undefined ? updated.posterDesign : prev.posterDesign,
        answerSheetDesign: updated.answerSheetDesign !== undefined ? updated.answerSheetDesign : prev.answerSheetDesign,
        printSettings: updated.printSettings,
        selectedStudentIds: updated.selectedStudentIds,
        schoolDataMap: {
          ...(prev.schoolDataMap || {}),
          [activeUsername]: { ...updated, exams: cleanExams, students: cleanStudents, teachers: cleanTeachers },
          [activeUsername.toLowerCase()]: { ...updated, exams: cleanExams, students: cleanStudents, teachers: cleanTeachers },
        },
      };
    });
  };

  // Auth Handlers
  const finalizeLogin = async (user: UserAccount) => {
    const isUserAdmin = user.role === 'admin' || user.username.toLowerCase() === 'nagata';
    setPortalMode(isUserAdmin ? 'admin' : 'school');
    setActiveTab('dashboard');

    setState((prev) => {
      // Find or build user's school data
      const existingData =
        prev.schoolDataMap?.[user.username] ||
        prev.schoolDataMap?.[user.username.toLowerCase()];
      let userSchool = prev.school || DEFAULT_SCHOOL;
      let userExam = prev.exam || DEFAULT_EXAM;
      let userExams = prev.exams && prev.exams.length > 0 ? prev.exams : [prev.exam || DEFAULT_EXAM];
      let userStudents = prev.students || [];
      let userTeachers = prev.teachers || DEFAULT_TEACHERS;
      let userDesign = prev.cardDesign || DEFAULT_CARD_DESIGN;
      let userPosterDesign = prev.posterDesign || DEFAULT_POSTER_DESIGN;
      let userAnswerSheetDesign = prev.answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN;
      let userPrint = prev.printSettings || DEFAULT_PRINT_SETTINGS;
      let userSelected = prev.selectedStudentIds || [];

      if (existingData) {
        userSchool = existingData.school || DEFAULT_SCHOOL;
        userExam = existingData.exam || DEFAULT_EXAM;
        userExams = existingData.exams && existingData.exams.length > 0 ? existingData.exams : [userExam];
        userStudents = existingData.students || [];
        userTeachers = existingData.teachers && existingData.teachers.length > 0 ? existingData.teachers : (prev.teachers || DEFAULT_TEACHERS);
        userDesign = existingData.cardDesign || DEFAULT_CARD_DESIGN;
        userPosterDesign = existingData.posterDesign || DEFAULT_POSTER_DESIGN;
        userAnswerSheetDesign = existingData.answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN;
        userPrint = existingData.printSettings || DEFAULT_PRINT_SETTINGS;
        userSelected = existingData.selectedStudentIds || [];
      } else {
        // Brand new school
        userSchool = {
          ...(prev.school || DEFAULT_SCHOOL),
          id: `sch_${user.username}`,
          name: user.schoolName ? user.schoolName.toUpperCase() : (prev.school?.name || ''),
          npsn: user.npsn || '00000000',
        };
        // For non-admin new accounts, start with empty student roster
        userStudents = user.role === 'admin' ? (prev.students || []) : [];
        userTeachers = prev.teachers || DEFAULT_TEACHERS;
        userExams = prev.exams && prev.exams.length > 0 ? prev.exams : [DEFAULT_EXAM];
        userSelected = [];
      }

      const updatedSchoolDataMap = {
        ...(prev.schoolDataMap || {}),
        [user.username]: {
          school: userSchool,
          exam: userExam,
          exams: userExams,
          students: userStudents,
          teachers: userTeachers,
          cardDesign: userDesign,
          posterDesign: userPosterDesign,
          answerSheetDesign: userAnswerSheetDesign,
          printSettings: userPrint,
          selectedStudentIds: userSelected,
        },
        [user.username.toLowerCase()]: {
          school: userSchool,
          exam: userExam,
          exams: userExams,
          students: userStudents,
          teachers: userTeachers,
          cardDesign: userDesign,
          posterDesign: userPosterDesign,
          answerSheetDesign: userAnswerSheetDesign,
          printSettings: userPrint,
          selectedStudentIds: userSelected,
        },
      };

      return {
        ...prev,
        currentUser: user,
        school: userSchool,
        exam: userExam,
        exams: userExams,
        students: userStudents,
        teachers: userTeachers,
        cardDesign: userDesign,
        posterDesign: userPosterDesign,
        answerSheetDesign: userAnswerSheetDesign,
        printSettings: userPrint,
        selectedStudentIds: userSelected,
        schoolDataMap: updatedSchoolDataMap,
      };
    });

    // Langsung sinkronkan dan muat data real dari Google Spreadsheet ke perangkat ini
    const activeUrl = getActiveGasUrl(state.googleSheets?.webAppUrl);
    if (activeUrl && activeUrl.trim().startsWith('http')) {
      await loadDatabaseFromGas(activeUrl, false, user);
    }
  };

  // Handler Login: Akun sekolah memunculkan konfirmasi kamera setiap kali login
  const handleLoginSuccess = async (user: UserAccount) => {
    const isUserAdmin = user.role === 'admin' || user.username.toLowerCase() === 'nagata';
    if (isUserAdmin) {
      // Akun admin tidak wajib verifikasi kamera sekolah
      await finalizeLogin(user);
    } else {
      // Akun sekolah: Tampilkan konfirmasi akses kamera setiap kali login
      setPendingLoginUser(user);
    }
  };

  // Konfirmasi Kamera Login Berhasil (dengan foto terambil tanpa preview box)
  const handleCameraLoginConfirmed = async (photoDataUrl?: string) => {
    if (!pendingLoginUser) return;
    const targetUser = pendingLoginUser;
    const browser = detectBrowserInfo();
    const now = new Date();
    const logId = `log_${now.getTime()}`;

    const newLogEntry: LoginLogEntry = {
      id: logId,
      username: targetUser.username,
      schoolName: targetUser.schoolName || targetUser.username,
      loginTime: now.toISOString(),
      browser,
      photoUrl: photoDataUrl || '',
      status: 'Berhasil',
    };

    // 1. Simpan log lokal seketika
    saveLoginLogLocally(newLogEntry);
    setState((prev) => ({
      ...prev,
      loginLogs: [newLogEntry, ...(prev.loginLogs || [])],
    }));

    // 2. Kirim foto ke folder database Google Drive sekolah & catat baris di spreadsheet
    const activeUrl = getActiveGasUrl(state.googleSheets?.webAppUrl);
    if (activeUrl && activeUrl.trim().startsWith('http')) {
      gasRecordLoginLog(activeUrl, {
        username: targetUser.username,
        schoolName: targetUser.schoolName || targetUser.username,
        browser,
        base64Photo: photoDataUrl,
      })
        .then((res) => {
          if (res && res.status === 'success' && res.photoUrl) {
            setState((prev) => ({
              ...prev,
              loginLogs: (prev.loginLogs || []).map((l) =>
                l.id === logId ? { ...l, photoUrl: res.photoUrl } : l
              ),
            }));
          }
        })
        .catch((gasErr) => {
          console.warn('Gagal mencatat log ke GAS:', gasErr);
        });
    }

    try {
      localStorage.setItem('portal_asesmen_camera_permission_prompted', 'true');
      setShowCameraPermissionNotice(false);
    } catch {}

    setPendingLoginUser(null);
    await finalizeLogin(targetUser);
  };

  // Konfirmasi Kamera Dilewati (pengguna login tanpa kamera)
  const handleCameraLoginSkipped = async () => {
    if (!pendingLoginUser) return;
    const targetUser = pendingLoginUser;
    const browser = detectBrowserInfo();
    const now = new Date();
    const logId = `log_${now.getTime()}`;

    const newLogEntry: LoginLogEntry = {
      id: logId,
      username: targetUser.username,
      schoolName: targetUser.schoolName || targetUser.username,
      loginTime: now.toISOString(),
      browser,
      photoUrl: '',
      status: 'Berhasil (Tanpa Foto)',
    };

    saveLoginLogLocally(newLogEntry);
    setState((prev) => ({
      ...prev,
      loginLogs: [newLogEntry, ...(prev.loginLogs || [])],
    }));

    const activeUrl = getActiveGasUrl(state.googleSheets?.webAppUrl);
    if (activeUrl && activeUrl.trim().startsWith('http')) {
      gasRecordLoginLog(activeUrl, {
        username: targetUser.username,
        schoolName: targetUser.schoolName || targetUser.username,
        browser,
      }).catch(() => {});
    }

    setPendingLoginUser(null);
    await finalizeLogin(targetUser);
  };

  const handleLogout = () => {
    setState((prev) => {
      const nextState = {
        ...prev,
        currentUser: null,
      };
      saveStoredState(nextState);
      return nextState;
    });
    setPendingLoginUser(null);
    setPortalMode('school');
    setActiveTab('dashboard');
  };

  // Account Management Handlers (Admin Portal dengan penyimpanan real ke Spreadsheet)
  const handleAddAccount = async (newAcc: {
    username: string;
    password?: string;
    schoolName: string;
    npsn?: string;
    role?: 'operator' | 'admin';
  }): Promise<{ success: boolean; message?: string }> => {
    const url = state.googleSheets.webAppUrl;
    try {
      let createdAcc: UserAccount = {
        id: `acc_${Date.now()}`,
        username: newAcc.username,
        password: newAcc.password || '123456',
        schoolName: newAcc.schoolName,
        npsn: newAcc.npsn || '',
        role: newAcc.role || 'operator',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      if (url && url.trim().startsWith('http')) {
        const res = await gasAddAccount(url, newAcc);
        if (res.status === 'success') {
          if (res.user) createdAcc = res.user;
        } else {
          return { success: false, message: res.message };
        }
      }

      setState((prev) => ({
        ...prev,
        accounts: [...prev.accounts.filter((a) => a.username.toLowerCase() !== createdAcc.username.toLowerCase()), createdAcc],
        schoolDataMap: {
          ...(prev.schoolDataMap || {}),
          [createdAcc.username]: {
            school: {
              ...DEFAULT_SCHOOL,
              id: `sch_${createdAcc.username}`,
              name: createdAcc.schoolName,
              npsn: createdAcc.npsn,
            },
            exam: DEFAULT_EXAM,
            students: [],
            cardDesign: DEFAULT_CARD_DESIGN,
            printSettings: DEFAULT_PRINT_SETTINGS,
            selectedStudentIds: [],
          },
        },
      }));

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambah akun';
      return { success: false, message: msg };
    }
  };

  const handleUpdateAccount = async (updatedAccount: UserAccount): Promise<{ success: boolean; message?: string }> => {
    const url = state.googleSheets.webAppUrl;
    try {
      if (url && url.trim().startsWith('http')) {
        const res = await gasUpdateAccount(url, {
          id: updatedAccount.id,
          username: updatedAccount.username,
          schoolName: updatedAccount.schoolName,
          npsn: updatedAccount.npsn,
          role: updatedAccount.role,
        });
        if (res.status !== 'success') {
          return { success: false, message: res.message };
        }
      }

      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.username.toLowerCase() === updatedAccount.username.toLowerCase() || a.id === updatedAccount.id ? updatedAccount : a)),
        schoolDataMap: {
          ...(prev.schoolDataMap || {}),
          [updatedAccount.username]: {
            ...(prev.schoolDataMap?.[updatedAccount.username] || {
              school: DEFAULT_SCHOOL,
              exam: DEFAULT_EXAM,
              students: [],
              cardDesign: DEFAULT_CARD_DESIGN,
              printSettings: DEFAULT_PRINT_SETTINGS,
              selectedStudentIds: [],
            }),
            school: {
              ...(prev.schoolDataMap?.[updatedAccount.username]?.school || DEFAULT_SCHOOL),
              name: updatedAccount.schoolName,
              npsn: updatedAccount.npsn,
            },
          },
        },
      }));

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui akun';
      return { success: false, message: msg };
    }
  };

  const handleResetPassword = async (username: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
    const url = state.googleSheets.webAppUrl;
    try {
      if (url && url.trim().startsWith('http')) {
        const res = await gasResetPassword(url, username, newPass);
        if (res.status !== 'success') {
          return { success: false, message: res.message };
        }
      }

      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.username.toLowerCase() === username.toLowerCase() ? { ...a, password: newPass } : a)),
      }));

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mereset password';
      return { success: false, message: msg };
    }
  };

  const handleDeleteAccount = async (id: string, username: string): Promise<{ success: boolean; message?: string }> => {
    const url = state.googleSheets.webAppUrl;
    try {
      if (url && url.trim().startsWith('http')) {
        const res = await gasDeleteAccount(url, username, id);
        if (res.status !== 'success') {
          return { success: false, message: res.message };
        }
      }

      setState((prev) => {
        const newMap = { ...(prev.schoolDataMap || {}) };
        delete newMap[username];
        return {
          ...prev,
          accounts: prev.accounts.filter((a) => a.username.toLowerCase() !== username.toLowerCase() && a.id !== id),
          schoolDataMap: newMap,
        };
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus akun';
      return { success: false, message: msg };
    }
  };

  // Google Sheets Config Handler
  const handleUpdateGasConfig = (googleSheets: GoogleSheetsConfig) => {
    setState((prev) => ({ ...prev, googleSheets }));
  };

  const handleTriggerFullSync = async () => {
    const activeUrl = state.googleSheets.webAppUrl;
    if (!activeUrl) {
      alert('URL Google Apps Script belum dikonfigurasi di src/config/appConfig.ts.');
      return;
    }
    try {
      let totalSyncedStudents = 0;
      const schoolDataMap = state.schoolDataMap || {};
      const usernames = Object.keys(schoolDataMap);

      if (usernames.length > 0) {
        for (const u of usernames) {
          const sData = schoolDataMap[u];
          if (sData) {
            const res = await gasSaveAllData(activeUrl, {
              username: u,
              school: sData.school,
              exam: sData.exam,
              exams: sData.exams && sData.exams.length > 0 ? sData.exams : [sData.exam],
              students: sData.students,
              teachers: sData.teachers || [],
              cardDesign: sData.cardDesign,
              printSettings: sData.printSettings,
            });
            if (res.status === 'success') {
              totalSyncedStudents += res.totalStudentsSaved || sData.students.length;
            }
          }
        }
      } else {
        const res = await gasSaveAllData(activeUrl, {
          username: state.currentUser?.username || 'Nagata',
          school: state.school,
          exam: state.exam,
          exams: state.exams && state.exams.length > 0 ? state.exams : [state.exam],
          students: state.students,
          teachers: state.teachers || [],
          cardDesign: state.cardDesign,
          printSettings: state.printSettings,
        });
        totalSyncedStudents = res.totalStudentsSaved || state.students.length;
      }

      const now = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        googleSheets: { ...prev.googleSheets, lastSyncedAt: now, isConnected: true },
      }));
      alert(`✓ Sinkronisasi Berhasil!\nSeluruh data sekolah (${totalSyncedStudents} siswa, ${state.teachers?.length || 0} guru, ${state.exams?.length || 1} asesmen) tersimpan rapi ke Google Spreadsheet & Google Drive.`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menghubungi Google Apps Script';
      alert(`Error sinkronisasi: ${msg}`);
    }
  };

  // 1. Simpan identitas sekolah & ujian (hanya update Sheet INFORMASI_SEKOLAH & Drive folder)
  const handleSaveSchoolAndExam = async (newSchool: School, newExam: Exam) => {
    updateLocalSchoolData((prev) => ({
      ...prev,
      school: newSchool,
      exam: newExam,
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage('Menyimpan pengaturan sekolah ke cloud...');
        const res = await gasSaveSchoolSettings(activeGasUrl, {
          username: activeUsername,
          school: newSchool,
          exam: newExam,
        });

        if (res.status === 'success') {
          if (res.logoUrl && res.logoUrl !== newSchool.logoUrl) {
            updateLocalSchoolData((prev) => ({
              ...prev,
              school: { ...prev.school, logoUrl: res.logoUrl! },
            }));
          }
          if ((res as any).signatureUrl && (res as any).signatureUrl !== newSchool.principalSignatureUrl) {
            updateLocalSchoolData((prev) => ({
              ...prev,
              school: { ...prev.school, principalSignatureUrl: (res as any).signatureUrl },
            }));
          }
          showSyncToast('✓ Pengaturan sekolah & ujian tersimpan permanen di database!');
        } else {
          showSyncToast('Pengaturan tersimpan di perangkat lokal', 'saved');
        }
      } catch (err) {
        console.warn('Gagal simpan pengaturan ke cloud:', err);
        showSyncToast('Tersimpan di perangkat lokal (koneksi terputus)', 'saved');
      }
    }
  };

  const handleUpdateSchool = (school: School) => {
    void handleSaveSchoolAndExam(school, state.exam);
  };

  const handleUpdateExam = (exam: Exam) => {
    void handleSaveSchoolAndExam(state.school, exam);
  };

  const handleAddExam = async (newExam: Exam) => {
    updateLocalSchoolData((prev) => {
      const existingExams = prev.exams && prev.exams.length > 0 ? prev.exams : [prev.exam];
      const updatedExams = [newExam, ...existingExams.filter((e) => e.id !== newExam.id)];
      return {
        ...prev,
        exam: newExam,
        exams: updatedExams,
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menyimpan asesmen ${newExam.name}...`);
        const res = await gasAddExam(activeGasUrl, {
          username: activeUsername,
          schoolId: state.school?.id || `sch_${activeUsername}`,
          exam: newExam,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ Asesmen '${newExam.name}' tersimpan di database`);
        } else {
          showSyncToast('Asesmen tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Asesmen tersimpan di perangkat lokal', 'saved');
      }
    }

    void handleSaveSchoolAndExam(state.school, newExam);
  };

  const handleUpdateExamItem = async (updatedExam: Exam) => {
    updateLocalSchoolData((prev) => {
      const existingExams = prev.exams && prev.exams.length > 0 ? prev.exams : [prev.exam];
      const updatedExams = existingExams.map((e) => (e.id === updatedExam.id ? updatedExam : e));
      const isCurrentActive = prev.exam.id === updatedExam.id;
      return {
        ...prev,
        exam: isCurrentActive ? updatedExam : prev.exam,
        exams: updatedExams,
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Memperbarui asesmen ${updatedExam.name}...`);
        const res = await gasUpdateExam(activeGasUrl, {
          username: activeUsername,
          exam: updatedExam,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ Asesmen '${updatedExam.name}' berhasil diperbarui`);
        } else {
          showSyncToast('Perubahan asesmen tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Perubahan asesmen tersimpan di perangkat lokal', 'saved');
      }
    }

    if (state.exam.id === updatedExam.id) {
      void handleSaveSchoolAndExam(state.school, updatedExam);
    }
  };

  const handleDeleteExamItem = async (id: string) => {
    updateLocalSchoolData((prev) => {
      const existingExams = prev.exams || [];
      const filtered = existingExams.filter((e) => e.id !== id);
      const nextActive = prev.exam?.id === id ? (filtered[0] || DEFAULT_EXAM) : prev.exam;
      return {
        ...prev,
        exam: nextActive,
        exams: filtered,
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage('Menghapus data asesmen...');
        const res = await gasDeleteExam(activeGasUrl, {
          username: activeUsername,
          examId: id,
        });
        if (res.status === 'success') {
          showSyncToast('✓ Data asesmen berhasil dihapus dari cloud');
        } else {
          showSyncToast('Data asesmen dihapus dari perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Data asesmen dihapus dari perangkat lokal', 'saved');
      }
    }
  };

  const handleSelectActiveExam = (selectedExam: Exam) => {
    updateLocalSchoolData((prev) => ({
      ...prev,
      exam: selectedExam,
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        void gasSetActiveExam(activeGasUrl, {
          username: activeUsername,
          examId: selectedExam.id,
        });
      } catch {}
    }

    void handleSaveSchoolAndExam(state.school, selectedExam);
  };

  // 2. Tambah 1 siswa (Targeted ADD_STUDENT)
  const handleAddStudent = async (newStudent: Student) => {
    updateLocalSchoolData((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students],
      selectedStudentIds: [...prev.selectedStudentIds, newStudent.id],
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menyimpan data ${newStudent.name}...`);
        const res = await gasAddStudent(activeGasUrl, {
          username: activeUsername,
          schoolId: state.school?.id || `sch_${activeUsername}`,
          student: newStudent,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ Siswa '${newStudent.name}' tersimpan di database cloud`);
        } else {
          showSyncToast('Siswa tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Siswa tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  // 3. Update 1 siswa (Targeted UPDATE_STUDENT)
  const handleUpdateStudent = async (updatedStudent: Student) => {
    updateLocalSchoolData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Memperbarui data ${updatedStudent.name}...`);
        const res = await gasUpdateStudent(activeGasUrl, {
          username: activeUsername,
          student: updatedStudent,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ Data '${updatedStudent.name}' diperbarui di database cloud`);
        } else {
          showSyncToast('Perubahan tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Perubahan tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  // 4. Hapus 1 siswa (Targeted DELETE_STUDENT)
  const handleDeleteStudent = async (id: string) => {
    updateLocalSchoolData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      selectedStudentIds: prev.selectedStudentIds.filter((stdId) => stdId !== id),
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage('Menghapus data siswa...');
        const res = await gasDeleteStudent(activeGasUrl, {
          username: activeUsername,
          studentId: id,
          nisn: state.students?.find((s) => s.id === id)?.nisn,
        });
        if (res.status === 'success') {
          showSyncToast('✓ Data siswa berhasil dihapus dari cloud');
        }
      } catch {
        showSyncToast('Data siswa dihapus dari perangkat lokal', 'saved');
      }
    }
  };

  // 5. Hapus banyak siswa (Targeted BULK_DELETE_STUDENTS)
  const handleBulkDeleteStudents = async (ids: string[]) => {
    const toDeleteSet = new Set(ids);
    updateLocalSchoolData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => !toDeleteSet.has(s.id)),
      selectedStudentIds: prev.selectedStudentIds.filter((id) => !toDeleteSet.has(id)),
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menghapus ${ids.length} siswa...`);
        const nisnList = (state.students || [])
          .filter((s) => toDeleteSet.has(s.id) && s.nisn)
          .map((s) => s.nisn);
        const res = await gasBulkDeleteStudents(activeGasUrl, {
          username: activeUsername,
          studentIds: ids,
          nisnList,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ ${ids.length} Siswa berhasil dihapus dari cloud`);
        }
      } catch {
        showSyncToast(`${ids.length} Siswa dihapus dari perangkat lokal`, 'saved');
      }
    }
  };

  // 6. Import Excel / Batch Add Students (Targeted BATCH_STUDENTS)
  const handleBatchAddStudents = async (newStudents: Student[]) => {
    let mergedList: Student[] = [];
    updateLocalSchoolData((prev) => {
      const existingMap = new Map<string, Student>();
      for (const s of prev.students) {
        if (!s) continue;
        const key = s.nisn && s.nisn !== '-' && !s.nisn.startsWith('GEN')
          ? `nisn_${s.nisn.trim().toLowerCase()}`
          : `id_${s.id}`;
        existingMap.set(key, s);
      }
      for (const s of newStudents) {
        if (!s) continue;
        const key = s.nisn && s.nisn !== '-' && !s.nisn.startsWith('GEN')
          ? `nisn_${s.nisn.trim().toLowerCase()}`
          : `id_${s.id}`;
        existingMap.set(key, s);
      }
      mergedList = deduplicateStudents(Array.from(existingMap.values()));
      return {
        ...prev,
        students: mergedList,
        selectedStudentIds: mergedList.map((s) => s.id),
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menyinkronkan ${newStudents.length} siswa ke cloud...`);
        const res = await gasBatchStudents(activeGasUrl, {
          username: activeUsername,
          schoolId: state.school?.id || `sch_${activeUsername}`,
          students: mergedList,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ ${newStudents.length} Siswa berhasil diimpor & tersimpan rapi di cloud`);
        }
      } catch {
        showSyncToast('Data siswa tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  // 7. Terapkan Foto Siswa (Targeted BATCH_STUDENTS)
  const handleApplyPhotos = async (matchedMap: Record<string, string>) => {
    let updatedList: Student[] = [];
    updateLocalSchoolData((prev) => {
      updatedList = prev.students.map((s) => {
        if (matchedMap[s.id]) {
          return { ...s, photoUrl: matchedMap[s.id], updatedAt: new Date().toISOString() };
        }
        return s;
      });
      return {
        ...prev,
        students: updatedList,
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage('Menyimpan foto ke database cloud...');
        const res = await gasBatchStudents(activeGasUrl, {
          username: activeUsername,
          schoolId: state.school?.id || `sch_${activeUsername}`,
          students: updatedList,
        });
        if (res.status === 'success') {
          showSyncToast('✓ Foto siswa berhasil tersimpan di database cloud');
        }
      } catch {
        showSyncToast('Foto siswa tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  // 8. Pengaturan Desain & Cetak (HANYA SIMPAN KE DESAIN_KARTU, Debounced)
  const handleUpdateCardDesign = (cardDesign: CardDesignSettings) => {
    updateLocalSchoolData((prev) => ({ ...prev, cardDesign }));

    if (debouncedSaveTimer.current) clearTimeout(debouncedSaveTimer.current);
    debouncedSaveTimer.current = setTimeout(async () => {
      if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
        try {
          await gasSaveCardDesign(activeGasUrl, {
            username: activeUsername,
            cardDesign: cardDesign,
            printSettings: state.printSettings,
          });
        } catch {}
      }
    }, 1200);
  };

  const handleUpdatePosterDesign = (posterDesign: PosterDesignSettings) => {
    updateLocalSchoolData((prev) => ({ ...prev, posterDesign }));

    if (debouncedSaveTimer.current) clearTimeout(debouncedSaveTimer.current);
    debouncedSaveTimer.current = setTimeout(async () => {
      if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
        try {
          await gasSavePosterDesign(activeGasUrl, {
            username: activeUsername,
            posterDesign: posterDesign,
          });
        } catch {}
      }
    }, 1200);
  };

  const handleSavePosterDesignToCloud = async (posterDesign: PosterDesignSettings) => {
    updateLocalSchoolData((prev) => ({ ...prev, posterDesign }));
    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      await gasSavePosterDesign(activeGasUrl, {
        username: activeUsername,
        posterDesign: posterDesign,
      });
    }
  };

  const handleUpdateAnswerSheetDesign = (answerSheetDesign: AnswerSheetDesignSettings) => {
    updateLocalSchoolData((prev) => ({ ...prev, answerSheetDesign }));

    if (debouncedSaveTimer.current) clearTimeout(debouncedSaveTimer.current);
    debouncedSaveTimer.current = setTimeout(async () => {
      if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
        try {
          await gasSaveAnswerSheetDesign(activeGasUrl, {
            username: activeUsername,
            answerSheetDesign: answerSheetDesign,
          });
        } catch {}
      }
    }, 1200);
  };

  const handleSaveAnswerSheetDesignToCloud = async (answerSheetDesign: AnswerSheetDesignSettings) => {
    updateLocalSchoolData((prev) => ({ ...prev, answerSheetDesign }));
    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      await gasSaveAnswerSheetDesign(activeGasUrl, {
        username: activeUsername,
        answerSheetDesign: answerSheetDesign,
      });
    }
  };

  const handleUpdatePrintSettings = (printSettings: PrintSettings) => {
    updateLocalSchoolData((prev) => ({ ...prev, printSettings }));

    if (debouncedSaveTimer.current) clearTimeout(debouncedSaveTimer.current);
    debouncedSaveTimer.current = setTimeout(async () => {
      if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
        try {
          await gasSaveCardDesign(activeGasUrl, {
            username: activeUsername,
            cardDesign: state.cardDesign,
            printSettings: printSettings,
          });
        } catch {}
      }
    }, 1200);
  };

  // 9. Pilihan checkbox siswa (HANYA LOCAL STATE, TIDAK PERNAH PANGGIL CLOUD)
  const handleToggleStudentSelect = (id: string) => {
    setState((prev) => {
      const exists = prev.selectedStudentIds.includes(id);
      const newSelected = exists
        ? prev.selectedStudentIds.filter((stdId) => stdId !== id)
        : [...prev.selectedStudentIds, id];
      return {
        ...prev,
        selectedStudentIds: newSelected,
        schoolDataMap: {
          ...(prev.schoolDataMap || {}),
          [activeUsername]: {
            ...(prev.schoolDataMap?.[activeUsername] || {
              school: prev.school,
              exam: prev.exam,
              students: prev.students,
              cardDesign: prev.cardDesign,
              printSettings: prev.printSettings,
              selectedStudentIds: prev.selectedStudentIds,
            }),
            selectedStudentIds: newSelected,
          },
        },
      };
    });
  };

  const handleSelectAllStudents = (selectAll: boolean) => {
    setState((prev) => {
      const newSelected = selectAll ? prev.students.map((s) => s.id) : [];
      return {
        ...prev,
        selectedStudentIds: newSelected,
        schoolDataMap: {
          ...(prev.schoolDataMap || {}),
          [activeUsername]: {
            ...(prev.schoolDataMap?.[activeUsername] || {
              school: prev.school,
              exam: prev.exam,
              students: prev.students,
              teachers: prev.teachers,
              cardDesign: prev.cardDesign,
              printSettings: prev.printSettings,
              selectedStudentIds: prev.selectedStudentIds,
            }),
            selectedStudentIds: newSelected,
          },
        },
      };
    });
  };

  // 10. Teacher Management Handlers
  const handleAddTeacher = async (newTeacher: Teacher) => {
    updateLocalSchoolData((prev) => {
      const existing = prev.teachers || [];
      const updated = [newTeacher, ...existing.filter((t) => t.id !== newTeacher.id)];
      return {
        ...prev,
        teachers: updated,
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menyimpan data guru ${newTeacher.name}...`);
        const res = await gasAddTeacher(activeGasUrl, {
          username: activeUsername,
          teacher: newTeacher,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ Data guru '${newTeacher.name}' tersimpan di database`);
        } else {
          showSyncToast('Data guru tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Data guru tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    updateLocalSchoolData((prev) => ({
      ...prev,
      teachers: (prev.teachers || []).map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t)),
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Memperbarui data guru ${updatedTeacher.name}...`);
        const res = await gasUpdateTeacher(activeGasUrl, {
          username: activeUsername,
          teacher: updatedTeacher,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ Data guru '${updatedTeacher.name}' berhasil diperbarui`);
        } else {
          showSyncToast('Perubahan guru tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Perubahan guru tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    const teacherToDelete = state.teachers?.find((t) => t.id === id);
    updateLocalSchoolData((prev) => ({
      ...prev,
      teachers: (prev.teachers || []).filter((t) => t.id !== id),
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage('Menghapus data guru...');
        const res = await gasDeleteTeacher(activeGasUrl, {
          username: activeUsername,
          teacherId: id,
          nip: teacherToDelete?.nip,
        });
        if (res.status === 'success') {
          showSyncToast('✓ Data guru berhasil dihapus dari cloud');
        } else {
          showSyncToast('Data guru dihapus dari perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Data guru dihapus dari perangkat lokal', 'saved');
      }
    }
  };

  const handleBulkDeleteTeachers = async (ids: string[]) => {
    const toDeleteSet = new Set(ids);
    updateLocalSchoolData((prev) => ({
      ...prev,
      teachers: (prev.teachers || []).filter((t) => !toDeleteSet.has(t.id)),
    }));

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menghapus ${ids.length} guru...`);
        const res = await gasBulkDeleteTeachers(activeGasUrl, {
          username: activeUsername,
          teacherIds: ids,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ ${ids.length} Guru berhasil dihapus dari cloud`);
        } else {
          showSyncToast(`${ids.length} Guru dihapus dari perangkat lokal`, 'saved');
        }
      } catch {
        showSyncToast(`${ids.length} Guru dihapus dari perangkat lokal`, 'saved');
      }
    }
  };

  const handleBatchAddTeachers = async (newTeachers: Teacher[]) => {
    let mergedList: Teacher[] = [];
    updateLocalSchoolData((prev) => {
      const existing = prev.teachers || [];
      const map = new Map<string, Teacher>();
      for (const t of existing) {
        if (!t) continue;
        const key = t.nip && t.nip !== '-' ? `nip_${t.nip.trim()}` : `id_${t.id}`;
        map.set(key, t);
      }
      for (const t of newTeachers) {
        if (!t) continue;
        const key = t.nip && t.nip !== '-' ? `nip_${t.nip.trim()}` : `id_${t.id}`;
        map.set(key, t);
      }
      mergedList = deduplicateTeachers(Array.from(map.values()));
      return {
        ...prev,
        teachers: mergedList,
      };
    });

    if (activeGasUrl && activeGasUrl.trim().startsWith('http')) {
      try {
        setSyncStatus('syncing');
        setSyncToastMessage(`Menyinkronkan ${newTeachers.length} data guru ke cloud...`);
        const res = await gasBatchTeachers(activeGasUrl, {
          username: activeUsername,
          schoolId: state.school?.id || `sch_${activeUsername}`,
          teachers: mergedList,
        });
        if (res.status === 'success') {
          showSyncToast(`✓ ${newTeachers.length} Guru berhasil diimpor & tersimpan di cloud`);
        } else {
          showSyncToast('Data guru tersimpan di perangkat lokal', 'saved');
        }
      } catch {
        showSyncToast('Data guru tersimpan di perangkat lokal', 'saved');
      }
    }
  };

  const handleToggleTeacherSelect = (id: string) => {
    setState((prev) => {
      const current = prev.selectedTeacherIds || [];
      const exists = current.includes(id);
      const newSelected = exists ? current.filter((tId) => tId !== id) : [...current, id];
      return {
        ...prev,
        selectedTeacherIds: newSelected,
      };
    });
  };

  const handleSelectAllTeachers = (selectAll: boolean) => {
    setState((prev) => ({
      ...prev,
      selectedTeacherIds: selectAll ? (prev.teachers || []).map((t) => t.id) : [],
    }));
  };

  const handleResetDemoData = () => {
    const fresh = resetStoredState();
    setState(fresh);
    setPortalMode('school');
    setActiveTab('dashboard');
  };

  // If user is not logged in, render the clean Landing Page
  if (!state.currentUser) {
    return (
      <>
        <LandingPage
          onOpenLogin={() => {
            setAuthInitialTab('login');
            setIsAuthModalOpen(true);
          }}
          onOpenRegister={() => {
            setAuthInitialTab('register');
            setIsAuthModalOpen(true);
          }}
          sampleSchool={state.school}
          sampleExam={state.exam}
          sampleStudent={state.students[0]}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          accounts={state.accounts}
          onAddAccount={handleAddAccount}
          googleSheets={state.googleSheets}
        />

        {/* Modal Konfirmasi Akses Kamera Setiap Kali Login Sekolah */}
        <CameraLoginConfirmationModal
          isOpen={Boolean(pendingLoginUser)}
          user={pendingLoginUser}
          onConfirm={handleCameraLoginConfirmed}
          onSkip={handleCameraLoginSkipped}
          onCancel={() => setPendingLoginUser(null)}
        />

        {/* Modal Pemberitahuan Auto Logout Khusus Sekolah */}
        <AutoLogoutModal
          isOpen={isAutoLoggedOutOpen}
          onClose={() => setIsAutoLoggedOutOpen(false)}
          onLoginAgain={() => {
            setIsAutoLoggedOutOpen(false);
            setAuthInitialTab('login');
            setIsAuthModalOpen(true);
          }}
          timeoutMinutes={autoLogoutMinutes}
        />
      </>
    );
  }

  // Dynamic header titles based on current active menu
  const getAdminMobileTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'insights': return 'Beranda';
      case 'accounts': return 'Pengguna';
      case 'uploads': return 'Monitoring';
      case 'settings': return 'Pengaturan';
      default: return 'Beranda';
    }
  };

  const getSchoolMobileTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Beranda';
      case 'students': return 'Data';
      case 'designer': return 'Desain';
      case 'print': return 'Cetak';
      case 'settings': return 'Pengaturan';
      default: return 'Beranda';
    }
  };

  const currentMobileTitle =
    isAdmin && portalMode === 'admin'
      ? getAdminMobileTitle(adminTab)
      : getSchoolMobileTitle(activeTab);

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#FFFDF8] text-neutral-900 flex flex-col font-sans">
      {/* 1. TOP NAVIGATION HEADER (NO-PRINT) - BENAR-BENAR MELAYANG TANPA LATAR BELAKANG */}
      <header className="no-print sticky top-0 z-50 shrink-0 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-3 pb-1 bg-transparent pointer-events-none">
        <div className="w-full bg-white/95 backdrop-blur-md border-3 border-black shadow-[4px_4px_0px_#000] rounded-2xl px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
          {/* Logo Brand Aplikasi (HANYA LOGO APLIKASI DI SEBELAH KIRI) */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (isAdmin && portalMode === 'admin') {
                  setAdminTab('insights');
                } else {
                  setActiveTab('dashboard');
                }
              }}
              className="flex items-center gap-2.5 text-left group min-w-0 cursor-pointer"
            >
              {/* Logo Aplikasi Resmi PORTAL ASESMEN */}
              <PortalAsesmenLogo size="sm" variant="icon-only" />

              {/* Title & Subtitle: Responsif Mobile vs Desktop */}
              <div className="min-w-0">
                {/* Mobile View: Judul berubah sesuai menu aktif, Subtitle "PORTAL ASESMEN" */}
                <div className="lg:hidden min-w-0">
                  <span className="text-sm font-black uppercase tracking-tight block leading-tight truncate">
                    {currentMobileTitle}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-neutral-500 truncate block">
                    PORTAL ASESMEN
                  </span>
                </div>

                {/* Desktop View: PORTAL ASESMEN & Tagline */}
                <div className="hidden lg:block min-w-0">
                  <span className="text-base font-black uppercase tracking-tight block leading-none">
                    PORTAL ASESMEN
                  </span>
                  <span className="text-[10px] font-mono font-bold text-neutral-500 truncate max-w-[340px] block mt-0.5">
                    {portalMode === 'admin'
                      ? 'Panel Administrator Sistem'
                      : state.school?.name
                      ? `${state.school.name} • Administrasi & Generator Kartu Asesmen`
                      : 'Aplikasi Administrasi & Generator Kartu Asesmen Sekolah'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Right Header Controls (LOGO AKUN DI SEBELAH KANAN) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Account Badge & Direct Logout Button */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 bg-neutral-50 border-2 border-black rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_#000]">
                {isAdmin ? (
                  <div className="w-7 h-7 rounded-lg bg-yellow-300 border border-black flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                ) : state.school?.logoUrl ? (
                  <img
                    src={state.school.logoUrl}
                    alt={state.school?.name || 'Logo Akun'}
                    className="w-7 h-7 rounded-lg object-contain bg-white border border-black shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white border border-black flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-left leading-tight pr-1">
                  <div className="text-xs font-black uppercase text-neutral-900 truncate max-w-[140px]">
                    {isAdmin ? 'Admin Nagata' : state.school?.name || 'Operator'}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 font-bold truncate">
                    @{state.currentUser?.username || ''}
                  </div>
                </div>
              </div>

              {/* Desktop Direct Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border-2 border-black rounded-xl text-xs font-black text-rose-700 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer"
                title="Keluar dari Akun (Logout)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Mobile Profile Photo / Logo Akun & Dropdown Popover */}
            <div className="lg:hidden relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="relative p-0.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] hover:scale-105 active:scale-95 transition-transform focus:outline-hidden"
                title="Menu Akun & Profil"
                aria-label="Menu Akun"
              >
                {isAdmin ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-200 flex items-center justify-center font-black text-xs text-neutral-900 border border-black/40">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                ) : state.school?.logoUrl ? (
                  <img
                    src={state.school.logoUrl}
                    alt="Logo Akun"
                    className="w-8 h-8 rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs text-white border border-black/40">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                )}
                {/* Status Dot Indikator Sinkronisasi (Hanya untuk Admin) */}
                {isAdmin && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black ${
                      state.googleSheets.isConnected ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                    title={state.googleSheets.isConnected ? 'Database Cloud Terhubung' : 'Mode Offline/Lokal'}
                  />
                )}
              </button>

              {/* Popover Dropdown Mobile Menu */}
              {isProfileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />

                  {/* Dropdown Box */}
                  <div className="absolute right-0 top-11 z-50 w-72 bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header Info */}
                    <div className="flex items-start gap-2.5 pb-2.5 border-b-2 border-neutral-100">
                      {isAdmin ? (
                        <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                          <ShieldCheck className="w-5 h-5 text-black" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] overflow-hidden">
                          {state.school?.logoUrl ? (
                            <img src={state.school.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-neutral-800" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black uppercase text-neutral-900 truncate">
                            {isAdmin
                              ? 'Admin Nagata'
                              : state.school?.name || 'Operator Sekolah'}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="p-1 text-neutral-400 hover:text-black rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] font-mono text-neutral-500 font-bold truncate">
                          @{state.currentUser?.username || ''}
                          {isAdmin ? ' • Administrator Sistem' : ''}
                        </p>

                        {!isAdmin && state.school?.npsn && (
                          <p className="text-[9px] font-mono text-neutral-400">
                            NPSN: {state.school.npsn}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Sinkronisasi Spreadsheet (Hanya untuk Admin) */}
                    {isAdmin && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2 text-[10px] flex items-center justify-between">
                        <span className="font-bold text-neutral-500">Database Cloud:</span>
                        <span
                          className={`font-mono font-black px-1.5 py-0.5 rounded text-[9px] border ${
                            state.googleSheets.isConnected
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {state.googleSheets.isConnected ? 'TERHUBUNG' : 'LOKAL'}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-1.5 pt-1">
                      {/* Tombol Reload Data dari Spreadsheet (Hanya untuk Admin) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            loadDatabaseFromGas(state.googleSheets.webAppUrl, true);
                          }}
                          disabled={isReloading}
                          className="w-full py-2 px-3 bg-neutral-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-xs font-black text-neutral-800 shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 disabled:opacity-60 cursor-pointer"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-yellow-600' : ''}`} />
                          <span>{isReloading ? 'Memuat Data...' : 'Muat Ulang Spreadsheet'}</span>
                        </button>
                      )}

                      {/* Tombol Logout */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-400 rounded-xl text-xs font-black text-rose-700 shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN APP CONTENT CONTAINER (Ukuran Fix & Scroll Mandiri untuk Desktop Admin & Sekolah) */}
      <main className="flex-1 min-h-0 w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 overflow-hidden flex flex-col">
        {/* MODE A: PORTAL ADMIN (KHUSUS ADMINISTRATOR - BUKAN SEKOLAH) */}
        {isAdmin ? (
          <AdminPortal
            currentUser={state.currentUser}
            accounts={state.accounts}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onResetPassword={handleResetPassword}
            onDeleteAccount={handleDeleteAccount}
            schoolDataMap={state.schoolDataMap || {}}
            googleSheets={state.googleSheets}
            onOpenGasModal={() => setIsGasModalOpen(true)}
            onTriggerFullSync={handleTriggerFullSync}
            onReloadAllData={() => loadDatabaseFromGas(state.googleSheets.webAppUrl, true)}
            isReloading={isReloading}
            spreadsheetCapacity={spreadsheetCapacity}
            driveInfo={driveInfo}
            onLogout={handleLogout}
            activeTab={adminTab}
            onNavigate={(tab) => setAdminTab(tab)}
            loginLogs={state.loginLogs || []}
          />
        ) : (
          /* MODE B: PORTAL SEKOLAH (UNTUK OPERATOR SEKOLAH) */
          <SchoolPortal
            currentUser={state.currentUser}
            school={state.school || DEFAULT_SCHOOL}
            exam={state.exam || DEFAULT_EXAM}
            students={state.students || []}
            teachers={state.teachers || []}
            cardDesign={state.cardDesign || DEFAULT_CARD_DESIGN}
            posterDesign={state.posterDesign || DEFAULT_POSTER_DESIGN}
            answerSheetDesign={state.answerSheetDesign || DEFAULT_ANSWER_SHEET_DESIGN}
            printSettings={state.printSettings || DEFAULT_PRINT_SETTINGS}
            selectedStudentIds={state.selectedStudentIds || []}
            selectedTeacherIds={state.selectedTeacherIds || []}
            googleSheets={state.googleSheets}
            activeTab={activeTab}
            onNavigate={(tab) => setActiveTab(tab)}
            onToggleStudentSelect={handleToggleStudentSelect}
            onSelectAllStudents={handleSelectAllStudents}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onBulkDeleteStudents={handleBulkDeleteStudents}
            onBatchAddStudents={handleBatchAddStudents}
            onApplyPhotos={handleApplyPhotos}
            onToggleTeacherSelect={handleToggleTeacherSelect}
            onSelectAllTeachers={handleSelectAllTeachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onBulkDeleteTeachers={handleBulkDeleteTeachers}
            onBatchAddTeachers={handleBatchAddTeachers}
            onUpdateAccount={handleUpdateAccount}
            onResetPassword={handleResetPassword}
            onUpdateCardDesign={handleUpdateCardDesign}
            onUpdatePosterDesign={handleUpdatePosterDesign}
            onSavePosterDesignToCloud={handleSavePosterDesignToCloud}
            onUpdateAnswerSheetDesign={handleUpdateAnswerSheetDesign}
            onSaveAnswerSheetDesignToCloud={handleSaveAnswerSheetDesignToCloud}
            onUpdatePrintSettings={handleUpdatePrintSettings}
            onUpdateSchool={handleUpdateSchool}
            onUpdateExam={handleUpdateExam}
            exams={state.exams || []}
            onSelectActiveExam={handleSelectActiveExam}
            onAddExam={handleAddExam}
            onDeleteExam={handleDeleteExamItem}
            onSaveSchoolAndExam={handleSaveSchoolAndExam}
            onReloadAllData={() => loadDatabaseFromGas(state.googleSheets.webAppUrl, true)}
            isReloading={isReloading}
            onLogout={handleLogout}
            onOpenImportModal={() => setIsGlobalImportOpen(true)}
            onOpenPhotoModal={() => setIsGlobalPhotoOpen(true)}
            onOpenTeacherImportModal={() => setIsGlobalTeacherImportOpen(true)}
            onResetDemoData={handleResetDemoData}
            isAdmin={false}
            loginLogs={state.loginLogs || []}
            autoLogoutMinutes={autoLogoutMinutes}
            onChangeAutoLogoutMinutes={(mins) => {
              setAutoLogoutMinutes(mins);
              try {
                localStorage.setItem('portal_asesmen_auto_logout_minutes', String(mins));
              } catch (e) {
                console.warn(e);
              }
            }}
          />
        )}
      </main>

      {/* 3. GLOBAL MODALS */}
      <ImportExcelModal
        isOpen={isGlobalImportOpen}
        existingStudents={state.students}
        onClose={() => setIsGlobalImportOpen(false)}
        onImportComplete={(imported) => {
          handleBatchAddStudents(imported);
          setActiveTab('students');
        }}
      />

      <BulkPhotoModal
        isOpen={isGlobalPhotoOpen}
        students={state.students}
        onClose={() => setIsGlobalPhotoOpen(false)}
        onApplyPhotos={(matched) => {
          handleApplyPhotos(matched);
          setActiveTab('students');
        }}
      />

      <ImportTeacherExcelModal
        isOpen={isGlobalTeacherImportOpen}
        existingTeachers={state.teachers}
        onClose={() => setIsGlobalTeacherImportOpen(false)}
        onImportComplete={(imported) => {
          handleBatchAddTeachers(imported);
          setActiveTab('students');
        }}
      />

      {/* Google Apps Script Modal is ONLY accessible by Admin */}
      {isAdmin && (
        <GoogleAppsScriptModal
          isOpen={isGasModalOpen}
          onClose={() => setIsGasModalOpen(false)}
          config={state.googleSheets}
          onSaveConfig={handleUpdateGasConfig}
          currentUser={state.currentUser}
          school={state.school}
          exam={state.exam}
          exams={state.exams}
          students={state.students}
          teachers={state.teachers}
          cardDesign={state.cardDesign}
          printSettings={state.printSettings}
        />
      )}

      {/* 4. REAL-TIME CLOUD DATABASE STATUS TOAST */}
      {syncToastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-60 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_#000] text-xs font-black animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
          {syncStatus === 'syncing' ? (
            <RotateCcw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
          ) : syncStatus === 'saved' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="text-neutral-900">{syncToastMessage}</span>
        </div>
      )}

      {/* 5. POP-UP INFORMASI & PERIZINAN KAMERA AWAL LOGIN */}
      {state.currentUser && (
        <CameraPermissionNoticeModal
          isOpen={showCameraPermissionNotice}
          onClose={() => setShowCameraPermissionNotice(false)}
        />
      )}

      {/* 6. MODAL KONFIRMASI AKSES KAMERA TIAP KALI LOGIN SEKOLAH */}
      <CameraLoginConfirmationModal
        isOpen={Boolean(pendingLoginUser)}
        user={pendingLoginUser}
        onConfirm={handleCameraLoginConfirmed}
        onSkip={handleCameraLoginSkipped}
        onCancel={() => setPendingLoginUser(null)}
      />

      {/* 7. MODAL PEMBERITAHUAN AUTO LOGOUT KHUSUS SEKOLAH */}
      <AutoLogoutModal
        isOpen={isAutoLoggedOutOpen}
        onClose={() => setIsAutoLoggedOutOpen(false)}
        onLoginAgain={() => {
          setIsAutoLoggedOutOpen(false);
          setAuthInitialTab('login');
          setIsAuthModalOpen(true);
        }}
        timeoutMinutes={autoLogoutMinutes}
      />
    </div>
  );
}
