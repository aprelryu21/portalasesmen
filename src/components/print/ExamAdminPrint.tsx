import React, { useState } from 'react';
import { School, Exam, Student, Teacher } from '../../types';
import { parseExamSchedule, formatScheduleDateIndo } from '../../utils/scheduleHelper';
import {
  FileText,
  Building2,
  Lock,
  Award,
  Users,
  Calendar,
  ShieldCheck,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  BookmarkCheck,
  ArrowLeft,
  ArrowRight,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  School as SchoolIcon,
} from 'lucide-react';

export type ExamAdminDocType =
  | 'cover'
  | 'school_profile'
  | 'confidentiality_statement'
  | 'committee_decree'
  | 'participant_count'
  | 'assessment_schedule'
  | 'room_proctors'
  | 'committee_attendance'
  | 'participant_attendance'
  | 'student_rules'
  | 'proctor_rules';

interface ExamAdminPrintProps {
  school: School;
  exam: Exam;
  students: Student[];
  teachers: Teacher[];
  onBackToMenu: () => void;
}

interface AdminDocItem {
  id: ExamAdminDocType;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
}

export const ADMIN_DOCUMENTS: AdminDocItem[] = [
  {
    id: 'cover',
    number: 1,
    title: 'COVER',
    subtitle: 'Sampul Dokumen Portofolio Ujian',
    description: 'Halaman sampul resmi bundel dokumen administrasi pelaksanaan asesmen lengkap dengan logo sekolah, nama ujian, dan tahun ajaran.',
    icon: FileText,
    color: 'bg-rose-100 text-rose-950 border-rose-300',
    badge: 'Dokumen Utama',
  },
  {
    id: 'school_profile',
    number: 2,
    title: 'PROFIL SEKOLAH',
    subtitle: 'Identitas & Data Satuan Pendidikan',
    description: 'Lembar profil resmi memuat NPSN, NSS, alamat lengkap, kontak sekolah, serta kepala sekolah penanggung jawab asesmen.',
    icon: Building2,
    color: 'bg-blue-100 text-blue-950 border-blue-300',
    badge: 'Identitas',
  },
  {
    id: 'confidentiality_statement',
    number: 3,
    title: 'SURAT PERNYATAAN KERAHASIAAN',
    subtitle: 'Pakta Integritas Pengamanan Naskah & Nilai',
    description: 'Surat pernyataan integritas dan komitmen menjaga kerahasiaan naskah soal serta dokumen asesmen bermaterai resmi.',
    icon: Lock,
    color: 'bg-amber-100 text-amber-950 border-amber-300',
    badge: 'Pakta Integritas',
  },
  {
    id: 'committee_decree',
    number: 4,
    title: 'SURAT KEPUTUSAN PANITIA',
    subtitle: 'SK Penetapan Panitia Asesmen',
    description: 'Surat Keputusan (SK) Kepala Sekolah tentang susunan panitia, pembagian tugas penanggung jawab, ketua, sekretaris, dan bendahara.',
    icon: Award,
    color: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    badge: 'Legalitas',
  },
  {
    id: 'participant_count',
    number: 5,
    title: 'JUMLAH PESERTA',
    subtitle: 'Rekapitulasi Data Peserta Asesmen',
    description: 'Tabel rekapitulasi jumlah siswa laki-laki, perempuan, total per rombel/kelas, serta distribusi per ruang ujian.',
    icon: Users,
    color: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    badge: 'Data Statistik',
  },
  {
    id: 'assessment_schedule',
    number: 6,
    title: 'JADWAL ASESMEN',
    subtitle: 'Jadwal Pelaksanaan Mata Pelajaran & Waktu',
    description: 'Tabel matriks jadwal pelaksanaan ujian per hari, tanggal, sesi waktu, dan mata pelajaran yang diujikan secara resmi.',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-950 border-purple-300',
    badge: 'Jadwal Resmi',
  },
  {
    id: 'room_proctors',
    number: 7,
    title: 'PENGAWAS RUANG',
    subtitle: 'Daftar & Penugasan Pengawas Ruang',
    description: 'Matriks pembagian tugas guru pengawas ruang ujian per sesi, nomor ruang, tanggal pelaksanaan, dan tanda tangan penugasan.',
    icon: ShieldCheck,
    color: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    badge: 'Penugasan',
  },
  {
    id: 'committee_attendance',
    number: 8,
    title: 'DAFTAR HADIR PANITIA',
    subtitle: 'Presensi Harian Panitia Penyelenggara',
    description: 'Formulir presensi tanda tangan harian panitia pelaksana ujian lengkap dengan jabatan, waktu hadir, dan keterangan tugas.',
    icon: ClipboardList,
    color: 'bg-teal-100 text-teal-950 border-teal-300',
    badge: 'Presensi Panitia',
  },
  {
    id: 'participant_attendance',
    number: 9,
    title: 'DAFTAR HADIR PESERTA',
    subtitle: 'Presensi Siswa per Ruang Ujian',
    description: 'Lembar absensi tanda tangan peserta ujian per ruang, mencakup nomor meja, NISN, nama lengkap, dan status kehadiran.',
    icon: ListChecks,
    color: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    badge: 'Presensi Siswa',
  },
  {
    id: 'student_rules',
    number: 10,
    title: 'TATA TERTIB PESERTA',
    subtitle: 'Peraturan & Larangan Siswa Selama Ujian',
    description: 'Petunjuk tata tertib peserta ujian, kewajiban membawa kartu, larangan membawa alat komunikasi, dan sanksi pelanggaran.',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-950 border-orange-300',
    badge: 'Tata Tertib',
  },
  {
    id: 'proctor_rules',
    number: 11,
    title: 'TATA TERTIB PENGAWAS',
    subtitle: 'Panduan & Kode Etik Pengawas Ruang',
    description: 'Pedoman operasional standar pengawas ruang sebelum, saat, dan sesudah ujian berlangsung demi kelancaran dan integritas asesmen.',
    icon: BookmarkCheck,
    color: 'bg-pink-100 text-pink-950 border-pink-300',
    badge: 'Kode Etik',
  },
];

