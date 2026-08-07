import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  Target,
  ClipboardCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  Award
} from 'lucide-react';
import { UserAccount } from '../../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onAddUser: (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'coach'>('coach');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg('Username tidak boleh kosong!');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setErrorMsg(`Username "${cleanUsername}" sudah digunakan oleh akun lain!`);
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password minimal 4 karakter!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok!');
      return;
    }

    onAddUser({
      name: name.trim(),
      username: cleanUsername,
      password: password,
      role: role,
    });

    setSuccessMsg(`User baru "${name.trim()}" (${role === 'admin' ? 'Admin' : 'Pelatih'}) berhasil dibuat!`);
    
    // Reset Form
    setName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRole('coach');

    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('list');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kelola User & Hak Akses</h3>
              <p className="text-xs text-slate-400">Tambah dan atur hak akses pengguna (Admin / Pelatih)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'list'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Daftar User ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'add'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> + Tambah User Baru
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs font-medium shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-emerald-400 text-xs font-medium shrink-0">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: User List */}
        {activeTab === 'list' && (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              return (
                <div
                  key={u.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isAdmin
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{u.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isAdmin
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isAdmin ? 'Admin (Akses Penuh)' : 'Pelatih (Scoring & Presensi)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Username: <span className="text-slate-200">{u.username}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {u.username === 'admin' ? (
                      <span className="text-[10px] text-slate-500 font-semibold px-2 py-1 bg-slate-800 rounded-lg">
                        Admin Utama
                      </span>
                    ) : (
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 rounded-xl transition-all"
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Create New User Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Coach Hendra, S.Pd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Username Login
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: pelatih_hendra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 karakter"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection Options */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Pilih Peran User (Hak Akses):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Admin */}
                <div
                  onClick={() => setRole('admin')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'admin'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className={`w-4 h-4 ${role === 'admin' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-white">1. Sebagai Admin</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Akses Penuh Seluruh Sistem (Kelola Sekolah, Siswa, SPP Online, Jadwal, Presensi, Scoring, Laporan, & Kelola User).
                  </p>
                </div>

                {/* Option 2: Pelatih */}
                <div
                  onClick={() => setRole('coach')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    role === 'coach'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className={`w-4 h-4 ${role === 'coach' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold text-white">2. Sebagai Pelatih</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Akses Terbatas: Hanya bisa membuka & mengedit <strong>Scoring Panahan</strong> dan <strong>Presensi Kehadiran</strong> saja.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Buat User Baru
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
