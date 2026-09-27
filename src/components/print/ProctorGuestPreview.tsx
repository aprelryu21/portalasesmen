import React, { useState, useMemo } from 'react';
import { School, Exam, Teacher, GuestCardData, Gender } from '../../types';
import { ProctorGuestCard } from '../card/ProctorGuestCard';
import { PinchZoomCardContainer } from '../card/PinchZoomCardContainer';
import { ThemeSliderBox } from '../card/ThemeSliderBox';
import { A4SheetContainer } from './A4SheetContainer';
import { PrintConfirmationModal } from './PrintConfirmationModal';
import { fileToDataUrl } from '../../utils/photoMatcher';
import {
  ShieldCheck,
  UserCheck,
  Printer,
  Sparkles,
  ArrowLeft,
  Search,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Eye,
  X,
  Compass,
  AlertCircle,
} from 'lucide-react';

interface ProctorGuestPreviewProps {
  type: 'proctor' | 'guest';
  school: School;
  exam: Exam;
  teachers?: Teacher[];
  onBackToMenu: () => void;
}

const GUEST_STATUS_PRESETS = [
  'TAMU & MONITORING EVALUASI UJIAN',
  'PENGAWAS SILANG ANTAR SEKOLAH',
  'TIM MONEV DINAS PENDIDIKAN',
  'ASESOR AKREDITASI SEKOLAH',
  'PENINJAU & VERIFIKATOR ASESMEN',
  'KOMITE SEKOLAH / TOKOH MASYARAKAT',
];

