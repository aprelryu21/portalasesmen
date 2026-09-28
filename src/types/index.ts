export type Gender = 'L' | 'P';

export interface School {
  id: string;
  name: string;
  npsn: string;
  nss?: string;
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  logoUrl: string;
  principalSignatureUrl?: string; // Foto / Scan Tanda Tangan Kepala Sekolah
  principalName: string;
  principalNip: string;
  headTitle: string; // e.g. "Kepala Sekolah"
}

export interface Exam {
  id: string;
  name: string; // e.g. "ASESMEN SUMATIF AKHIR SEMESTER (ASAS)"
  semester: string; // e.g. "Semester Ganjil"
  academicYear: string; // e.g. "2026/2027"
  dateText: string; // e.g. "01 - 08 Desember 2026"
  location: string; // e.g. "Kediri"
  signatureDate?: string; // Tanggal titimangsa / tandatangan kartu (misal: "01 Desember 2026")
  scheduleInfo?: string; // Jadwal pelaksanaan asesmen (Hari, Waktu, Mapel)
  extraNote: string; // e.g. "Harap membawa kartu ini dan perlengkapan ujian setiap hari."
  isActive?: boolean;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: Gender;
  religion?: string; // 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu'
  className: string;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  photoUrl?: string;
  examRoom?: string;
  examSeat?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  nip: string; // NIP atau NUPTK
  name: string; // Nama Lengkap beserta Gelar
  gender: Gender;
  religion?: string;
  subject: string; // Mata Pelajaran atau Jabatan
  phone?: string;
  email?: string;
  roleType?: 'pengawas' | 'panitia' | 'guru' | 'wali_kelas' | 'proktor' | 'teknisi' | 'kepala_sekolah' | 'guru_kelas' | 'guru_mapel';
  roomDuty?: string; // Ruang Ujian yang diawasi (misal Ruang 01)
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplatePreset =
  | 'neobrutal'
  | 'modern'
  | 'classic'
  | 'madrasah'
  | 'cyber'
  | 'royal'
  | 'minimalist'
  | 'aurora'
  | 'vintage'
  | 'corporate'
  | 'playful'
  | 'crimson'
  | 'dark'
  | 'indigo'
  | 'coral'
  | 'violet';

export interface GuestCardData {
  id: string;
  label: string; // Teks Label, misal: TAMU & MONITORING EVALUASI UJIAN
  name: string; // Nama Tamu
  nip: string; // NIP Tamu / NIK
  position: string; // Jabatan Tamu / Instansi
  gender: Gender; // Jenis Kelamin 'L' | 'P'
  photoUrl?: string; // Foto Tamu
}

export interface CardDesignSettings {
  templatePreset: TemplatePreset;
  presetSize: 'standard' | 'idcard' | 'large' | 'custom';
  widthMm: number; // default: 95mm
  heightMm: number; // default: 65mm
  cardOrientation?: 'landscape' | 'portrait'; // orientasi kartu: Lanskap (Horizontal) vs Potret (Vertikal)
  themeBaseColor?: string; // Kustomisasi warna dasar tema pilihan
  
  // Header
  showLogo: boolean;
  logoSizeMm: number; // default: 14mm
  logoPosition: 'left' | 'center';
  showSchoolName: boolean;
  showNpsn: boolean;
  showExamName: boolean;
  showSemesterYear: boolean;
  headerBgColor: string;
  headerTextColor: string;

  // Colors & Theme
  accentColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  borderWidthPx: number;
  borderRadiusPx: number;
  showBorder: boolean;
  showShadow: boolean;
  shadowColor: string;

  // Student Info
  showStudentName?: boolean;
  showPhoto: boolean;
  photoWidthMm: number; // default 22mm
  photoHeightMm: number; // default 28mm
  photoShape: 'square' | 'rounded' | 'circle';
  photoBorder: boolean;
  showNisn: boolean;
  showNis: boolean;
  showClass: boolean;
  showGender?: boolean;
  showBirthDate: boolean;
  showRoomSeat: boolean;
  showReligion?: boolean;

