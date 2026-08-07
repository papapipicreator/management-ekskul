import React from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  Calendar,
  ClipboardCheck,
  Target,
  CreditCard,
  FileSpreadsheet,
  Bell,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { UserRole } from '../types';

export type AdminTab =
  | 'overview'
  | 'schools'
  | 'students'
  | 'schedules'
  | 'attendance'
  | 'scoring'
  | 'payments'
  | 'reports';

export type StudentTab =
  | 'student_schedule'
  | 'student_attendance'
  | 'student_scoring'
  | 'student_payments'
  | 'student_report';

interface SidebarProps {
  currentRole: UserRole;
  loggedUserRole?: 'admin' | 'coach';
  activeAdminTab: AdminTab;
  onSelectAdminTab: (tab: AdminTab) => void;
  activeStudentTab: StudentTab;
  onSelectStudentTab: (tab: StudentTab) => void;
  studentCount: number;
  schoolCount: number;
  unpaidCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  loggedUserRole = 'admin',
  activeAdminTab,
  onSelectAdminTab,
  activeStudentTab,
  onSelectStudentTab,
  studentCount,
  schoolCount,
  unpaidCount,
}) => {
  const isAdminView = currentRole === 'admin' || currentRole === 'coach';

  const allAdminNavItems = [
    { id: 'overview', label: 'Ringkasan Dashboard', icon: LayoutDashboard },
    { id: 'schools', label: 'Kelola Sekolah', icon: School, badge: schoolCount },
    { id: 'students', label: 'Data Siswa Panahan', icon: Users, badge: studentCount },
    { id: 'schedules', label: 'Jadwal Latihan', icon: Calendar },
    { id: 'attendance', label: 'Presensi (Siswa & Pelatih)', icon: ClipboardCheck },
    { id: 'scoring', label: 'Input Skor Panahan', icon: Target },
    { id: 'payments', label: 'Keuangan SPP Online', icon: CreditCard, badge: unpaidCount > 0 ? unpaidCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'reports', label: 'Export Laporan (PDF/Excel)', icon: FileSpreadsheet },
  ];

  const adminNavItems =
    loggedUserRole === 'coach'
      ? allAdminNavItems.filter((item) => item.id === 'scoring' || item.id === 'attendance')
      : allAdminNavItems;

  const studentNavItems = [
    { id: 'student_schedule', label: 'Jadwal Latihan Saya', icon: Calendar },
    { id: 'student_attendance', label: 'Rekap Kehadiran Saya', icon: ClipboardCheck },
    { id: 'student_scoring', label: 'Grafik Skor Panahan', icon: TrendingUp },
    { id: 'student_payments', label: 'Pembayaran SPP Online', icon: CreditCard },
    { id: 'student_report', label: 'Laporan Perkembangan', icon: Award },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Role Header Badge */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Akses Sistem
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isAdminView ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>
          <p className="text-xs font-bold text-slate-100">
            {isAdminView
              ? loggedUserRole === 'coach'
                ? 'Portal Akses Pelatih'
                : 'Dashboard Backend Admin'
              : 'Portal Orang Tua'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAdminView
              ? loggedUserRole === 'coach'
                ? 'Akses Scoring & Presensi'
                : 'Manajemen Multi-Sekolah'
              : 'Monitoring & Pembayaran SPP'}
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>

          {isAdminView
            ? adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeAdminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectAdminTab(item.id as AdminTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-950/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            : studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeStudentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectStudentTab(item.id as StudentTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-600/90 text-white shadow-md shadow-amber-950/40 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                );
              })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 rounded-xl p-3 border border-emerald-800/30">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Target Panahan Digital</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Sistem evaluasi skor standar World Archery (10, X, 9 s/d 1) dengan notifikasi otomatis ke WhatsApp Orang Tua.
          </p>
        </div>
      </div>
    </aside>
  );
};
