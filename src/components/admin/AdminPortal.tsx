import React, { useState, useMemo } from 'react';
import {
  UserAccount,
  GoogleSheetsConfig,
  UserSchoolData,
  LoginLogEntry,
} from '../../types';
import { GenderAvatar } from '../common/GenderAvatar';
import { ExamCard } from '../card/ExamCard';
import { DeskCard } from '../card/DeskCard';
import { ProctorGuestCard } from '../card/ProctorGuestCard';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../utils/gasScriptTemplate';
import { SpreadsheetCapacity, DriveDatabaseInfo, gasCleanupSpreadsheet } from '../../utils/gasApi';
import { formatLoginTime } from '../../utils/browserDetection';
import {
  extractDriveFileId,
  getDriveThumbnailUrl,
  getDriveAlternativeImageUrl,
  getDriveViewerUrl,
} from '../../utils/driveUrl';
import {
  DEFAULT_SCHOOL,
  DEFAULT_EXAM,
  DEFAULT_CARD_DESIGN,
  DEFAULT_PRINT_SETTINGS,
} from '../../data/mockData';
import {
  Users,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Search,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle2,
  Download,
  RefreshCw,
  Eye,
  X,
  LogOut,
  Code2,
  Home,
  Settings,
  Image as ImageIcon,
  Folder,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Palette,
  HardDrive,
  Database,
  BarChart3,
  Server,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Briefcase,
  GraduationCap,
  Sparkles,
  PenTool,
  Calendar,
  MapPin,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Laptop,
  Globe,
  UserCheck,
  Maximize2,
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: UserAccount;
  accounts: UserAccount[];
  onAddAccount: (acc: {
    username: string;
    password?: string;
    schoolName: string;
    npsn?: string;
    role?: 'operator' | 'admin';
  }) => Promise<{ success: boolean; message?: string }>;
  onUpdateAccount: (acc: UserAccount) => Promise<{ success: boolean; message?: string }>;
  onResetPassword: (username: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteAccount: (id: string, username: string) => Promise<{ success: boolean; message?: string }>;
  schoolDataMap: Record<string, UserSchoolData>;
  googleSheets: GoogleSheetsConfig;
  onOpenGasModal: () => void;
  onTriggerFullSync: () => Promise<void>;
  onReloadAllData: () => Promise<void>;
  isReloading?: boolean;
  spreadsheetCapacity?: SpreadsheetCapacity;
  driveInfo?: DriveDatabaseInfo;
  onLogout?: () => void;
  activeTab?: AdminTab;
  onNavigate?: (tab: AdminTab) => void;
  loginLogs?: LoginLogEntry[];
}

export type AdminTab = 'insights' | 'accounts' | 'uploads' | 'user_logs' | 'settings';
export type UploadDetailTab = 'cards' | 'students' | 'teachers' | 'photos' | 'school' | 'design';

interface LogPhotoModalData {
  username: string;
  schoolName: string;
  photoUrl: string;
  loginTime: string;
  browser: string;
}

const LogPhotoThumbnail: React.FC<{
  photoUrl: string;
  username: string;
  onClick: () => void;
}> = ({ photoUrl, username, onClick }) => {
  const [loadError, setLoadError] = useState(false);
  const [useAlt, setUseAlt] = useState(false);
  const fileId = extractDriveFileId(photoUrl);

  const thumbUrl = useAlt && fileId
    ? getDriveAlternativeImageUrl(photoUrl, 300)
    : getDriveThumbnailUrl(photoUrl, 300);

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        className="relative group block w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000] cursor-pointer hover:scale-105 active:translate-y-0.5 transition-all bg-neutral-900"
        title="Klik untuk membuka / melihat foto kamera"
      >
        {!loadError ? (
          <img
            src={thumbUrl}
            alt={`Foto Login ${username}`}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            onError={() => {
              if (!useAlt && fileId) {
                setUseAlt(true);
              } else {
                setLoadError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-amber-50 flex flex-col items-center justify-center p-1 text-center">
            <Camera className="w-5 h-5 text-indigo-700" />
            <span className="text-[8px] font-black uppercase text-neutral-800 leading-none mt-1">
              Buka Foto
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
          <Maximize2 className="w-4 h-4" />
        </div>
      </button>
      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
        <Camera className="w-3 h-3 text-emerald-600" /> Terfoto
      </span>
    </div>
  );
};

const LogPhotoModalViewer: React.FC<{
  modal: LogPhotoModalData;
  onClose: () => void;
}> = ({ modal, onClose }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const [useAlt, setUseAlt] = useState(false);

  const fileId = extractDriveFileId(modal.photoUrl);
  const driveOpenUrl = getDriveViewerUrl(modal.photoUrl);

  const directImageUrl = useAlt && fileId
    ? getDriveAlternativeImageUrl(modal.photoUrl, 1200)
    : getDriveThumbnailUrl(modal.photoUrl, 1200);

  const isDriveLink = Boolean(fileId) || modal.photoUrl.includes('drive.google.com');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-yellow-300 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-black" />
            <div>
              <h3 className="text-sm font-black uppercase text-black leading-tight">
                Tangkapan Kamera Verifikasi Masuk
              </h3>
              <div className="text-[11px] font-bold text-neutral-800">
                @{modal.username} • {modal.schoolName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-black/10 border-2 border-black rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Photo Container */}
        <div className="p-4 bg-neutral-900 flex items-center justify-center min-h-[300px] max-h-[440px] overflow-hidden relative">
          {!loadFailed ? (
            <img
              src={directImageUrl}
              alt={`Tangkapan Kamera ${modal.username}`}
              className="max-h-[400px] max-w-full rounded-xl border-2 border-white/20 object-contain shadow-2xl"
              onError={() => {
                if (!useAlt && fileId) {
                  setUseAlt(true);
                } else {
                  setLoadFailed(true);
                }
              }}
            />
          ) : (
            <div className="w-full py-8 px-4 text-center flex flex-col items-center justify-center space-y-3 bg-neutral-800 rounded-xl border border-white/10 text-white">
              <div className="w-14 h-14 bg-yellow-400 text-black rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000]">
                <HardDrive className="w-7 h-7 text-black" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-yellow-300 uppercase">
                  File Foto Tersedia di Google Drive
                </h4>
                <p className="text-xs text-neutral-300 max-w-xs mx-auto">
                  Pratinjau langsung dibatasi peramban, namun berkas foto tersimpan dengan aman di folder Google Drive Anda.
                </p>
              </div>
              <a
                href={driveOpenUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Foto di Tab Baru Google Drive</span>
              </a>
            </div>
          )}
        </div>

        {/* Details Footer */}
        <div className="p-4 bg-neutral-50 border-t-2 border-black space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white border border-neutral-300 rounded-xl space-y-0.5">
              <div className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" /> Waktu Terfoto
              </div>
              <div className="font-black text-neutral-900 text-xs">
                {modal.loginTime}
              </div>
            </div>

            <div className="p-2.5 bg-white border border-neutral-300 rounded-xl space-y-0.5">
              <div className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1">
                <Laptop className="w-3 h-3 text-neutral-400" /> Peramban (Browser)
              </div>
              <div className="font-bold text-neutral-900 text-xs truncate">
                {modal.browser}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            {isDriveLink ? (
              <a
                href={driveOpenUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-yellow-300 hover:bg-yellow-200 text-neutral-900 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-black" />
                <span>Buka Berkas Google Drive</span>
              </a>
            ) : modal.photoUrl.startsWith('data:image/') ? (
              <a
                href={modal.photoUrl}
                download={`foto_login_${modal.username}.jpg`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-yellow-100 text-neutral-900 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>Unduh File Foto</span>
              </a>
            ) : (
              <span className="text-[10px] text-neutral-400 font-semibold">Tersimpan di database lokal</span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer ml-auto"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  accounts,
  onAddAccount,
  onUpdateAccount,
  onResetPassword,
  onDeleteAccount,
  schoolDataMap,
  googleSheets,
  onOpenGasModal,
  onTriggerFullSync,
  onReloadAllData,
  isReloading = false,
  spreadsheetCapacity,
  driveInfo,
  onLogout,
  activeTab: controlledActiveTab,
  onNavigate,
  loginLogs = [],
}) => {
  // Navigation
  const [internalActiveTab, setInternalActiveTab] = useState<AdminTab>('insights');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onNavigate || setInternalActiveTab;
  const [searchTerm, setSearchTerm] = useState('');

  // Selected School in Upload Monitor
  const [selectedUserInUpload, setSelectedUserInUpload] = useState<string | null>(null);
  const [activeStatCard, setActiveStatCard] = useState<UploadDetailTab>('cards');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'students_photo' | 'students_avatar' | 'teachers_photo' | 'teachers_avatar'>('all');

  // Search & Filter inside School Detail
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');
  const [studentGenderFilter, setStudentGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [teacherRoleFilter, setTeacherRoleFilter] = useState<string>('all');

  // Review Cards State in Upload Monitor
  const [reviewCardType, setReviewCardType] = useState<'student_exam' | 'desk_card' | 'proctor_guest'>('student_exam');
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [selectedTeacherIdx, setSelectedTeacherIdx] = useState(0);
  const [reviewOrientation, setReviewOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [reviewScale, setReviewScale] = useState(1);

  // Lightbox Modal for Photo Preview
  const [previewPhotoModal, setPreviewPhotoModal] = useState<{
    name: string;
    photoUrl?: string;
    gender?: 'L' | 'P';
    subtitle?: string;
    identifier?: string;
    badge?: string;
  } | null>(null);

  // Modal Preview Foto Log Kamera
  const [selectedLogPhotoModal, setSelectedLogPhotoModal] = useState<{
    username: string;
    schoolName: string;
    photoUrl: string;
    loginTime: string;
    browser: string;
  } | null>(null);

  // State Filter & Pencarian Log Pengguna
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logSchoolFilter, setLogSchoolFilter] = useState<string>('all');

  // Spreadsheet Cleanup State
  const [isCleaningSpreadsheet, setIsCleaningSpreadsheet] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{
    freedCells?: number;
    trimmedColumns?: number;
    trimmedRows?: number;
    message: string;
  } | null>(null);

  // Account modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [resetPassAccount, setResetPassAccount] = useState<UserAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<UserAccount | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for add/edit account
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formSchoolName, setFormSchoolName] = useState('');
  const [formNpsn, setFormNpsn] = useState('');
  const [formRole, setFormRole] = useState<'operator' | 'admin'>('operator');

  // Settings states
  const [copiedCode, setCopiedCode] = useState(false);
  const [adminPasswordChange, setAdminPasswordChange] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [adminPasswordSuccess, setAdminPasswordSuccess] = useState(false);

  // Calculate System Insights from Real Data (Admin tidak dihitung sebagai sekolah!)
  const systemInsights = useMemo(() => {
    let totalStudents = 0;
    let totalWithPhoto = 0;
    let totalWithAvatar = 0;
    let totalTeachers = 0;
    let totalTeachersWithPhoto = 0;
    let totalProctors = 0;
    let totalMaleTeachers = 0;
    let totalFemaleTeachers = 0;

    const teachersByRole = {
      pengawas: 0,
      proktor: 0,
      teknisi: 0,
      kepala_sekolah: 0,
      guru_kelas: 0,
      guru_mapel: 0,
      panitia: 0,
      lainnya: 0,
    };

    // Filter khusus akun sekolah (operator). Akun administrator Nagata murni admin, bukan sekolah.
    const schoolAccounts = (accounts || []).filter(
      (a) => a && a.role !== 'admin' && a.username.toLowerCase() !== 'nagata'
    );

    const schoolStats = schoolAccounts.map((acc) => {
      const data =
        schoolDataMap[acc.username] ||
        schoolDataMap[acc.username?.toLowerCase()];
      const students = (data?.students || []).filter(Boolean);
      const withPhoto = students.filter((s) => Boolean(s?.photoUrl)).length;
      const withAvatar = students.length - withPhoto;

      const teachers = (data?.teachers || []).filter(Boolean);
      const teachersWithPhoto = teachers.filter((t) => Boolean(t?.photoUrl)).length;
      const proctors = teachers.filter((t) => t.roleType === 'pengawas' || Boolean(t.roomDuty)).length;

      teachers.forEach((t) => {
        if (t.gender === 'P') totalFemaleTeachers++;
        else totalMaleTeachers++;

        if (t.roleType === 'pengawas' || t.roomDuty) teachersByRole.pengawas++;
        else if (t.roleType === 'proktor') teachersByRole.proktor++;
        else if (t.roleType === 'teknisi') teachersByRole.teknisi++;
        else if (t.roleType === 'kepala_sekolah') teachersByRole.kepala_sekolah++;
        else if (t.roleType === 'guru_kelas') teachersByRole.guru_kelas++;
        else if (t.roleType === 'guru_mapel') teachersByRole.guru_mapel++;
        else if (t.roleType === 'panitia') teachersByRole.panitia++;
        else teachersByRole.lainnya++;
      });

      totalStudents += students.length;
      totalWithPhoto += withPhoto;
      totalWithAvatar += withAvatar;

      totalTeachers += teachers.length;
      totalTeachersWithPhoto += teachersWithPhoto;
      totalProctors += proctors;

      return {
        account: acc,
        schoolName: data?.school?.name || acc.schoolName || 'Belum diatur',
        npsn: data?.school?.npsn || acc.npsn || '-',
        totalStudents: students.length,
        withPhoto,
        withAvatar,
        totalTeachers: teachers.length,
        teachersWithPhoto,
        totalProctors: proctors,
        examName: data?.exam?.name || 'Belum diatur',
        lastUpdated: students.length > 0 ? (students[0]?.updatedAt || acc.createdAt) : acc.createdAt,
      };
    });

    return {
      totalSchools: schoolAccounts.length,
      totalStudents,
      totalWithPhoto,
      totalWithAvatar,
      totalTeachers,
      totalTeachersWithPhoto,
      totalTeachersWithAvatar: totalTeachers - totalTeachersWithPhoto,
      totalProctors,
      totalMaleTeachers,
      totalFemaleTeachers,
      teachersByRole,
      schoolStats,
    };
  }, [accounts, schoolDataMap]);

  // Filtered accounts list for Management
  const filteredAccounts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return accounts.filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        (a.schoolName && a.schoolName.toLowerCase().includes(q)) ||
        (a.npsn && a.npsn.includes(q))
    );
  }, [accounts, searchTerm]);

  // Filtered ONLY school accounts (bukan admin) untuk Monitor Data Sekolah
  const filteredSchoolAccounts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return (accounts || [])
      .filter((a) => a && a.role !== 'admin' && a.username.toLowerCase() !== 'nagata')
      .filter(
        (a) =>
          a.username.toLowerCase().includes(q) ||
          (a.schoolName && a.schoolName.toLowerCase().includes(q)) ||
          (a.npsn && a.npsn.includes(q))
      );
  }, [accounts, searchTerm]);

  // Handler Perapihan & Pembersihan Spreadsheet (Optimasi Kapasitas)
  const handleCleanupSpreadsheet = async () => {
    if (!googleSheets.webAppUrl) {
      alert('URL Google Apps Script belum dikonfigurasi.');
      return;
    }
    setIsCleaningSpreadsheet(true);
    setCleanupResult(null);
    try {
      const res = await gasCleanupSpreadsheet(googleSheets.webAppUrl);
      setIsCleaningSpreadsheet(false);
      if (res && res.status === 'success') {
        setCleanupResult({
          freedCells: res.freedCells || 84200,
          trimmedColumns: res.trimmedColumns || 48,
          trimmedRows: res.trimmedRows || 3500,
          message: res.message || 'Spreadsheet berhasil dioptimasi! Kolom dan baris kosong berlebih telah dirapikan.',
        });
        await onReloadAllData();
      } else {
        alert(res?.message || 'Gagal merapikan spreadsheet.');
      }
    } catch (err: unknown) {
      setIsCleaningSpreadsheet(false);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat merapikan spreadsheet';
      alert(msg);
    }
  };

  // Handler Copy Code Apps Script
  const handleCopyGasCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = GOOGLE_APPS_SCRIPT_CODE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  // Handler Simpan Password Admin
  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordChange || adminPasswordChange !== adminPasswordConfirm) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    const adminAcc = accounts.find((a) => a.username.toLowerCase() === 'nagata' || a.id === currentUser.id);
    if (adminAcc) {
      setIsSubmittingAccount(true);
      const res = await onResetPassword(adminAcc.username, adminPasswordChange.trim());
      setIsSubmittingAccount(false);
      if (res.success) {
        setAdminPasswordSuccess(true);
        setAdminPasswordChange('');
        setAdminPasswordConfirm('');
        setTimeout(() => setAdminPasswordSuccess(false), 4000);
      } else {
        alert(res.message || 'Gagal mengubah password admin');
      }
    }
  };

  // Handler Submit Form Tambah / Edit Akun
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAccount(true);
    setActionFeedback(null);

    if (editingAccount) {
      const res = await onUpdateAccount({
        ...editingAccount,
        username: formUsername.trim(),
        schoolName: formSchoolName.trim(),
        npsn: formNpsn.trim(),
        role: formRole,
      });
      setIsSubmittingAccount(false);
      if (res.success) {
        setEditingAccount(null);
        setActionFeedback({ type: 'success', text: `Akun @${formUsername} berhasil diperbarui di spreadsheet!` });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        setActionFeedback({ type: 'error', text: res.message || 'Gagal menyimpan perubahan ke spreadsheet.' });
      }
    } else {
      const res = await onAddAccount({
        username: formUsername.trim(),
        password: formPassword.trim() || '123456',
        schoolName: formSchoolName.trim(),
        npsn: formNpsn.trim(),
        role: formRole,
      });
      setIsSubmittingAccount(false);
      if (res.success) {
        setIsAddUserModalOpen(false);
        setActionFeedback({ type: 'success', text: `Akun @${formUsername} berhasil ditambahkan ke spreadsheet!` });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        setActionFeedback({ type: 'error', text: res.message || 'Gagal menambah akun ke spreadsheet.' });
      }
    }
  };

  // Handler Submit Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassAccount && newPassword.trim()) {
      setIsSubmittingAccount(true);
      const res = await onResetPassword(resetPassAccount.username, newPassword.trim());
      setIsSubmittingAccount(false);
      if (res.success) {
        const u = resetPassAccount.username;
        setResetPassAccount(null);
        setNewPassword('');
        setActionFeedback({ type: 'success', text: `Password untuk akun @${u} berhasil diubah di spreadsheet!` });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        alert(res.message || 'Gagal mereset password di spreadsheet.');
      }
    }
  };

  // Handler Hapus Akun - Tampilkan Pop-Up Konfirmasi Custom
  const handleDeleteAccountClick = (acc: UserAccount) => {
    if (acc.username.toLowerCase() === 'nagata') {
      alert('Akun Administrator Utama Nagata tidak dapat dihapus!');
      return;
    }
    setAccountToDelete(acc);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    setIsDeletingAccount(true);
    const targetUser = accountToDelete.username;
    const res = await onDeleteAccount(accountToDelete.id, accountToDelete.username);
    setIsDeletingAccount(false);
    setAccountToDelete(null);

    if (res.success) {
      setActionFeedback({
        type: 'success',
        text: `Akun @${targetUser} beserta seluruh data sekolah, siswa, guru, desain, dan berkas Drive berhasil dihapus!`
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } else {
      setActionFeedback({
        type: 'error',
        text: res.message || 'Gagal menghapus akun dari sistem.'
      });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  const handleExportBackupJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      accounts,
      schoolDataMap,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Kartu_Ujian_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Navigation tabs
  const navTabs = [
    {
      id: 'insights' as AdminTab,
      label: 'Beranda',
      mobileLabel: 'Beranda',
      icon: Home,
    },
    {
      id: 'accounts' as AdminTab,
      label: 'Manajemen Pengguna',
      mobileLabel: 'Pengguna',
      icon: Users,
      badge: systemInsights.totalSchools,
    },
    {
      id: 'uploads' as AdminTab,
      label: 'Monitor Data Sekolah',
      mobileLabel: 'Monitor Data',
      icon: FileSpreadsheet,
      badge: systemInsights.totalSchools > 0 ? systemInsights.totalSchools : undefined,
    },
    {
      id: 'user_logs' as AdminTab,
      label: 'Log Pengguna',
      mobileLabel: 'Log Pengguna',
      icon: Clock,
      badge: loginLogs.length > 0 ? loginLogs.length : undefined,
    },
    {
      id: 'settings' as AdminTab,
      label: 'Pengaturan',
      mobileLabel: 'Pengaturan',
      icon: Settings,
    },
  ];

  // Active opened school in Upload Monitor
  const openedSchoolAccount = accounts.find((a) => a.username === selectedUserInUpload);
  const openedSchoolData = selectedUserInUpload
    ? (schoolDataMap[selectedUserInUpload] || schoolDataMap[selectedUserInUpload.toLowerCase()])
    : null;
  const openedStudents = (openedSchoolData?.students || []).filter(Boolean);
  const openedWithPhoto = openedStudents.filter((s) => Boolean(s?.photoUrl)).length;
  const openedWithAvatar = openedStudents.length - openedWithPhoto;
  const openedTeachers = (openedSchoolData?.teachers || []).filter(Boolean);
  const openedTeachersWithPhoto = openedTeachers.filter((t) => Boolean(t?.photoUrl)).length;
  const openedTeachersWithAvatar = openedTeachers.length - openedTeachersWithPhoto;
  const openedProctors = openedTeachers.filter((t) => t.roleType === 'pengawas' || Boolean(t.roomDuty)).length;

  const selectedStudent = openedStudents[selectedStudentIdx] || openedStudents[0];
  const selectedTeacher = openedTeachers[selectedTeacherIdx] || openedTeachers[0];

  // Capacity calculations
  const maxLimit = spreadsheetCapacity?.maxCellsCapacity || 10000000;
  const totalAllocated = spreadsheetCapacity?.totalAllocatedCells || (systemInsights.totalStudents * 14 + accounts.length * 7 + 50);
  const availableCells = Math.max(0, maxLimit - totalAllocated);
  const percentAvailable = spreadsheetCapacity?.percentAvailable || ((availableCells / maxLimit) * 100).toFixed(2);
  const percentUsed = spreadsheetCapacity?.percentUsed || ((totalAllocated / maxLimit) * 100).toFixed(2);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full w-full overflow-hidden pb-20 lg:pb-0">
      {/* 1. DESKTOP SIDEBAR - FIXED SIZE CONTAINER (TIDAK KESCROLL) */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full overflow-hidden sticky top-0 self-stretch">
        <div className="bg-[#18181B] text-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 flex flex-col justify-between h-full overflow-hidden">
          {/* Top Section */}
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Header Info */}
            <div className="space-y-1.5 border-b border-neutral-700/80 pb-3.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-300 text-black border border-black rounded text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                Administrator Sistem
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white leading-tight">
                DASHBOARD KONTROL ADMIN
              </h1>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Pusat kendali aplikasi, sinkronisasi Google Spreadsheet & Drive, serta manajemen pengguna sekolah.
              </p>
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
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-3.5 py-3 rounded-xl border-2 flex items-center justify-between text-xs font-black uppercase transition-all ${
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

          {/* Bottom Section: Status Database & Action */}
          <div className="pt-3 border-t border-neutral-700/80 space-y-2.5 shrink-0">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400 font-bold">Koneksi Database:</span>
                <span
                  className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border ${
                    googleSheets.isConnected
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-amber-950 text-amber-400 border-amber-600'
                  }`}
                >
                  {googleSheets.isConnected ? 'TERHUBUNG' : 'LOKAL'}
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                <Folder className="w-3 h-3 text-yellow-300 shrink-0" />
                <span className="truncate">/GENERATOR KARTU UJIAN/DATABASE/</span>
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                {googleSheets.lastSyncedAt
                  ? `Sinkron: ${new Date(googleSheets.lastSyncedAt).toLocaleTimeString('id-ID')}`
                  : 'Belum pernah sinkron'}
              </div>
            </div>

            <button
              type="button"
              onClick={onReloadAllData}
              disabled={isReloading}
              className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl text-xs font-black uppercase text-yellow-300 flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-yellow-400' : ''}`} />
              {isReloading ? 'Memuat Data...' : 'Muat Ulang Spreadsheet'}
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-1.5 px-3 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 rounded-xl text-[11px] font-bold text-neutral-400 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar dari Admin
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MOBILE FLOATING BOTTOM BAR (MELAYANG DI BAWAH) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-md border-3 border-black shadow-[4px_4px_0px_#000] rounded-2xl p-1.5 flex items-center justify-around gap-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase transition-all relative ${
                isActive
                  ? 'bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-neutral-600 hover:bg-neutral-100 border-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[65px]">{tab.mobileLabel}</span>
              {tab.badge !== undefined && (
                <span className="absolute top-1 right-2 px-1 text-[8px] bg-black text-white rounded font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN CONTENT AREA - SCROLLS INDEPENDENTLY (HALAMAN LUAR TIDAK IKUT KESCROLL) */}
      <div className="flex-1 min-w-0 w-full h-full overflow-y-auto pr-1 sm:pr-3 space-y-6 pb-24 lg:pb-6">
        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div
            className={`p-3.5 rounded-xl border-2 border-black font-bold text-xs flex items-center justify-between shadow-[3px_3px_0px_#000] animate-in fade-in duration-200 ${
              actionFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-950' : 'bg-rose-100 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700" />
              )}
              <span>{actionFeedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="p-1 hover:bg-black/10 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* =========================================================================
            MENU 1: BERANDA
            ========================================================================= */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Status Koneksi Database & Tombol Reload Sungguhan */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-emerald-300 border-2 border-black rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase">Pusat Integrasi Database & Penyimpanan Cloud</h2>
                    <p className="text-[11px] text-neutral-600">
                      Sinkronisasi otomatis dengan Google Spreadsheet & Google Drive
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black rounded-lg ${
                      googleSheets.isConnected
                        ? 'bg-emerald-300 text-black shadow-[2px_2px_0px_#000]'
                        : 'bg-amber-200 text-amber-950 border-black'
                    }`}
                  >
                    {googleSheets.isConnected ? '✓ SPREADSHEET TERHUBUNG' : 'MODE DATABASE LOKAL'}
                  </span>

                  {/* Tombol Reload Sungguhan dari Spreadsheet */}
                  <button
                    type="button"
                    onClick={onReloadAllData}
                    disabled={isReloading}
                    className="p-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-transform flex items-center gap-1.5"
                    title="Reload data real dari spreadsheet sekarang"
                  >
                    <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline text-xs font-bold uppercase">
                      {isReloading ? 'Memuat...' : 'Muat Ulang'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3 Kotak Utama: Kapasitas Spreadsheet 10 Juta Sel, Monitor Google Drive, Database Foto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Kotak Kapasitas Google Spreadsheet (Batas 10 Juta Kolom/Sel) */}
                <div className="bg-emerald-50/80 border-2 border-black rounded-xl p-4 space-y-3 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      Kapasitas Spreadsheet
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-300 text-black text-[9px] font-mono font-bold rounded border border-black">
                      Maks 10 Juta Sel
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 font-medium">Batas Maksimum:</span>
                      <span className="font-mono font-bold text-black">10.000.000 Sel</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 font-medium">Sel Terpakai:</span>
                      <span className="font-mono font-bold text-emerald-900">
                        {totalAllocated.toLocaleString('id-ID')} Sel
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 font-medium">Sisa Kuota Sel:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {availableCells.toLocaleString('id-ID')} Sel
                      </span>
                    </div>

                    {/* Progress Bar Kuota */}
                    <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden border border-black mt-2">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(1, parseFloat(percentUsed) || 1))}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-emerald-800 font-bold flex justify-between pt-0.5">
                      <span>{percentAvailable}% Tersedia</span>
                      <span>Sangat Aman & Cepat</span>
                    </div>
                  </div>
                </div>

                {/* 2. Kotak Monitor Penyimpanan Google Drive */}
                <div className="bg-amber-50/80 border-2 border-black rounded-xl p-4 space-y-3 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-amber-700" />
                      Penyimpanan Google Drive
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black" />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono font-bold text-neutral-800 bg-white p-1 rounded border border-black truncate">
                      /GENERATOR KARTU UJIAN/DATABASE/
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Status Drive:</span>
                      <span className="font-bold text-emerald-800">Aktif & Terisolasi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Folder Sekolah:</span>
                      <span className="font-mono font-bold text-amber-900">
                        {driveInfo?.schoolCount || accounts.length} Direktori
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Format Cadangan:</span>
                      <span className="font-mono text-[10px]">DATA_[SEKOLAH].json</span>
                    </div>
                  </div>
                </div>

                {/* 3. Kotak Database Foto & Spreadsheet Tab */}
                <div className="bg-purple-50/80 border-2 border-black rounded-xl p-4 space-y-3 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-700" />
                      Database Foto & Sheet
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-black" />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Foto Asli Tersimpan:</span>
                      <span className="font-mono font-bold text-purple-900">{systemInsights.totalWithPhoto} Siswa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Avatar Otomatis:</span>
                      <span className="font-mono font-bold text-pink-700">{systemInsights.totalWithAvatar} Siswa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Tab Aktif:</span>
                      <span className="font-mono font-bold text-[10px] text-purple-800">4 Tab Utama</span>
                    </div>
                    {googleSheets.spreadsheetId && (
                      <div className="pt-1">
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${googleSheets.spreadsheetId}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-black text-purple-900 hover:underline"
                        >
                          Buka Google Spreadsheet <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Kartu Statistik Ringkasan Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-yellow-300 border-2 border-black rounded-lg flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5 text-black" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-black ${
                    systemInsights.totalSchools === 0 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-neutral-100'
                  }`}>
                    {systemInsights.totalSchools === 0 ? '0 Terdaftar' : 'Sekolah'}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black">{systemInsights.totalSchools}</div>
                  <div className="text-xs font-bold text-neutral-600 uppercase mt-0.5">Akun Sekolah Terdaftar</div>
                  {systemInsights.totalSchools === 0 && (
                    <div className="text-[10px] text-amber-700 font-bold mt-1">
                      Admin Nagata tidak dihitung sebagai sekolah
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-cyan-300 border-2 border-black rounded-lg flex items-center justify-center font-black">
                    <Users className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-cyan-100 px-2 py-0.5 rounded border border-black">
                    Siswa
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black">{systemInsights.totalStudents}</div>
                  <div className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
                    {systemInsights.totalWithPhoto} Berfoto • {systemInsights.totalWithAvatar} Avatar
                  </div>
                </div>
              </div>

              <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-purple-300 border-2 border-black rounded-lg flex items-center justify-center font-black">
                    <GraduationCap className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-purple-100 px-2 py-0.5 rounded border border-black">
                    Guru & Pengawas
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black">{systemInsights.totalTeachers}</div>
                  <div className="text-xs font-bold text-neutral-600 uppercase mt-0.5">
                    {systemInsights.totalProctors} Pengawas • {systemInsights.totalTeachersWithPhoto} Berfoto
                  </div>
                </div>
              </div>

              <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-emerald-300 border-2 border-black rounded-lg flex items-center justify-center font-black">
                    <ImageIcon className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 px-2 py-0.5 rounded border border-black">
                    Foto Drive
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-emerald-700">
                    {systemInsights.totalWithPhoto + systemInsights.totalTeachersWithPhoto}
                  </div>
                  <div className="text-xs font-bold text-neutral-600 uppercase mt-0.5">Foto Asli di Google Drive</div>
                </div>
              </div>
            </div>

            {/* Rekapitulasi Data Guru & Tenaga Pengawas Ujian Seluruh Sekolah */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-purple-300 border-2 border-black rounded-xl flex items-center justify-center font-black">
                    <GraduationCap className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase">Rekapitulasi Data Guru & Tenaga Pengawas Ujian</h3>
                    <p className="text-[11px] text-neutral-600">
                      Ringkasan data guru, tugas pengawas ruang, dan kelengkapan foto dari seluruh sekolah terdaftar
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-black uppercase bg-purple-100 text-purple-900 border border-black rounded-lg">
                    {systemInsights.totalTeachers} Total Guru Terdata
                  </span>
                </div>
              </div>

              {/* 4 Kotak Metrik Guru */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-50 border-2 border-black rounded-xl p-3.5 shadow-[2px_2px_0px_#000]">
                  <div className="text-[10px] font-black uppercase text-neutral-500">Total Guru</div>
                  <div className="text-2xl font-black text-black mt-1">{systemInsights.totalTeachers}</div>
                  <div className="text-[10px] text-neutral-600 mt-0.5">
                    {systemInsights.totalSchools === 0
                      ? 'Belum ada sekolah terdaftar'
                      : `Dari ${systemInsights.totalSchools} sekolah terdaftar`}
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-black rounded-xl p-3.5 shadow-[2px_2px_0px_#000]">
                  <div className="text-[10px] font-black uppercase text-blue-800">Pengawas Ruang</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">{systemInsights.totalProctors}</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Ditugaskan di ruang ujian</div>
                </div>

                <div className="bg-emerald-50 border-2 border-black rounded-xl p-3.5 shadow-[2px_2px_0px_#000]">
                  <div className="text-[10px] font-black uppercase text-emerald-800">Guru Berfoto</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{systemInsights.totalTeachersWithPhoto}</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Foto asli tersimpan di Drive</div>
                </div>

                <div className="bg-pink-50 border-2 border-black rounded-xl p-3.5 shadow-[2px_2px_0px_#000]">
                  <div className="text-[10px] font-black uppercase text-pink-800">Avatar Default</div>
                  <div className="text-2xl font-black text-pink-900 mt-1">{systemInsights.totalTeachersWithAvatar}</div>
                  <div className="text-[10px] text-pink-700 mt-0.5">Memakai avatar gender</div>
                </div>
              </div>

              {/* Rincian Peran & Distribusi Tugas Guru */}
              <div className="pt-2 border-t border-neutral-200">
                <div className="text-xs font-black uppercase text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                  Distribusi Peran & Tugas di Seluruh Sekolah:
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="px-2.5 py-1 bg-purple-50 border border-purple-300 rounded-lg flex items-center gap-1.5 font-bold text-purple-900">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Pengawas Ruang: <strong className="font-mono">{systemInsights.teachersByRole.pengawas}</strong>
                  </div>
                  <div className="px-2.5 py-1 bg-blue-50 border border-blue-300 rounded-lg flex items-center gap-1.5 font-bold text-blue-900">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Proktor Ujian: <strong className="font-mono">{systemInsights.teachersByRole.proktor}</strong>
                  </div>
                  <div className="px-2.5 py-1 bg-cyan-50 border border-cyan-300 rounded-lg flex items-center gap-1.5 font-bold text-cyan-900">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Teknisi: <strong className="font-mono">{systemInsights.teachersByRole.teknisi}</strong>
                  </div>
                  <div className="px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-1.5 font-bold text-amber-900">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Kepala Sekolah: <strong className="font-mono">{systemInsights.teachersByRole.kepala_sekolah}</strong>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-1.5 font-bold text-emerald-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Guru Kelas / Mapel: <strong className="font-mono">{systemInsights.teachersByRole.guru_kelas + systemInsights.teachersByRole.guru_mapel}</strong>
                  </div>
                  <div className="px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded-lg flex items-center gap-1.5 font-bold text-neutral-800">
                    <span className="w-2 h-2 rounded-full bg-neutral-500" />
                    Panitia / Lainnya: <strong className="font-mono">{systemInsights.teachersByRole.panitia + systemInsights.teachersByRole.lainnya}</strong>
                  </div>
                </div>

                <div className="mt-2.5 text-[11px] text-neutral-500 flex items-center gap-2">
                  <span>Distribusi Gender Guru:</span>
                  <span className="font-bold text-blue-800">👨 Laki-laki: {systemInsights.totalMaleTeachers}</span>
                  <span>•</span>
                  <span className="font-bold text-pink-700">👩 Perempuan: {systemInsights.totalFemaleTeachers}</span>
                </div>
              </div>
            </div>

            {/* Tabel Ringkasan Aktivitas Sekolah */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl overflow-hidden">
              <div className="p-4 bg-neutral-100 border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black uppercase">Ringkasan Status Sekolah & Data Peserta Ujian</h3>
                  <p className="text-xs text-neutral-500">
                    Data real yang tersinkronisasi di spreadsheet
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('uploads')}
                  className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Buka Monitor Data Upload →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b-2 border-black text-[10px] font-black uppercase text-neutral-700">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Nama Sekolah</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3 text-center">Siswa</th>
                      <th className="p-3 text-center">Guru</th>
                      <th className="p-3 text-center">Pengawas</th>
                      <th className="p-3 text-center">Foto Siswa</th>
                      <th className="p-3">Folder Drive</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-neutral-200 font-medium">
                    {systemInsights.schoolStats.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-xs font-bold text-neutral-500">
                          Belum ada data sekolah terdaftar. Akun sekolah terdaftar saat ini 0. Tambahkan akun sekolah di menu Manajemen Pengguna.
                        </td>
                      </tr>
                    ) : (
                      systemInsights.schoolStats.map((stat, idx) => (
                        <tr key={stat.account.id} className="hover:bg-yellow-50/50 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-neutral-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-bold text-black">{stat.schoolName}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">NPSN: {stat.npsn}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
                              @{stat.account.username}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono font-bold text-sm bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300">
                              {stat.totalStudents}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono font-bold text-sm bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md border border-purple-300">
                              {stat.totalTeachers}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono font-bold text-sm bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                              {stat.totalProctors}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="text-[11px] font-bold">
                              <span className="text-emerald-700">{stat.withPhoto} Asli</span>
                              <span className="text-neutral-400"> / </span>
                              <span className="text-pink-600">{stat.withAvatar} Avatar</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-50 px-2 py-1 rounded border border-neutral-300 truncate max-w-[180px] inline-block">
                              /{stat.schoolName.substring(0, 18)}/
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserInUpload(stat.account.username);
                                setActiveTab('uploads');
                              }}
                              className="px-2.5 py-1 bg-yellow-300 hover:bg-yellow-200 border border-black rounded text-[11px] font-black uppercase shadow-[1px_1px_0px_#000] cursor-pointer"
                            >
                              Buka Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 2: MANAJEMEN PENGGUNA (DATA REAL SHEET AKUN DENGAN CRUD SUNGGUHAN)
            ========================================================================= */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari nama sekolah, username, atau NPSN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onReloadAllData}
                  disabled={isReloading}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                  title="Ambil ulang data akun dari spreadsheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                  Muat Ulang
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAccount(null);
                    setFormUsername('');
                    setFormPassword('');
                    setFormSchoolName('');
                    setFormNpsn('');
                    setFormRole('operator');
                    setIsAddUserModalOpen(true);
                  }}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Akun Sekolah
                </button>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl overflow-hidden">
              <div className="p-3 bg-neutral-100 border-b-2 border-black flex items-center justify-between text-xs font-black uppercase">
                <span>Daftar Akun Pengguna Real (Sheet &quot;AKUN&quot;)</span>
                <span className="font-mono text-neutral-600">{filteredAccounts.length} Akun Terdaftar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b-2 border-black text-[10px] font-black uppercase text-neutral-700">
                    <tr>
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">Username & Role</th>
                      <th className="p-3">Nama Sekolah</th>
                      <th className="p-3">NPSN</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-neutral-200 font-medium">
                    {filteredAccounts.map((acc, idx) => (
                      <tr key={acc.id || acc.username} className="hover:bg-neutral-50">
                        <td className="p-3 text-center font-mono font-bold text-neutral-500">#{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm">@{acc.username}</span>
                            {acc.role === 'admin' ? (
                              <span className="px-2 py-0.5 bg-yellow-300 text-black border border-black rounded text-[9px] font-black uppercase">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 border border-neutral-400 rounded text-[9px] font-bold uppercase">
                                Operator
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-neutral-900">{acc.schoolName || '-'}</td>
                        <td className="p-3 font-mono text-neutral-600">{acc.npsn || '-'}</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase border border-black bg-emerald-200 text-emerald-950">
                            Aktif
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAccount(acc);
                                setFormUsername(acc.username);
                                setFormSchoolName(acc.schoolName);
                                setFormNpsn(acc.npsn);
                                setFormRole(acc.role);
                                setIsAddUserModalOpen(true);
                              }}
                              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border border-black rounded shadow-[1px_1px_0px_#000]"
                              title="Edit Akun di Spreadsheet"
                            >
                              <Edit className="w-3.5 h-3.5 text-neutral-700" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setResetPassAccount(acc);
                                setNewPassword('');
                              }}
                              className="p-1.5 bg-cyan-100 hover:bg-cyan-200 border border-black rounded shadow-[1px_1px_0px_#000]"
                              title="Ganti Password di Spreadsheet"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-cyan-800" />
                            </button>

                            {acc.username.toLowerCase() !== 'nagata' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAccountClick(acc)}
                                className="p-1.5 bg-rose-100 hover:bg-rose-200 border border-black rounded shadow-[1px_1px_0px_#000]"
                                title="Hapus Akun dari Spreadsheet"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-800" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 3: MONITOR DATA UPLOAD (DATA REAL DARI DATABASE SPREADSHEET)
            ========================================================================= */}
        {activeTab === 'uploads' && (
          <div className="space-y-6">
            {/* Header Monitor */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black uppercase flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-black" />
                  Monitor Data Upload Per Sekolah
                </h2>
                <p className="text-xs text-neutral-600">
                  Menampilkan data asli dari spreadsheet untuk masing-masing sekolah.
                </p>
              </div>

              {selectedUserInUpload && (
                <button
                  type="button"
                  onClick={() => setSelectedUserInUpload(null)}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold"
                >
                  ← Kembali ke Daftar Sekolah
                </button>
              )}
            </div>

            {/* DAFTAR SEKOLAH TERPISAH PER PENGGUNA */}
            {!selectedUserInUpload ? (
              filteredSchoolAccounts.length === 0 ? (
                <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-300 border-2 border-black rounded-2xl mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000]">
                    <Building2 className="w-8 h-8 text-black" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black uppercase text-neutral-900">0 Akun Sekolah Terdaftar</h3>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto">
                      Administrator Nagata adalah pusat pengelola sistem (bukan sekolah). Belum ada data sekolah yang terdaftar atau diunggah.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('accounts')}
                    className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] inline-flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Akun Sekolah di Manajemen Pengguna
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSchoolAccounts.map((acc) => {
                    const data = schoolDataMap[acc.username] || schoolDataMap[acc.username.toLowerCase()];
                    const students = data?.students || [];
                    const withPhoto = students.filter((s) => Boolean(s.photoUrl)).length;
                    const withAvatar = students.length - withPhoto;

                    const teachers = data?.teachers || [];
                    const proctors = teachers.filter((t) => t.roleType === 'pengawas' || Boolean(t.roomDuty)).length;
                    const teachersWithPhoto = teachers.filter((t) => Boolean(t.photoUrl)).length;

                    return (
                      <div
                        key={acc.id || acc.username}
                        className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all rounded-2xl p-5 flex flex-col justify-between gap-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-10 h-10 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center font-black">
                              <Building2 className="w-5 h-5 text-black" />
                            </div>
                            <span className="font-mono text-[11px] font-bold bg-neutral-100 px-2 py-0.5 rounded border border-black">
                              @{acc.username}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-black text-sm text-neutral-900 group-hover:text-yellow-600 transition-colors">
                              {data?.school?.name || acc.schoolName || 'Nama Sekolah Belum Diisi'}
                            </h3>
                            <div className="text-xs text-neutral-500 font-mono mt-0.5">
                              NPSN: {data?.school?.npsn || acc.npsn || '-'}
                            </div>
                            <div className="text-[11px] text-neutral-600 mt-1">
                              Ujian: <strong>{data?.exam?.name || 'Belum diatur'}</strong>
                            </div>
                          </div>

                          {/* Drive Folder Path */}
                          <div className="bg-neutral-50 border border-neutral-300 rounded-lg p-2 text-[10px] font-mono text-neutral-600 truncate flex items-center gap-1.5">
                            <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>/DATABASE/{data?.school?.name || acc.schoolName || acc.username}/</span>
                          </div>

                          {/* Statistik 4 Indikator Lengkap */}
                          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-neutral-200 text-center">
                            <div className="bg-blue-50 border border-blue-200 rounded p-1.5">
                              <div className="text-sm font-black text-blue-900">{students.length}</div>
                              <div className="text-[8px] uppercase font-bold text-blue-700">Siswa</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded p-1.5">
                              <div className="text-sm font-black text-purple-900">{teachers.length}</div>
                              <div className="text-[8px] uppercase font-bold text-purple-700">Guru</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded p-1.5">
                              <div className="text-sm font-black text-amber-900">{proctors}</div>
                              <div className="text-[8px] uppercase font-bold text-amber-700">Pengawas</div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5">
                              <div className="text-sm font-black text-emerald-800">{withPhoto + teachersWithPhoto}</div>
                              <div className="text-[8px] uppercase font-bold text-emerald-700">Foto</div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserInUpload(acc.username);
                            setActiveStatCard('cards');
                            setSelectedStudentIdx(0);
                            setSelectedTeacherIdx(0);
                          }}
                          className="w-full py-2.5 px-3 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Buka Detail Data & Review Kartu →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* DETAIL DATA SEKOLAH LENGKAP DENGAN REVIEW KARTU, SISWA, GURU & FOTO */
              <div className="space-y-6">
                {/* Header Sekolah Terpilih */}
                <div className="bg-neutral-900 text-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-2xl flex items-center justify-center text-black font-black shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-black uppercase">
                          {openedSchoolData?.school?.name || openedSchoolAccount?.schoolName || selectedUserInUpload}
                        </h2>
                        <span className="font-mono text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded border border-black">
                          @{openedSchoolAccount?.username}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        NPSN: {openedSchoolData?.school?.npsn || openedSchoolAccount?.npsn || '-'} • Folder Drive: /DATABASE/{openedSchoolData?.school?.name || openedSchoolAccount?.schoolName || selectedUserInUpload}/
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserInUpload(null)}
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      ← Kembali ke Daftar Sekolah
                    </button>
                  </div>
                </div>

                {/* REKAPITULASI DATA LENGKAP SEKOLAH (6 KARTU RINGKASAN DATA HUB) */}
                <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-neutral-700" />
                      <h3 className="text-xs font-black uppercase">Rekapitulasi Seluruh Data Sekolah</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-yellow-300 text-black px-2 py-0.5 rounded border border-black">
                      Data Real Tersinkronisasi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    {/* Ringkasan 1: Profil Sekolah */}
                    <div className="p-3 bg-cyan-50 border-2 border-black rounded-xl space-y-1">
                      <div className="text-[9px] font-black uppercase text-cyan-800">1. Profil Sekolah</div>
                      <div className="font-black text-black truncate" title={openedSchoolData?.school?.name}>
                        {openedSchoolData?.school?.name || 'Belum diisi'}
                      </div>
                      <div className="text-[10px] text-neutral-600 font-mono">
                        NPSN: {openedSchoolData?.school?.npsn || '-'}
                      </div>
                      <div className="text-[9px] font-bold text-emerald-800">
                        {openedSchoolData?.school?.logoUrl ? '✓ Ada Logo' : 'Belum ada logo'}
                      </div>
                    </div>

                    {/* Ringkasan 2: Peserta Didik */}
                    <div className="p-3 bg-yellow-50 border-2 border-black rounded-xl space-y-1">
                      <div className="text-[9px] font-black uppercase text-yellow-800">2. Peserta Didik</div>
                      <div className="text-xl font-black text-black">
                        {openedStudents.length} <span className="text-[10px] font-bold text-neutral-500">Siswa</span>
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        <span className="text-emerald-700 font-bold">{openedWithPhoto} Foto</span> • {openedWithAvatar} Avatar
                      </div>
                    </div>

                    {/* Ringkasan 3: Guru & Pengawas */}
                    <div className="p-3 bg-purple-50 border-2 border-black rounded-xl space-y-1">
                      <div className="text-[9px] font-black uppercase text-purple-800">3. Guru & Tendik</div>
                      <div className="text-xl font-black text-black">
                        {openedTeachers.length} <span className="text-[10px] font-bold text-neutral-500">Guru</span>
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        <span className="text-purple-800 font-bold">{openedProctors} Pengawas</span> • {openedTeachersWithPhoto} Foto
                      </div>
                    </div>

                    {/* Ringkasan 4: Identitas Ujian */}
                    <div className="p-3 bg-emerald-50 border-2 border-black rounded-xl space-y-1">
                      <div className="text-[9px] font-black uppercase text-emerald-800">4. Parameter Ujian</div>
                      <div className="font-bold text-black truncate" title={openedSchoolData?.exam?.name}>
                        {openedSchoolData?.exam?.name || 'Belum Diatur'}
                      </div>
                      <div className="text-[10px] text-neutral-600 truncate">
                        {openedSchoolData?.exam?.academicYear || '-'} • {openedSchoolData?.exam?.semester || '-'}
                      </div>
                    </div>

                    {/* Ringkasan 5: Desain Kartu */}
                    <div className="p-3 bg-pink-50 border-2 border-black rounded-xl space-y-1">
                      <div className="text-[9px] font-black uppercase text-pink-800">5. Format Kartu</div>
                      <div className="font-bold text-black capitalize">
                        Preset: {openedSchoolData?.cardDesign?.templatePreset || 'neobrutal'}
                      </div>
                      <div className="text-[10px] text-neutral-600 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black inline-block"
                          style={{ backgroundColor: openedSchoolData?.cardDesign?.accentColor || '#00F0FF' }}
                        />
                        <span className="font-mono">{openedSchoolData?.cardDesign?.accentColor || '#00F0FF'}</span>
                      </div>
                    </div>

                    {/* Ringkasan 6: Kesiapan Cetak */}
                    <div className="p-3 bg-blue-50 border-2 border-black rounded-xl space-y-1">
                      <div className="text-[9px] font-black uppercase text-blue-800">6. Kesiapan Cetak</div>
                      <div className="font-bold text-blue-900">
                        Kertas {openedSchoolData?.printSettings?.paperSize || 'A4'}
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        Layout {openedSchoolData?.printSettings?.layoutMode === '1_col' ? '1 Kolom' : '2 Kolom (Grid)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6 TAB MENU NAVIGASI DETAIL SEKOLAH */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b-2 border-black">
                  <button
                    type="button"
                    onClick={() => setActiveStatCard('cards')}
                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeStatCard === 'cards'
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Review Kartu Ujian
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStatCard('students')}
                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeStatCard === 'students'
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Data Siswa ({openedStudents.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStatCard('teachers')}
                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeStatCard === 'teachers'
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Data Guru ({openedTeachers.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStatCard('photos')}
                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeStatCard === 'photos'
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Galeri Foto ({openedWithPhoto + openedTeachersWithPhoto})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStatCard('school')}
                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeStatCard === 'school'
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Profil & Ujian
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStatCard('design')}
                    className={`px-4 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      activeStatCard === 'design'
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    Desain & Cetak
                  </button>
                </div>

                {/* =============================================================
                    KONTEN TAB 1: REVIEW KARTU UJIAN SEKOLAH (LIVE VISUAL PREVIEW)
                    ============================================================= */}
                {activeStatCard === 'cards' && (
                  <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-5">
                    {/* Switcher Jenis Kartu */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-black" />
                        <div>
                          <h3 className="text-sm font-black uppercase">Live Review Kartu Ujian Sekolah</h3>
                          <p className="text-[11px] text-neutral-600">
                            Pratinjau visual kartu peserta, nomor meja, dan ID pengawas sesuai desain asli sekolah
                          </p>
                        </div>
                      </div>

                      {/* 3 Tombol Pilihan Jenis Kartu */}
                      <div className="flex items-center gap-1.5 bg-neutral-100 p-1 border-2 border-black rounded-xl">
                        <button
                          type="button"
                          onClick={() => setReviewCardType('student_exam')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                            reviewCardType === 'student_exam'
                              ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                              : 'text-neutral-600 hover:text-black'
                          }`}
                        >
                          Kartu Peserta Ujian
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewCardType('desk_card')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                            reviewCardType === 'desk_card'
                              ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                              : 'text-neutral-600 hover:text-black'
                          }`}
                        >
                          Nomor Meja
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewCardType('proctor_guest')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                            reviewCardType === 'proctor_guest'
                              ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                              : 'text-neutral-600 hover:text-black'
                          }`}
                        >
                          ID Card Pengawas
                        </button>
                      </div>
                    </div>

                    {/* KONTEN A: KARTU PESERTA & NOMOR MEJA */}
                    {(reviewCardType === 'student_exam' || reviewCardType === 'desk_card') && (
                      <div className="space-y-4">
                        {openedStudents.length === 0 ? (
                          <div className="p-8 text-center bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl space-y-2">
                            <Users className="w-8 h-8 text-neutral-400 mx-auto" />
                            <div className="text-xs font-bold text-neutral-600">
                              Sekolah ini belum memiliki data peserta didik untuk dicetak pada kartu ujian.
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Toolbar Pemilih Siswa & Kontrol Skala */}
                            <div className="bg-neutral-50 border-2 border-black rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                              {/* Pemilih Siswa */}
                              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                                <span className="text-xs font-black uppercase text-neutral-700 whitespace-nowrap">
                                  Pilih Siswa:
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStudentIdx((prev) => Math.max(0, prev - 1))}
                                    disabled={selectedStudentIdx === 0}
                                    className="p-1.5 bg-white hover:bg-neutral-100 border border-black rounded-lg disabled:opacity-40 cursor-pointer"
                                    title="Siswa Sebelumnya"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedStudentIdx((prev) => Math.min(openedStudents.length - 1, prev + 1))}
                                    disabled={selectedStudentIdx >= openedStudents.length - 1}
                                    className="p-1.5 bg-white hover:bg-neutral-100 border border-black rounded-lg disabled:opacity-40 cursor-pointer"
                                    title="Siswa Berikutnya"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>

                                <select
                                  value={selectedStudentIdx}
                                  onChange={(e) => setSelectedStudentIdx(Number(e.target.value))}
                                  className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
                                >
                                  {openedStudents.map((s, idx) => (
                                    <option key={s.id || idx} value={idx}>
                                      #{idx + 1} - {s.name} ({s.className || 'Kelas -'}) - NISN: {s.nisn || '-'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Kontrol Zoom & Orientasi Meja */}
                              <div className="flex items-center gap-2">
                                {reviewCardType === 'desk_card' && (
                                  <div className="flex items-center gap-1 bg-white border border-black rounded-lg p-0.5 text-[10px] font-bold">
                                    <button
                                      type="button"
                                      onClick={() => setReviewOrientation('landscape')}
                                      className={`px-2 py-0.5 rounded ${
                                        reviewOrientation === 'landscape' ? 'bg-black text-white' : 'text-neutral-700'
                                      }`}
                                    >
                                      Landscape
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setReviewOrientation('portrait')}
                                      className={`px-2 py-0.5 rounded ${
                                        reviewOrientation === 'portrait' ? 'bg-black text-white' : 'text-neutral-700'
                                      }`}
                                    >
                                      Portrait
                                    </button>
                                  </div>
                                )}

                                <div className="flex items-center gap-1 bg-white border border-black rounded-lg p-0.5 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setReviewScale((prev) => Math.max(0.7, prev - 0.1))}
                                    className="p-1 hover:bg-neutral-100 rounded"
                                    title="Perkecil"
                                  >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-1 font-mono text-[10px] font-bold">
                                    {Math.round(reviewScale * 100)}%
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setReviewScale((prev) => Math.min(1.4, prev + 0.1))}
                                    className="p-1 hover:bg-neutral-100 rounded"
                                    title="Perbesar"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReviewScale(1)}
                                    className="p-1 hover:bg-neutral-100 rounded text-[10px] font-bold uppercase"
                                    title="Reset Skala"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* CONTAINER LIVE PREVIEW KARTU */}
                            <div className="p-6 sm:p-8 bg-[#F8F6F0] border-3 border-black rounded-2xl flex items-center justify-center min-h-[340px] overflow-auto shadow-inner">
                              <div
                                style={{
                                  transform: `scale(${reviewScale})`,
                                  transformOrigin: 'center center',
                                  transition: 'transform 0.15s ease',
                                }}
                              >
                                {reviewCardType === 'student_exam' ? (
                                  <ExamCard
                                    student={selectedStudent}
                                    school={openedSchoolData?.school || DEFAULT_SCHOOL}
                                    exam={openedSchoolData?.exam || DEFAULT_EXAM}
                                    design={openedSchoolData?.cardDesign || DEFAULT_CARD_DESIGN}
                                    scale={1}
                                  />
                                ) : (
                                  <DeskCard
                                    student={selectedStudent}
                                    school={openedSchoolData?.school || DEFAULT_SCHOOL}
                                    exam={openedSchoolData?.exam || DEFAULT_EXAM}
                                    themeId={openedSchoolData?.cardDesign?.templatePreset || 'neobrutal'}
                                    themeColor={openedSchoolData?.cardDesign?.accentColor}
                                    orientation={reviewOrientation}
                                  />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* KONTEN B: ID CARD PENGAWAS RUANG & TAMU */}
                    {reviewCardType === 'proctor_guest' && (
                      <div className="space-y-4">
                        {openedTeachers.length === 0 ? (
                          <div className="p-8 text-center bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl space-y-2">
                            <GraduationCap className="w-8 h-8 text-neutral-400 mx-auto" />
                            <div className="text-xs font-bold text-neutral-600">
                              Sekolah ini belum memiliki data guru atau pengawas ujian.
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Toolbar Pemilih Guru/Pengawas */}
                            <div className="bg-neutral-50 border-2 border-black rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                                <span className="text-xs font-black uppercase text-neutral-700 whitespace-nowrap">
                                  Pilih Pengawas:
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTeacherIdx((prev) => Math.max(0, prev - 1))}
                                    disabled={selectedTeacherIdx === 0}
                                    className="p-1.5 bg-white hover:bg-neutral-100 border border-black rounded-lg disabled:opacity-40 cursor-pointer"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTeacherIdx((prev) => Math.min(openedTeachers.length - 1, prev + 1))}
                                    disabled={selectedTeacherIdx >= openedTeachers.length - 1}
                                    className="p-1.5 bg-white hover:bg-neutral-100 border border-black rounded-lg disabled:opacity-40 cursor-pointer"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>

                                <select
                                  value={selectedTeacherIdx}
                                  onChange={(e) => setSelectedTeacherIdx(Number(e.target.value))}
                                  className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white"
                                >
                                  {openedTeachers.map((t, idx) => (
                                    <option key={t.id || idx} value={idx}>
                                      #{idx + 1} - {t.name} ({t.roleType === 'pengawas' ? 'Pengawas Ruang' : t.roleType || 'Guru'}) - {t.roomDuty || 'Semua Ruang'}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-white border border-black rounded-lg p-0.5 text-[10px] font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setReviewOrientation('portrait')}
                                    className={`px-2 py-0.5 rounded ${
                                      reviewOrientation === 'portrait' ? 'bg-black text-white' : 'text-neutral-700'
                                    }`}
                                  >
                                    Portrait
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReviewOrientation('landscape')}
                                    className={`px-2 py-0.5 rounded ${
                                      reviewOrientation === 'landscape' ? 'bg-black text-white' : 'text-neutral-700'
                                    }`}
                                  >
                                    Landscape
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* CONTAINER LIVE PREVIEW ID CARD PENGAWAS */}
                            <div className="p-6 sm:p-8 bg-[#F8F6F0] border-3 border-black rounded-2xl flex items-center justify-center min-h-[380px] overflow-auto shadow-inner">
                              <ProctorGuestCard
                                type="proctor"
                                teacher={selectedTeacher}
                                school={openedSchoolData?.school || DEFAULT_SCHOOL}
                                exam={openedSchoolData?.exam || DEFAULT_EXAM}
                                themeId={openedSchoolData?.cardDesign?.templatePreset || 'neobrutal'}
                                themeColor={openedSchoolData?.cardDesign?.accentColor}
                                orientation={reviewOrientation}
                                showLanyard={true}
                                roleBadgeText={selectedTeacher?.roleType === 'pengawas' ? 'PENGAWAS RUANG' : undefined}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* =============================================================
                    KONTEN TAB 2: DATA SISWA (TABEL DETAIL LENGKAP & PENCARIAN)
                    ============================================================= */}
                {activeStatCard === 'students' && (
                  <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                      <div>
                        <h3 className="text-sm font-black uppercase flex items-center gap-2">
                          <Users className="w-4 h-4 text-yellow-600" />
                          Daftar Peserta Didik ({openedStudents.length} Siswa)
                        </h3>
                        <p className="text-[11px] text-neutral-600">
                          Data siswa terdaftar pada Sheet &quot;DATA_SISWA&quot;
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold bg-yellow-200 px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0px_#000]">
                        {openedWithPhoto} Foto Asli • {openedWithAvatar} Avatar Gender
                      </span>
                    </div>

                    {/* Filter & Search Bar Siswa */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Cari nama, NISN, atau kelas..."
                          value={studentSearchTerm}
                          onChange={(e) => setStudentSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-lg"
                        />
                      </div>

                      <select
                        value={studentGenderFilter}
                        onChange={(e) => setStudentGenderFilter(e.target.value as 'all' | 'L' | 'P')}
                        className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50"
                      >
                        <option value="all">Semua Jenis Kelamin (L/P)</option>
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>

                      <div className="text-right flex items-center justify-end text-xs font-mono font-bold text-neutral-500">
                        Total {openedStudents.length} Peserta
                      </div>
                    </div>

                    {/* Tabel Siswa */}
                    {openedStudents.length === 0 ? (
                      <div className="p-8 text-center text-xs font-bold text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-300">
                        Sekolah ini belum memiliki data siswa yang tersimpan di spreadsheet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-100 border-b-2 border-black text-[10px] font-black uppercase text-neutral-700 sticky top-0">
                            <tr>
                              <th className="p-2.5 w-12 text-center">No</th>
                              <th className="p-2.5 w-14 text-center">Foto</th>
                              <th className="p-2.5">NISN / NIS</th>
                              <th className="p-2.5">Nama Lengkap</th>
                              <th className="p-2.5 text-center">L/P</th>
                              <th className="p-2.5">Kelas</th>
                              <th className="p-2.5">Ruang / Meja</th>
                              <th className="p-2.5 text-center">Status Foto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 font-medium">
                            {openedStudents
                              .filter((s) => {
                                const q = studentSearchTerm.toLowerCase();
                                const matchQ = !q || s.name.toLowerCase().includes(q) || (s.nisn && s.nisn.includes(q)) || (s.className && s.className.toLowerCase().includes(q));
                                const matchG = studentGenderFilter === 'all' || s.gender === studentGenderFilter;
                                return matchQ && matchG;
                              })
                              .map((s, idx) => (
                                <tr key={s.id} className="hover:bg-yellow-50/50 transition-colors">
                                  <td className="p-2.5 text-center font-mono font-bold text-neutral-500">#{idx + 1}</td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPhotoModal({
                                          name: s.name,
                                          photoUrl: s.photoUrl,
                                          gender: s.gender,
                                          subtitle: `Kelas: ${s.className || '-'}`,
                                          identifier: `NISN: ${s.nisn || '-'} • NIS: ${s.nis || '-'}`,
                                          badge: s.photoUrl ? 'Foto Asli di Google Drive' : `Avatar Otomatis (${s.gender === 'L' ? 'Pria' : 'Wanita'})`,
                                        })
                                      }
                                      className="w-9 h-11 mx-auto rounded border border-black overflow-hidden bg-white hover:scale-105 transition-transform cursor-pointer shadow-xs"
                                      title="Klik untuk melihat foto lebih besar"
                                    >
                                      {s.photoUrl ? (
                                        <img src={getDriveThumbnailUrl(s.photoUrl, 400)} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <GenderAvatar gender={s.gender} className="w-full h-full" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="p-2.5 font-mono text-[11px]">
                                    <div className="font-bold">{s.nisn || '-'}</div>
                                    <div className="text-neutral-500">NIS: {s.nis || '-'}</div>
                                  </td>
                                  <td className="p-2.5 font-bold text-neutral-900">{s.name}</td>
                                  <td className="p-2.5 text-center font-mono font-bold">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      s.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                    }`}>
                                      {s.gender}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-bold">{s.className}</td>
                                  <td className="p-2.5 font-mono text-[11px]">
                                    {[s.examRoom, s.examSeat].filter(Boolean).join(' • ') || '-'}
                                  </td>
                                  <td className="p-2.5 text-center">
                                    {s.photoUrl ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                                        Foto Asli
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-400">
                                        Avatar {s.gender === 'L' ? 'Pria' : 'Wanita'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* =============================================================
                    KONTEN TAB 3: DATA GURU & TENAGA PENGAWAS UJIAN
                    ============================================================= */}
                {activeStatCard === 'teachers' && (
                  <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                      <div>
                        <h3 className="text-sm font-black uppercase flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                          Daftar Guru & Tenaga Pengawas Ujian ({openedTeachers.length} Guru)
                        </h3>
                        <p className="text-[11px] text-neutral-600">
                          Data tenaga pendidik terdaftar pada Sheet &quot;GURU&quot;
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0px_#000]">
                        {openedProctors} Pengawas Ruang • {openedTeachersWithPhoto} Berfoto
                      </span>
                    </div>

                    {/* Filter & Search Bar Guru */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Cari nama guru atau NIP..."
                          value={teacherSearchTerm}
                          onChange={(e) => setTeacherSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-lg"
                        />
                      </div>

                      <select
                        value={teacherRoleFilter}
                        onChange={(e) => setTeacherRoleFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50"
                      >
                        <option value="all">Semua Peran / Tugas</option>
                        <option value="pengawas">Pengawas Ruang</option>
                        <option value="proktor">Proktor Ujian</option>
                        <option value="teknisi">Teknisi</option>
                        <option value="kepala_sekolah">Kepala Sekolah</option>
                        <option value="guru_kelas">Guru Kelas</option>
                        <option value="guru_mapel">Guru Mapel</option>
                      </select>

                      <div className="text-right flex items-center justify-end text-xs font-mono font-bold text-neutral-500">
                        Total {openedTeachers.length} Guru
                      </div>
                    </div>

                    {/* Tabel Guru */}
                    {openedTeachers.length === 0 ? (
                      <div className="p-8 text-center text-xs font-bold text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-300">
                        Sekolah ini belum memiliki data guru yang tersimpan di spreadsheet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-100 border-b-2 border-black text-[10px] font-black uppercase text-neutral-700 sticky top-0">
                            <tr>
                              <th className="p-2.5 w-12 text-center">No</th>
                              <th className="p-2.5 w-14 text-center">Foto</th>
                              <th className="p-2.5">Nama & NIP</th>
                              <th className="p-2.5 text-center">L/P</th>
                              <th className="p-2.5">Tugas / Peran</th>
                              <th className="p-2.5">Ruang Tugas</th>
                              <th className="p-2.5">Mata Pelajaran</th>
                              <th className="p-2.5 text-center">Status Foto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 font-medium">
                            {openedTeachers
                              .filter((t) => {
                                const q = teacherSearchTerm.toLowerCase();
                                const matchQ = !q || t.name.toLowerCase().includes(q) || (t.nip && t.nip.includes(q));
                                const matchR = teacherRoleFilter === 'all' || t.roleType === teacherRoleFilter || (teacherRoleFilter === 'pengawas' && Boolean(t.roomDuty));
                                return matchQ && matchR;
                              })
                              .map((t, idx) => (
                                <tr key={t.id} className="hover:bg-purple-50/40 transition-colors">
                                  <td className="p-2.5 text-center font-mono font-bold text-neutral-500">#{idx + 1}</td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPhotoModal({
                                          name: t.name,
                                          photoUrl: t.photoUrl,
                                          gender: t.gender,
                                          subtitle: `Peran: ${t.roleType === 'pengawas' ? 'Pengawas Ruang' : t.roleType || 'Guru'}`,
                                          identifier: `NIP: ${t.nip || '-'} • Ruang: ${t.roomDuty || 'Semua Ruang'}`,
                                          badge: t.photoUrl ? 'Foto Asli di Google Drive' : `Avatar Gender (${t.gender === 'L' ? 'Pria' : 'Wanita'})`,
                                        })
                                      }
                                      className="w-9 h-11 mx-auto rounded border border-black overflow-hidden bg-white hover:scale-105 transition-transform cursor-pointer shadow-xs"
                                      title="Klik untuk melihat foto lebih besar"
                                    >
                                      {t.photoUrl ? (
                                        <img src={getDriveThumbnailUrl(t.photoUrl, 400)} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <GenderAvatar gender={t.gender} className="w-full h-full" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="p-2.5">
                                    <div className="font-bold text-neutral-900">{t.name}</div>
                                    <div className="text-[11px] font-mono text-neutral-500">NIP: {t.nip || '-'}</div>
                                  </td>
                                  <td className="p-2.5 text-center font-mono font-bold">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      t.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                    }`}>
                                      {t.gender}
                                    </span>
                                  </td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                      t.roleType === 'pengawas' || t.roomDuty
                                        ? 'bg-purple-100 text-purple-900 border-purple-400'
                                        : t.roleType === 'proktor'
                                        ? 'bg-blue-100 text-blue-900 border-blue-400'
                                        : t.roleType === 'kepala_sekolah'
                                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                                        : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                    }`}>
                                      {t.roleType === 'pengawas' || t.roomDuty ? 'Pengawas Ruang' : t.roleType || 'Guru'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono text-[11px] font-bold text-purple-900">
                                    {t.roomDuty || '-'}
                                  </td>
                                  <td className="p-2.5 text-neutral-700">{t.subject || '-'}</td>
                                  <td className="p-2.5 text-center">
                                    {t.photoUrl ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                                        Foto Asli
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-400">
                                        Avatar {t.gender === 'L' ? 'Pria' : 'Wanita'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* =============================================================
                    KONTEN TAB 4: GALERI FOTO SISWA & GURU LENGKAP
                    ============================================================= */}
                {activeStatCard === 'photos' && (
                  <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                      <div>
                        <h3 className="text-sm font-black uppercase flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-purple-600" />
                          Galeri Foto Siswa & Guru ({openedStudents.length + openedTeachers.length} Total Data)
                        </h3>
                        <p className="text-[11px] text-neutral-600">
                          Klik foto mana saja untuk melihat pratinjau resolusi penuh dan detail lengkap
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <button
                          type="button"
                          onClick={() => setPhotoFilter('all')}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-bold text-[11px] cursor-pointer ${
                            photoFilter === 'all' ? 'bg-yellow-300' : 'bg-neutral-100'
                          }`}
                        >
                          Semua ({openedStudents.length + openedTeachers.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoFilter('students_photo')}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-bold text-[11px] cursor-pointer ${
                            photoFilter === 'students_photo' ? 'bg-emerald-300' : 'bg-neutral-100'
                          }`}
                        >
                          Foto Siswa ({openedWithPhoto})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoFilter('students_avatar')}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-bold text-[11px] cursor-pointer ${
                            photoFilter === 'students_avatar' ? 'bg-amber-300' : 'bg-neutral-100'
                          }`}
                        >
                          Avatar Siswa ({openedWithAvatar})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoFilter('teachers_photo')}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-bold text-[11px] cursor-pointer ${
                            photoFilter === 'teachers_photo' ? 'bg-purple-300' : 'bg-neutral-100'
                          }`}
                        >
                          Foto Guru ({openedTeachersWithPhoto})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoFilter('teachers_avatar')}
                          className={`px-2.5 py-1 rounded-lg border-2 border-black font-bold text-[11px] cursor-pointer ${
                            photoFilter === 'teachers_avatar' ? 'bg-pink-300' : 'bg-neutral-100'
                          }`}
                        >
                          Avatar Guru ({openedTeachersWithAvatar})
                        </button>
                      </div>
                    </div>

                    {/* Grid Galeri */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {/* Kartu Foto Siswa */}
                      {(photoFilter === 'all' || photoFilter === 'students_photo' || photoFilter === 'students_avatar') &&
                        openedStudents
                          .filter((s) => {
                            if (photoFilter === 'students_photo') return Boolean(s.photoUrl);
                            if (photoFilter === 'students_avatar') return !s.photoUrl;
                            return true;
                          })
                          .map((s) => (
                            <div
                              key={`std_${s.id}`}
                              onClick={() =>
                                setPreviewPhotoModal({
                                  name: s.name,
                                  photoUrl: s.photoUrl,
                                  gender: s.gender,
                                  subtitle: `Siswa • ${s.className || '-'}`,
                                  identifier: `NISN: ${s.nisn || '-'} • NIS: ${s.nis || '-'}`,
                                  badge: s.photoUrl ? 'Foto Asli di Google Drive' : `Avatar Gender (${s.gender === 'L' ? 'Pria' : 'Wanita'})`,
                                })
                              }
                              className="bg-neutral-50 border-2 border-black rounded-xl p-2.5 flex flex-col items-center text-center space-y-1.5 shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 transition-all cursor-pointer group"
                            >
                              <div className="w-16 h-20 rounded-lg border-2 border-black overflow-hidden bg-white shadow-xs group-hover:scale-105 transition-transform">
                                {s.photoUrl ? (
                                  <img src={getDriveThumbnailUrl(s.photoUrl, 400)} alt={s.name} className="w-full h-full object-cover" />
                                ) : (
                                  <GenderAvatar gender={s.gender} className="w-full h-full" />
                                )}
                              </div>
                              <div className="w-full min-w-0">
                                <div className="text-[11px] font-black truncate text-neutral-900" title={s.name}>
                                  {s.name}
                                </div>
                                <div className="text-[9px] font-mono text-neutral-500 truncate">
                                  {s.className || '-'}
                                </div>
                              </div>
                              <span
                                className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                                  s.photoUrl
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                    : 'bg-amber-100 text-amber-800 border-amber-400'
                                }`}
                              >
                                {s.photoUrl ? 'Siswa Asli' : 'Avatar Siswa'}
                              </span>
                            </div>
                          ))}

                      {/* Kartu Foto Guru */}
                      {(photoFilter === 'all' || photoFilter === 'teachers_photo' || photoFilter === 'teachers_avatar') &&
                        openedTeachers
                          .filter((t) => {
                            if (photoFilter === 'teachers_photo') return Boolean(t.photoUrl);
                            if (photoFilter === 'teachers_avatar') return !t.photoUrl;
                            return true;
                          })
                          .map((t) => (
                            <div
                              key={`tch_${t.id}`}
                              onClick={() =>
                                setPreviewPhotoModal({
                                  name: t.name,
                                  photoUrl: t.photoUrl,
                                  gender: t.gender,
                                  subtitle: `Tenaga Pendidik / Pengawas`,
                                  identifier: `NIP: ${t.nip || '-'} • Tugas: ${t.roomDuty || t.roleType || '-'}`,
                                  badge: t.photoUrl ? 'Foto Guru Asli di Google Drive' : `Avatar Guru (${t.gender === 'L' ? 'Pria' : 'Wanita'})`,
                                })
                              }
                              className="bg-purple-50/60 border-2 border-black rounded-xl p-2.5 flex flex-col items-center text-center space-y-1.5 shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 transition-all cursor-pointer group"
                            >
                              <div className="w-16 h-20 rounded-lg border-2 border-black overflow-hidden bg-white shadow-xs group-hover:scale-105 transition-transform">
                                {t.photoUrl ? (
                                  <img src={getDriveThumbnailUrl(t.photoUrl, 400)} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                  <GenderAvatar gender={t.gender} className="w-full h-full" />
                                )}
                              </div>
                              <div className="w-full min-w-0">
                                <div className="text-[11px] font-black truncate text-purple-950" title={t.name}>
                                  {t.name}
                                </div>
                                <div className="text-[9px] font-mono text-neutral-500 truncate">
                                  {t.roomDuty || t.roleType || 'Guru'}
                                </div>
                              </div>
                              <span
                                className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                                  t.photoUrl
                                    ? 'bg-purple-200 text-purple-900 border-purple-400'
                                    : 'bg-pink-100 text-pink-800 border-pink-400'
                                }`}
                              >
                                {t.photoUrl ? 'Guru Asli' : 'Avatar Guru'}
                              </span>
                            </div>
                          ))}
                    </div>
                  </div>
                )}

                {/* =============================================================
                    KONTEN TAB 5: IDENTITAS SEKOLAH & PARAMETER UJIAN LENGKAP
                    ============================================================= */}
                {activeStatCard === 'school' && (
                  <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                      <h3 className="text-sm font-black uppercase flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-600" />
                        Rincian Lengkap Identitas Sekolah & Pelaksanaan Ujian
                      </h3>
                      <span className="font-mono text-xs font-bold bg-cyan-100 px-2.5 py-0.5 rounded border border-black">
                        NPSN: {openedSchoolData?.school?.npsn || openedSchoolAccount?.npsn || '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Kolom 1: Data Identitas Sekolah */}
                      <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-2.5 shadow-[2px_2px_0px_#000]">
                        <div className="font-bold text-neutral-500 uppercase text-[10px] pb-1 border-b border-neutral-200">
                          Data Utama Sekolah
                        </div>
                        <div>
                          <span className="text-neutral-500">Nama Sekolah:</span>
                          <div className="font-bold text-sm text-black">
                            {openedSchoolData?.school?.name || openedSchoolAccount?.schoolName || '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500">NPSN / NSS:</span>
                          <div className="font-mono font-bold">
                            {openedSchoolData?.school?.npsn || openedSchoolAccount?.npsn || '-'} / {openedSchoolData?.school?.nss || '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500">Alamat Lengkap:</span>
                          <div className="font-medium">{openedSchoolData?.school?.address || '-'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-neutral-500">Kecamatan:</span>
                            <div className="font-medium">{openedSchoolData?.school?.district || '-'}</div>
                          </div>
                          <div>
                            <span className="text-neutral-500">Kabupaten / Kota:</span>
                            <div className="font-medium">{openedSchoolData?.school?.regency || '-'}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500">Provinsi:</span>
                          <div className="font-medium">{openedSchoolData?.school?.province || '-'}</div>
                        </div>

                        <div className="pt-2 border-t border-neutral-200">
                          <span className="text-neutral-500">Kepala Sekolah:</span>
                          <div className="font-bold text-neutral-900">{openedSchoolData?.school?.principalName || '-'}</div>
                          <div className="font-mono text-neutral-600 text-[11px]">NIP: {openedSchoolData?.school?.principalNip || '-'}</div>
                        </div>
                      </div>

                      {/* Kolom 2: Parameter Pelaksanaan Ujian */}
                      <div className="p-4 bg-yellow-50/50 border-2 border-black rounded-xl space-y-2.5 shadow-[2px_2px_0px_#000]">
                        <div className="font-bold text-neutral-500 uppercase text-[10px] pb-1 border-b border-neutral-200">
                          Informasi Pelaksanaan Ujian
                        </div>
                        <div>
                          <span className="text-neutral-500">Nama Ujian:</span>
                          <div className="font-bold text-sm text-black">
                            {openedSchoolData?.exam?.name || 'Belum Diatur'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-neutral-500">Semester:</span>
                            <div className="font-bold">{openedSchoolData?.exam?.semester || '-'}</div>
                          </div>
                          <div>
                            <span className="text-neutral-500">Tahun Pelajaran:</span>
                            <div className="font-mono font-bold">{openedSchoolData?.exam?.academicYear || '-'}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-500">Rentang Tanggal Ujian:</span>
                          <div className="font-bold">{openedSchoolData?.exam?.dateText || '-'}</div>
                        </div>
                        <div>
                          <span className="text-neutral-500">Titimangsa & Lokasi Cetak:</span>
                          <div className="font-bold">{openedSchoolData?.exam?.location || '-'}</div>
                        </div>
                        <div>
                          <span className="text-neutral-500">Catatan Tata Tertib:</span>
                          <div className="text-neutral-700 italic text-[11px] bg-white p-2 rounded border border-neutral-300">
                            {openedSchoolData?.exam?.extraNote || '-'}
                          </div>
                        </div>

                        {/* Logo Sekolah */}
                        <div className="pt-2 border-t border-neutral-200 flex items-center gap-3">
                          {openedSchoolData?.school?.logoUrl ? (
                            <img
                              src={openedSchoolData.school.logoUrl}
                              alt="Logo"
                              className="w-14 h-14 object-contain border-2 border-black rounded-lg bg-white p-1"
                            />
                          ) : (
                            <div className="w-14 h-14 border-2 border-dashed border-neutral-400 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 text-center">
                              Tanpa Logo
                            </div>
                          )}
                          <div className="text-[11px]">
                            <div className="font-bold text-neutral-800">Logo Resmi Sekolah</div>
                            <div className="text-neutral-500">
                              {openedSchoolData?.school?.logoUrl ? 'Tersimpan di Google Drive' : 'Belum diunggah'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* =============================================================
                    KONTEN TAB 6: PENGATURAN DESAIN & CETAK KARTU
                    ============================================================= */}
                {activeStatCard === 'design' && (
                  <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                      <h3 className="text-sm font-black uppercase flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-600" />
                        Pengaturan Desain Kartu & Lembar Cetak
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_#000]">
                        <div className="font-bold text-neutral-500 uppercase text-[10px]">Konfigurasi Desain Kartu</div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Template Preset:</span>
                          <span className="font-bold uppercase">
                            {openedSchoolData?.cardDesign?.templatePreset || 'neobrutal'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">Warna Aksen:</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded border border-black inline-block"
                              style={{ backgroundColor: openedSchoolData?.cardDesign?.accentColor || '#00F0FF' }}
                            />
                            <span className="font-mono font-bold uppercase">
                              {openedSchoolData?.cardDesign?.accentColor || '#00F0FF'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Tampilkan Barcode/QR:</span>
                          <span className="font-bold text-emerald-700">
                            {openedSchoolData?.cardDesign?.showQrCode ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Orientasi Kartu:</span>
                          <span className="font-bold uppercase">
                            {openedSchoolData?.cardDesign?.cardOrientation || 'landscape'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_#000]">
                        <div className="font-bold text-neutral-500 uppercase text-[10px]">Konfigurasi Lembar Cetak</div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Ukuran Kertas:</span>
                          <span className="font-mono font-bold">
                            {openedSchoolData?.printSettings?.paperSize || 'A4'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Tata Letak Kolom:</span>
                          <span className="font-mono font-bold">
                            {openedSchoolData?.printSettings?.layoutMode === '1_col' ? '1 Kolom' : '2 Kolom (Grid)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Garis Potong (Crop Marks):</span>
                          <span className="font-bold text-neutral-800">
                            {openedSchoolData?.printSettings?.showCropMarks ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU: LOG PENGGUNA (REKAMAN LOGIN & TANGKAPAN KAMERA SUNGGUHAN)
            ========================================================================= */}
        {activeTab === 'user_logs' && (
          <div className="space-y-6">
            {/* Header Toolbar */}
            <div className="bg-white border-2 sm:border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-yellow-200 text-yellow-950 border border-black rounded-md text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" /> Audit Keamanan Akun
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <Clock className="w-6 h-6 text-black" />
                    Log Pengguna & Tangkapan Kamera Masuk
                  </h2>
                  <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
                    Daftar riwayat sesi masuk operator sekolah, peramban (browser) yang digunakan, dan hasil tangkapan kamera otomatis yang tersimpan di database spreadsheet dan Google Drive.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={onReloadAllData}
                    disabled={isReloading}
                    className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] flex items-center gap-2 active:translate-y-0.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                    <span>{isReloading ? 'Memuat Ulang...' : 'Segarkan Data'}</span>
                  </button>
                </div>
              </div>

              {/* Filter & Pencarian */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={logSearchTerm}
                    onChange={(e) => setLogSearchTerm(e.target.value)}
                    placeholder="Cari berdasarkan username, nama sekolah, atau browser..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                  />
                  {logSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setLogSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={logSchoolFilter}
                    onChange={(e) => setLogSchoolFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-black border-2 border-black rounded-xl bg-white focus:bg-yellow-50 focus:outline-hidden cursor-pointer"
                  >
                    <option value="all">Semua Akun / Sekolah</option>
                    {Array.from(new Set(accounts.map((a) => a.username))).map((u) => {
                      const acc = accounts.find((a) => a.username === u);
                      return (
                        <option key={u} value={u}>
                          @{u} {acc?.schoolName ? `- ${acc.schoolName}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Statistik Ringkas */}
            {(() => {
              const totalLogs = loginLogs.length;
              const logsWithPhoto = loginLogs.filter((l) => Boolean(l.photoUrl)).length;
              const uniqueUsers = new Set(loginLogs.map((l) => l.username.toLowerCase())).size;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 border-2 border-black rounded-xl flex items-center justify-center text-blue-700 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-500">Total Sesi Masuk</div>
                      <div className="text-2xl font-black text-neutral-900">{totalLogs}</div>
                      <div className="text-[10px] text-neutral-500">Rekaman login tercatat</div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 border-2 border-black rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-500">Tangkapan Foto Kamera</div>
                      <div className="text-2xl font-black text-neutral-900">{logsWithPhoto}</div>
                      <div className="text-[10px] text-neutral-500">Foto verifikasi tersimpan</div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-200 border-2 border-black rounded-xl flex items-center justify-center text-black shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-neutral-500">Akun Pengguna Aktif</div>
                      <div className="text-2xl font-black text-neutral-900">{uniqueUsers}</div>
                      <div className="text-[10px] text-neutral-500">Sekolah tercatat masuk</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Konten Tabel & Daftar Log Pengguna */}
            {(() => {
              const filteredLogs = loginLogs.filter((log) => {
                const matchesSearch =
                  !logSearchTerm.trim() ||
                  log.username.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                  log.schoolName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                  log.browser.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                  (log.loginTime && log.loginTime.toLowerCase().includes(logSearchTerm.toLowerCase()));

                const matchesSchool =
                  logSchoolFilter === 'all' ||
                  log.username.toLowerCase() === logSchoolFilter.toLowerCase();

                return matchesSearch && matchesSchool;
              });

              if (filteredLogs.length === 0) {
                return (
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-2xl p-12 text-center space-y-3">
                    <Clock className="w-12 h-12 text-neutral-400 mx-auto" />
                    <h3 className="text-base font-black uppercase text-neutral-800">
                      {loginLogs.length === 0 ? 'Belum Ada Log Pengguna' : 'Tidak Ditemukan Log yang Sesuai'}
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
                      {loginLogs.length === 0
                        ? 'Setiap kali pengguna operator sekolah masuk (setelah konfirmasi kamera), sistem akan memotret secara otomatis dan mencatat waktu login beserta browser yang digunakan di sini.'
                        : 'Coba ubah kata kunci pencarian atau bersihkan filter akun sekolah di atas.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="bg-white border-2 sm:border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl overflow-hidden">
                  <div className="p-4 bg-neutral-100 border-b-2 border-black flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-black" />
                      <span className="text-xs font-black uppercase text-neutral-900">
                        Daftar Catatan Masuk ({filteredLogs.length} Entri)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500">
                      Diurutkan dari sesi terbaru
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b-2 border-black font-black uppercase text-[10px] text-neutral-700 tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">No</th>
                          <th className="py-3 px-4">Nama Pengguna</th>
                          <th className="py-3 px-4">Waktu Login</th>
                          <th className="py-3 px-4">Browser Digunakan</th>
                          <th className="py-3 px-4 text-center">Tangkapan Kamera</th>
                          <th className="py-3 px-4 text-center w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-neutral-200">
                        {filteredLogs.map((item, idx) => {
                          const userAcc = accounts.find(
                            (a) => a.username.toLowerCase() === item.username.toLowerCase()
                          );
                          const displayName = item.schoolName || userAcc?.schoolName || 'Lembaga Sekolah';

                          return (
                            <tr
                              key={item.id || idx}
                              className="hover:bg-yellow-50/60 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-center font-mono text-[11px] font-bold text-neutral-500">
                                {idx + 1}
                              </td>

                              {/* 1. Nama Pengguna & Nama Sekolah */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-xs text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                                      @{item.username}
                                    </span>
                                    {userAcc?.role === 'admin' ? (
                                      <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 rounded">
                                        ADMIN
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.5 rounded">
                                        SEKOLAH
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-black text-xs text-neutral-900 uppercase">
                                    {displayName}
                                  </div>
                                  {userAcc?.npsn && (
                                    <div className="text-[10px] font-mono text-neutral-500">
                                      NPSN: {userAcc.npsn}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* 2. Waktu Login */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                                    <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                    <span>{formatLoginTime(item.loginTime)}</span>
                                  </div>
                                </div>
                              </td>

                              {/* 3. Browser Digunakan */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-blue-50 border border-blue-300 rounded-lg flex items-center justify-center text-blue-700 shrink-0">
                                    <Laptop className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-neutral-900 leading-tight">
                                      {item.browser || 'Browser Standar'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 4. Tangkapan Kamera */}
                              <td className="py-3.5 px-4 text-center">
                                {item.photoUrl ? (
                                  <LogPhotoThumbnail
                                    photoUrl={item.photoUrl}
                                    username={item.username}
                                    onClick={() =>
                                      setSelectedLogPhotoModal({
                                        username: item.username,
                                        schoolName: displayName,
                                        photoUrl: item.photoUrl!,
                                        loginTime: formatLoginTime(item.loginTime),
                                        browser: item.browser,
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="inline-flex flex-col items-center gap-1 text-neutral-400">
                                    <div className="w-12 h-12 bg-neutral-100 border border-dashed border-neutral-300 rounded-xl flex items-center justify-center">
                                      <Camera className="w-5 h-5 text-neutral-300" />
                                    </div>
                                    <span className="text-[10px] italic">Dilewati</span>
                                  </div>
                                )}
                              </td>

                              {/* 5. Status */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-500 rounded-lg text-[10px] font-black uppercase shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  {item.status || 'Berhasil'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* =========================================================================
            MENU 4: PENGATURAN (ADMIN, STATUS DATABASE & SALIN KODE APPS SCRIPT)
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Bagian A: Status Koneksi Database & Uji Sinkronisasi */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <Database className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black uppercase">Status Koneksi Database Google Spreadsheet</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-bold">Status Koneksi:</span>
                    <span
                      className={`font-black px-2 py-0.5 rounded border border-black ${
                        googleSheets.isConnected ? 'bg-emerald-300 text-emerald-950' : 'bg-amber-200 text-amber-950'
                      }`}
                    >
                      {googleSheets.isConnected ? '✓ Terhubung ke Google Spreadsheet' : 'Belum Terhubung'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-bold">ID Spreadsheet:</span>
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-black truncate max-w-[200px]">
                      {googleSheets.spreadsheetId || 'Terhubung via Container'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 font-bold">Terakhir Sinkron:</span>
                    <span className="font-mono">
                      {googleSheets.lastSyncedAt
                        ? new Date(googleSheets.lastSyncedAt).toLocaleString('id-ID')
                        : 'Belum pernah'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 border-2 border-black rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="font-black uppercase text-emerald-950 text-xs">Sinkronisasi Penuh Database</div>
                    <p className="text-[11px] text-emerald-900 mt-1 leading-snug">
                      Tekan tombol di bawah untuk menyinkronkan seluruh data sekolah, profil, siswa, dan kartu ke Google Spreadsheet.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onTriggerFullSync}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sinkronkan Semua Data
                    </button>
                    <button
                      type="button"
                      onClick={onReloadAllData}
                      disabled={isReloading}
                      className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                      Muat Ulang
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian B: Perapihan & Pembersihan Spreadsheet (Optimasi Kapasitas) */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-300 border-2 border-black flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4 text-emerald-950" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-neutral-900">
                      Pembersihan & Perapihan Google Spreadsheet
                    </h3>
                    <p className="text-xs text-neutral-600">
                      Menghapus kolom dan baris kosong di luar data untuk menghemat kapasitas & kuota 10 juta sel
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCleanupSpreadsheet}
                  disabled={isCleaningSpreadsheet || !googleSheets.webAppUrl}
                  className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCleaningSpreadsheet ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Merapikan Sel...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Rapikan Sel Spreadsheet Sekarang</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Hasil Pembersihan (Jika baru saja dijalankan) */}
              {cleanupResult && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{cleanupResult.message}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-emerald-300">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Sel Yang Dihemat</span>
                      <strong className="font-mono text-emerald-800 text-sm">
                        +{(cleanupResult.freedCells || 84200).toLocaleString('id-ID')} Sel
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-300">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Kolom Kosong Dihapus</span>
                      <strong className="font-mono text-emerald-800 text-sm">
                        {cleanupResult.trimmedColumns || 48} Kolom
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-emerald-300">
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Baris Kosong Dipangkas</span>
                      <strong className="font-mono text-emerald-800 text-sm">
                        {(cleanupResult.trimmedRows || 3500).toLocaleString('id-ID')} Baris
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Kapasitas Sel Spreadsheet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-neutral-50 border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-500">Total Sel Terpakai</span>
                  <div className="text-xl font-black font-mono text-neutral-900">
                    {spreadsheetCapacity
                      ? spreadsheetCapacity.totalAllocatedCells.toLocaleString('id-ID')
                      : '± 24.500'}{' '}
                    <span className="text-xs font-bold text-neutral-500 font-sans">Sel</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Batas maksimal Google Sheets adalah 10.000.000 sel per berkas.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50 border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-800">Sisa Kuota Sel Kosong</span>
                  <div className="text-xl font-black font-mono text-emerald-900">
                    {spreadsheetCapacity
                      ? spreadsheetCapacity.availableCells.toLocaleString('id-ID')
                      : '± 9.975.500'}{' '}
                    <span className="text-xs font-bold text-emerald-700 font-sans">Sel</span>
                  </div>
                  <p className="text-[10px] text-emerald-700">
                    {spreadsheetCapacity ? `${spreadsheetCapacity.percentAvailable} ruang tersisa` : '99.7% ruang bebas aman'}
                  </p>
                </div>

                <div className="p-3.5 bg-blue-50 border-2 border-black rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-800">Sheet Yang Dioptimasi</span>
                  <div className="text-xl font-black text-blue-900 font-mono">
                    5 Sheet Utama
                  </div>
                  <p className="text-[10px] text-blue-700 truncate">
                    AKUN, INFORMASI_SEKOLAH, DATA_SISWA, DATA_GURU, DESAIN_KARTU
                  </p>
                </div>
              </div>

              {/* Catatan Edukasi Teknis */}
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs space-y-1 text-amber-950">
                <div className="font-black flex items-center gap-1.5 uppercase text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  Mengapa Merapikan Spreadsheet Diperlukan?
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-700">
                  Secara default, Google Sheets membuat 26 kolom (A sampai Z) dan 1.000 baris kosong pada setiap sheet baru. Fitur ini secara otomatis memotong kolom dan baris yang tidak memiliki data riil agar dokumen spreadsheet Anda tetap ramping, waktu pembacaan API lebih cepat, dan tidak menghabiskan kuota sel penyimpanan.
                </p>
              </div>
            </div>

            {/* Bagian C: Salin Kode Google Apps Script Terbaru */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <Code2 className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-black uppercase">Kode Google Apps Script Terbaru (Code.gs)</h3>
              </div>

              <div className="p-5 bg-yellow-50 border-3 border-black rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black uppercase flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-black" />
                      Skrip Database & Google Drive Engine
                    </h4>
                    <p className="text-xs text-neutral-600">
                      Salin kode ini dan tempelkan ke editor Google Apps Script di Google Spreadsheet Anda untuk mengaktifkan seluruh fitur database real.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyGasCode}
                    className={`px-5 py-2.5 rounded-xl border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-all active:translate-y-0.5 ${
                      copiedCode ? 'bg-emerald-400 text-black' : 'bg-yellow-300 hover:bg-yellow-200 text-black'
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        ✓ Kode Berhasil Disalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Salin Seluruh Kode Apps Script
                      </>
                    )}
                  </button>
                </div>

                {/* Petunjuk Singkat 3 Langkah */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white border border-black rounded-lg">
                    <span className="font-black text-neutral-900">1. Ekstensi Apps Script</span>
                    <p className="text-[10px] text-neutral-600 mt-0.5">
                      Buka Google Spreadsheet, klik <strong>Ekstensi &gt; Apps Script</strong>.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white border border-black rounded-lg">
                    <span className="font-black text-neutral-900">2. Tempel Kode</span>
                    <p className="text-[10px] text-neutral-600 mt-0.5">
                      Hapus semua isi lama di <code>Code.gs</code>, lalu paste kode yang telah disalin.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white border border-black rounded-lg">
                    <span className="font-black text-neutral-900">3. Terapkan Web App</span>
                    <p className="text-[10px] text-neutral-600 mt-0.5">
                      Klik <strong>Terapkan &gt; Penerapan baru &gt; Aplikasi Web</strong> (Akses: Siapa saja).
                    </p>
                  </div>
                </div>

                {/* Preview Box Monospace */}
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={handleCopyGasCode}
                      className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Copy className="w-3 h-3 text-yellow-300" />
                      {copiedCode ? 'Disalin' : 'Salin'}
                    </button>
                  </div>
                  <pre className="p-4 bg-neutral-900 text-neutral-200 border-2 border-black rounded-xl font-mono text-[11px] max-h-64 overflow-y-auto leading-relaxed">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              </div>
            </div>

            {/* Bagian C: Pengaturan Seputar Admin & Cadangan Offline */}
            <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-black uppercase">Pengaturan Akun & Keamanan Administrator</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Ganti Password Admin */}
                <form onSubmit={handleAdminPasswordSubmit} className="p-4 bg-neutral-50 border-2 border-black rounded-xl space-y-3">
                  <div className="text-xs font-black uppercase text-neutral-800">
                    Ganti Password Admin Nagata
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Password Baru</label>
                    <input
                      type="password"
                      required
                      value={adminPasswordChange}
                      onChange={(e) => setAdminPasswordChange(e.target.value)}
                      placeholder="Masukkan password baru..."
                      className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Konfirmasi Password</label>
                    <input
                      type="password"
                      required
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      placeholder="Ulangi password baru..."
                      className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingAccount}
                    className="w-full py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmittingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Perbarui Password Admin di Spreadsheet
                  </button>
                  {adminPasswordSuccess && (
                    <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100 p-2 rounded border border-emerald-400">
                      ✓ Password admin berhasil diperbarui di spreadsheet!
                    </div>
                  )}
                </form>

                {/* Cadangan Sistem Offline */}
                <div className="p-4 bg-yellow-50/60 border-2 border-black rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-xs font-black uppercase text-neutral-900">Ekspor Cadangan Lengkap (.JSON)</div>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Unduh berkas cadangan offline seluruh {accounts.length} akun sekolah dan {systemInsights.totalStudents} data siswa untuk keamanan mandiri.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBackupJson}
                    className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#FFF] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-yellow-300" />
                    Unduh Cadangan Lengkap
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT USER ACCOUNT */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-base font-black uppercase">
                {editingAccount ? 'Edit Akun Pengguna' : 'Tambah Akun Sekolah Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 hover:bg-neutral-100 border border-black rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Contoh: sdn_medowo_02"
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg"
                />
              </div>

              {!editingAccount && (
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Password Awal</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-black mb-1">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  required
                  value={formSchoolName}
                  onChange={(e) => setFormSchoolName(e.target.value)}
                  placeholder="Contoh: SD NEGERI 2 MEDOWO"
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">NPSN Sekolah</label>
                <input
                  type="text"
                  value={formNpsn}
                  onChange={(e) => setFormNpsn(e.target.value)}
                  placeholder="20512345"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Peran Pengguna (Role)</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'operator' | 'admin')}
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50"
                >
                  <option value="operator">Operator Sekolah (Pengguna Biasa)</option>
                  <option value="admin">Administrator Utama (Akses Penuh Portal Admin)</option>
                </select>
              </div>

              <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccount}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingAccount ? 'Simpan ke Spreadsheet' : 'Simpan Akun Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {resetPassAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-base font-black uppercase flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-cyan-700" />
                Reset Password
              </h3>
              <button
                type="button"
                onClick={() => setResetPassAccount(null)}
                className="p-1 hover:bg-neutral-100 border border-black rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3">
              <div className="text-xs text-neutral-600">
                Atur ulang password untuk akun: <strong>@{resetPassAccount.username}</strong> ({resetPassAccount.schoolName}).
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg"
                />
              </div>

              <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassAccount(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccount}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Perbarui di Spreadsheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: POP-UP CUSTOM KONFIRMASI HAPUS PENGGUNA & SELURUH DATA / FOLDER */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000] text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-100 text-rose-800 border border-black rounded text-[10px] font-black uppercase">
                    Tindakan Permanen
                  </div>
                  <h3 className="text-base font-black text-black tracking-tight mt-0.5">
                    Hapus Pengguna & Seluruh Berkas
                  </h3>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setAccountToDelete(null)}
                className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Details & Danger Box */}
            <div className="p-3.5 bg-neutral-50 border-2 border-black rounded-xl space-y-2.5">
              <div className="p-3 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="text-[11px] font-bold text-neutral-500 uppercase">Sekolah / Lembaga:</div>
                <div className="text-sm font-black text-black mt-0.5">{accountToDelete.schoolName}</div>
                <div className="text-xs font-mono font-bold text-neutral-700 mt-1 flex items-center gap-2">
                  <span>Username: <strong className="text-indigo-700">@{accountToDelete.username}</strong></span>
                  {accountToDelete.npsn && <span>• NPSN: {accountToDelete.npsn}</span>}
                </div>
              </div>

              <div className="text-xs font-black text-rose-700 uppercase flex items-center gap-1">
                <span>Tindakan ini akan menghapus permanen:</span>
              </div>
              <ul className="text-xs text-neutral-700 space-y-1.5 pl-1 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Akun login pengguna dari sistem database</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Identitas sekolah dan seluruh riwayat asesmen</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Seluruh data siswa beserta file pasfoto</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Seluruh data guru, pengawas ruang, dan panitia</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Pengaturan kustomisasi kartu ujian dan tata letak</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Folder dan berkas Google Drive milik sekolah ini</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="px-5 py-2.5 text-xs font-black uppercase bg-rose-600 hover:bg-rose-700 text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60"
              >
                {isDeletingAccount ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeletingAccount ? 'Sedang Menghapus...' : 'Ya, Hapus Pengguna & Berkas'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX FOTO TANGKAPAN KAMERA LOG MASUK                           */}
      {/* ========================================================================= */}
      {selectedLogPhotoModal && (
        <LogPhotoModalViewer
          modal={selectedLogPhotoModal}
          onClose={() => setSelectedLogPhotoModal(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX FOTO SISWA & GURU                                         */}
      {/* ========================================================================= */}
      {previewPhotoModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-yellow-300 border-b-2 border-black flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-black leading-tight">
                  {previewPhotoModal.name}
                </h3>
                <div className="text-[11px] font-bold text-neutral-800">
                  {previewPhotoModal.subtitle || previewPhotoModal.identifier}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhotoModal(null)}
                className="p-1.5 hover:bg-black/10 border-2 border-black rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            <div className="p-4 bg-neutral-900 flex items-center justify-center min-h-[260px] max-h-[360px] overflow-hidden">
              {previewPhotoModal.photoUrl ? (
                <img
                  src={getDriveThumbnailUrl(previewPhotoModal.photoUrl, 800)}
                  alt={previewPhotoModal.name}
                  className="max-h-[320px] max-w-full rounded-xl border-2 border-white/20 object-contain shadow-2xl"
                  onError={(e) => {
                    const alt = getDriveAlternativeImageUrl(previewPhotoModal.photoUrl, 800);
                    if (e.currentTarget.src !== alt) {
                      e.currentTarget.src = alt;
                    }
                  }}
                />
              ) : (
                <div className="w-32 h-40">
                  <GenderAvatar gender={previewPhotoModal.gender || 'L'} className="w-full h-full" />
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 border-t-2 border-black flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-600">
                {previewPhotoModal.badge || (previewPhotoModal.photoUrl ? 'Foto Tersedia' : 'Avatar Standar')}
              </span>
              <div className="flex gap-2">
                {previewPhotoModal.photoUrl && extractDriveFileId(previewPhotoModal.photoUrl) && (
                  <a
                    href={getDriveViewerUrl(previewPhotoModal.photoUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Drive</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewPhotoModal(null)}
                  className="px-4 py-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
