import React, { useState, useEffect, useRef } from 'react';
import { Teacher, Gender } from '../../types';
import { GenderAvatar } from '../common/GenderAvatar';
import { fileToDataUrl } from '../../utils/photoMatcher';
import { X, Camera, Trash2, ShieldCheck, UserCheck, Briefcase, Upload } from 'lucide-react';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  onDelete?: (id: string) => void;
  initialTeacher?: Teacher | null;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTeacher,
}) => {
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [gender, setGender] = useState<Gender>('L');
  const [religion, setReligion] = useState('Islam');
  const [subject, setSubject] = useState('Guru Kelas');
  const [roleType, setRoleType] = useState<Teacher['roleType']>('pengawas');
  const [roomDuty, setRoomDuty] = useState('Ruang 01');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTeacher) {
      setName(initialTeacher.name || '');
      setNip(initialTeacher.nip || '');
      setGender(initialTeacher.gender || 'L');
      setReligion(initialTeacher.religion || 'Islam');
      setSubject(initialTeacher.subject || 'Guru Kelas');
      setRoleType(initialTeacher.roleType || 'pengawas');
      setRoomDuty(initialTeacher.roomDuty || 'Ruang 01');
      setPhone(initialTeacher.phone || '');
      setEmail(initialTeacher.email || '');
      setPhotoUrl(initialTeacher.photoUrl || '');
    } else {
      setName('');
      setNip('-');
      setGender('L');
      setReligion('Islam');
      setSubject('Guru Kelas');
      setRoleType('pengawas');
      setRoomDuty('Ruang 01');
      setPhone('');
      setEmail('');
      setPhotoUrl('');
    }
    setErrorMessage('');
  }, [initialTeacher, isOpen]);

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
      setErrorMessage('Nama Lengkap Guru beserta Gelar wajib diisi!');
      return;
    }

    const newTeacher: Teacher = {
      id: initialTeacher?.id || `tch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      nip: nip.trim() || '-',
      gender,
      religion: religion.trim(),
      subject: subject.trim(),
      roleType,
      roomDuty: roomDuty.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photoUrl: photoUrl.trim(),
      createdAt: initialTeacher?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newTeacher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Briefcase className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">
                {initialTeacher ? 'Edit Data Guru & Pengawas' : 'Tambah Guru & Pengawas Baru'}
              </h3>
              <p className="text-xs text-neutral-500">
                Lengkapi identitas tenaga pendidik untuk data sekolah & kartu ID Pengawas.
              </p>
            </div>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Foto & Avatar Preview */}
          <div className="p-4 bg-neutral-50 border-2 border-black rounded-xl flex flex-wrap sm:flex-nowrap items-center gap-5">
            <div className="w-24 h-28 border-2 border-black rounded-lg overflow-hidden bg-white shadow-[2px_2px_0px_#000] shrink-0 flex items-center justify-center relative group">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview Foto Guru" className="w-full h-full object-cover" />
              ) : (
                <GenderAvatar
                  role="teacher"
                  isAdult={true}
                  gender={gender}
                  religion={religion}
                  className="w-full h-full"
                />
              )}
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded border border-black shadow hover:bg-red-700 cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="text-xs font-bold text-neutral-800">Foto Profil Guru / Pengawas</div>
              <p className="text-[11px] text-neutral-500">
                Format: JPG, PNG, atau WEBP. Anda dapat mengunggah file foto atau memotret langsung dengan kamera. Bila belum ada foto, sistem otomatis menyematkan{' '}
                <strong>Avatar Guru {gender === 'L' ? 'Pria' : 'Wanita'}</strong>.
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
                  className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {photoUrl ? 'Ganti File' : 'Unggah File'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-1.5 bg-cyan-200 hover:bg-cyan-300 text-black border-2 border-black rounded-lg text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
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

          {/* Nama Lengkap & Gelar */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Drs. Bambang Suryono, M.Pd."
              className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
            />
          </div>

          {/* NIP & Gender & Agama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                NIP / NUPTK <span className="text-neutral-400 font-normal">(- bila non-PNS)</span>
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: 19780512 200501 1 008"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

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
                  Pria
                </button>
                <button
                  type="button"
                  onClick={() => setGender('P')}
                  className={`py-2 px-2 border-2 border-black rounded-lg text-xs font-black flex items-center justify-center cursor-pointer ${
                    gender === 'P' ? 'bg-rose-300 shadow-[2px_2px_0px_#000]' : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  Wanita
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Agama <span className="text-rose-500">*</span>
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
          </div>

          {/* Mapel / Jabatan & Status Tugas & Ruang */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Mata Pelajaran / Jabatan
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Matematika, Guru Kelas"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Status Tugas Ujian
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as Teacher['roleType'])}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden bg-white"
              >
                <option value="pengawas">Pengawas Ruang Ujian</option>
                <option value="panitia">Panitia Ujian Sekolah</option>
                <option value="guru">Guru Mata Pelajaran</option>
                <option value="wali_kelas">Wali Kelas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Ruang Tugas Ujian
              </label>
              <input
                type="text"
                value={roomDuty}
                onChange={(e) => setRoomDuty(e.target.value)}
                placeholder="Contoh: Ruang 01"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Kontak: No HP & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">No. HP / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: guru@sekolah.sch.id"
                className="w-full px-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-between gap-3">
            {initialTeacher && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialTeacher.id);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
              >
                <Trash2 className="w-4 h-4 text-rose-700" />
                Hapus Guru
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border-2 border-black rounded-xl text-xs font-black"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black rounded-xl text-xs font-black shadow-[3px_3px_0px_#000] active:translate-y-0.5"
              >
                {initialTeacher ? 'Simpan Perubahan' : 'Tambah Guru'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live Camera Capture Modal for Teacher */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => setPhotoUrl(dataUrl)}
        title="Ambil Pasfoto Guru / Pengawas"
      />
    </div>
  );
};
