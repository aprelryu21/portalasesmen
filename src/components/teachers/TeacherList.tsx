import React, { useState, useMemo } from 'react';
import { Teacher, Gender, School, Exam } from '../../types';
import { GenderAvatar } from '../common/GenderAvatar';
import { TeacherModal } from './TeacherModal';
import { ImportTeacherExcelModal } from './ImportTeacherExcelModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { downloadTeacherExcelTemplate } from '../../utils/excel';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit,
  ArrowUpDown,
  Briefcase,
  Users,
  CheckCircle,
  ShieldCheck,
  ChevronDown,
  X,
  Phone,
} from 'lucide-react';

interface TeacherListProps {
  teachers: Teacher[];
  school: School;
  exam: Exam;
  selectedTeacherIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void | Promise<void>;
  onBulkDelete: (ids: string[]) => void | Promise<void>;
  onBatchAddTeachers: (newTeachers: Teacher[]) => void;
  onNavigateToPrintProctor?: () => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  school,
  exam,
  selectedTeacherIds,
  onToggleSelect,
  onSelectAll,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onBulkDelete,
  onBatchAddTeachers,
  onNavigateToPrintProctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'name' | 'nip' | 'subject'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'bulk';
    teacher?: Teacher;
    ids?: string[];
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered & Sorted teachers
  const filteredTeachers = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueList = (teachers || []).filter((t) => {
      if (!t || !t.id) return false;
      if (seenIds.has(t.id)) return false;
      seenIds.add(t.id);
      return true;
    });

