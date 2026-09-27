import React, { useState, useMemo } from 'react';
import { Student, Gender, School, Exam, CardDesignSettings } from '../../types';
import { GenderAvatar } from '../common/GenderAvatar';
import { StudentModal } from './StudentModal';
import { ImportExcelModal } from './ImportExcelModal';
import { BulkPhotoModal } from './BulkPhotoModal';
import { CardPreviewModal } from './CardPreviewModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { downloadExcelTemplate } from '../../utils/excel';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  UploadCloud,
  Printer,
  Trash2,
  Edit,
  Eye,
  Camera,
  CheckSquare,
  Square,
  ArrowUpDown,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  school: School;
  exam: Exam;
  design: CardDesignSettings;
  selectedStudentIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void | Promise<void>;
  onBulkDelete: (ids: string[]) => void | Promise<void>;
  onBatchAddStudents: (newStudents: Student[]) => void;
  onApplyPhotos: (matchedMap: Record<string, string>) => void;
  onNavigateToPrint: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  school,
  exam,
  design,
  selectedStudentIds,
  onToggleSelect,
  onSelectAll,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkDelete,
  onBatchAddStudents,
  onApplyPhotos,
  onNavigateToPrint,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [photoFilter, setPhotoFilter] = useState<'ALL' | 'HAS_PHOTO' | 'AVATAR'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'nisn' | 'className'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkPhotoModalOpen, setIsBulkPhotoModalOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'bulk';
    student?: Student;
    ids?: string[];
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique classes for filter dropdown
  const uniqueClasses = useMemo(() => {
    const safeStudents = (students || []).filter(Boolean);
    const set = new Set(safeStudents.map((s) => s.className).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    // Deduplicate students by ID first to guarantee strictly unique elements
    const seenIds = new Set<string>();
    const uniqueStudents = (students || []).filter((s) => {
      if (!s || !s.id) return false;
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    });

    return uniqueStudents
      .filter((s) => {
        // Search matches name, nisn, or nis
        const cleanQuery = searchTerm.toLowerCase();
        const matchesSearch =
          !cleanQuery ||
          Boolean(s.name && s.name.toLowerCase().includes(cleanQuery)) ||
          Boolean(s.nisn && s.nisn.toLowerCase().includes(cleanQuery)) ||
          Boolean(s.nis && s.nis.toLowerCase().includes(cleanQuery)) ||
          Boolean(s.religion && s.religion.toLowerCase().includes(cleanQuery));

        // Class filter
        const matchesClass = classFilter === 'ALL' || s.className === classFilter;

        // Gender filter
        const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;

        // Photo filter
        const matchesPhoto =
          photoFilter === 'ALL' ||
          (photoFilter === 'HAS_PHOTO' && Boolean(s.photoUrl)) ||
          (photoFilter === 'AVATAR' && !s.photoUrl);

        return matchesSearch && matchesClass && matchesGender && matchesPhoto;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        const compare = valA.localeCompare(valB, undefined, { numeric: true });
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [students, searchTerm, classFilter, genderFilter, photoFilter, sortField, sortOrder]);

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      // Unselect filtered
      const unselectIds = new Set(filteredStudents.map((s) => s.id));
      const remaining = selectedStudentIds.filter((id) => !unselectIds.has(id));
      onSelectAll(false);
      remaining.forEach((id) => onToggleSelect(id));
    } else {
      // Select all filtered
      const currentSet = new Set(selectedStudentIds);
      filteredStudents.forEach((s) => {
        if (!currentSet.has(s.id)) onToggleSelect(s.id);
      });
    }
  };

  const handleBulkDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    setDeleteTarget({
      type: 'bulk',
      ids: selectedStudentIds,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      if (deleteTarget.type === 'single' && deleteTarget.student) {
        await onDeleteStudent(deleteTarget.student.id);
      } else if (deleteTarget.type === 'bulk' && deleteTarget.ids) {
        await onBulkDelete(deleteTarget.ids);
      }
    } catch (err) {
      console.error('Gagal menghapus siswa:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const toggleSort = (field: 'name' | 'nisn' | 'className') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS & QUICK ACTIONS */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-500" />
            Kelola Data Siswa
          </h2>
          <p className="text-xs font-medium text-neutral-600 mt-0.5">
            Kelola data peserta ujian, kelas, agama, ruang, nomor meja, dan foto/avatar
          </p>
        </div>

        {/* Action Buttons: 2 menu dalam 1 baris di mobile, fleksibel di desktop */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className="px-2.5 sm:px-3 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5"
            title="Unduh Template Excel untuk diisi"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Template</span>
            <span className="hidden sm:inline">Template Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-2 text-xs font-black uppercase bg-emerald-300 hover:bg-emerald-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkPhotoModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-2 text-xs font-black uppercase bg-cyan-300 hover:bg-cyan-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5"
          >
            <UploadCloud className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Upload Foto</span>
            <span className="hidden sm:inline">Upload Foto Massal</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-2.5 sm:px-4 py-2 text-xs font-black uppercase bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">+ Tambah</span>
            <span className="hidden sm:inline">+ Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR (KARTU FILTER TERSEMBUNYI, DITAMPILKAN SAAT DIPILIH) */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama, NISN, atau NIS..."
              className="w-full pl-9 pr-8 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 focus:bg-white focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tombol Buka/Tutup Filter Tersembunyi */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3.5 py-2 text-xs font-black rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 transition-all active:translate-y-0.5 shrink-0 ${
              isFilterOpen || (classFilter !== 'ALL' || genderFilter !== 'ALL' || photoFilter !== 'ALL')
                ? 'bg-yellow-300 text-black'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Data</span>
            {(classFilter !== 'ALL' || genderFilter !== 'ALL' || photoFilter !== 'ALL') && (
              <span className="px-1.5 py-0.2 bg-black text-yellow-300 rounded-full text-[10px] font-mono font-bold">
                {(classFilter !== 'ALL' ? 1 : 0) + (genderFilter !== 'ALL' ? 1 : 0) + (photoFilter !== 'ALL' ? 1 : 0)}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Opsi Filter Dropdown (Hanya Muncul Saat Dipilih) */}
        {isFilterOpen && (
          <div className="pt-2 border-t border-neutral-200 space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Filter Kelas */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-neutral-500 mb-1">
                  ROMBEL / KELAS:
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 focus:bg-white"
                >
                  <option value="ALL">Semua Kelas ({uniqueClasses.length} Rombel)</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Gender */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-neutral-500 mb-1">
                  JENIS KELAMIN:
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 focus:bg-white"
                >
                  <option value="ALL">Semua Gender</option>
                  <option value="L">👦 Laki-laki (L)</option>
                  <option value="P">👧 Perempuan (P)</option>
                </select>
              </div>

              {/* Filter Foto */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-neutral-500 mb-1">
                  STATUS FOTO:
                </label>
                <select
                  value={photoFilter}
                  onChange={(e) => setPhotoFilter(e.target.value as typeof photoFilter)}
                  className="w-full px-2.5 py-2 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 focus:bg-white"
                >
                  <option value="ALL">Semua Status Foto</option>
                  <option value="HAS_PHOTO">✓ Hanya Siswa Berfoto</option>
                  <option value="AVATAR">⚠ Hanya Siswa Avatar Gender</option>
                </select>
              </div>
            </div>

            {/* Reset Filter Button */}
            {(classFilter !== 'ALL' || genderFilter !== 'ALL' || photoFilter !== 'ALL') && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setClassFilter('ALL');
                    setGenderFilter('ALL');
                    setPhotoFilter('ALL');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 underline"
                >
                  <X className="w-3 h-3" />
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulk Selection Bar */}
        <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAllFiltered}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-black rounded-lg shadow-[1px_1px_0px_#000]"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400" />
              )}
              {allFilteredSelected ? 'Batal Pilih Semua' : 'Pilih Semua di Hasil Filter'}
            </button>

            <span className="px-2.5 py-1 bg-yellow-200 text-black border border-black rounded-md font-black">
              {selectedStudentIds.length} SISWA DIPILIH
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedStudentIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBulkDeleteSelected();
                  }}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-xs font-black uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  title="Hapus seluruh siswa yang dicentang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus ({selectedStudentIds.length})
                </button>

                <button
                  type="button"
                  onClick={onNavigateToPrint}
                  className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 font-black uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak {selectedStudentIds.length} Siswa Terpilih →
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. STUDENT TABLE / EMPTY STATE */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-yellow-200 border-2 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_#000] text-3xl">
            👨‍🎓
          </div>
          <h3 className="text-base font-black uppercase tracking-tight">Belum Ada Data Siswa</h3>
          <p className="text-xs text-neutral-600 mt-1 mb-6">
            Mulai dengan mengunduh template Excel, mengimport file data, atau menambahkan siswa secara manual.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-emerald-300 hover:bg-emerald-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Import Excel
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + Tambah Siswa
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 border-b-2 border-black text-[11px] font-black uppercase tracking-wider text-neutral-700">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAllFiltered}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                  </th>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3 w-16 text-center">Foto</th>
                  <th
                    className="p-3 cursor-pointer hover:bg-neutral-200 select-none"
                    onClick={() => toggleSort('nisn')}
                  >
                    <div className="flex items-center gap-1">
                      NISN <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3">NIS</th>
                  <th
                    className="p-3 cursor-pointer hover:bg-neutral-200 select-none"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Nama Lengkap <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3 w-14 text-center">L/P</th>
                  <th className="p-3 w-24">Agama</th>
                  <th
                    className="p-3 cursor-pointer hover:bg-neutral-200 select-none"
                    onClick={() => toggleSort('className')}
                  >
                    <div className="flex items-center gap-1">
                      Kelas <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3">Tempat, Tgl Lahir</th>
                  <th className="p-3">Status Foto</th>
                  <th className="p-3 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-medium">
                {filteredStudents.map((student, idx) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <tr
                      key={`row_std_${student.id || student.nisn || idx}_${idx}`}
                      className={`hover:bg-yellow-50/60 transition-colors ${
                        isSelected ? 'bg-yellow-50/90' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(student.id)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-neutral-500">
                        {idx + 1}
                      </td>

                      <td className="p-2 text-center">
                        <div className="w-9 h-11 mx-auto rounded border border-black overflow-hidden shadow-[1px_1px_0px_#000] bg-white flex items-center justify-center">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student?.name || 'Siswa'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <GenderAvatar
                              gender={student?.gender || 'L'}
                              religion={student?.religion}
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-neutral-800">
                        {student.nisn || '-'}
                      </td>

                      <td className="p-3 font-mono text-neutral-600">
                        {student.nis || '-'}
                      </td>

                      <td className="p-3 font-bold text-neutral-900">
                        {student?.name || '-'}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border border-black ${
                            student.gender === 'L' ? 'bg-sky-200 text-sky-900' : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-neutral-300 bg-neutral-100 text-neutral-800">
                          {student.religion || 'Islam'}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-neutral-800">
                        {student.className}
                      </td>

                      <td className="p-3 text-neutral-600 text-[11px]">
                        {[student.birthPlace, student.birthDate].filter(Boolean).join(', ') || '-'}
                      </td>

                      <td className="p-3">
                        {student.photoUrl ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Foto Ada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-400">
                            Avatar {student.gender === 'L' ? 'Pria' : 'Wanita'}
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewStudent(student);
                            }}
                            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Pratinjau Kartu Siswa Ini"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-700" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStudent(student);
                            }}
                            className="p-1.5 bg-cyan-100 hover:bg-cyan-200 border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Edit Data Siswa / Ganti Foto"
                          >
                            <Edit className="w-3.5 h-3.5 text-cyan-800" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                type: 'single',
                                student,
                              });
                            }}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-black rounded shadow-[1px_1px_0px_#000] cursor-pointer transition-colors"
                            title={`Hapus data ${student.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-neutral-100 border-t-2 border-black flex justify-end items-center text-xs font-bold text-neutral-600">
            <div className="font-mono">
              {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} siswa dipilih` : ''}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add / Edit Modal */}
      <StudentModal
        isOpen={isAddModalOpen || editingStudent !== null}
        initialStudent={editingStudent}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
        onDelete={(id) => {
          const s = students.find((item) => item.id === id);
          if (s) {
            setDeleteTarget({
              type: 'single',
              student: s,
            });
          }
        }}
        onSave={(student) => {
          if (editingStudent) {
            onUpdateStudent(student);
          } else {
            onAddStudent(student);
          }
        }}
      />

      {/* 2. Excel Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        existingStudents={students}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(newStudents) => {
          onBatchAddStudents(newStudents);
        }}
      />

      {/* 3. Bulk Photo Modal */}
      <BulkPhotoModal
        isOpen={isBulkPhotoModalOpen}
        students={students}
        onClose={() => setIsBulkPhotoModalOpen(false)}
        onApplyPhotos={(matchedMap) => {
          onApplyPhotos(matchedMap);
        }}
      />

      {/* 4. Single Card Preview Modal */}
      <CardPreviewModal
        isOpen={previewStudent !== null}
        student={previewStudent}
        school={school}
        exam={exam}
        design={design}
        onClose={() => setPreviewStudent(null)}
        onPrintSingle={() => {
          if (previewStudent) {
            onSelectAll(false);
            onToggleSelect(previewStudent.id);
            onNavigateToPrint();
          }
        }}
      />

      {/* 5. Custom Neobrutalist Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.type === 'bulk' ? 'Hapus Siswa Terpilih' : 'Hapus Data Siswa'}
        itemCount={deleteTarget?.type === 'bulk' ? (deleteTarget.ids?.length || 0) : 1}
        studentName={deleteTarget?.student?.name}
        studentNisn={deleteTarget?.student?.nisn}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
};
