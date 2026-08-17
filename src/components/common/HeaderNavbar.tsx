import React from 'react';
import { Target, Bell, QrCode, ShieldCheck, LogOut, Lock, Users, Palette, Database, FileSpreadsheet } from 'lucide-react';
import { Role, School } from '../../types';
import { LOGO_IMAGE } from '../../assets/logoDataUri';

interface HeaderNavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  schools?: School[];
  selectedSchoolId?: string;
  onSchoolChange?: (schoolId: string) => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenScanModal: () => void;
  isAdminLoggedIn?: boolean;
  isCoachRole?: boolean;
  onAdminLoginClick?: () => void;
  onAdminLogout?: () => void;
  onOpenColorSchemeModal?: () => void;
  onOpenExcelBackupModal?: () => void;
  onOpenMysqlModal?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentRole,
  onRoleChange,
  schools = [],
  selectedSchoolId = '',
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
  onOpenMysqlModal,
}) => {
  const isFullAdmin = currentRole === 'admin' && isAdminLoggedIn && !isCoachRole;
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-3 md:px-6 lg:px-8 py-2 md:py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-4">
        {/* Brand Logo & Title (Compact on Mobile) */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <img 
              src={LOGO_IMAGE} 
              alt="PanahanBandung.com Logo" 
              className="h-8 md:h-11 w-auto object-contain shrink-0 drop-shadow-md" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm md:text-lg font-black tracking-tight text-white truncate">
                  PanahanBandung.com
                </h1>
                <span className="text-[9px] md:text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 md:px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                  PRO
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-400 hidden sm:block truncate">
                Sistem Ekstrakurikuler Panahan Sekolah Terpadu
              </p>
            </div>
          </div>

          {/* Action Icons for Mobile Header Right */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {currentRole === 'admin' && isAdminLoggedIn && (
              <button
                onClick={onOpenScanModal}
                className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1"
                title="Scan QR"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan</span>
              </button>
            )}

            {isFullAdmin && (
              <button
                onClick={onOpenNotifications}
                className="p-1.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg relative"
                title="Notifikasi"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
            )}

            {onOpenColorSchemeModal && (
              <button
                onClick={onOpenColorSchemeModal}
                className="p-1.5 bg-slate-950 text-amber-400 border border-slate-800 rounded-lg"
                title="Skema Warna"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center / Right Controls: Role Switcher & Desktop Quick Actions */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          {/* Role Switcher Pill Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => {
                onRoleChange('admin');
                if (!isAdminLoggedIn && onAdminLoginClick) {
                  onAdminLoginClick();
                }
              }}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-lg transition-all text-center ${
                currentRole === 'parent'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Portal Orang Tua
            </button>
          </div>

          {/* Desktop Only Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
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
                  </div>
                )}
              </>
            )}

            {onOpenMysqlModal && isFullAdmin && (
              <button
                onClick={onOpenMysqlModal}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 rounded-xl relative transition-all"
                title="Pengaturan & Migrasi MySQL Shared Hosting"
              >
                <Database className="w-4 h-4" />
              </button>
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
      </div>
    </header>
  );
};