    return uniqueList
      .filter((t) => {
        const cleanQuery = searchTerm.toLowerCase();
        const matchesSearch =
          !cleanQuery ||
          Boolean(t.name && t.name.toLowerCase().includes(cleanQuery)) ||
          Boolean(t.nip && t.nip.toLowerCase().includes(cleanQuery)) ||
          Boolean(t.subject && t.subject.toLowerCase().includes(cleanQuery)) ||
          Boolean(t.roomDuty && t.roomDuty.toLowerCase().includes(cleanQuery));

        const matchesGender = genderFilter === 'ALL' || t.gender === genderFilter;
        const matchesRole = roleFilter === 'ALL' || t.roleType === roleFilter;

        return matchesSearch && matchesGender && matchesRole;
      })
      .sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        const compare = valA.localeCompare(valB, undefined, { numeric: true });
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [teachers, searchTerm, genderFilter, roleFilter, sortField, sortOrder]);

  const allFilteredSelected =
    filteredTeachers.length > 0 &&
    filteredTeachers.every((t) => selectedTeacherIds.includes(t.id));

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const unselectIds = new Set(filteredTeachers.map((t) => t.id));
      const remaining = selectedTeacherIds.filter((id) => !unselectIds.has(id));
      onSelectAll(false);
      remaining.forEach((id) => onToggleSelect(id));
    } else {
      const currentSet = new Set(selectedTeacherIds);
      filteredTeachers.forEach((t) => {
        if (!currentSet.has(t.id)) onToggleSelect(t.id);
      });
    }
  };

  const handleBulkDeleteSelected = () => {
    if (selectedTeacherIds.length === 0) return;
    setDeleteTarget({
      type: 'bulk',
      ids: [...selectedTeacherIds],
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      if (deleteTarget.type === 'single' && deleteTarget.teacher) {
        await onDeleteTeacher(deleteTarget.teacher.id);
      } else if (deleteTarget.type === 'bulk' && deleteTarget.ids) {
        await onBulkDelete(deleteTarget.ids);
      }
    } catch (err) {
      console.error('Gagal menghapus data guru:', err);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const toggleSort = (field: 'name' | 'nip' | 'subject') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Stats
  const totalGuru = teachers.length;
  const totalPengawas = teachers.filter((t) => t.roleType === 'pengawas').length;
  const totalPria = teachers.filter((t) => t.gender === 'L').length;
  const totalWanita = teachers.filter((t) => t.gender === 'P').length;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3 sm:p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-neutral-500">Total Guru</span>
            <Briefcase className="w-4 h-4 text-black" />
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1">{totalGuru}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Tenaga Pendidik</div>
        </div>

        <div className="p-3 sm:p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-indigo-700">Pengawas Ruang</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">{totalPengawas}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Tugas Jaga Ujian</div>
        </div>

        <div className="p-3 sm:p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-sky-800">Guru Pria (L)</span>
            <span className="text-xs font-black px-1.5 py-0.2 bg-sky-100 rounded border border-black">L</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-800 mt-1">{totalPria}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Laki-laki</div>
        </div>

        <div className="p-3 sm:p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-800">Guru Wanita (P)</span>
            <span className="text-xs font-black px-1.5 py-0.2 bg-rose-100 rounded border border-black">P</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-800 mt-1">{totalWanita}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Perempuan</div>
        </div>
      </div>

      {/* 2. ACTIONS & SEARCH BAR */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_#000] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru berdasarkan nama, NIP, mapel, atau ruang..."
              className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-xl focus:bg-yellow-50 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel</span>
            </button>

            <button
              type="button"
              onClick={downloadTeacherExcelTemplate}
              className="px-2.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
              title="Unduh Template Excel Guru"
            >
              <Download className="w-4 h-4" />
            </button>

            {onNavigateToPrintProctor && (
              <button
                type="button"
                onClick={onNavigateToPrintProctor}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cetak ID Pengawas</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 text-xs">
          <span className="font-bold text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 focus:bg-white"
          >
            <option value="ALL">Semua Gender</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-bold border-2 border-black rounded-lg bg-neutral-50 focus:bg-white"
          >
            <option value="ALL">Semua Tugas</option>
            <option value="pengawas">Pengawas Ruang</option>
            <option value="panitia">Panitia Ujian</option>
            <option value="guru">Guru Mata Pelajaran</option>
            <option value="wali_kelas">Wali Kelas</option>
          </select>

          {/* Bulk Delete Button if selected */}
          {selectedTeacherIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDeleteSelected}
              className="ml-auto px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus {selectedTeacherIds.length} Terpilih</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TABLE OF TEACHERS */}
      <div className="bg-white border-2 sm:border-3 border-black rounded-xl sm:rounded-2xl shadow-[5px_5px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-900 text-white font-black uppercase text-[10px] tracking-wider border-b-2 border-black">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAllFiltered}
                    className="w-4 h-4 accent-yellow-400 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 w-16 text-center">Foto</th>
                <th
                  className="p-3 cursor-pointer hover:bg-neutral-800 select-none"
                  onClick={() => toggleSort('nip')}
                >
                  <div className="flex items-center gap-1">
                    NIP / NUPTK <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="p-3 cursor-pointer hover:bg-neutral-800 select-none"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nama Guru & Gelar <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 w-14 text-center">L/P</th>
                <th className="p-3 w-20">Agama</th>
                <th
                  className="p-3 cursor-pointer hover:bg-neutral-800 select-none"
                  onClick={() => toggleSort('subject')}
                >
                  <div className="flex items-center gap-1">
                    Mata Pelajaran / Jabatan <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Tugas Ujian</th>
                <th className="p-3">Ruang</th>
                <th className="p-3">Kontak</th>
                <th className="p-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-medium">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-neutral-500">
                    <Briefcase className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-neutral-700">Belum ada data guru</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tambahkan guru secara manual atau import berkas Excel untuk memulai.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, idx) => {
                  const isSelected = selectedTeacherIds.includes(teacher.id);
                  return (
                    <tr
                      key={`tch_row_${teacher.id}_${idx}`}
                      className={`hover:bg-yellow-50/60 transition-colors ${
                        isSelected ? 'bg-yellow-50/90' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(teacher.id)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-neutral-500">
                        {idx + 1}
                      </td>

                      <td className="p-2 text-center">
                        <div className="w-9 h-11 mx-auto rounded border border-black overflow-hidden shadow-[1px_1px_0px_#000] bg-white flex items-center justify-center">
                          {teacher.photoUrl ? (
                            <img
                              src={teacher.photoUrl}
                              alt={teacher.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <GenderAvatar
                              gender={teacher.gender || 'L'}
                              religion={teacher.religion}
                              className="w-full h-full"
                            />
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-neutral-800">
                        {teacher.nip || '-'}
                      </td>

                      <td className="p-3 font-bold text-neutral-900">
                        {teacher.name}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border border-black ${
                            teacher.gender === 'L' ? 'bg-sky-200 text-sky-900' : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {teacher.gender}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-neutral-300 bg-neutral-100 text-neutral-800">
                          {teacher.religion || 'Islam'}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-neutral-800">
                        {teacher.subject}
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border border-black ${
                            teacher.roleType === 'pengawas'
                              ? 'bg-indigo-100 text-indigo-900'
                              : teacher.roleType === 'panitia'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {teacher.roleType === 'pengawas'
                            ? 'Pengawas Ruang'
                            : teacher.roleType === 'panitia'
                            ? 'Panitia Ujian'
                            : teacher.roleType === 'wali_kelas'
                            ? 'Wali Kelas'
                            : 'Guru Mapel'}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-neutral-800">
                        {teacher.roomDuty || '-'}
                      </td>

                      <td className="p-3 text-[11px] text-neutral-600">
                        {teacher.phone || teacher.email || '-'}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTeacher(teacher);
                            }}
                            className="p-1.5 bg-yellow-100 hover:bg-yellow-200 text-black border border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ type: 'single', teacher });
                            }}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Add / Edit Teacher Modal */}
      <TeacherModal
        isOpen={isAddModalOpen || Boolean(editingTeacher)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTeacher(null);
        }}
        onSave={(saved) => {
          if (editingTeacher) {
            onUpdateTeacher(saved);
          } else {
            onAddTeacher(saved);
          }
        }}
        onDelete={(id) => {
          setDeleteTarget({
            type: 'single',
            teacher: teachers.find((t) => t.id === id),
          });
        }}
        initialTeacher={editingTeacher}
      />

      {/* 2. Import Excel Modal */}
      <ImportTeacherExcelModal
        isOpen={isImportModalOpen}
        existingTeachers={teachers}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={(imported) => {
          onBatchAddTeachers(imported);
        }}
      />

      {/* 3. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === 'single'
            ? 'Konfirmasi Hapus Guru'
            : `Hapus ${deleteTarget?.ids?.length || 0} Guru Terpilih?`
        }
        message={
          deleteTarget?.type === 'single'
            ? `Apakah Anda yakin ingin menghapus data guru "${deleteTarget.teacher?.name}" (NIP: ${deleteTarget.teacher?.nip || '-'})? Tindakan ini akan menghapus data dari memori dan database cloud.`
            : `Apakah Anda yakin ingin menghapus ${deleteTarget?.ids?.length || 0} data guru yang dipilih? Tindakan ini akan langsung menghapus data dari sistem dan database cloud.`
        }
        confirmLabel={
          deleteTarget?.type === 'single'
            ? 'Ya, Hapus Guru'
            : `Hapus ${deleteTarget?.ids?.length || 0} Guru`
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