export const ProctorGuestPreview: React.FC<ProctorGuestPreviewProps> = ({
  type,
  school,
  exam,
  teachers = [],
  onBackToMenu,
}) => {
  const isProctor = type === 'proctor';
  const title = isProctor ? 'ID Pengawas Ruang & Panitia' : 'ID Tamu & Monitoring Ujian';
  const subtitle = isProctor
    ? 'Tanda Pengenal Pengawas Ruang & Panitia Ujian Sekolah (Otomatis dari Data Guru)'
    : 'Formulir Input Data Tamu & Cetak Tanda Pengenal Resmi Kunjungan / Monev Ujian';

  // 10 Theme Selection & Base Color Controls
  const [themeId, setThemeId] = useState<string>('neobrutal');
  const [themeColor, setThemeColor] = useState<string>('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showLanyard, setShowLanyard] = useState<boolean>(true);
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState<boolean>(false);

  // Modal zoom inspection state
  const [inspectedCardData, setInspectedCardData] = useState<{
    teacher?: Teacher;
    guest?: GuestCardData;
  } | null>(null);

  // Proctor Selection & Search State
  const [selectedIds, setSelectedIds] = useState<string[]>(() => teachers.map((t) => t.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'pengawas' | 'panitia'>('ALL');

  // Filter proctors
  const printableTeachers = useMemo(() => {
    if (!isProctor) return [];
    return teachers.filter((t) => {
      const cleanQ = searchTerm.toLowerCase();
      const matchSearch =
        !cleanQ ||
        t.name.toLowerCase().includes(cleanQ) ||
        t.nip.toLowerCase().includes(cleanQ) ||
        (t.roomDuty && t.roomDuty.toLowerCase().includes(cleanQ));

      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'pengawas' && t.roleType === 'pengawas') ||
        (roleFilter === 'panitia' && t.roleType === 'panitia');

      return matchSearch && matchRole;
    });
  }, [teachers, searchTerm, roleFilter, isProctor]);

  const activeTeachersToPrint = useMemo(() => {
    if (!isProctor) return [];
    const set = new Set(selectedIds);
    return printableTeachers.filter((t) => set.has(t.id));
  }, [printableTeachers, selectedIds, isProctor]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    setSelectedIds(select ? printableTeachers.map((t) => t.id) : []);
  };

  // Guest State - CLEAN WITHOUT DUMMY DATA
  const [guests, setGuests] = useState<GuestCardData[]>([]);

  // Guest Form State (Always shown first on Guest print page)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [guestForm, setGuestForm] = useState<GuestCardData>({
    id: '',
    label: 'TAMU & MONITORING EVALUASI UJIAN',
    name: '',
    nip: '',
    position: '',
    gender: 'L',
    photoUrl: '',
  });

  const resetGuestForm = () => {
    setEditingGuestId(null);
    setGuestForm({
      id: '',
      label: 'TAMU & MONITORING EVALUASI UJIAN',
      name: '',
      nip: '',
      position: '',
      gender: 'L',
      photoUrl: '',
    });
  };

  const handleOpenEditGuest = (g: GuestCardData) => {
    setEditingGuestId(g.id);
    setGuestForm({ ...g });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    if (editingGuestId === id) resetGuestForm();
  };

  const handleSaveGuestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.name.trim()) {
      alert('Mohon masukkan nama tamu.');
      return;
    }

    if (editingGuestId) {
      setGuests((prev) => prev.map((g) => (g.id === editingGuestId ? guestForm : g)));
      resetGuestForm();
    } else {
      const newGuest: GuestCardData = {
        ...guestForm,
        id: `gst_${Date.now()}`,
      };
      setGuests((prev) => [...prev, newGuest]);
      resetGuestForm();
    }
  };

  const handleGuestPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setGuestForm((prev) => ({ ...prev, photoUrl: dataUrl }));
    } catch {
      alert('Gagal memproses foto. Silakan coba file lain.');
    }
  };

  // Pagination calculation for printing
  // Portrait: 6 cards per A4 sheet (2 columns x 3 rows)
  // Landscape: 6 cards per A4 sheet (2 columns x 3 rows)
  const cardsPerPage = 6;

  const proctorPages = useMemo(() => {
    if (!isProctor) return [];
    const p: Teacher[][] = [];
    for (let i = 0; i < activeTeachersToPrint.length; i += cardsPerPage) {
      p.push(activeTeachersToPrint.slice(i, i + cardsPerPage));
    }
    return p.length > 0 ? p : [[]];
  }, [activeTeachersToPrint, isProctor]);

  const guestPages = useMemo(() => {
    if (isProctor) return [];
    const p: GuestCardData[][] = [];
    for (let i = 0; i < guests.length; i += cardsPerPage) {
      p.push(guests.slice(i, i + cardsPerPage));
    }
    return p.length > 0 ? p : [[]];
  }, [guests, isProctor]);

  const handlePrint = () => {
    setIsPrintConfirmOpen(true);
  };

  const handleExecutePrint = () => {
    setIsPrintConfirmOpen(false);
    setTimeout(() => {
      window.focus();
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP TOOLBAR (Hidden on Print) */}
      <div className="no-print bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Menu
          </button>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              {isProctor ? (
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-emerald-600" />
              )}
              {title}
            </h2>
            <p className="text-xs font-medium text-neutral-600">{subtitle}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Orientasi Kartu */}
          <div className="flex bg-neutral-100 p-1 border-2 border-black rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1 rounded transition-colors ${
                orientation === 'portrait'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Potret ↕
            </button>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1 rounded transition-colors ${
                orientation === 'landscape'
                  ? 'bg-yellow-300 text-black border border-black shadow-[1px_1px_0px_#000]'
                  : 'hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Lanskap ↔
            </button>
          </div>

          {/* Lanyard Slot Checkbox */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-neutral-100 border-2 border-black rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showLanyard}
              onChange={(e) => setShowLanyard(e.target.checked)}
              className="w-4 h-4 accent-yellow-400"
            />
            <span>Lubang Tali Lanyard</span>
          </label>

          {/* PRINT BUTTON */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-black uppercase bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Kartu ({isProctor ? activeTeachersToPrint.length : guests.length})
          </button>
        </div>
      </div>

      {/* 2. FORM INPUT TAMU PROMINEN (MUNCUL PERTAMA PADA HALAMAN CETAK KARTU TAMU) */}
      {!isProctor && (
        <div className="no-print bg-[#ECFDF5] border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900">
                  {editingGuestId ? 'Edit Data Kartu Tamu' : 'Form Input Data Tamu & Monev Ujian'}
                </h3>
                <p className="text-[11px] text-neutral-600">
                  Silakan isi form di bawah ini untuk mengisi data pada kartu tamu sebelum dicetak.
                </p>
              </div>
            </div>

            {editingGuestId && (
              <button
                type="button"
                onClick={resetGuestForm}
                className="px-2.5 py-1 text-xs font-bold bg-neutral-200 hover:bg-neutral-300 border border-black rounded-lg"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveGuestForm} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Status Tamu */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-neutral-800">
                1. Status Tamu *
              </label>
              <input
                type="text"
                list="guest-status-presets"
                required
                value={guestForm.label}
                onChange={(e) => setGuestForm({ ...guestForm, label: e.target.value })}
                placeholder="Pilih atau ketik status tamu..."
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl bg-white focus:bg-yellow-50 focus:outline-hidden"
              />
              <datalist id="guest-status-presets">
                {GUEST_STATUS_PRESETS.map((st) => (
                  <option key={st} value={st} />
                ))}
              </datalist>
            </div>

            {/* 2. Nama Tamu */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-neutral-800">
                2. Nama Lengkap Tamu *
              </label>
              <input
                type="text"
                required
                value={guestForm.name}
                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl bg-white focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            {/* 3. NIP Tamu */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-neutral-800">
                3. NIP Tamu / Identitas
              </label>
              <input
                type="text"
                value={guestForm.nip}
                onChange={(e) => setGuestForm({ ...guestForm, nip: e.target.value })}
                placeholder="NIP / NIK / tanda strip (-)"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl bg-white focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            {/* 4. Jabatan/Instansi Tamu */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-neutral-800">
                4. Jabatan / Instansi Tamu *
              </label>
              <input
                type="text"
                required
                value={guestForm.position}
                onChange={(e) => setGuestForm({ ...guestForm, position: e.target.value })}
                placeholder="Contoh: Pengawas Pembina Dinas Pendidikan"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl bg-white focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            {/* 5. Jenis Kelamin */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-neutral-800">
                5. Jenis Kelamin *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGuestForm({ ...guestForm, gender: 'L' })}
                  className={`py-2 px-2 text-xs font-black rounded-xl border-2 border-black cursor-pointer transition-all ${
                    guestForm.gender === 'L'
                      ? 'bg-blue-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Laki-Laki (👨‍💼)
                </button>
                <button
                  type="button"
                  onClick={() => setGuestForm({ ...guestForm, gender: 'P' })}
                  className={`py-2 px-2 text-xs font-black rounded-xl border-2 border-black cursor-pointer transition-all ${
                    guestForm.gender === 'P'
                      ? 'bg-pink-300 text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Perempuan (👩‍💼)
                </button>
              </div>
            </div>

            {/* 6. Unggah Foto Tamu & Submit Button */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase text-neutral-800">
                6. Unggah Foto Tamu (Opsional)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2 text-xs font-bold border-2 border-dashed border-black rounded-xl bg-white hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1.5 truncate">
                  <Upload className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span className="truncate">
                    {guestForm.photoUrl ? 'Ganti Foto...' : 'Pilih File Foto...'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGuestPhotoUpload}
                    className="hidden"
                  />
                </label>

                {guestForm.photoUrl && (
                  <div className="relative shrink-0">
                    <img
                      src={guestForm.photoUrl}
                      alt="Foto Tamu"
                      className="w-9 h-9 rounded-lg object-cover border-2 border-black"
                    />
                    <button
                      type="button"
                      onClick={() => setGuestForm({ ...guestForm, photoUrl: '' })}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]"
                      title="Hapus foto"
                    >
                      ×
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] shrink-0 cursor-pointer transition-transform active:translate-y-0.5"
                >
                  {editingGuestId ? 'Simpan' : '+ Tambah'}
                </button>
              </div>
            </div>
          </form>

          {/* List of Added Guests with Action Chips */}
          {guests.length > 0 && (
            <div className="pt-2 border-t border-black/10 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase text-neutral-700">
                Daftar Tamu Siap Cetak ({guests.length}):
              </span>
              {guests.map((g) => (
                <div
                  key={g.id}
                  className="bg-white border border-black rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-2 shadow-[1px_1px_0px_#000]"
                >
                  <span className="truncate max-w-[150px]">{g.name}</span>
                  <span className="text-[9.5px] px-1 bg-neutral-100 border border-neutral-300 rounded font-mono">
                    {g.gender === 'L' ? 'L' : 'P'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditGuest(g)}
                    className="text-blue-600 hover:text-blue-800 p-0.5"
                    title="Edit tamu ini"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGuest(g.id)}
                    className="text-red-600 hover:text-red-800 p-0.5"
                    title="Hapus tamu ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TEMA SELECTION SLIDER BOX (KOTAK GESER KOMPAK DENGAN PILIHAN WARNA DASAR) */}
      <ThemeSliderBox
        selectedThemeId={themeId}
        onSelectTheme={(id) => setThemeId(id)}
        baseColor={themeColor}
        onChangeBaseColor={(col) => setThemeColor(col)}
        title={isProctor ? 'Pilih Tema ID Card Pengawas' : 'Pilih Tema ID Card Tamu'}
        subtitle="Kotak geser tema agar ringkas dan tidak memakan ruang layar. Pilih tema & sesuaikan warna dasar kartu."
      />

      {/* 4. PROCTOR FILTER TOOLBAR */}
      {isProctor && (
        <div className="no-print bg-white border-2 border-black rounded-xl p-3 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari pengawas / ruang..."
                className="pl-8 pr-2.5 py-1 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'pengawas' | 'panitia')}
              className="px-2.5 py-1 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50"
            >
              <option value="ALL">Semua Tugas</option>
              <option value="pengawas">Khusus Pengawas Ruang</option>
              <option value="panitia">Khusus Panitia Ujian</option>
            </select>

            <button
              type="button"
              onClick={() => handleSelectAll(selectedIds.length !== printableTeachers.length)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {selectedIds.length === printableTeachers.length ? (
                <CheckSquare className="w-3.5 h-3.5 text-black" />
              ) : (
                <Square className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>Pilih Semua ({printableTeachers.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-bold text-neutral-600">
            Terpilih: <strong className="text-indigo-700">{activeTeachersToPrint.length}</strong> dari {teachers.length} Guru
          </div>
        </div>
      )}

      {/* 5. A4 SHEETS PRINT CONTAINER */}
      <div className="print-only-container flex flex-col items-center gap-8 py-2">
        {/* State Empty Warning */}
        {isProctor && activeTeachersToPrint.length === 0 ? (
          <div className="no-print bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-8 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-sm font-black uppercase">Belum ada Guru / Pengawas yang dipilih</h3>
            <p className="text-xs text-neutral-600 mt-1 mb-4">
              Aktifkan tanda centang pada daftar guru untuk mencetak tanda pengenal pengawas.
            </p>
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
            >
              Pilih Semua Pengawas ({printableTeachers.length})
            </button>
          </div>
        ) : !isProctor && guests.length === 0 ? (
          <div className="no-print bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-8 text-center max-w-md">
            <AlertCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-black uppercase">Belum ada data kartu tamu</h3>
            <p className="text-xs text-neutral-600 mt-1 mb-4">
              Silakan isi formulir input data tamu di atas untuk mengisi data dan langsung menampilkan kartu tamu siap cetak.
            </p>
          </div>
        ) : (
          (isProctor ? proctorPages : guestPages).map((pageItems, pageIdx) => (
            <A4SheetContainer
              key={pageIdx}
              pageNumber={pageIdx + 1}
              totalPages={isProctor ? proctorPages.length : guestPages.length}
              totalCards={pageItems.length}
              orientation="portrait"
              marginMm={8}
              className={pageIdx < (isProctor ? proctorPages.length : guestPages.length) - 1 ? 'page-break-after' : ''}
            >
              {/* Grid 6 Kartu per Lembar A4 */}
              <div className="w-full grid grid-cols-2 gap-x-4 gap-y-4 justify-items-center pt-2">
                {pageItems.map((item, idx) => {
                  const teacherItem = isProctor ? (item as Teacher) : undefined;
                  const guestItem = !isProctor ? (item as GuestCardData) : undefined;
                  const itemId = teacherItem ? teacherItem.id : guestItem ? guestItem.id : `${idx}`;

                  return (
                    <div key={`${itemId}_${idx}`} className="print-card-item relative group">
                      <button
                        type="button"
                        onClick={() => setInspectedCardData({ teacher: teacherItem, guest: guestItem })}
                        className="no-print absolute top-1.5 right-1.5 px-2 py-0.5 bg-yellow-300 hover:bg-yellow-400 text-black border border-black rounded text-[9px] font-black shadow-[1px_1px_0px_#000] flex items-center gap-1 z-20 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Perbesar & Inspeksi Kartu Ini (Pinch to Zoom)"
                      >
                        <Eye className="w-2.5 h-2.5" />
                        <span>Zoom</span>
                      </button>

                      <ProctorGuestCard
                        type={type}
                        themeId={themeId}
                        themeColor={themeColor}
                        orientation={orientation}
                        school={school}
                        exam={exam}
                        teacher={teacherItem}
                        guestData={guestItem}
                        showLanyard={showLanyard}
                      />
                    </div>
                  );
                })}
              </div>
            </A4SheetContainer>
          ))
        )}
      </div>

      {/* Pop-up Konfirmasi Cetak ID Pengawas / Tamu */}
      <PrintConfirmationModal
        isOpen={isPrintConfirmOpen}
        onClose={() => setIsPrintConfirmOpen(false)}
        onConfirm={handleExecutePrint}
        cardType={isProctor ? 'Kartu ID Pengawas Ruang & Panitia' : 'Kartu Tanda Pengenal Tamu & Monev'}
        itemCount={isProctor ? activeTeachersToPrint.length : guests.length}
        estimatedSheets={isProctor ? proctorPages.length : guestPages.length}
        orientation="portrait"
      />

      {/* 6. MODAL INSPEKSI DENGAN FITUR PINCH-TO-ZOOM */}
      {inspectedCardData && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl w-full max-w-xl p-4 sm:p-5 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase">
                  Inspeksi &amp; Zoom Kartu: {inspectedCardData.teacher?.name || inspectedCardData.guest?.name || 'Kartu'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedCardData(null)}
                className="p-1 hover:bg-neutral-200 border border-black rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-neutral-100 rounded-xl border border-neutral-300">
              <PinchZoomCardContainer
                cardTitle={inspectedCardData.teacher?.name || inspectedCardData.guest?.name || 'Tanda Pengenal'}
                badgeLabel={orientation === 'portrait' ? 'Potret ↕' : 'Lanskap ↔'}
                initialScale={1.15}
              >
                <ProctorGuestCard
                  type={type}
                  themeId={themeId}
                  themeColor={themeColor}
                  orientation={orientation}
                  school={school}
                  exam={exam}
                  teacher={inspectedCardData.teacher}
                  guestData={inspectedCardData.guest}
                  showLanyard={showLanyard}
                />
              </PinchZoomCardContainer>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">
                Gunakan cubit 2 jari (mobile) atau tombol + / - untuk zoom.
              </span>
              <button
                type="button"
                onClick={() => setInspectedCardData(null)}
                className="px-4 py-1.5 bg-yellow-300 hover:bg-yellow-400 border border-black rounded-lg font-black uppercase text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
