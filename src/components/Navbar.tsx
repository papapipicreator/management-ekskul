import React, { useState } from 'react';
import { Target, Bell, UserCheck, School as SchoolIcon, Shield, RotateCcw, Search, CheckCircle2, Send } from 'lucide-react';
import { School, UserRole, SystemNotification } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  schools: School[];
  selectedSchoolId: string;
  onSelectSchool: (id: string) => void;
  notifications: SystemNotification[];
  onOpenNotifications: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  schools,
  selectedSchoolId,
  onSelectSchool,
  notifications,
  onOpenNotifications,
  onResetData,
  searchQuery,
  onSearchChange,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">PanahanEdu</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Sekolah
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Manajemen Ekstrakurikuler Panahan</p>
          </div>
        </div>

        {/* Global Search & School Selector */}
        <div className="flex-1 max-w-md mx-4 hidden md:flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari siswa, jadwal, atau nilai..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative min-w-[170px]">
            <select
              value={selectedSchoolId}
              onChange={(e) => onSelectSchool(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua Sekolah</option>
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher Pill */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center">
            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'admin' || currentRole === 'coach'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span> Admin
            </button>
            <button
              onClick={() => onRoleChange('student_parent')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'student_parent'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal</span> Siswa & Orang Tua
            </button>
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Pusat Notifikasi Otomatis"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Data Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-slate-200 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              Reset Data Demo?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tindakan ini akan mengembalikan seluruh data sekolah, jadwal, absensi, skor panahan, dan pembayaran SPP ke kondisi awal.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-500"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
