import React from 'react';
import {
  School as SchoolIcon,
  Users,
  Target,
  CreditCard,
  Calendar,
  TrendingUp,
  Award,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { School, Student, Schedule, StudentAttendance, ArcheryScoreRecord, SppPayment } from '../../types';

interface DashboardOverviewProps {
  schools: School[];
  students: Student[];
  schedules: Schedule[];
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  onNavigateTab: (tab: any) => void;
  selectedSchoolId: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  schools,
  students,
  schedules,
  attendance,
  scores,
  payments,
  onNavigateTab,
  selectedSchoolId,
}) => {
  // Filter by school if selected
  const filteredStudents = selectedSchoolId === 'ALL' ? students : students.filter((s) => s.schoolId === selectedSchoolId);
  const filteredSchedules = selectedSchoolId === 'ALL' ? schedules : schedules.filter((s) => s.schoolId === selectedSchoolId);
  const filteredScores = selectedSchoolId === 'ALL' ? scores : scores.filter((s) => s.schoolId === selectedSchoolId);
  const filteredPayments = selectedSchoolId === 'ALL' ? payments : payments.filter((p) => p.schoolId === selectedSchoolId);
  const filteredAttendance = selectedSchoolId === 'ALL' ? attendance : attendance.filter((a) => a.schoolId === selectedSchoolId);

  // KPIs
  const totalSchools = selectedSchoolId === 'ALL' ? schools.length : 1;
  const totalStudents = filteredStudents.length;

  const totalAttendanceEntries = filteredAttendance.length;
  const hadirCount = filteredAttendance.filter((a) => a.status === 'Hadir').length;
  const attendanceRate = totalAttendanceEntries > 0 ? Math.round((hadirCount / totalAttendanceEntries) * 100) : 100;

  const paidPayments = filteredPayments.filter((p) => p.status === 'Lunas');
  const totalPaidAmount = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDueAmount = filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const paymentRate = totalDueAmount > 0 ? Math.round((totalPaidAmount / totalDueAmount) * 100) : 0;

  // Score progression data for Chart
  const scoreData = filteredScores
    .slice(-6)
    .reverse()
    .map((sc) => ({
      date: sc.date.substring(5),
      nama: sc.studentName.split(' ')[0],
      skor: sc.totalScore,
      rataRata: Number(sc.averageArrow.toFixed(1)),
    }));

  // Attendance Breakdown Pie Data
  const pieData = [
    { name: 'Hadir', value: hadirCount || 12, color: '#10b981' },
    { name: 'Sakit', value: filteredAttendance.filter((a) => a.status === 'Sakit').length || 2, color: '#0ea5e9' },
    { name: 'Izin', value: filteredAttendance.filter((a) => a.status === 'Izin').length || 3, color: '#f59e0b' },
    { name: 'Alpa', value: filteredAttendance.filter((a) => a.status === 'Alpa').length || 1, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 shadow-xl text-white">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
            Sistem Digital Panahan Sekolah
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selamat Datang di Dashboard Pelatih & Admin Panahan
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kelola jadwal latihan, catat absensi digital, input skor sasaran 10 meter hingga 30 meter, pantau pembayaran SPP, dan terbitkan laporan orang tua.
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('scoring')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <Target className="w-4 h-4" /> Input Skor Panahan
            </button>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Presensi Latihan
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" /> Export Laporan
            </button>
          </div>
        </div>

        {/* Decorative Archery Target */}
        <div className="absolute -right-8 -bottom-10 w-52 h-52 rounded-full border-8 border-emerald-500/10 flex items-center justify-center pointer-events-none opacity-40 md:opacity-100">
          <div className="w-40 h-40 rounded-full border-8 border-rose-500/20 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-8 border-sky-500/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/40 flex items-center justify-center">
                <Target className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sekolah */}
        <div
          onClick={() => onNavigateTab('schools')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total Sekolah</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <SchoolIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalSchools}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> {totalStudents} Atlet Terdaftar
          </p>
        </div>

        {/* Card 2: Siswa */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Siswa Panahan</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalStudents}</p>
          <p className="text-[11px] text-slate-400 mt-1">Standard Bow, Recurve, Barebow</p>
        </div>

        {/* Card 3: Kehadiran */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Rata-rata Kehadiran</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{attendanceRate}%</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> {hadirCount} Sesi Presensi Masuk
          </p>
        </div>

        {/* Card 4: SPP */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Pemasukan SPP</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            Rp {(totalPaidAmount / 1000).toLocaleString('id-ID')}rb
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Realisasi Pembayaran {paymentRate}%</p>
        </div>
      </div>

      {/* Main Content Grid: Score Chart & Attendance Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Score Progression */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Perkembangan Skor Panahan Terakhir
              </h3>
              <p className="text-xs text-slate-400">Rata-rata total skor simulasi latihan atlet panahan</p>
            </div>
            <button
              onClick={() => onNavigateTab('scoring')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData}>
                <defs>
                  <linearGradient id="colorSkor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="nama" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[200, 360]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="skor"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSkor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Attendance Breakdown Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Distribusi Presensi Siswa
            </h3>
            <p className="text-xs text-slate-400">Persentase status kehadiran latihan</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 text-xs">{item.name}:</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Practice Schedules & Recent Scores Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practice Schedules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Jadwal Latihan Mendatang
            </h3>
            <button
              onClick={() => onNavigateTab('schedules')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              Kelola Jadwal
            </button>
          </div>

          <div className="space-y-3">
            {filteredSchedules.slice(0, 3).map((schd) => (
              <div
                key={schd.id}
                className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      {schd.targetDistance}
                    </span>
                    <span className="text-xs font-bold text-white">{schd.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{schd.schoolName}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>📅 {schd.date}</span>
                    <span>⏰ {schd.timeStart} - {schd.timeEnd}</span>
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('attendance')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  Presensi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scores */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" /> Hasil Skor Terkini
            </h3>
            <button
              onClick={() => onNavigateTab('scoring')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              Input Skor Baru
            </button>
          </div>

          <div className="space-y-3">
            {filteredScores.slice(0, 3).map((sc) => (
              <div
                key={sc.id}
                className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{sc.studentName}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {sc.bowType} ({sc.distance})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Catatan Pelatih: "{sc.coachNotes}"
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-amber-400">{sc.totalScore} / 360</p>
                  <p className="text-[10px] text-slate-400">Rata2: {sc.averageArrow.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
