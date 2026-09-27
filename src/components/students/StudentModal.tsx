import React, { useState, useEffect, useRef } from 'react';
import { Student, Gender } from '../../types';
import { GenderAvatar } from '../common/GenderAvatar';
import { fileToDataUrl } from '../../utils/photoMatcher';
import { X, Upload, Trash2, Camera, UserCheck, Video } from 'lucide-react';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  onDelete?: (id: string) => void;
  initialStudent?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialStudent,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('L');
  const [religion, setReligion] = useState('Islam');
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [className, setClassName] = useState('Kelas 6A');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [examRoom, setExamRoom] = useState('Ruang 01');
  const [examSeat, setExamSeat] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name || '');
      setGender(initialStudent.gender || 'L');
      setReligion(initialStudent.religion || 'Islam');
      setNisn(initialStudent.nisn || '');
      setNis(initialStudent.nis || '');
      setClassName(initialStudent.className || 'Kelas 6A');
      setBirthPlace(initialStudent.birthPlace || '');
      setBirthDate(initialStudent.birthDate || '');
      setExamRoom(initialStudent.examRoom || 'Ruang 01');
      setExamSeat(initialStudent.examSeat || '');
      setPhotoUrl(initialStudent.photoUrl || '');
    } else {
      setName('');
      setGender('L');
      setReligion('Islam');
      setNisn('');
      setNis('');
      setClassName('Kelas 6A');
      setBirthPlace('');
      setBirthDate('');
      setExamRoom('Ruang 01');
      setExamSeat('');
      setPhotoUrl('');
    }
    setErrorMessage('');
  }, [initialStudent, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Format file harus berupa gambar (JPG, PNG, atau WEBP).');
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setPhotoUrl(dataUrl);
      } catch {
        setErrorMessage('Gagal memproses file foto.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama Lengkap siswa wajib diisi!');
      return;
    }

    const newStudent: Student = {
      id: initialStudent?.id || `std_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      gender,
      religion: religion.trim(),
      nisn: nisn.trim() || `GEN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      nis: nis.trim(),
      className: className.trim(),
      birthPlace: birthPlace.trim(),
      birthDate: birthDate.trim(),
      examRoom: examRoom.trim(),
      examSeat: examSeat.trim(),
      photoUrl: photoUrl.trim(),
      createdAt: initialStudent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">
              {initialStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
            <p className="text-xs text-neutral-500">
              Lengkapi informasi siswa untuk kartu ujian sekolah.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-100 border-2 border-rose-500 rounded-lg text-xs font-bold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Photo & Gender Row */}
          <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-5">
            {/* Photo Avatar Preview */}
            <div className="w-24 h-28 border-2 border-black rounded-lg overflow-hidden bg-white shadow-[2px_2px_0px_#000] flex-shrink-0 flex items-center justify-center relative group">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
              ) : (
                <GenderAvatar gender={gender} religion={religion} className="w-full h-full" />
              )}
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded border border-black shadow hover:bg-red-700"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Photo upload action */}
            <div className="flex-1 space-y-2">
              <div className="text-xs font-bold text-neutral-800">Foto Profil Siswa</div>
              <p className="text-[11px] text-neutral-500">
                Format: JPG, PNG, atau WEBP. Anda dapat mengunggah file foto atau memotret langsung dengan kamera. Bila belum ada foto, sistem otomatis menyematkan{' '}
                <strong>
                  Avatar Siswa {gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                </strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-cyan-200 hover:bg-cyan-300 text-black border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {photoUrl ? 'Ganti File' : 'Unggah File'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Ambil Lewat Kamera
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-black border border-black rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Gunakan Avatar Saja
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ahmad Rizky Pratama"
              className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
            />
          </div>

          {/* Gender, Agama & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGender('L')}
                  className={`py-2 px-2 border-2 border-black rounded-lg text-xs font-black flex items-center justify-center cursor-pointer ${
                    gender === 'L' ? 'bg-sky-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  Laki-Laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender('P')}
                  className={`py-2 px-2 border-2 border-black rounded-lg text-xs font-black flex items-center justify-center cursor-pointer ${
                    gender === 'P' ? 'bg-rose-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  Perempuan
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Agama Siswa <span className="text-rose-500">*</span>
              </label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden bg-white"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">Kelas / Rombel</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Contoh: Kelas 6A"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* NISN & NIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">NISN (10 Digit)</label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Contoh: 0123456789"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">NIS (Nomor Induk Sekolah)</label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 2023001"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* TTL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Contoh: Kediri"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Ruang & Meja */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-black mb-1">Ruang Ujian</label>
              <input
                type="text"
                value={examRoom}
                onChange={(e) => setExamRoom(e.target.value)}
                placeholder="Contoh: Ruang 01"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Nomor Meja / Peserta</label>
              <input
                type="text"
                value={examSeat}
                onChange={(e) => setExamSeat(e.target.value)}
                placeholder="Contoh: 01"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3">
            {initialStudent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialStudent.id);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Hapus data siswa ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Siswa Ini
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black uppercase bg-yellow-300 hover:bg-yellow-200 border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                {initialStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => setPhotoUrl(dataUrl)}
        title="Ambil Pasfoto Siswa"
      />
    </div>
  );
};
