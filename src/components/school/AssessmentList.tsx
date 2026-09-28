import React, { useState } from 'react';
import { Exam, ExamScheduleItem } from '../../types';
import {
  DAYS_OF_WEEK,
  createDefaultScheduleDays,
  parseExamSchedule,
  serializeExamSchedule,
  formatScheduleDateIndo,
  formatReadableIndonesianDate,
} from '../../utils/scheduleHelper';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  Sparkles,
  Search,
  AlertCircle,
  X,
  Save,
  Layers,
  FileText,
} from 'lucide-react';

interface AssessmentListProps {
  exams: Exam[];
  activeExam: Exam;
  onSelectActiveExam: (exam: Exam) => void;
  onAddExam: (exam: Exam) => void;
  onUpdateExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({
  exams = [],
  activeExam,
  onSelectActiveExam,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form State
  const [formData, setFormData] = useState<Exam>({
    id: '',
    name: '',
    semester: 'Semester Ganjil',
    academicYear: '2026/2027',
    dateText: '',
    location: '',
    signatureDate: '',
    scheduleInfo: '',
    extraNote: '',
  });

  // Schedule Rows State (JSON serializable)
  const [scheduleItems, setScheduleItems] = useState<ExamScheduleItem[]>([]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredExams = exams.filter((e) => {
    const q = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.semester.toLowerCase().includes(q) ||
      e.academicYear.toLowerCase().includes(q) ||
      (e.location && e.location.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      id: `exam_${Date.now()}`,
      name: '',
      semester: 'Semester Ganjil',
      academicYear: '2026/2027',
      dateText: '',
      location: '',
      signatureDate: '',
      scheduleInfo: '',
      extraNote: '',
    });
    setScheduleItems(createDefaultScheduleDays());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({ ...exam });
    setScheduleItems(parseExamSchedule(exam.scheduleInfo));
    setIsModalOpen(true);
  };

  const handleDuplicate = (exam: Exam) => {
    const duplicated: Exam = {
      ...exam,
      id: `exam_${Date.now()}`,
      name: `${exam.name} (Salinan)`,
      isActive: false,
    };
    onAddExam(duplicated);
  };

  const handleUpdateScheduleItem = (
    index: number,
    field: keyof ExamScheduleItem,
    value: string
  ) => {
    setScheduleItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddScheduleItem = () => {
    setScheduleItems((prev) => {
      const nextIdx = prev.length;
      const lastItem = prev[prev.length - 1];
      let nextDay = 'Senin';
      if (lastItem?.day) {
        const lastDayIdx = DAYS_OF_WEEK.indexOf(lastItem.day);
        if (lastDayIdx !== -1) {
          nextDay = DAYS_OF_WEEK[(lastDayIdx + 1) % DAYS_OF_WEEK.length];
        }
      }

      // Hitung tanggal berikutnya jika tanggal sebelumnya berformat YYYY-MM-DD
      let nextDate = '';
      if (lastItem?.date && lastItem.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const d = new Date(lastItem.date);
          d.setDate(d.getDate() + 1);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const dayNum = String(d.getDate()).padStart(2, '0');
          nextDate = `${y}-${m}-${dayNum}`;
        } catch {
          nextDate = '';
        }
      }

      return [
        ...prev,
        {
          id: `day_${nextIdx + 1}_${Date.now()}`,
          day: nextDay,
          date: nextDate,
          time: lastItem?.time || '07.30 - 09.30',
          subject: '',
          time2: '',
          subject2: '',
        },
      ];
    });
  };

  const handleDeleteScheduleItem = (index: number) => {
    if (scheduleItems.length <= 1) return;
    setScheduleItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Serialize schedule items to JSON string
    const jsonSchedule = serializeExamSchedule(scheduleItems);
    const updatedExam: Exam = {
      ...formData,
      scheduleInfo: jsonSchedule,
    };

    if (editingExam) {
      onUpdateExam(updatedExam);
    } else {
      onAddExam(updatedExam);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-[#FFE600] border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase mb-1">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            Manajemen Asesmen & Ujian
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
            Data Asesmen & Jadwal Ujian
          </h2>
          <p className="text-xs sm:text-sm text-neutral-800 font-medium">
            Kelola nama ujian, semester, tahun ajaran, jadwal mata pelajaran, dan tentukan asesmen mana yang sedang aktif digunakan untuk kartu.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#FFF] flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5 shrink-0"
        >
          <Plus className="w-4 h-4 text-yellow-300" />
          <span>Tambah Asesmen Baru</span>
        </button>
      </div>

      {/* Search & Active Info Bar */}
      <div className="bg-white border-2 border-black rounded-xl p-3 sm:p-4 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama ujian, semester, tahun ajaran..."
            className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:outline-hidden focus:bg-yellow-50"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-neutral-600">Asesmen Aktif:</span>
          <span className="px-2.5 py-1 bg-yellow-300 border border-black rounded-lg font-black text-black shadow-[1px_1px_0px_#000] truncate max-w-[200px] sm:max-w-xs">
            {activeExam?.name || 'Belum Dipilih'}
          </span>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredExams.map((ex) => {
          const isActive = ex.id === activeExam?.id;
          return (
            <div
              key={ex.id}
              className={`bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between transition-all duration-150 relative ${
                isActive ? 'ring-3 ring-black bg-yellow-50/50' : 'hover:bg-neutral-50/60'
              }`}
            >
              {/* Active Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isActive ? (
                    <span className="px-2.5 py-1 bg-yellow-300 text-black border border-black rounded-md text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      Asesmen Aktif Terpilih
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectActiveExam(ex)}
                      className="px-2 py-0.5 bg-neutral-100 hover:bg-yellow-200 border border-black rounded text-[10px] font-bold text-neutral-700 cursor-pointer shadow-xs"
                      title="Jadikan Asesmen Aktif untuk Kartu"
                    >
                      Pilih Sebagai Aktif
                    </button>
                  )}
                  <span className="px-2 py-0.5 bg-neutral-100 border border-black rounded text-[10px] font-mono font-bold text-neutral-600">
                    {ex.academicYear || '-'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(ex)}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg text-neutral-700 cursor-pointer shadow-xs"
                    title="Duplikat Asesmen"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(ex)}
                    className="p-1.5 bg-neutral-100 hover:bg-yellow-200 border border-black rounded-lg text-neutral-900 cursor-pointer shadow-xs"
                    title="Edit Asesmen"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {exams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(ex.id)}
                      className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-black rounded-lg cursor-pointer shadow-xs"
                      title="Hapus Asesmen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Details */}
              <div className="space-y-2 mt-1">
                <h3 className="text-base font-black uppercase text-neutral-900 tracking-tight leading-snug">
                  {ex.name}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    {ex.semester || '-'}
                  </span>
                  {ex.dateText && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {ex.dateText}
                    </span>
                  )}
                  {ex.signatureDate && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 text-[10px] font-bold">
                      <FileText className="w-3 h-3 text-amber-700" />
                      TTD: {formatReadableIndonesianDate(ex.signatureDate)}
                    </span>
                  )}
                  {ex.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {ex.location}
                    </span>
                  )}
                </div>

                {/* Schedule preview if present */}
                {ex.scheduleInfo && (() => {
                  const scheduleList = parseExamSchedule(ex.scheduleInfo);
                  const activeList = scheduleList.filter(
                    (s) => s.subject.trim() || s.date.trim() || (s.subject2 && s.subject2.trim())
                  );

                  if (activeList.length === 0) {
                    return (
                      <div className="mt-2.5 p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-[11px] text-neutral-600 font-mono">
                        <strong className="block text-neutral-800 font-sans mb-0.5 text-[10px] uppercase font-bold">
                          Jadwal Pelaksanaan:
                        </strong>
                        {ex.scheduleInfo}
                      </div>
                    );
                  }

                  return (
                    <div className="mt-2.5 p-2.5 bg-neutral-50 border-2 border-neutral-300 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-1">
                        <span className="text-neutral-900 font-sans text-[10px] uppercase font-black flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-700" />
                          <span>Jadwal Pelaksanaan:</span>
                        </span>
                        <span className="px-1.5 py-0.2 bg-yellow-300 border border-black rounded text-[9.5px] font-black uppercase text-black">
                          {activeList.length} Hari Asesmen
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        {activeList.map((item, sIdx) => (
                          <div
                            key={item.id || sIdx}
                            className="p-1.5 bg-white border border-neutral-200 rounded-lg flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-700">
                              <span>
                                {item.day}
                                {item.date ? `, ${formatScheduleDateIndo(item.date)}` : ''}
                              </span>
                              {item.time && (
                                <span className="font-mono text-neutral-500 text-[9.5px]">
                                  {item.time}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-neutral-900 text-[11px] truncate mt-0.5">
                              {item.subject || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Extra Notes */}
                {ex.extraNote && (
                  <p className="text-[11px] text-neutral-500 italic mt-1">
                    "{ex.extraNote}"
                  </p>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-3 mt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-mono">
                  ID: {ex.id}
                </span>

                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => onSelectActiveExam(ex)}
                    className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-y-0.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Jadikan Asesmen Aktif</span>
                  </button>
                ) : (
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                    ✓ Digunakan pada Cetakan Kartu
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredExams.length === 0 && (
        <div className="bg-white border-2 border-black rounded-xl p-8 text-center max-w-md mx-auto shadow-[3px_3px_0px_#000]">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h4 className="text-sm font-black uppercase">Asesmen Tidak Ditemukan</h4>
          <p className="text-xs text-neutral-600 mt-1 mb-3">
            Tidak ada data asesmen yang sesuai dengan kata kunci pencarian.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
          >
            Tambah Asesmen Baru
          </button>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT ASESMEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl w-full max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-yellow-300 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-black" />
                <h3 className="text-sm sm:text-base font-black uppercase">
                  {editingExam ? 'Edit Data Asesmen' : 'Tambah Asesmen Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Nama Asesmen / Ujian Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: ASESMEN SUMATIF AKHIR SEMESTER (ASAS)"
                  className="w-full px-3 py-2 text-xs font-bold uppercase border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden bg-white"
                  >
                    <option value="Semester Ganjil">Semester Ganjil (1)</option>
                    <option value="Semester Genap">Semester Genap (2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Waktu / Rentang Tanggal Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={formData.dateText}
                    onChange={(e) => setFormData({ ...formData, dateText: e.target.value })}
                    placeholder="Contoh: 01 - 08 Desember 2026"
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Tempat / Kota Titimangsa
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Kediri"
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Tanggal Titimangsa / Tanda Tangan Kartu
                </label>
                <input
                  type="text"
                  value={formData.signatureDate || ''}
                  onChange={(e) => setFormData({ ...formData, signatureDate: e.target.value })}
                  placeholder="Contoh: 01 Desember 2026"
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                />
                <p className="text-[10.5px] text-neutral-500 mt-1 font-medium">
                  Digunakan untuk tanggal pada kolom tanda tangan kepala sekolah di kartu ujian (misal: <em>Kediri, 01 Desember 2026</em>). Jika dikosongkan, otomatis menggunakan tanggal pelaksanaan.
                </p>
              </div>

              {/* Dynamic Schedule Builder (JSON format in spreadsheet) */}
              <div className="space-y-3 pt-3 border-t-2 border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      <span>Jadwal Pelaksanaan Asesmen</span>
                      <span className="text-[10px] bg-yellow-300 text-black px-2 py-0.5 rounded font-black border border-black ml-1">
                        Format Database JSON
                      </span>
                    </label>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Atur hari, tanggal, dan mata pelajaran untuk setiap hari asesmen. Jumlah baris hari dapat ditambah bebas (&gt; 6 hari).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddScheduleItem}
                    className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Hari (+ Hari ke-{scheduleItems.length + 1})</span>
                  </button>
                </div>

                {/* List Baris Hari Asesmen */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {scheduleItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-neutral-50 hover:bg-yellow-50/40 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] space-y-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black uppercase text-neutral-800">
                            Hari Asesmen ke-{idx + 1}
                          </span>
                        </div>

                        {scheduleItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteScheduleItem(idx)}
                            className="p-1 hover:bg-rose-100 text-neutral-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="Hapus baris hari ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                        {/* Pilihan Hari: 3 cols */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-black uppercase text-neutral-600 mb-0.5">
                            Pilihan Hari <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={item.day}
                            onChange={(e) => handleUpdateScheduleItem(idx, 'day', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:outline-hidden"
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Tanggal: 4 cols */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-black uppercase text-neutral-600 mb-0.5 flex items-center justify-between">
                            <span>Tanggal</span>
                            {item.date && (
                              <span className="text-[9.5px] font-bold text-amber-700 font-mono">
                                {formatScheduleDateIndo(item.date)}
                              </span>
                            )}
                          </label>
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => handleUpdateScheduleItem(idx, 'date', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:outline-hidden"
                          />
                        </div>

                        {/* Waktu / Jam: 5 cols */}
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-black uppercase text-neutral-600 mb-0.5">
                            Waktu / Jam Pelaksanaan
                          </label>
                          <input
                            type="text"
                            value={item.time || ''}
                            onChange={(e) => handleUpdateScheduleItem(idx, 'time', e.target.value)}
                            placeholder="Contoh: 07.30 - 09.30"
                            className="w-full px-2 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:outline-hidden"
                          />
                        </div>

                        {/* Jadwal Pelajaran / Mata Pelajaran: 12 cols */}
                        <div className="sm:col-span-12">
                          <label className="block text-[10px] font-black uppercase text-neutral-600 mb-0.5">
                            Jadwal Mata Pelajaran
                          </label>
                          <input
                            type="text"
                            value={item.subject || ''}
                            onChange={(e) => handleUpdateScheduleItem(idx, 'subject', e.target.value)}
                            placeholder="Contoh: Bahasa Indonesia atau Sesi 1: B. Indo (07.30 - 09.00), Sesi 2: PAI (09.30 - 11.00)"
                            className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddScheduleItem}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Hari Asesmen (+ Hari ke-{scheduleItems.length + 1})</span>
                  </button>

                  <span className="text-[11px] font-mono font-bold text-neutral-600">
                    Total: {scheduleItems.length} Hari Terkonfigurasi
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Catatan / Tata Tertib Ujian (Bawah Kartu)
                </label>
                <input
                  type="text"
                  value={formData.extraNote}
                  onChange={(e) => setFormData({ ...formData, extraNote: e.target.value })}
                  placeholder="Contoh: Wajib membawa kartu ini dan perlengkapan tulis setiap hari."
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t-2 border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Asesmen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-5 max-w-sm w-full space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-base font-black uppercase">Hapus Asesmen Ini?</h3>
            <p className="text-xs text-neutral-600">
              Asesmen ini akan dihapus dari sistem. Pastikan asesmen lain terpilih sebagai asesmen aktif.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExam(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white border-2 border-black rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
