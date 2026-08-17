import React, { useState } from 'react';
import {
  Target,
  ClipboardCheck,
  CreditCard,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  UserPlus,
  Palette,
  KeyRound,
  LogOut,
  QrCode,
  Menu,
  X,
  Database,
  School as SchoolIcon,
  Sparkles
} from 'lucide-react';
import { Role, UserAccount, School } from '../types';

export type AdminTab = 'scoring' | 'attendance' | 'payments' | 'master' | 'reports';

interface SidebarProps {
  currentRole: Role;
  isAdminLoggedIn: boolean;
  isCoachRole: boolean;
  currentUserSession?: UserAccount | null;
  adminCredentialsName?: string;
  activeAdminTab: AdminTab;
  onSelectAdminTab: (tab: AdminTab) => void;
  studentCount: number;
  schoolCount: number;
  unpaidCount: number;
  scoreCount: number;
  schools?: School[];
  selectedSchoolId?: string;
  onSchoolChange?: (schoolId: string) => void;
  onOpenExcelBackupModal?: () => void;
  onOpenUserManagementModal?: () => void;
  onOpenColorSchemeModal?: () => void;
  onOpenChangePasswordModal?: () => void;
  onOpenScanModal?: () => void;
  onOpenMysqlModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  isAdminLoggedIn,
  isCoachRole,
  currentUserSession,
  adminCredentialsName = 'admin',
  activeAdminTab,
  onSelectAdminTab,
  studentCount,
  schoolCount,
  unpaidCount,
  scoreCount,
  schools = [],
  selectedSchoolId = '',
  onSchoolChange,
  onOpenExcelBackupModal,
  onOpenUserManagementModal,
  onOpenColorSchemeModal,
  onOpenChangePasswordModal,
  onOpenScanModal,
  onOpenMysqlModal,
  onLogout,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'scoring' as AdminTab,
      label: 'Scoring Panahan',
      icon: Target,
      activeColor: 'bg-amber-600 text-white shadow-lg shadow-amber-950/40',
      iconColor: 'text-amber-400',
      badge: scoreCount > 0 ? scoreCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'attendance' as AdminTab,
      label: 'Presensi Kehadiran',
      icon: ClipboardCheck,
      activeColor: 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'payments' as AdminTab,
      label: 'Keuangan SPP',
      icon: CreditCard,
      activeColor: 'bg-sky-600 text-white shadow-lg shadow-sky-950/40',
      iconColor: 'text-sky-400',
      badge: unpaidCount > 0 ? `${unpaidCount} Tagihan` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      hideForCoach: true,
    },
    {
      id: 'master' as AdminTab,
      label: 'Siswa & Sekolah',
      icon: Users,
      activeColor: 'bg-purple-600 text-white shadow-lg shadow-purple-950/40',
      iconColor: 'text-purple-400',
      badge: studentCount > 0 ? `${studentCount} Siswa` : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      hideForCoach: true,
    },
    {
      id: 'reports' as AdminTab,
      label: 'Export Laporan',
      icon: FileSpreadsheet,
      activeColor: 'bg-rose-600 text-white shadow-lg shadow-rose-950/40',
      iconColor: 'text-rose-400',
      hideForCoach: true,
    },
  ];

  const filteredNavItems = isCoachRole
    ? navItems.filter((item) => !item.hideForCoach)
    : navItems;

  const handleTabClick = (tabId: AdminTab) => {
    onSelectAdminTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button Bar */}
      <div className="md:hidden bg-slate-900/90 border-b border-slate-800 p-3 flex items-center justify-between sticky top-[65px] z-30 backdrop-blur-md">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
        >
          {isMobileOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-emerald-400" />}
          <span>{isMobileOpen ? 'Tutup Menu' : 'Menu Dashboard'}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {activeAdminTab === 'scoring' && 'Scoring'}
            {activeAdminTab === 'attendance' && 'Presensi'}
            {activeAdminTab === 'payments' && 'Keuangan'}
            {activeAdminTab === 'master' && 'Siswa & Sekolah'}
            {activeAdminTab === 'reports' && 'Laporan'}
          </span>
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 top-[65px] bg-slate-950/80 backdrop-blur-sm z-35 md:hidden"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed md:sticky top-[65px] md:top-[72px] z-35 h-[calc(100vh-4.5rem)] w-72 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 transition-all duration-300 ${
          isMobileOpen ? 'left-0' : '-left-72 md:left-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* User Status Card */}
          <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                  isCoachRole
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white truncate">
                    {currentUserSession?.name || currentUserSession?.username || adminCredentialsName}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                      isCoachRole
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isCoachRole ? 'Pelatih' : 'Admin'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {isCoachRole ? 'Akses Terbatas' : 'Akses Penuh'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mitra Sekolah Selector Card */}
          {schools && schools.length > 0 && onSchoolChange && (
            <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 shadow-inner space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <SchoolIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pilihan Mitra Sekolah</span>
                </label>
                <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                  {schools.length} Sekolah
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => onSchoolChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8"
                >
                  {!isCoachRole && schools.length > 1 && (
                    <option value="ALL" className="bg-slate-900 text-white">
                      🌐 Semua Sekolah Terdaftar
                    </option>
                  )}
                  {schools.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation Menu */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Menu Utama Dashboard
            </p>

            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? `${item.activeColor}`
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick System Tools / Actions */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Akses Cepat Sistem
            </p>

            {onOpenScanModal && (
              <button
                onClick={() => {
                  onOpenScanModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-emerald-500/20 transition-all"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Scan QR Presensi</span>
              </button>
            )}

            {!isCoachRole && onOpenExcelBackupModal && (
              <button
                onClick={() => {
                  onOpenExcelBackupModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Backup & Restore Excel</span>
              </button>
            )}

            {!isCoachRole && onOpenUserManagementModal && (
              <button
                onClick={() => {
                  onOpenUserManagementModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span>Kelola User Account</span>
              </button>
            )}

            {onOpenColorSchemeModal && (
              <button
                onClick={() => {
                  onOpenColorSchemeModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Skema Warna Tampilan</span>
              </button>
            )}

            {onOpenChangePasswordModal && (
              <button
                onClick={() => {
                  onOpenChangePasswordModal();
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <KeyRound className="w-4 h-4 text-sky-400" />
                <span>Ubah Akun & Password</span>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer Box & Logout Button */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/60">
          {onOpenMysqlModal && !isCoachRole && (
            <button
              onClick={() => {
                onOpenMysqlModal();
                setIsMobileOpen(false);
              }}
              className="w-full py-2 px-3 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>MySQL Shared Hosting</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                setIsMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout Admin</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
