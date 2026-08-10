import React from 'react';
import { Target, School as SchoolIcon, Bell, QrCode, ShieldCheck, LogOut, Lock, Users, Palette, Database, FileSpreadsheet } from 'lucide-react';
import { Role, School } from '../../types';
import { LOGO_IMAGE } from '../../assets/logoDataUri';

interface HeaderNavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  schools: School[];
  selectedSchoolId: string;
  onSchoolChange: (schoolId: string) => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenScanModal: () => void;
  isAdminLoggedIn?: boolean;
  isCoachRole?: boolean;
  onAdminLoginClick?: () => void;
  onAdminLogout?: () => void;
  onOpenColorSchemeModal?: () => void;
  onOpenExcelBackupModal?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  onRoleChange,
  schools,
  selectedSchoolId,
  onSchoolChange,
  unreadNotifCount,
  onOpenNotifications,
  onOpenScanModal,
  isAdminLoggedIn = false,
  isCoachRole = false,
  onAdminLoginClick,
  onAdminLogout,
  onOpenColorSchemeModal,
  onOpenExcelBackupModal,
}) => {
  const isFullAdmin = currentRole === 'admin' && isAdminLoggedIn && !isCoachRole;
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <img 
            src={LOGO_IMAGE} 
            alt="PanahanBandung.com Logo" 
            className="h-12 w-auto object-contain shrink-0 drop-shadow-md" 
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black tracking-tight text-white">PanahanBandung.com</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PRO 2026
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1 shadow-sm">
                <Database className="w-2.5 h-2.5 text-sky-400" /> Cloud Firestore DB
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sistem Ekstrakurikuler Panahan Sekolah Terpadu
            </p>
          </div>
        </div>

        {/* Center Controls: School Selector & Role Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* School Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <SchoolIcon className="w-4 h-4 text-amber-400" />
            <select
              value={selectedSchoolId}
              onChange={(e) => onSchoolChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">
                🌐 Semua Sekolah Mitra
              </option>
              {schools.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher Pill Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                onRoleChange('admin');
                if (!isAdminLoggedIn && onAdminLoginClick) {
                  onAdminLoginClick();
                }
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                currentRole === 'admin'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Admin</span>
            </button>
            <button
              onClick={() => onRoleChange('parent')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currentRole === 'parent'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Portal Orang Tua
            </button>
          </div>
        </div>

        {/* Quick Action Icons & Admin Auth Status */}
        <div className="flex items-center gap-2">
          {currentRole === 'admin' && (
            <>
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenScanModal}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Scan QR
                  </button>
                  <button
                    onClick={onAdminLogout}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    title="Keluar dari mode admin"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" /> Logout Admin
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onAdminLoginClick}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <Lock className="w-3.5 h-3.5" /> Login Admin
                  </button>
                  <button
                    onClick={() => onRoleChange('parent')}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  >
                    <Users className="w-3.5 h-3.5" /> Akses Sebagai Orang Tua
                  </button>
                </div>
              )}
            </>
          )}

          {onOpenExcelBackupModal && isFullAdmin && (
            <button
              onClick={onOpenExcelBackupModal}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 rounded-xl relative transition-all"
              title="Backup & Restore Data Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          )}

          {onOpenColorSchemeModal && (
            <button
              onClick={onOpenColorSchemeModal}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded-xl relative transition-all"
              title="Pilih Skema Warna Tampilan"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {isFullAdmin && (
            <button
              onClick={onOpenNotifications}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl relative transition-all"
              title="Pusat Notifikasi & Broadcast Admin"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
