import React, { useState } from 'react';
import {
  X,
  Target,
  Calendar,
  CreditCard,
  QrCode,
  User,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  School as SchoolIcon,
  Edit3,
  Award,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldCheck,
  Plus
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
  ArcheryScoreRecord,
  StudentAttendance,
  SppPayment
} from '../../types';
import { getStudentQrCodeImgUrl } from '../../utils/qrUtils';

interface StudentDetailModalProps {
  student: Student;
  school?: School;
  scores: ArcheryScoreRecord[];
  attendance: StudentAttendance[];
  payments: SppPayment[];
  onClose: () => void;
  onEditStudent?: (student: Student) => void;
  onUpdatePaymentStatus?: (
    paymentId: string,
    status: 'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi',
    paidDate?: string,
    paymentMethod?: string
  ) => void;
  onAddPaymentBill?: (newPayment: SppPayment) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  school,
  scores,
  attendance,
  payments,
  onClose,
  onEditStudent,
  onUpdatePaymentStatus,
  onAddPaymentBill,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'scoring' | 'attendance' | 'payments'>('profile');
  const [selectedScore, setSelectedScore] = useState<ArcheryScoreRecord | null>(null);

  // Payment status edit state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi'>('Lunas');
  const [editingMethod, setEditingMethod] = useState<string>('Transfer Bank');
  const [editingPaidDate, setEditingPaidDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // Add bill state
  const [isAddingBillModalOpen, setIsAddingBillModalOpen] = useState(false);
  const [newBillMonth, setNewBillMonth] = useState<string>('Agustus 2026');
  const [newBillAmount, setNewBillAmount] = useState<number>(school?.monthlyFeePerStudent || 150000);
  const [newBillDueDate, setNewBillDueDate] = useState<string>('2026-08-10');
  const [newBillStatus, setNewBillStatus] = useState<'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi'>('Belum Bayar');

  // Filter student-specific data sorted chronologically
  const studentScores = scores
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const studentAttendance = attendance
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const studentPayments = payments
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => new Date(b.dueDate || b.month).getTime() - new Date(a.dueDate || a.month).getTime());

  // Statistics calculation
  const highestScore = studentScores.length > 0 ? Math.max(...studentScores.map((s) => s.totalScore)) : 0;
  const latestScoreRecord = studentScores.length > 0 ? studentScores[studentScores.length - 1] : null;
  const averageArrowOverall =
    studentScores.length > 0
      ? (studentScores.reduce((acc, curr) => acc + curr.averageArrow, 0) / studentScores.length).toFixed(2)
      : '0.00';

  const totalArrowsShot = studentScores.reduce(
    (acc, curr) => acc + (curr.ends ? curr.ends.flatMap((e) => e.arrows).length : 36),
    0
  );

  const total10s = studentScores.reduce((acc, curr) => acc + (curr.tenCount || 0), 0);
  const totalXs = studentScores.reduce((acc, curr) => acc + (curr.xCount || 0), 0);

  // Attendance metrics
  const totalPresence = studentAttendance.length;
  const hadirCount = studentAttendance.filter((a) => a.status === 'Hadir').length;
  const izinCount = studentAttendance.filter((a) => a.status === 'Izin').length;
  const sakitCount = studentAttendance.filter((a) => a.status === 'Sakit').length;
  const alphaCount = studentAttendance.filter((a) => a.status === 'Alpha').length;

  const attendanceRate = totalPresence > 0 ? Math.round((hadirCount / totalPresence) * 100) : 100;

  // SPP financial scheme determination
  // A school is on monthly SPP fee if financialModel === 'monthly_fee' OR monthlyFeePerStudent > 0
  const isMonthlySppScheme = school
    ? school.financialModel === 'monthly_fee' || (school.monthlyFeePerStudent && school.monthlyFeePerStudent > 0)
    : true; // Default to true if school metadata not found

