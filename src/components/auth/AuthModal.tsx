import React, { useState } from 'react';
import { UserAccount, GoogleSheetsConfig } from '../../types';
import { gasLogin, gasRegister } from '../../utils/gasApi';
import {
  X,
  Lock,
  User,
  Building2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  accounts: UserAccount[];
  onAddAccount: (user: UserAccount) => void;
  googleSheets: GoogleSheetsConfig;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  accounts,
  onAddAccount,
  googleSheets,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [npsn, setNpsn] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processStatus, setProcessStatus] = useState<'validating' | 'success'>('validating');
  const [processStep, setProcessStep] = useState('Memvalidasi Kredensial...');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    setProcessStatus('validating');
    setProcessStep('Memvalidasi Kredensial...');

    try {
      if (activeTab === 'login') {
        let gasFailedMessage = '';

        // 1. Try Google Sheets if connected
        if (googleSheets.isConnected && googleSheets.webAppUrl) {
          try {
            const gasRes = await gasLogin(googleSheets.webAppUrl, username, password);
            if (gasRes.status === 'success' && gasRes.user) {
              setProcessStatus('success');
              setProcessStep('Sukses!');
              await new Promise((r) => setTimeout(r, 650));
              onLoginSuccess(gasRes.user);
              onClose();
              return;
            } else {
              gasFailedMessage = gasRes.message || '';
            }
          } catch (gasErr) {
            console.warn('GAS login error, checking local accounts:', gasErr);
          }
        }

        // 2. Check local accounts database (including default Admin Nagata and stored schools)
        await new Promise((r) => setTimeout(r, 450));
        const found = accounts.find(
          (acc) =>
            acc.username.toLowerCase() === username.trim().toLowerCase() &&
            acc.password === password.trim()
        );

        if (found) {
          setProcessStatus('success');
          setProcessStep('Sukses!');
          await new Promise((r) => setTimeout(r, 650));
          onLoginSuccess(found);
          onClose();
        } else {
          setErrorMessage(gasFailedMessage || 'Username atau password yang Anda masukkan salah. Silakan periksa kembali.');
        }
      } else {
        // REGISTER NEW SCHOOL
        if (!username.trim() || !password.trim() || !schoolName.trim()) {
          setErrorMessage('Semua kolom bertanda * wajib diisi!');
          setIsLoading(false);
          return;
        }

        setProcessStep('Mendaftarkan Sekolah...');
        const newAccount: UserAccount = {
          id: `acc_${Date.now()}`,
          username: username.trim(),
          password: password.trim(),
          schoolName: schoolName.trim(),
          npsn: npsn.trim() || '00000000',
          role: username.trim().toLowerCase() === 'nagata' ? 'admin' : 'operator',
          createdAt: new Date().toISOString(),
        };

        // Try pushing to Google Sheets if connected
        if (googleSheets.isConnected && googleSheets.webAppUrl) {
          try {
            const gasRes = await gasRegister(googleSheets.webAppUrl, {
              username: newAccount.username,
              password: newAccount.password || '',
              schoolName: newAccount.schoolName,
              npsn: newAccount.npsn,
            });
            if (gasRes.status !== 'success') {
              setErrorMessage(gasRes.message || 'Gagal mendaftar.');
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to register on Google Sheets, saving locally:', e);
          }
        }

        setProcessStatus('success');
        setProcessStep('Sukses!');
        await new Promise((r) => setTimeout(r, 650));
        onAddAccount(newAccount);
        onLoginSuccess(newAccount);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-300 border-2 border-black rounded-lg flex items-center justify-center font-black">
              <Lock className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">
                {activeTab === 'login' ? 'Masuk ke Aplikasi' : 'Daftar Sekolah Baru'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                {activeTab === 'login'
                  ? 'Gunakan akun sekolah Anda untuk mengelola kartu ujian.'
                  : 'Daftarkan identitas sekolah untuk memulai.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border-2 border-black rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-black uppercase rounded-lg border-2 border-black transition-all ${
              activeTab === 'login'
                ? 'bg-yellow-300 shadow-[2px_2px_0px_#000] translate-x-0.5 translate-y-0.5'
                : 'bg-neutral-100 hover:bg-neutral-200'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-black uppercase rounded-lg border-2 border-black transition-all ${
              activeTab === 'register'
                ? 'bg-yellow-300 shadow-[2px_2px_0px_#000] translate-x-0.5 translate-y-0.5'
                : 'bg-neutral-100 hover:bg-neutral-200'
            }`}
          >
            Daftar Sekolah
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 mb-3 bg-rose-100 border-2 border-rose-500 rounded-lg text-xs font-bold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-black text-black mb-1">
                  Nama Resmi Sekolah <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SD Negeri 2 Medowo"
                    className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">
                  NPSN Sekolah (8 Digit)
                </label>
                <input
                  type="text"
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  placeholder="20512345"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-black mb-1">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-black mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-lg focus:bg-yellow-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-yellow-300 hover:bg-yellow-200 disabled:opacity-50 text-black border-2 border-black rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              {activeTab === 'login' ? 'Masuk Sekarang →' : 'Daftarkan & Mulai →'}
            </button>
          </div>
        </form>
      </div>

      {/* POP UP MEMPROSES MODERN SAAT PROSES LOGIN / REGISTER */}
      {isLoading && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border-3 border-black shadow-[10px_10px_0px_#000] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 animate-in zoom-in-95 duration-200">
            {/* Animasi Ikon Radar / Sukses Neo-brutalism */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {processStatus === 'success' ? (
                <div className="relative w-18 h-18 bg-emerald-400 border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000] animate-in zoom-in-75 duration-200">
                  <CheckCircle2 className="w-10 h-10 text-black stroke-[2.5]" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full bg-yellow-300 animate-ping opacity-35" />
                  <div className="absolute inset-2 rounded-full border-3 border-dashed border-black animate-spin [animation-duration:3s]" />
                  <div className="relative w-16 h-16 bg-[#FFE600] border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000] transform rotate-3">
                    <ShieldCheck className="w-8 h-8 text-black animate-pulse" />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 border border-black rounded-full text-[10px] font-black uppercase shadow-[1px_1px_0px_#000] ${
                  processStatus === 'success'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-yellow-100 text-yellow-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {processStatus === 'success' ? 'Berhasil' : 'Autentikasi Akun'}
              </div>

              <h4 className="text-xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
                {processStep}
              </h4>

              <p className="text-xs text-neutral-600 font-bold leading-relaxed px-2">
                {processStatus === 'success'
                  ? 'Kredensial valid, membuka portal aplikasi...'
                  : 'Mohon tunggu sebentar...'}
              </p>
            </div>

            {/* Indikator Garis Progres Modern */}
            <div className="w-full bg-neutral-100 border-2 border-black rounded-full h-3.5 p-0.5 overflow-hidden shadow-[2px_2px_0px_#000]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  processStatus === 'success'
                    ? 'bg-emerald-500 w-full'
                    : 'bg-linear-to-r from-yellow-300 via-amber-300 to-yellow-400 animate-pulse w-full'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
