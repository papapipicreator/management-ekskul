import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../../types';

interface ParentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  users?: UserAccount[];
  onSwitchToAdminLogin?: () => void;
}

export const ParentLoginModal: React.FC<ParentLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users = [],
  onSwitchToAdminLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanUsername = username.trim().toLowerCase();

      // Check users list first
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === cleanUsername && u.password === password
      );

      if (foundUser) {
        onLoginSuccess(foundUser);
        return;
      }

      // Check default orangtua fallback
      if (cleanUsername === 'orangtua' && password === 'orangtua123') {
        onLoginSuccess({
          id: 'parent-demo',
          name: 'Orang Tua (Wali Siswa)',
          username: 'orangtua',
          password: 'orangtua123',
          role: 'parent',
          assignedSchoolIds: ['sch-1'],
          createdAt: new Date().toISOString(),
        });
        return;
      }

      setErrorMsg(
        'Username atau password salah! Pastikan Anda menggunakan kredensial orang tua yang telah dibuatkan oleh Admin.'
      );
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-xl shadow-purple-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Login Portal Orang Tua</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Masukkan kredensial akun orang tua/wali siswa yang telah dibuatkan oleh Admin Sekolah.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Username Orang Tua
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: orangtua"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi orang tua"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <>
                <Users className="w-4 h-4" /> Masuk Portal Orang Tua <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Info Box */}
        <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 text-[11px] text-purple-300/90 leading-relaxed">
          <strong>Catatan:</strong> Setiap akun Orang Tua akan dikhususkan untuk melihat data anak di sekolah yang telah disetujui oleh Admin pada menu <em>Kelola User & Hak Akses</em>.
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          {onSwitchToAdminLogin ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToAdminLogin();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Login Sebagai Admin
            </button>
          ) : (
            <span className="text-slate-500">Portal Wali Siswa</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
