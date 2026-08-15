import React, { useState } from 'react';
import {
  Target,
  Award,
  CreditCard,
  Bell,
  Download,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Info,
  User,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Phone,
  School as SchoolIcon,
  ChevronRight,
  XCircle,
  FileText,
  LogOut,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Student,
  School,
  StudentAttendance,
  ArcheryScoreRecord,
  SppPayment,
  SystemNotification,
  BankAccountConfig,
  UserAccount
} from '../../types';
import { exportScoresToPdf, downloadInvoicePdf } from '../../utils/exportUtils';

interface ParentPortalProps {
  students: Student[];
  schools?: School[];
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  notifications: SystemNotification[];
  onPaySpp?: (paymentId: string, method: string) => void;
  selectedSchoolId?: string;
  bankConfig?: BankAccountConfig;
  currentUserSession?: UserAccount | null;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  schools = [],
  attendance,
  scores,
  payments,
  notifications,
  onPaySpp,
  selectedSchoolId = 'ALL',
  bankConfig,
  currentUserSession,
  onLogout,
  onLoginClick,
}) => {
  const filteredStudents =
    selectedSchoolId && selectedSchoolId !== 'ALL'
      ? students.filter((s) => s.schoolId === selectedSchoolId)
      : students;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'scoring' | 'attendance' | 'payments'>('overview');

  const activeStudent =
    filteredStudents.find((s) => s.id === selectedStudentId) || filteredStudents[0];

  const activeSchool = schools.find((sch) => sch.id === activeStudent?.schoolId);

  // Child-specific data sorted chronologically
  const childAttendance = attendance
    .filter((a) => a.studentId === activeStudent?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const childScores = scores
    .filter((s) => s.studentId === activeStudent?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const childPayments = payments
    .filter((p) => p.studentId === activeStudent?.id)
    .sort((a, b) => new Date(b.dueDate || b.month).getTime() - new Date(a.dueDate || a.month).getTime());

  // Attendance metrics
  const totalSessions = childAttendance.length;
  const hadirCount = childAttendance.filter((a) => a.status === 'Hadir').length;
  const izinCount = childAttendance.filter((a) => a.status === 'Izin').length;
  const sakitCount = childAttendance.filter((a) => a.status === 'Sakit').length;
  const alphaCount = childAttendance.filter((a) => a.status === 'Alpha').length;

  const attendancePercentage = totalSessions > 0 ? Math.round((hadirCount / totalSessions) * 100) : 100;

  // Scoring statistics
  const highestScore = childScores.length > 0 ? Math.max(...childScores.map((s) => s.totalScore)) : 0;
  const latestScore = childScores.length > 0 ? childScores[childScores.length - 1] : null;
  const averageArrow =
    childScores.length > 0
      ? (childScores.reduce((acc, curr) => acc + curr.averageArrow, 0) / childScores.length).toFixed(2)
      : '0.00';

  const total10s = childScores.reduce((acc, curr) => acc + (curr.tenCount || 0), 0);
  const totalXs = childScores.reduce((acc, curr) => acc + (curr.xCount || 0), 0);

  // School Financial Scheme check
  const isMonthlySppScheme = activeSchool
    ? activeSchool.financialModel === 'monthly_fee' || (activeSchool.monthlyFeePerStudent && activeSchool.monthlyFeePerStudent > 0)
    : true; // Default to true if school object not passed

  // Chart data format
  const chartData = childScores.map((sc) => ({
    date: sc.date,
    skor: sc.totalScore,
    rataPanah: sc.averageArrow,
    distance: sc.distance,
    bowType: sc.bowType,
  }));

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      amount
    );
  };

  // Filter notifications: General announcements OR announcements specifically for active student's school
  const relevantNotifications = notifications.filter((n) => {
    if (!n.targetSchoolId || n.targetSchoolId === 'ALL') return true;
    if (activeStudent && n.targetSchoolId === activeStudent.schoolId) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Account Session Info Header Bar */}
      <div className="bg-slate-900 border border-purple-500/30 p-3.5 px-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">
                Akun Orang Tua: {currentUserSession?.name || 'Orang Tua / Wali Siswa'}
              </span>
              {currentUserSession?.username && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono px-2 py-0.5 rounded-full">
                  @{currentUserSession.username}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentUserSession?.assignedSchoolIds && currentUserSession.assignedSchoolIds.length > 0
                ? `Terhubung ke ${schools.filter((s) => currentUserSession.assignedSchoolIds?.includes(s.id)).map((s) => s.name).join(', ') || 'Sekolah Terdaftar'}`
                : 'Akses Seluruh Sekolah Mitra'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLoginClick && (
            <button
              onClick={onLoginClick}
              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" /> Ganti Akun Orang Tua
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Keluar dari sesi orang tua"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          )}
        </div>
      </div>

      {/* Parent Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
            Portal Orang Tua & Wali • Panahan Bandung
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
            Laporan Perkembangan Panahan Ananda
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Pantau riwayat presensi, grafik perkembangan skoring, dan status pembayaran SPP bulanan.
          </p>
        </div>

        {/* Child Selector */}
        <div className="w-full sm:w-auto min-w-[260px]">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">
            Pilih Putra/Putri Anda:
          </label>
          <select
            value={activeStudent?.id || ''}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-xs text-white font-bold rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow"
          >
            {filteredStudents.length === 0 ? (
              <option value="">Tidak ada siswa terdaftar</option>
            ) : (
              filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.schoolName})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Child Profile Banner */}
      {activeStudent && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  activeStudent.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={activeStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                  activeStudent.status === 'Aktif'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-amber-500 text-slate-950 border-amber-400'
                }`}
              >
                {activeStudent.status || 'Aktif'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  NISN: {activeStudent.nisn}
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {activeStudent.bowType}
                </span>
                <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                  Target: {activeStudent.targetDistance}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1">{activeStudent.name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <SchoolIcon className="w-3.5 h-3.5 text-emerald-400 inline" />
                <span className="text-slate-200 font-semibold">{activeStudent.schoolName}</span> • Kelas: {activeStudent.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => exportScoresToPdf(childScores, `Laporan Orang Tua - ${activeStudent.name}`)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" /> Unduh Rapot Panahan PDF
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 p-1.5 rounded-2xl gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <User className="w-4 h-4" /> Ikhtisar & Evaluasi
        </button>

        <button
          onClick={() => setActiveTab('scoring')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'scoring'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Target className="w-4 h-4" /> Riwayat Skoring & Grafik ({childScores.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-sky-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="w-4 h-4" /> Riwayat Presensi ({hadirCount}/{totalSessions})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Riwayat Pembayaran SPP ({childPayments.length})
        </button>
      </div>

      {/* TAB 1: IKHTISAR & EVALUASI */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Key Performance Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kehadiran Latihan</span>
              <p className="text-2xl font-black text-sky-400">{attendancePercentage}%</p>
              <span className="text-[11px] text-slate-400">{hadirCount} dari {totalSessions} Sesi</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Skor Tertinggi</span>
              <p className="text-2xl font-black text-amber-400">{highestScore} <span className="text-xs text-slate-500">/ 360</span></p>
              <span className="text-[11px] text-slate-400">Rata Arrow: {averageArrow}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sesi Tembak Terakhir</span>
              <p className="text-2xl font-black text-emerald-400">{latestScore ? latestScore.totalScore : 0}</p>
              <span className="text-[11px] text-slate-400">{latestScore ? latestScore.date : 'Belum ada'}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status SPP Bulanan</span>
              {isMonthlySppScheme ? (
                <div>
                  <p className="text-lg font-black text-purple-400">{childPayments[0]?.status || 'Lunas'}</p>
                  <span className="text-[11px] text-slate-400">{childPayments[0]?.month || 'Agustus 2026'}</span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-black text-sky-300 mt-1">Bebas SPP</p>
                  <span className="text-[10px] text-slate-400">Honor Pelatih Sekolah</span>
                </div>
              )}
            </div>
          </div>

          {/* Evaluation Feed & Latest Score Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Catatan Perkembangan & Evaluasi Pelatih
                </h3>

                {childScores.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada catatan skor panahan terdaftar.</p>
                ) : (
                  <div className="space-y-4">
                    {childScores
                      .slice()
                      .reverse()
                      .map((sc) => (
                        <div key={sc.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 font-mono font-bold">{sc.date}</span>
                              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                                {sc.bowType}
                              </span>
                              <span className="text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded">
                                {sc.distance}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-lg font-black text-amber-400">{sc.totalScore}</span>
                              <span className="text-xs text-slate-500"> / {sc.maxPossibleScore}</span>
                            </div>
                          </div>

                          {sc.coachNotes && (
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs italic text-slate-200 flex items-start gap-2">
                              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <span>Catatan Pelatih: "{sc.coachNotes}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Notifications */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" /> Informasi & Pengumuman Ekskul
                </h3>

                {relevantNotifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Tidak ada pengumuman baru untuk sekolah ini.</p>
                ) : (
                  <div className="space-y-3">
                    {relevantNotifications.map((n) => (
                      <div key={n.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-emerald-400 block">{n.title}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-purple-500/20 text-purple-300 border-purple-500/30 shrink-0">
                            {!n.targetSchoolId || n.targetSchoolId === 'ALL' ? 'Pengumuman Umum' : 'Khusus Sekolah'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-500 font-mono block pt-1">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT SCORING & GRAFIK */}
      {activeTab === 'scoring' && (
        <div className="space-y-6">
          {/* Scoring KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Skor Tertinggi</span>
              <p className="text-2xl font-black text-amber-400">{highestScore} <span className="text-xs text-slate-500">/ 360</span></p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rata-Rata per Arrow</span>
              <p className="text-2xl font-black text-emerald-400">{averageArrow}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Sesi Tembak</span>
              <p className="text-2xl font-black text-sky-400">{childScores.length} <span className="text-xs text-slate-500">Sesi</span></p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total 10s & Xs</span>
              <p className="text-2xl font-black text-purple-400">{total10s} <span className="text-xs text-slate-500">(X: {totalXs})</span></p>
            </div>
          </div>

          {/* Interactive Recharts Area Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Grafik Tren Perkembangan Skor Panahan Ananda
                </h3>
                <p className="text-xs text-slate-400">
                  Visualisasi grafik perolehan skor total per tanggal sesi evaluasi latihan.
                </p>
              </div>
              {latestScore && (
                <span className="text-xs bg-slate-950 border border-slate-800 text-amber-300 font-mono px-3 py-1 rounded-xl">
                  Sesi Terakhir: {latestScore.totalScore} Pts ({latestScore.date})
                </span>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                Belum ada data skoring panahan untuk ditampilkan dalam grafik.
              </div>
            ) : (
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="parentScoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 360]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="skor"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#parentScoreColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Score Cards List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Riwayat Sesi Skoring Lengkap
            </h3>

            {childScores.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Tidak ada riwayat skoring.</p>
            ) : (
              <div className="space-y-4">
                {childScores
                  .slice()
                  .reverse()
                  .map((sc) => (
                    <div
                      key={sc.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-200">{sc.date}</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                            {sc.bowType}
                          </span>
                          <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-bold">
                            {sc.distance}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            10s: <strong className="text-white">{sc.tenCount}</strong> | Xs:{' '}
                            <strong className="text-white">{sc.xCount}</strong>
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-black text-amber-400">{sc.totalScore}</span>
                            <span className="text-xs text-slate-500"> / {sc.maxPossibleScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ends / Seri Breakdown */}
                      {sc.ends && sc.ends.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          {sc.ends.map((e) => {
                            const endSum = e.arrows.reduce((a, b) => a + b, 0);
                            return (
                              <div
                                key={e.endNumber}
                                className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center space-y-1"
                              >
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">
                                  Seri {e.endNumber} ({endSum})
                                </span>
                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                  {e.arrows.map((arr, idx) => (
                                    <span
                                      key={idx}
                                      className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                                        arr === 10
                                          ? 'bg-amber-400 text-slate-950 font-extrabold'
                                          : arr >= 9
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : arr >= 7
                                          ? 'bg-rose-500/20 text-rose-300'
                                          : 'bg-slate-800 text-slate-300'
                                      }`}
                                    >
                                      {arr}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {sc.coachNotes && (
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs italic text-slate-200 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Evaluasi Pelatih: "{sc.coachNotes}"</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT PRESENSI KEHADIRAN */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Persentase Kehadiran</span>
              <p className="text-xl font-black text-emerald-400">{attendancePercentage}%</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hadir</span>
              <p className="text-xl font-black text-emerald-400">{hadirCount}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Izin</span>
              <p className="text-xl font-black text-amber-400">{izinCount}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sakit</span>
              <p className="text-xl font-black text-sky-400">{sakitCount}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alpha</span>
              <p className="text-xl font-black text-rose-400">{alphaCount}</p>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Log Presensi Latihan Panahan Ananda
            </h3>

            {childAttendance.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada rekam presensi terdaftar.</p>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
                {childAttendance.map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 bg-slate-950 hover:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{att.date}</span>
                        <span className="text-[10px] text-slate-400">Jam: {att.timeIn || '-'}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          Metode: {att.method || 'Scan QR'}
                        </span>
                      </div>
                      {att.notes && <p className="text-[11px] text-slate-400 italic">"{att.notes}"</p>}
                    </div>

                    <span
                      className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                        att.status === 'Hadir'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : att.status === 'Izin'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : att.status === 'Sakit'
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RIWAYAT PEMBAYARAN SPP */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {!isMonthlySppScheme ? (
            /* Information Banner for Coach Honor Scheme Schools */
            <div className="bg-amber-950/30 border border-amber-500/30 p-6 rounded-2xl space-y-3 text-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">Skema Keuangan Honor Pelatih Per Sesi</h3>
                  <p className="text-xs text-amber-200/80">
                    Sekolah Mitra <strong>{activeStudent?.schoolName}</strong> menggunakan skema honor pelatih per kedatangan.
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed border-t border-amber-500/20 pt-3">
                Dalam skema keuangan ini, biaya operasional kegiatan panahan didanai langsung oleh pihak sekolah melalui honor kedatangan pelatih. Oleh karena itu, putra/putri Anda <strong>BEBAS dari tagihan iuran SPP perorangan</strong>.
              </p>
            </div>
          ) : (
            /* Monthly SPP Payments for Monthly Fee Scheme Schools */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status SPP Terbaru</span>
                  <p className="text-lg font-black text-emerald-400">
                    {childPayments[0]?.status || 'Tidak Ada Tagihan'}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tagihan Lunas</span>
                  <p className="text-lg font-black text-white">
                    {childPayments.filter((p) => p.status === 'Lunas').length} Bulan
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nominal Iuran SPP</span>
                  <p className="text-lg font-black text-purple-400">
                    {formatRupiah(activeSchool?.monthlyFeePerStudent || 150000)} / bln
                  </p>
                </div>
              </div>

              {/* Payment Records List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Riwayat & Tagihan SPP Bulanan
                </h3>

                {childPayments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada riwayat tagihan SPP.</p>
                ) : (
                  <div className="space-y-3">
                    {childPayments.map((p) => {
                      const isFreeSpp = p.amount === 0;

                      return (
                        <div key={p.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{p.month}</span>
                              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                {p.invoiceNumber}
                              </span>
                            </div>

                            {isFreeSpp ? (
                              <p className="text-xs text-sky-400 font-semibold">Bebas SPP (Honor Pelatih)</p>
                            ) : (
                              <p className="text-xs text-slate-400">
                                Nominal: <strong className="text-emerald-400">{formatRupiah(p.amount)}</strong>
                                {p.paidDate && ` • Dibayar: ${p.paidDate}`}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span
                              className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${
                                isFreeSpp
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  : p.status === 'Lunas'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : p.status === 'Menunggu Konfirmasi'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {isFreeSpp ? 'Bebas SPP' : p.status}
                            </span>

                            {!isFreeSpp && p.status === 'Lunas' && (
                              <button
                                onClick={() => downloadInvoicePdf(p)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" /> Kuitansi PDF
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