  // QR Code
  showQrCode: boolean;
  qrSizeMm: number; // default 16mm

  // Footer & Signature
  showFooter: boolean;
  showPrincipalSign: boolean;
  signatureType?: 'qr' | 'digital'; // Opsi TTD: QR Code vs Digital (Foto/Scan TTD)
  principalTitle: string;
  showDateLocation: boolean;
  showSignatureSpace: boolean;
  customRulesNote: string;
}

export interface PrintSettings {
  paperSize: 'A4';
  orientation: 'portrait' | 'landscape';
  layoutMode: '1_col' | '2_col'; // 1 baris x 1 kartu OR 1 baris x 2 kartu
  marginMm: number; // 8 - 15mm
  spacingMm: number; // 4 - 8mm
  showCropMarks: boolean;
  showCutLines: boolean;
}

export interface ImportValidationRow {
  rowNumber: number;
  data: Partial<Student>;
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface ImportValidationResult {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: ImportValidationRow[];
}

export interface TeacherImportValidationRow {
  rowNumber: number;
  data: Partial<Teacher>;
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface TeacherImportValidationResult {
  totalRows: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  rows: TeacherImportValidationRow[];
}

export type UserRole = 'admin' | 'operator';

export interface LoginLogEntry {
  id: string;
  username: string;
  schoolName: string;
  loginTime: string; // ISO string or formatted timestamp
  browser: string; // e.g. "Chrome 122 (Windows 11)"
  photoUrl?: string; // Captured photo (Drive URL or base64 data)
  status?: string; // e.g. "Berhasil"
  ipAddress?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  schoolName: string;
  npsn: string;
  role: UserRole;
  status?: 'active' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

export interface PosterDesignSettings {
  styleId: PosterStyleId;
  orientation: PosterOrientation;
  watermarkOpacity: number; // 10 - 30 %
  showSchoolAddressInFooter: boolean;
  updatedAt?: string;
}

export type PosterStyleId =
  | 'neobrutal'
  | 'modern'
  | 'hazard'
  | 'classic_academic'
  | 'playful_friendly';

export type PosterOrientation = 'portrait' | 'landscape';

export interface AnswerSheetKopSettings {
  showLogo: boolean;
  logoUrl?: string;
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
}

export interface AnswerSheetIdentitySettings {
  title: string;
  examTitle: string;
  yearTitle: string;
  scoreLabel: string;
  nameLabel: string;
  classLabel: string;
  subjectLabel: string;
  dateLabel: string;
}

export type AnswerSheetPgCount = 10 | 15 | 20 | 25 | 50;
export type AnswerSheetIsianCount = 5 | 10 | 15 | 20;
export type AnswerSheetUraianCount = 5 | 10;

export interface AnswerSheetQuestionsSettings {
  enablePg: boolean;
  pgCount: AnswerSheetPgCount;
  pgOptions: 'ABCD' | 'ABCDE';
  pgLayout?: '5_rows' | '10_rows';
  enableIsian: boolean;
  isianCount: AnswerSheetIsianCount;
  enableUraian: boolean;
  uraianCount: AnswerSheetUraianCount;
  uraianRowsPerNumber: number;
}

export type AnswerSheetTemplateStyle = 'classic' | 'modern' | 'geometric' | 'elegant' | 'compact';

export interface AnswerSheetDesignSettings {
  kop: AnswerSheetKopSettings;
  identity: AnswerSheetIdentitySettings;
  questions: AnswerSheetQuestionsSettings;
  fontFamily: 'serif' | 'sans';
  templateStyle?: AnswerSheetTemplateStyle;
  updatedAt?: string;
}

export interface UserSchoolData {
  school: School;
  exam: Exam;
  exams?: Exam[];
  students: Student[];
  teachers?: Teacher[];
  cardDesign: CardDesignSettings;
  posterDesign?: PosterDesignSettings;
  answerSheetDesign?: AnswerSheetDesignSettings;
  printSettings: PrintSettings;
  selectedStudentIds: string[];
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  lastSyncedAt?: string;
  isConnected: boolean;
}



