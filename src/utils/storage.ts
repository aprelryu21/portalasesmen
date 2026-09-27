import { School, Exam, Student, Teacher, CardDesignSettings, PrintSettings, UserAccount, GoogleSheetsConfig, UserSchoolData, LoginLogEntry } from '../types';
import {
  DEFAULT_SCHOOL,
  DEFAULT_EXAM,
  DEFAULT_EXAMS,
  DEFAULT_CARD_DESIGN,
  DEFAULT_PRINT_SETTINGS,
  DEFAULT_TEACHERS,
  MOCK_STUDENTS,
} from '../data/mockData';
import { getActiveGasUrl, isConfiguredGasUrl } from '../config/appConfig';

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc_admin_nagata',
    username: 'Nagata',
    password: '09072022',
    schoolName: 'Pusat Administrator Sistem',
    npsn: '',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

const initialGasUrl = getActiveGasUrl();
export const DEFAULT_GOOGLE_SHEETS: GoogleSheetsConfig = {
  webAppUrl: initialGasUrl,
  spreadsheetId: '',
  spreadsheetName: '',
  isConnected: isConfiguredGasUrl(initialGasUrl),
};

export interface AppState {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  googleSheets: GoogleSheetsConfig;
  school: School;
  exam: Exam;
  exams: Exam[];
  students: Student[];
  teachers: Teacher[];
  cardDesign: CardDesignSettings;
  printSettings: PrintSettings;
  selectedStudentIds: string[];
  selectedTeacherIds: string[];
  schoolDataMap?: Record<string, UserSchoolData>;
  loginLogs: LoginLogEntry[];
}

const STORAGE_KEYS = {
  APP_STATE: 'portal_ujian_clean_state_v4',
  LOGIN_LOGS: 'portal_asesmen_login_logs_v1',
};

export const deduplicateStudents = (students: Student[] = []): Student[] => {
  const seenIds = new Set<string>();
  const cleanList: Student[] = [];

  for (const s of students) {
    if (!s || !s.id) continue;
    const idStr = String(s.id).trim();
    if (!seenIds.has(idStr)) {
      seenIds.add(idStr);
      cleanList.push(s);
    }
  }

  return cleanList;
};

export const deduplicateTeachers = (teachers: Teacher[] = []): Teacher[] => {
  const seenIds = new Set<string>();
  const cleanList: Teacher[] = [];

  for (const t of teachers) {
    if (!t || !t.id) continue;
    const idStr = String(t.id).trim();
    if (!seenIds.has(idStr)) {
      seenIds.add(idStr);
      cleanList.push(t);
    }
  }

  return cleanList;
};