export const ExamAdminPrint: React.FC<ExamAdminPrintProps> = ({
  school,
  exam,
  students,
  teachers,
  onBackToMenu,
}) => {
  const [activeDoc, setActiveDoc] = useState<ExamAdminDocType | null>(null);

  // Jika sedang membuka salah satu dari 11 dokumen
  if (activeDoc) {
    const docInfo = ADMIN_DOCUMENTS.find((d) => d.id === activeDoc);
    const scheduleItems = parseExamSchedule(exam?.scheduleInfo);

    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        {/* Top Bar Navigation */}
        <div className="bg-white border-3 border-black shadow-[5px_5px_0px_#000] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveDoc(null)}
              className="p-2 bg-neutral-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5 shrink-0"
              title="Kembali ke Daftar Administrasi Ujian"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-200 text-rose-950 border border-black rounded text-[10px] font-black uppercase mb-1">
                <span>Dokumen #{docInfo?.number}</span>
                <span>•</span>
                <span>{docInfo?.badge}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-neutral-900">
                {docInfo?.title}
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                {docInfo?.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={() => setActiveDoc(null)}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-2 border-black rounded-xl text-xs font-black uppercase cursor-pointer"
            >
              Daftar Menu
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>

        {/* Quick Context Strip */}
        <div className="bg-neutral-50 border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-neutral-700">
            <SchoolIcon className="w-4 h-4 text-neutral-500" />
            <span>{school?.name || 'Sekolah Terdaftar'}</span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-900 uppercase">{exam?.name || 'Asesmen Ujian'}</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            Tahun Ajaran: {exam?.academicYear || '-'} • Semester: {exam?.semester || '-'}
          </div>
        </div>

        {/* Document Preview Placeholder Container */}
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
          {/* Header Preview / Kop Sekolah Mini */}
          <div className="text-center pb-5 border-b-2 border-black space-y-1.5">
            {school?.logoUrl && (
              <img
                src={school.logoUrl}
                alt="Logo Sekolah"
                className="w-16 h-16 mx-auto object-contain mb-2"
              />
            )}
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900">
              {school?.name || 'PEMERINTAH KABUPATEN / KOTA'}
            </h3>
            <p className="text-xs font-medium text-neutral-600">
              {school?.address ? `${school.address}, ${school.village || ''}, ${school.district || ''}` : 'Alamat Satuan Pendidikan'}
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000]">
                {docInfo?.title}
              </span>
            </div>
          </div>

          {/* Subtitle & Info Asesmen */}
          <div className="text-center space-y-1">
            <h4 className="text-sm sm:text-base font-black uppercase text-neutral-800">
              {exam?.name || 'ASESMEN SUMATIF'}
            </h4>
            <p className="text-xs font-semibold text-neutral-600">
              Tahun Ajaran {exam?.academicYear || '2026/2027'} — {exam?.semester || 'Semester Ganjil'}
            </p>
          </div>

          {/* Document Content Placeholder Box */}
          <div className="p-6 sm:p-8 bg-neutral-50 border-2 border-dashed border-neutral-400 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-xl mx-auto flex items-center justify-center shadow-[2px_2px_0px_#000]">
              {docInfo?.icon && <docInfo.icon className="w-6 h-6 text-black" />}
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h5 className="text-sm font-black uppercase text-neutral-900">
                Struktur Dokumen {docInfo?.title} Telah Disiapkan
              </h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {docInfo?.description}
              </p>
            </div>

            {/* Quick Context Summary based on document */}
            {activeDoc === 'assessment_schedule' && (
              <div className="mt-4 pt-4 border-t border-neutral-200 text-left max-w-xl mx-auto">
                <span className="text-[11px] font-black uppercase text-neutral-700 block mb-2">
                  Preview Jadwal Terdata ({scheduleItems.length} Hari Asesmen):
                </span>
                <div className="space-y-1 text-xs">
                  {scheduleItems.slice(0, 4).map((it, idx) => (
                    <div key={it.id || idx} className="p-2 bg-white border border-neutral-200 rounded-lg flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{it.day}, {formatScheduleDateIndo(it.date) || '-'}</span>
                      <span className="text-neutral-600">{it.time || '07.30 - 09.30'} • {it.subject || '(Mata Pelajaran Belum Diisi)'}</span>
                    </div>
                  ))}
                  {scheduleItems.length > 4 && (
                    <p className="text-[10px] text-neutral-500 italic text-center pt-1">
                      + {scheduleItems.length - 4} hari lainnya
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeDoc === 'participant_count' && (
              <div className="mt-4 pt-4 border-t border-neutral-200 text-center max-w-sm mx-auto">
                <div className="inline-flex items-center gap-3 bg-white border border-black rounded-xl p-3 shadow-xs text-xs font-bold">
                  <span>Total Peserta: {students.length} Siswa</span>
                  <span>•</span>
                  <span>Pengawas: {teachers.length} Guru</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Format dan tata letak isi dokumen ini akan dikonfigurasi pada tahap berikutnya.
              </span>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setActiveDoc(null)}
              className="px-4 py-2 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke 11 Menu</span>
            </button>

            <span className="text-[11px] text-neutral-500 font-mono">
              Dokumen {docInfo?.number} dari 11
            </span>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN UTAMA: GRID 11 MENU ADMINISTRASI UJIAN
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-rose-100 border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Koleksi Cetak Administrasi Ujian Resmi
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-rose-700" />
              Administrasi Pelaksanaan Ujian
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl font-medium mt-1">
              Pusat pencetakan bundel portofolio administrasi ujian untuk <strong>{exam?.name || 'Asesmen Ujian'}</strong> di <strong>{school?.name || 'Sekolah'}</strong>. Silakan pilih dokumen yang ingin dicetak di bawah ini.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToMenu}
            className="px-4 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>
        </div>
      </div>

      {/* Grid 11 Sub-menu Dokumen Administrasi Ujian: 2 menu per baris di Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {ADMIN_DOCUMENTS.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className="group bg-white hover:bg-rose-50/40 border-2 sm:border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all duration-150 flex flex-col justify-between cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Header Card: Nomor & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shadow-[1.5px_1.5px_0px_#FFE600]">
                      {doc.number}
                    </span>
                    <span className="px-2.5 py-0.5 bg-neutral-100 border border-black rounded text-[10px] font-bold text-neutral-700 uppercase">
                      {doc.badge}
                    </span>
                  </div>

                  <div className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center ${doc.color} shadow-[1.5px_1.5px_0px_#000]`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-neutral-900 group-hover:text-rose-700 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                    {doc.subtitle}
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                    {doc.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  Format A4 Resmi
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 group-hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] transition-all">
                  <span>Buka Berkas</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
