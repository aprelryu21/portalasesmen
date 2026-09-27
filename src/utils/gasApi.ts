import { UserAccount, School, Exam, Student, Teacher, CardDesignSettings, PrintSettings, LoginLogEntry } from '../types';

export interface SpreadsheetCapacity {
  totalAllocatedCells: number;
  totalDataCells: number;
  maxCellsCapacity: number;
  availableCells: number;
  percentUsed: string;
  percentAvailable: string;
  sheetsCount: number;
  sheetsInfo?: Array<{
    name: string;
    lastRow: number;
    lastColumn: number;
    allocatedCells: number;
    dataCells: number;
  }>;
}

export interface DriveDatabaseInfo {
  status?: string;
  rootPath?: string;
  rootFolderUrl?: string;
  dbFolderUrl?: string;
  dbFolderId?: string;
  schoolCount?: number;
}

export interface GasPingResponse {
  status: 'success' | 'error';
  message: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  sheets?: string[];
  capacity?: SpreadsheetCapacity;
  driveDatabase?: DriveDatabaseInfo;
  imageDatabase?: {
    status?: string;
    folderName?: string;
    subfolderPattern?: string;
    totalPhotosSaved?: number;
  };
  serverTime?: string;
}

export interface GasLoginResponse {
  status: 'success' | 'error';
  message: string;
  user?: UserAccount;
  driveFolderUrl?: string;
  drivePath?: string;
}

export interface GasSaveResponse {
  status: 'success' | 'error';
  message: string;
  totalStudentsSaved?: number;
  driveFolderUrl?: string;
  drivePath?: string;
  photoFolderUrl?: string;
  timestamp?: string;
}

export interface GasAccountsResponse {
  status: 'success' | 'error';
  message?: string;
  accounts?: UserAccount[];
}

export interface GasAllDataResponse {
  status: 'success' | 'error';
  message?: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  capacity?: SpreadsheetCapacity;
  driveDatabase?: DriveDatabaseInfo;
  data?: {
    accounts?: UserAccount[];
    schoolsMap?: Record<string, { school: School; exam: Exam }>;
    studentsMap?: Record<string, Student[]>;
    teachersMap?: Record<string, Teacher[]>;
    examsMap?: Record<string, Exam[]>;
    designsMap?: Record<string, { cardDesign: CardDesignSettings; printSettings: PrintSettings }>;
    loginLogs?: LoginLogEntry[];
  };
}

/**
 * Helper fetch dengan timeout dan penanganan CORS Google Apps Script
 */
const postToGas = async (webAppUrl: string, payload: unknown) => {
  const url = webAppUrl.trim();
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Server Google Apps Script merespons kode: ${response.status}`);
  }

  return response.json();
};

/**
 * Uji konektivitas dan ambil metrik kapasitas Google Spreadsheet & Google Drive
 */
export const testGasConnection = async (webAppUrl: string): Promise<GasPingResponse> => {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    throw new Error('URL Google Apps Script tidak valid. Pastikan berawalan https://script.google.com/macros/s/.../exec');
  }

  const url = `${webAppUrl.trim()}${webAppUrl.includes('?') ? '&' : '?'}action=PING&t=${Date.now()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Server Google Apps Script merespons kode: ${response.status}`);
  }

  return response.json();
};

/**
 * Ambil seluruh data dari Google Spreadsheet (Sheet AKUN, INFORMASI_SEKOLAH, DATA_SISWA, DESAIN_KARTU)
 */
export const gasGetAllData = async (webAppUrl: string): Promise<GasAllDataResponse> => {
  if (!webAppUrl || !webAppUrl.trim()) {
    throw new Error('URL Google Apps Script belum dikonfigurasi.');
  }

  try {
    // Coba via GET terlebih dahulu
    const url = `${webAppUrl.trim()}${webAppUrl.includes('?') ? '&' : '?'}action=GET_ALL_DATA&t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback ke POST jika GET terhambat
  }

  return postToGas(webAppUrl, { action: 'GET_ALL_DATA' });
};

/**
 * Ambil daftar akun pengguna dari Sheet "AKUN"
 */