export const loadStoredState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const activeUrl = getActiveGasUrl(parsed.googleSheets?.webAppUrl);
      const isConnected = Boolean(activeUrl && isConfiguredGasUrl(activeUrl));

      const mergedGoogleSheets: GoogleSheetsConfig = {
        ...DEFAULT_GOOGLE_SHEETS,
        ...(parsed.googleSheets || {}),
        webAppUrl: activeUrl,
        isConnected: parsed.googleSheets?.isConnected ?? isConnected,
      };

      const cleanStudents = deduplicateStudents(Array.isArray(parsed.students) ? parsed.students : []);
      const cleanTeachers = deduplicateTeachers(
        Array.isArray(parsed.teachers) && parsed.teachers.length > 0
          ? parsed.teachers
          : DEFAULT_TEACHERS
      );
      const cleanSchoolDataMap: Record<string, UserSchoolData> = {};

      if (parsed.schoolDataMap && typeof parsed.schoolDataMap === 'object') {
        for (const [key, val] of Object.entries(parsed.schoolDataMap as Record<string, UserSchoolData>)) {
          if (val && typeof val === 'object') {
            const valStudents = deduplicateStudents(Array.isArray(val.students) ? val.students : []);
            const valTeachers = deduplicateTeachers(
              Array.isArray(val.teachers) && val.teachers.length > 0 ? val.teachers : DEFAULT_TEACHERS
            );
            cleanSchoolDataMap[key] = {
              ...val,
              students: valStudents,
              teachers: valTeachers,
              selectedStudentIds: Array.isArray(val.selectedStudentIds)
                ? Array.from(new Set(val.selectedStudentIds.filter((id: string) => valStudents.some((s) => s.id === id))))
                : valStudents.map((s) => s.id),
            };
          }
        }
      }

      delete cleanSchoolDataMap['Nagata'];
      delete cleanSchoolDataMap['nagata'];

      const cleanExams: Exam[] = Array.isArray(parsed.exams)
        ? parsed.exams.filter((e: Exam) => e && e.name && e.id !== 'exam_default' && e.id !== 'exam_preview')
        : [];
      const cleanExam: Exam = parsed.exam && parsed.exam.name && parsed.exam.id !== 'exam_default' && parsed.exam.id !== 'exam_preview'
        ? parsed.exam
        : (cleanExams[0] || DEFAULT_EXAM);

      return {
        currentUser: (parsed.currentUser && parsed.currentUser.username) ? parsed.currentUser : null,
        accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0 ? parsed.accounts : DEFAULT_ACCOUNTS,
        googleSheets: mergedGoogleSheets,
        school: { ...DEFAULT_SCHOOL, ...(parsed.school || {}) },
        exam: cleanExam,
        exams: cleanExams,
        students: cleanStudents,
        teachers: cleanTeachers,
        cardDesign: { ...DEFAULT_CARD_DESIGN, ...(parsed.cardDesign || {}) },
        printSettings: { ...DEFAULT_PRINT_SETTINGS, ...(parsed.printSettings || {}) },
        selectedStudentIds: Array.isArray(parsed.selectedStudentIds)
          ? Array.from(new Set(parsed.selectedStudentIds.filter((id: string) => cleanStudents.some((s) => s.id === id))))
          : cleanStudents.map((s: Student) => s.id),
        selectedTeacherIds: Array.isArray(parsed.selectedTeacherIds)
          ? parsed.selectedTeacherIds
          : cleanTeachers.map((t) => t.id),
        schoolDataMap: cleanSchoolDataMap,
        loginLogs: Array.isArray(parsed.loginLogs) ? parsed.loginLogs : getStoredLoginLogs(),
      };
    }
  } catch (err) {
    console.warn('Failed to parse stored app state, falling back to defaults:', err);
  }

  // Initial clean state with default teachers
  const activeUrl = getActiveGasUrl();
  return {
    currentUser: null,
    accounts: DEFAULT_ACCOUNTS,
    googleSheets: {
      ...DEFAULT_GOOGLE_SHEETS,
      webAppUrl: activeUrl,
      isConnected: isConfiguredGasUrl(activeUrl),
    },
    school: DEFAULT_SCHOOL,
    exam: DEFAULT_EXAM,
    exams: DEFAULT_EXAMS,
    students: [],
    teachers: DEFAULT_TEACHERS,
    cardDesign: DEFAULT_CARD_DESIGN,
    printSettings: DEFAULT_PRINT_SETTINGS,
    selectedStudentIds: [],
    selectedTeacherIds: DEFAULT_TEACHERS.map((t) => t.id),
    schoolDataMap: {},
    loginLogs: getStoredLoginLogs(),
  };
};

export const saveStoredState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    if (state.loginLogs && Array.isArray(state.loginLogs)) {
      localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(state.loginLogs));
    }
  } catch (err) {
    console.error('Failed to save app state to localStorage:', err);
  }
};

export const resetStoredState = (): AppState => {
  try {
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
  } catch (err) {
    console.warn('Failed to clear localStorage:', err);
  }
  const activeUrl = getActiveGasUrl();
  return {
    currentUser: null,
    accounts: DEFAULT_ACCOUNTS,
    googleSheets: {
      ...DEFAULT_GOOGLE_SHEETS,
      webAppUrl: activeUrl,
      isConnected: isConfiguredGasUrl(activeUrl),
    },
    school: DEFAULT_SCHOOL,
    exam: DEFAULT_EXAM,
    exams: DEFAULT_EXAMS,
    students: [],
    teachers: DEFAULT_TEACHERS,
    cardDesign: DEFAULT_CARD_DESIGN,
    printSettings: DEFAULT_PRINT_SETTINGS,
    selectedStudentIds: [],
    selectedTeacherIds: DEFAULT_TEACHERS.map((t) => t.id),
    schoolDataMap: {},
    loginLogs: getStoredLoginLogs(),
  };
};

export const getStoredLoginLogs = (): LoginLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Gagal membaca login logs:', e);
  }
  return [];
};

export const saveLoginLogLocally = (entry: LoginLogEntry): LoginLogEntry[] => {
  try {
    const current = getStoredLoginLogs();
    const updated = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Gagal menyimpan login log lokal:', e);
    return [entry];
  }
};