  // Score trend chart data format
  const chartData = studentScores.map((sc) => ({
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

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 border-b border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  student.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={student.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl"
              />
              <span
                className={`absolute -bottom-1 -right-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                  student.status === 'Aktif'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-amber-500 text-slate-950 border-amber-400'
                }`}
              >
                {student.status}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                  NISN: {student.nisn}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {student.bowType}
                </span>
                <span className="text-[10px] uppercase font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/30">
                  Jarak: {student.targetDistance}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{student.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <SchoolIcon className="w-3.5 h-3.5 text-emerald-400 inline" />
                <span className="font-semibold text-white">{student.schoolName}</span> • Kelas: {student.grade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onEditStudent && (
              <button
                onClick={() => {
                  onEditStudent(student);
                  onClose();
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              title="Tutup Profil"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" /> Profil & Biodata
          </button>

          <button
            onClick={() => setActiveTab('scoring')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'scoring'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Target className="w-4 h-4" /> Scoring & Grafik ({studentScores.length})
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'attendance'
                ? 'bg-sky-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" /> Presensi ({hadirCount}/{totalPresence})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-4 h-4" /> SPP Bulanan ({studentPayments.length})
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* TAB 1: PROFIL & BIODATA LENGKAP */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Information Card Column 1 & 2 */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Informasi Data Diri Atlet
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Nama Lengkap</span>
                        <span className="text-white font-bold text-sm">{student.name}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">NISN / Nomor Induk</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm">{student.nisn}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sekolah Mitra</span>
                        <span className="text-white font-semibold">{student.schoolName}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Kelas / Tingkat</span>
                        <span className="text-slate-200 font-semibold">{student.grade}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori Busur</span>
                        <span className="text-amber-400 font-bold">{student.bowType}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Jarak Target Latihan</span>
                        <span className="text-sky-400 font-bold">{student.targetDistance}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Tanggal Bergabung</span>
                        <span className="text-slate-300 font-mono">{student.joinDate || '2026-01-10'}</span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Keanggotaan</span>
                        <span className="text-emerald-400 font-bold">{student.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent & Contact Information */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Phone className="w-4 h-4 text-sky-400" /> Kontak Orang Tua / Wali Siswa
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Nama Wali</span>
                        <p className="text-slate-200 font-bold text-sm">{student.parentName}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">No. WhatsApp / HP</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono font-bold text-sm">
                            {student.parentPhone || '081234567890'}
                          </span>
                          {student.parentPhone && (
                            <a
                              href={`https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              WA Direct <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Digital Card & QR Code */}
                <div className="space-y-4">
                  <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" /> Kartu Anggota Presensi QR
                    </h4>

                    <div className="bg-white p-4 rounded-2xl shadow-xl inline-block border-2 border-emerald-500/30">
                      <img src={getStudentQrCodeImgUrl(student)} alt="QR Code" className="w-32 h-32 mx-auto" />
                      <p className="text-[10px] font-mono font-extrabold text-slate-900 mt-1">
                        STD-{student.nisn}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                      Gunakan QR Code ini saat datang ke lokasi latihan ekstrakurikuler untuk scan presensi otomatis oleh pelatih.
                    </p>
                  </div>

                  {/* Financial Scheme Status Callout */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Skema Keuangan Sekolah</span>
                    {isMonthlySppScheme ? (
                      <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 font-semibold flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Iuran SPP Bulanan (Rp {school?.monthlyFeePerStudent?.toLocaleString('id-ID') || '150.000'} / Bln)</span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-semibold flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Honor Pelatih per Sesi (Bebas Tagihan SPP Individual)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT SCORING LENGKAP DENGAN GRAFIK */}
          {activeTab === 'scoring' && (
            <div className="space-y-6">
              {/* Scoring Highlights KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Skor Tertinggi</span>
                  <p className="text-2xl font-black text-amber-400">{highestScore} <span className="text-xs text-slate-500">/ 360</span></p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rata-Rata Arrow</span>
                  <p className="text-2xl font-black text-emerald-400">{averageArrowOverall}</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Anak Panah</span>
                  <p className="text-2xl font-black text-sky-400">{totalArrowsShot} <span className="text-xs text-slate-500">Arrows</span></p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total 10s & Xs</span>
                  <p className="text-2xl font-black text-purple-400">{total10s} <span className="text-xs text-slate-500">(X: {totalXs})</span></p>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Grafik Tren Perkembangan Skor Total
                    </h3>
                    <p className="text-xs text-slate-400">
                      Visualisasi perkembangan total skor per sesi tembak (Maksimal 360).
                    </p>
                  </div>
                  {latestScoreRecord && (
                    <span className="text-[11px] bg-slate-900 border border-slate-800 text-amber-300 font-mono px-3 py-1 rounded-xl">
                      Sesi Terakhir: {latestScoreRecord.totalScore} Pts ({latestScoreRecord.date})
                    </span>
                  )}
                </div>

                {chartData.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    Belum ada rekam data scoring panahan terdaftar untuk siswa ini.
                  </div>
                ) : (
                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#scoreColor)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Detailed Scoring History List */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Riwayat Sesi Skoring Lengkap
                </h3>

                {studentScores.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Tidak ada catatan scoring.</p>
                ) : (
                  <div className="space-y-4">
                    {studentScores
                      .slice()
                      .reverse()
                      .map((sc) => (
                        <div
                          key={sc.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-200">{sc.date}</span>
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                                {sc.bowType}
                              </span>
                              <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-md font-bold">
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
                                    className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 text-center space-y-1"
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
                            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs italic text-slate-300 flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>Catatan Pelatih: "{sc.coachNotes}"</span>
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
              {/* Attendance Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Persentase</span>
                  <p className="text-xl font-black text-emerald-400">{attendanceRate}%</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hadir</span>
                  <p className="text-xl font-black text-emerald-400">{hadirCount}</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Izin</span>
                  <p className="text-xl font-black text-amber-400">{izinCount}</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sakit</span>
                  <p className="text-xl font-black text-sky-400">{sakitCount}</p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alpha</span>
                  <p className="text-xl font-black text-rose-400">{alphaCount}</p>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" /> Log Presensi Kehadiran Siswa
                </h3>

                {studentAttendance.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada rekam presensi terdaftar.</p>
                ) : (
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-2xl overflow-hidden">
                    {studentAttendance.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 bg-slate-900/80 hover:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
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
                /* Information Card for Coach Honor Scheme Schools */
                <div className="bg-amber-950/20 border border-amber-500/30 p-6 rounded-2xl space-y-3 text-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-300">Skema Keuangan Honor Pelatih Per Sesi</h3>
                      <p className="text-xs text-amber-200/80">
                        Sekolah Mitra <strong>{student.schoolName}</strong> menggunakan skema honor pelatih per sesi latihan.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed border-t border-amber-500/20 pt-3">
                    Dalam skema ini, biaya ekstrakurikuler ditanggung oleh pihak sekolah melalui honor kedatangan pelatih, sehingga siswa tidak dikenakan iuran SPP bulanan per perorangan. Tagihan SPP tidak diterbitkan untuk atlet di sekolah ini.
                  </p>
                </div>
              ) : (
                /* SPP Payment History for Monthly SPP Scheme */
                <div className="space-y-6">
                  {/* Payment Summary Header */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status SPP Terbaru</span>
                      <p className="text-lg font-black text-emerald-400">
                        {studentPayments[0]?.status || 'Tidak Ada Tagihan'}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tagihan Lunas</span>
                      <p className="text-lg font-black text-white">
                        {studentPayments.filter((p) => p.status === 'Lunas').length} Bulan
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nominal Iuran SPP</span>
                      <p className="text-lg font-black text-purple-400">
                        {formatRupiah(school?.monthlyFeePerStudent || 150000)} / bln
                      </p>
                    </div>
                  </div>

                  {/* Payment Records List */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-400" /> Histori Pembayaran SPP Bulanan
                      </h3>

                      {onAddPaymentBill && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewBillAmount(school?.monthlyFeePerStudent || 150000);
                            setIsAddingBillModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Tagihan SPP
                        </button>
                      )}
                    </div>

                    {studentPayments.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <p className="text-xs text-slate-500">Belum ada data tagihan SPP untuk siswa ini.</p>
                        {onAddPaymentBill && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewBillAmount(school?.monthlyFeePerStudent || 150000);
                              setIsAddingBillModalOpen(true);
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Buat Tagihan SPP Pertama
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {studentPayments.map((pay) => {
                          const isEditingThis = editingPaymentId === pay.id;

                          return (
                            <div
                              key={pay.id}
                              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-white">{pay.month}</span>
                                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                      {pay.invoiceNumber}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400">
                                    Nominal: <strong className="text-emerald-400">{formatRupiah(pay.amount)}</strong> • Metode: {pay.paymentMethod || 'Transfer'}
                                  </p>
                                  {pay.paidDate && (
                                    <p className="text-[10px] text-slate-400">
                                      Tanggal Bayar: <span className="text-slate-300 font-mono">{pay.paidDate}</span>
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-black border ${
                                      pay.status === 'Lunas'
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : pay.status === 'Menunggu Konfirmasi'
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                    }`}
                                  >
                                    {pay.status}
                                  </span>

                                  {onUpdatePaymentStatus && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isEditingThis) {
                                          setEditingPaymentId(null);
                                        } else {
                                          setEditingPaymentId(pay.id);
                                          setEditingStatus(pay.status);
                                          setEditingMethod(pay.paymentMethod || 'Transfer Bank');
                                          setEditingPaidDate(pay.paidDate || new Date().toISOString().substring(0, 10));
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                      <span>{isEditingThis ? 'Batal' : 'Edit Status'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Inline Payment Status Editor */}
                              {isEditingThis && (
                                <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/40 space-y-3 mt-2">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-purple-400" /> Form Edit Status SPP ({pay.month})
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{pay.invoiceNumber}</span>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                                      Pilih Status Pembayaran
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingStatus('Lunas')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                          editingStatus === 'Lunas'
                                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-500/50'
                                            : 'bg-slate-900 text-emerald-400 border-slate-800 hover:border-emerald-500/40'
                                        }`}
                                      >
                                        <CheckCircle2 className="w-4 h-4" /> Lunas
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setEditingStatus('Menunggu Konfirmasi')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                          editingStatus === 'Menunggu Konfirmasi'
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-500/50'
                                            : 'bg-slate-900 text-amber-400 border-slate-800 hover:border-amber-500/40'
                                        }`}
                                      >
                                        <Clock className="w-4 h-4" /> Menunggu Konfirmasi
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setEditingStatus('Belum Bayar')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                          editingStatus === 'Belum Bayar'
                                            ? 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-500/50'
                                            : 'bg-slate-900 text-rose-400 border-slate-800 hover:border-rose-500/40'
                                        }`}
                                      >
                                        <XCircle className="w-4 h-4" /> Belum Bayar
                                      </button>
                                    </div>
                                  </div>

                                  {editingStatus === 'Lunas' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                      <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-300 block">Metode Pembayaran</label>
                                        <select
                                          value={editingMethod}
                                          onChange={(e) => setEditingMethod(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                          <option value="Transfer Bank">Transfer Bank</option>
                                          <option value="QRIS Direct">QRIS Direct</option>
                                          <option value="Tunai / Cash">Tunai / Cash</option>
                                          <option value="Manual Verifikasi Admin">Manual Verifikasi Admin</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-300 block">Tanggal Pembayaran</label>
                                        <input
                                          type="date"
                                          value={editingPaidDate}
                                          onChange={(e) => setEditingPaidDate(e.target.value)}
                                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                                    <button
                                      type="button"
                                      onClick={() => setEditingPaymentId(null)}
                                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onUpdatePaymentStatus) {
                                          onUpdatePaymentStatus(pay.id, editingStatus, editingPaidDate, editingMethod);
                                        }
                                        setEditingPaymentId(null);
                                      }}
                                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                                    >
                                      Simpan Status
                                    </button>
                                  </div>
                                </div>
                              )}
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

        {/* Modal Overlay for Adding New SPP Bill */}
        {isAddingBillModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" /> Buat Tagihan SPP Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingBillModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nama Siswa</label>
                  <input
                    type="text"
                    disabled
                    value={student.name}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Bulan / Periode Tagihan</label>
                  <input
                    type="text"
                    value={newBillMonth}
                    onChange={(e) => setNewBillMonth(e.target.value)}
                    placeholder="Contoh: September 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nominal Iuran (Rp)</label>
                  <input
                    type="number"
                    value={newBillAmount}
                    onChange={(e) => setNewBillAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={newBillDueDate}
                    onChange={(e) => setNewBillDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Status Awal</label>
                  <select
                    value={newBillStatus}
                    onChange={(e) => setNewBillStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingBillModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onAddPaymentBill) {
                      const createdBill: SppPayment = {
                        id: `pay-${Date.now()}`,
                        studentId: student.id,
                        studentName: student.name,
                        schoolId: student.schoolId,
                        schoolName: student.schoolName,
                        month: newBillMonth || 'Bulan Baru',
                        amount: newBillAmount || 150000,
                        status: newBillStatus,
                        invoiceNumber: `INV/PAN/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
                        dueDate: newBillDueDate || new Date().toISOString().substring(0, 10),
                        paidDate: newBillStatus === 'Lunas' ? new Date().toISOString().substring(0, 10) : undefined,
                        paymentMethod: newBillStatus === 'Lunas' ? 'Manual Verifikasi Admin' : undefined,
                      };
                      onAddPaymentBill(createdBill);
                    }
                    setIsAddingBillModalOpen(false);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                >
                  Terbitkan Tagihan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
          <span>Panahan Bandung — Profil Atlet Digital</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