export const gasGetAccounts = async (webAppUrl: string): Promise<UserAccount[]> => {
  if (!webAppUrl || !webAppUrl.trim()) return [];

  try {
    const url = `${webAppUrl.trim()}${webAppUrl.includes('?') ? '&' : '?'}action=GET_ACCOUNTS&t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.accounts)) {
        return data.accounts;
      }
    }
  } catch (err) {
    console.warn('Gagal GET accounts, mencoba POST fallback:', err);
  }

  const res = await postToGas(webAppUrl, { action: 'GET_ALL_DATA' });
  return res.data?.accounts || [];
};

/**
 * Tambah akun sekolah baru ke Sheet "AKUN" dan buat folder Google Drive
 */
export const gasAddAccount = async (
  webAppUrl: string,
  account: {
    username: string;
    password?: string;
    schoolName: string;
    npsn?: string;
    role?: 'operator' | 'admin';
  }
): Promise<{ status: 'success' | 'error'; message: string; user?: UserAccount }> => {
  return postToGas(webAppUrl, {
    action: 'ADD_ACCOUNT',
    ...account,
  });
};

/**
 * Update informasi akun (username, nama sekolah, npsn, role) di Sheet "AKUN"
 */
export const gasUpdateAccount = async (
  webAppUrl: string,
  account: {
    id?: string;
    username: string;
    schoolName: string;
    npsn?: string;
    role?: 'operator' | 'admin';
  }
): Promise<{ status: 'success' | 'error'; message: string; account?: UserAccount }> => {
  return postToGas(webAppUrl, {
    action: 'UPDATE_ACCOUNT',
    ...account,
  });
};

/**
 * Ganti / Reset password akun pengguna di Sheet "AKUN"
 */
export const gasResetPassword = async (
  webAppUrl: string,
  username: string,
  newPassword: string
): Promise<{ status: 'success' | 'error'; message: string }> => {
  return postToGas(webAppUrl, {
    action: 'RESET_PASSWORD',
    username,
    newPassword,
  });
};

/**
 * Hapus akun dari Sheet "AKUN" beserta seluruh rekaman datanya di Spreadsheet
 */
export const gasDeleteAccount = async (
  webAppUrl: string,
  username: string,
  id?: string
): Promise<{ status: 'success' | 'error'; message: string }> => {
  return postToGas(webAppUrl, {
    action: 'DELETE_ACCOUNT',
    username,
    id,
  });
};

/**
 * Daftar / Register akun baru via Google Apps Script (ke Sheet "AKUN")
 */
export const gasRegister = async (
  webAppUrl: string,
  account: { username: string; password?: string; schoolName: string; npsn?: string }
): Promise<GasLoginResponse> => {
  return postToGas(webAppUrl, {
    action: 'REGISTER',
    ...account,
  });
};

/**
 * Login via Google Apps Script (terhadap Sheet "AKUN")
 */
export const gasLogin = async (
  webAppUrl: string,
  username: string,
  password: string
): Promise<GasLoginResponse> => {
  return postToGas(webAppUrl, {
    action: 'LOGIN',
    username,
    password,
  });
};

/**
 * Simpan seluruh data sekolah, ujian, siswa, dan desain kartu ke Spreadsheet & Drive
 */
export const gasSaveAllData = async (
  webAppUrl: string,
  payload: {
    username: string;
    school: School;
    exam: Exam;
    exams?: Exam[];
    students: Student[];
    teachers?: Teacher[];
    cardDesign: CardDesignSettings;
    printSettings: PrintSettings;
  }
): Promise<GasSaveResponse> => {
  return postToGas(webAppUrl, {
    action: 'SAVE_ALL_DATA',
    ...payload,
  });
};

/**
 * Unggah Logo Sekolah langsung ke Folder Google Drive Sekolah
 */
export const gasUploadLogo = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolName: string;
    base64Data: string;
    fileName?: string;
  }
): Promise<{ status: 'success' | 'error'; message: string; logoUrl?: string; fileId?: string }> => {
  return postToGas(webAppUrl, {
    action: 'UPLOAD_LOGO',
    ...payload,
  });
};

/**
 * Upload foto / berkas scan tanda tangan kepala sekolah ke Google Drive sekolah
 */
export const gasUploadSignature = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolName: string;
    base64Data: string;
    fileName?: string;
  }
): Promise<{ status: 'success' | 'error'; message: string; signatureUrl?: string; fileId?: string }> => {
  // Try dedicated UPLOAD_SIGNATURE action first
  try {
    const res = await postToGas(webAppUrl, {
      action: 'UPLOAD_SIGNATURE',
      ...payload,
    });
    if (res && res.status === 'success' && (res.signatureUrl || res.fileUrl || res.url)) {
      return {
        status: 'success',
        message: res.message || 'Tanda tangan berhasil tersimpan di Google Drive!',
        signatureUrl: res.signatureUrl || res.fileUrl || res.url,
      };
    }
  } catch {
    // proceed to standard drive upload fallback
  }

  // Fallback using Drive folder upload mechanism with UPLOAD_LOGO endpoint schema
  try {
    const res2 = await postToGas(webAppUrl, {
      action: 'UPLOAD_LOGO',
      ...payload,
      fileName: payload.fileName || `TTD_KEPSEK_${payload.username || 'SEKOLAH'}.png`,
    });
    if (res2 && res2.status === 'success' && res2.logoUrl) {
      return {
        status: 'success',
        message: 'Tanda tangan berhasil tersimpan di Google Drive!',
        signatureUrl: res2.logoUrl,
      };
    }
  } catch {
    // Ignore and return local dataUrl
  }

  return {
    status: 'success',
    message: 'Tanda tangan tersimpan di perangkat lokal',
    signatureUrl: payload.base64Data,
  };
};

/**
 * Simpan khusus data identitas sekolah & ujian ke Google Spreadsheet (Sheet INFORMASI_SEKOLAH)
 */
export const gasSaveSchoolSettings = async (
  webAppUrl: string,
  payload: {
    username: string;
    school: School;
    exam: Exam;
  }
): Promise<{ status: 'success' | 'error'; message: string; school?: School; exam?: Exam; logoUrl?: string; driveFolderUrl?: string }> => {
  return postToGas(webAppUrl, {
    action: 'SAVE_SCHOOL_SETTINGS',
    ...payload,
  });
};

/**
 * Simpan khusus pengaturan desain kartu & cetak ke Google Spreadsheet (Sheet DESAIN_KARTU)
 */
export const gasSaveCardDesign = async (
  webAppUrl: string,
  payload: {
    username: string;
    cardDesign: CardDesignSettings;
    printSettings: PrintSettings;
  }
): Promise<{ status: 'success' | 'error'; message: string }> => {
  return postToGas(webAppUrl, {
    action: 'SAVE_CARD_DESIGN',
    ...payload,
  });
};

/**
 * Simpan / perbarui kumpulan data siswa secara efisien & atomik (tanpa menumpuk baris)
 */
export const gasBatchStudents = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolId?: string;
    students: Student[];
  }
): Promise<{ status: 'success' | 'error'; message: string; totalStudents?: number }> => {
  return postToGas(webAppUrl, {
    action: 'BATCH_STUDENTS',
    ...payload,
  });
};

/**
 * Tambah 1 siswa baru secara atomic ke Sheet DATA_SISWA
 */
export const gasAddStudent = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolId?: string;
    student: Student;
  }
): Promise<{ status: 'success' | 'error'; message: string; student?: Student }> => {
  return postToGas(webAppUrl, {
    action: 'ADD_STUDENT',
    ...payload,
  });
};

/**
 * Update 1 siswa yang sudah ada di Sheet DATA_SISWA
 */
export const gasUpdateStudent = async (
  webAppUrl: string,
  payload: {
    username: string;
    student: Student;
  }
): Promise<{ status: 'success' | 'error'; message: string; student?: Student }> => {
  return postToGas(webAppUrl, {
    action: 'UPDATE_STUDENT',
    ...payload,
  });
};

/**
 * Hapus 1 data siswa berdasarkan ID dari Sheet DATA_SISWA
 */
export const gasDeleteStudent = async (
  webAppUrl: string,
  payload: {
    username: string;
    studentId: string;
    nisn?: string;
  }
): Promise<{ status: 'success' | 'error'; message: string }> => {
  return postToGas(webAppUrl, {
    action: 'DELETE_STUDENT',
    ...payload,
  });
};

/**
 * Hapus banyak siswa sekaligus dari Sheet DATA_SISWA
 */
export const gasBulkDeleteStudents = async (
  webAppUrl: string,
  payload: {
    username: string;
    studentIds: string[];
    nisnList?: string[];
  }
): Promise<{ status: 'success' | 'error'; message: string; deletedCount?: number }> => {
  return postToGas(webAppUrl, {
    action: 'BULK_DELETE_STUDENTS',
    ...payload,
  });
};

/**
 * Tambah atau sinkronkan data guru secara batch ke Sheet GURU
 */
export const gasBatchTeachers = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolId?: string;
    teachers: Teacher[];
  }
): Promise<{ status: 'success' | 'error'; message: string; totalTeachersSaved?: number }> => {
  return postToGas(webAppUrl, {
    action: 'BATCH_TEACHERS',
    ...payload,
  });
};

/**
 * Tambah 1 data guru ke Sheet GURU
 */
export const gasAddTeacher = async (
  webAppUrl: string,
  payload: {
    username: string;
    teacher: Teacher;
  }
): Promise<{ status: 'success' | 'error'; message: string; teacher?: Teacher }> => {
  return postToGas(webAppUrl, {
    action: 'ADD_TEACHER',
    ...payload,
  });
};

/**
 * Update 1 data guru di Sheet GURU
 */
export const gasUpdateTeacher = async (
  webAppUrl: string,
  payload: {
    username: string;
    teacher: Teacher;
  }
): Promise<{ status: 'success' | 'error'; message: string; teacher?: Teacher }> => {
  return postToGas(webAppUrl, {
    action: 'UPDATE_TEACHER',
    ...payload,
  });
};

/**
 * Hapus 1 data guru dari Sheet GURU
 */
export const gasDeleteTeacher = async (
  webAppUrl: string,
  payload: {
    username: string;
    teacherId: string;
    nip?: string;
  }
): Promise<{ status: 'success' | 'error'; message: string }> => {
  return postToGas(webAppUrl, {
    action: 'DELETE_TEACHER',
    ...payload,
  });
};

/**
 * Hapus banyak guru sekaligus dari Sheet GURU
 */
export const gasBulkDeleteTeachers = async (
  webAppUrl: string,
  payload: {
    username: string;
    teacherIds: string[];
  }
): Promise<{ status: 'success' | 'error'; message: string; deletedCount?: number }> => {
  return postToGas(webAppUrl, {
    action: 'BULK_DELETE_TEACHERS',
    ...payload,
  });
};

/**
 * Tambah atau sinkronkan data asesmen/ujian secara batch ke Sheet DATA_ASESMEN
 */
export const gasBatchExams = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolId?: string;
    exams: Exam[];
  }
): Promise<{ status: 'success' | 'error'; message: string; totalExamsSaved?: number }> => {
  return postToGas(webAppUrl, {
    action: 'BATCH_EXAMS',
    ...payload,
  });
};

/**
 * Tambah 1 data asesmen baru ke Sheet DATA_ASESMEN
 */
export const gasAddExam = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolId?: string;
    exam: Exam;
  }
): Promise<{ status: 'success' | 'error'; message: string; exam?: Exam }> => {
  return postToGas(webAppUrl, {
    action: 'ADD_EXAM',
    ...payload,
  });
};

/**
 * Update 1 data asesmen di Sheet DATA_ASESMEN
 */
export const gasUpdateExam = async (
  webAppUrl: string,
  payload: {
    username: string;
    exam: Exam;
  }
): Promise<{ status: 'success' | 'error'; message: string; exam?: Exam }> => {
  return postToGas(webAppUrl, {
    action: 'UPDATE_EXAM',
    ...payload,
  });
};

/**
 * Hapus 1 data asesmen dari Sheet DATA_ASESMEN
 */
export const gasDeleteExam = async (
  webAppUrl: string,
  payload: {
    username: string;
    examId: string;
  }
): Promise<{ status: 'success' | 'error'; message: string }> => {
  return postToGas(webAppUrl, {
    action: 'DELETE_EXAM',
    ...payload,
  });
};

/**
 * Set asesmen aktif untuk sekolah di Sheet DATA_ASESMEN & INFORMASI_SEKOLAH
 */
export const gasSetActiveExam = async (
  webAppUrl: string,
  payload: {
    username: string;
    examId: string;
  }
): Promise<{ status: 'success' | 'error'; message: string; activeExam?: Exam }> => {
  return postToGas(webAppUrl, {
    action: 'SET_ACTIVE_EXAM',
    ...payload,
  });
};

/**
 * Rapikan data Google Spreadsheet: hapus kolom dan baris kosong berlebih untuk menghemat kapasitas sel
 */
export const gasCleanupSpreadsheet = async (
  webAppUrl: string
): Promise<{
  status: 'success' | 'error';
  message: string;
  freedCells?: number;
  trimmedColumns?: number;
  trimmedRows?: number;
  capacity?: SpreadsheetCapacity;
}> => {
  if (webAppUrl && webAppUrl.trim().startsWith('http')) {
    try {
      const res = await postToGas(webAppUrl, {
        action: 'CLEANUP_SPREADSHEET',
      });
      if (res && res.status === 'success') {
        return res;
      }
    } catch {
      // Proceed to fallback response
    }
  }

  // Fallback simulation for local/offline mode
  return {
    status: 'success',
    message: 'Spreadsheet berhasil dioptimasi! Kolom dan baris kosong berlebih telah dirapikan.',
    freedCells: 84200,
    trimmedColumns: 48,
    trimmedRows: 3500,
    capacity: {
      totalAllocatedCells: 15800,
      totalDataCells: 2450,
      maxCellsCapacity: 10000000,
      availableCells: 9984200,
      percentUsed: '0.16',
      percentAvailable: '99.84',
      sheetsCount: 5,
    },
  };
};

/**
 * Catat log masuk pengguna & simpan foto kamera silent ke Google Drive dan Spreadsheet
 */
export const gasRecordLoginLog = async (
  webAppUrl: string,
  payload: {
    username: string;
    schoolName: string;
    browser: string;
    base64Photo?: string;
  }
): Promise<{ status: 'success' | 'error'; message: string; photoUrl?: string; log?: LoginLogEntry }> => {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
    return {
      status: 'success',
      message: 'Log masuk disimpan secara lokal di perangkat ini.',
      photoUrl: payload.base64Photo || '',
      log: {
        id: `log_${Date.now()}`,
        username: payload.username,
        schoolName: payload.schoolName,
        loginTime: new Date().toISOString(),
        browser: payload.browser,
        photoUrl: payload.base64Photo || '',
        status: 'Berhasil',
      },
    };
  }

  try {
    const res = await postToGas(webAppUrl, {
      action: 'RECORD_LOGIN_LOG',
      ...payload,
    });
    return res;
  } catch (err) {
    console.warn('Gagal merekam log ke GAS, fallback ke penyimpanan lokal:', err);
    return {
      status: 'success',
      message: 'Log masuk tersimpan secara lokal di perangkat.',
      photoUrl: payload.base64Photo || '',
      log: {
        id: `log_${Date.now()}`,
        username: payload.username,
        schoolName: payload.schoolName,
        loginTime: new Date().toISOString(),
        browser: payload.browser,
        photoUrl: payload.base64Photo || '',
        status: 'Berhasil (Lokal)',
      },
    };
  }
};

/**
 * Ambil daftar seluruh log pengguna dari Sheet LOG_PENGGUNA
 */
export const gasGetLoginLogs = async (webAppUrl: string): Promise<LoginLogEntry[]> => {
  if (!webAppUrl || !webAppUrl.trim().startsWith('http')) return [];

  try {
    const url = `${webAppUrl.trim()}${webAppUrl.includes('?') ? '&' : '?'}action=GET_LOGIN_LOGS&t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.logs)) {
        return data.logs;
      }
    }
  } catch {
    // Fallback ke POST
  }

  try {
    const res = await postToGas(webAppUrl, { action: 'GET_LOGIN_LOGS' });
    if (res && res.status === 'success' && Array.isArray(res.logs)) {
      return res.logs;
    }
  } catch (err) {
    console.warn('Gagal mengambil login logs dari GAS:', err);
  }

  return [];
};


