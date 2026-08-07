import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Send,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Coins,
  Building2,
  Users,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { SppPayment, Student, School, SystemNotification } from '../../types';
import { exportPaymentsToPdf, exportPaymentsToExcel, downloadInvoicePdf, downloadSchoolInvoicePdf } from '../../utils/exportUtils';

interface PaymentManagementProps {
  payments: SppPayment[];
  students: Student[];
  schools: School[];
  onUpdatePaymentStatus: (id: string, status: 'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi') => void;
  onSendNotification: (notif: SystemNotification) => void;
  selectedSchoolId: string;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
  students,
  schools,
  onUpdatePaymentStatus,
  onSendNotification,
  selectedSchoolId,
}) => {
  const [activeTab, setActiveTab] = useState<'spp_siswa' | 'school_honor'>('spp_siswa');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [sentNoticeId, setSentNoticeId] = useState<string | null>(null);

  // State to track school invoice payment status & sessions count
  const [schoolInvoicePaid, setSchoolInvoicePaid] = useState<Record<string, boolean>>({
    'sch-2': false, // SMPN 1 Surabaya initial unpaid
  });
  const [schoolSessions, setSchoolSessions] = useState<Record<string, number>>({
    'sch-1': 4,
    'sch-2': 4,
    'sch-3': 4,
  });

  const selectedSchoolObj = schools.find((s) => s.id === selectedSchoolId);

  const filteredPayments = payments.filter((p) => {
    const matchSchool = selectedSchoolId === 'ALL' || p.schoolId === selectedSchoolId;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchSearch =
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    return matchSchool && matchStatus && matchSearch;
  });

  // Calculate totals
  const totalPaidSpp = payments
    .filter((p) => (selectedSchoolId === 'ALL' || p.schoolId === selectedSchoolId) && p.status === 'Lunas')
    .reduce((a, b) => a + b.amount, 0);

  const totalUnpaidSpp = payments
    .filter((p) => (selectedSchoolId === 'ALL' || p.schoolId === selectedSchoolId) && p.status !== 'Lunas')
    .reduce((a, b) => a + b.amount, 0);

  const freeSppStudentCount = students.filter((st) => {
    const sch = schools.find((s) => s.id === st.schoolId);
    const mode = sch?.financialModel || ((sch?.coachHonorPerSession ?? 0) > 0 ? 'coach_honor' : 'monthly_fee');
    const matchSchool = selectedSchoolId === 'ALL' || st.schoolId === selectedSchoolId;
    return matchSchool && mode === 'coach_honor';
  }).length;

  const handleSendPaymentReminder = (p: SppPayment) => {
    const std = students.find((s) => s.id === p.studentId);
    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Pengingat SPP Panahan (${p.month})`,
      message: `Yth. Bapak/Ibu ${std ? std.parentName : 'Orang Tua'}. Tagihan SPP Panahan ${p.studentName} sebesar Rp ${p.amount.toLocaleString('id-ID')} untuk bulan ${p.month} dapat dibayarkan melalui QRIS/Transfer Bank pada Portal PanahanEdu.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'payment',
      targetSchoolId: p.schoolId,
      read: false,
      channelSent: 'WhatsApp',
    };
    onSendNotification(notif);
    setSentNoticeId(p.id);
    setTimeout(() => setSentNoticeId(null), 3000);
  };

  const handleSendSchoolInvoiceReminder = (sch: School) => {
    const sessionCount = schoolSessions[sch.id] || 4;
    const totalAmount = sessionCount * (sch.coachHonorPerSession || 0);

    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Tagihan Invoice Kedatangan Pelatih - ${sch.name}`,
      message: `Yth. ${sch.contactPerson} (${sch.name}). Invoice honor kedatangan pelatih PanahanEdu bulan Agustus 2026 (${sessionCount} sesi x Rp ${(sch.coachHonorPerSession || 0).toLocaleString('id-ID')}) sebesar Rp ${totalAmount.toLocaleString('id-ID')} telah diterbitkan. Silakan konfirmasi pembayaran.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'payment',
      targetSchoolId: sch.id,
      read: false,
      channelSent: 'WhatsApp',
    };
    onSendNotification(notif);
    setSentNoticeId(`sch-${sch.id}`);
    setTimeout(() => setSentNoticeId(null), 3000);
  };

  const toggleSchoolPaid = (schId: string) => {
    setSchoolInvoicePaid((prev) => ({ ...prev, [schId]: !prev[schId] }));
  };

  const filteredSchools = selectedSchoolId === 'ALL' ? schools : schools.filter((s) => s.id === selectedSchoolId);

  return (
    <div className="space-y-6">
      {/* Header Bar & Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Integrasi Keuangan & Tarif SPP Sekolah
            </h2>
            <p className="text-xs text-slate-400">
              Kelola iuran bulanan siswa dan tagihan honor kedatangan pelatih secara otomatis sesuai skema sekolah mitra.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportPaymentsToPdf(filteredPayments, 'Agustus 2026')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" /> Export PDF
            </button>
            <button
              onClick={() => exportPaymentsToExcel(filteredPayments)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Excel
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('spp_siswa')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'spp_siswa'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> 1. Tagihan SPP Siswa ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('school_honor')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'school_honor'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> 2. Tagihan & Rekapitulasi Sekolah ({schools.length})
          </button>
        </div>
      </div>

      {/* Selected School Scheme Banner */}
      {selectedSchoolObj && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
          selectedSchoolObj.financialModel === 'coach_honor'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">
                Skema Terpilih: {selectedSchoolObj.name} &mdash;{' '}
                {selectedSchoolObj.financialModel === 'coach_honor' ? 'Honor Kedatangan Pelatih' : 'Iuran Siswa Bulanan'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {selectedSchoolObj.financialModel === 'coach_honor' ? (
                  <>Siswa di sekolah ini <strong>Bebas SPP (Rp 0)</strong>. Tagihan dialihkan ke sekolah sebesar <strong>Rp {(selectedSchoolObj.coachHonorPerSession || 0).toLocaleString('id-ID')} / kedatangan sesi</strong>.</>
                ) : (
                  <>Tagihan SPP bulanan dibebankan ke siswa sebesar <strong>Rp {(selectedSchoolObj.monthlyFeePerStudent || 0).toLocaleString('id-ID')} / siswa / bulan</strong>.</>
                )}
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-black/40 border border-white/10">
            {selectedSchoolObj.code}
          </span>
        </div>
      )}

      {/* TAB 1: TAGIHAN SPP SISWA */}
      {activeTab === 'spp_siswa' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-emerald-800/40 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Total SPP Siswa Terkumpul</span>
                <p className="text-2xl font-black text-emerald-400">
                  Rp {totalPaidSpp.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-amber-800/40 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Total Tunggakan / Pending SPP</span>
                <p className="text-2xl font-black text-amber-400">
                  Rp {totalUnpaidSpp.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-sky-800/40 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Siswa Bebas SPP (Honor Sekolah)</span>
                <p className="text-2xl font-black text-sky-400">
                  {freeSppStudentCount} <span className="text-xs text-slate-500 font-normal">Siswa</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari invoice atau nama siswa..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Status SPP</option>
                <option value="Lunas">Lunas</option>
                <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                <option value="Belum Bayar">Belum Bayar</option>
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-200 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice / Siswa</th>
                    <th className="py-3.5 px-4">Sekolah & Skema</th>
                    <th className="py-3.5 px-4">Bulan & Nominal Tagihan</th>
                    <th className="py-3.5 px-4">Status Pembayaran</th>
                    <th className="py-3.5 px-4">Tanggal / Metode</th>
                    <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                        Tidak ada data tagihan SPP ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pay) => {
                      const sch = schools.find((s) => s.id === pay.schoolId);
                      const isCoachHonorMode = pay.amount === 0 || sch?.financialModel === 'coach_honor';

                      return (
                        <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white">
                            <p className="font-bold text-slate-100">{pay.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{pay.invoiceNumber}</p>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300">
                            <p className="font-semibold text-slate-200">{pay.schoolName}</p>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                              isCoachHonorMode ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {isCoachHonorMode ? 'Honor Kedatangan (Bebas SPP)' : 'Iuran SPP Bulanan'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isCoachHonorMode ? (
                              <div>
                                <span className="font-bold text-sky-400">Rp 0</span>
                                <span className="text-[10px] text-slate-400 block">Di-cover Sekolah</span>
                              </div>
                            ) : (
                              <div>
                                <p className="font-bold text-emerald-400">
                                  Rp {pay.amount.toLocaleString('id-ID')}
                                </p>
                                <p className="text-[10px] text-slate-400">{pay.month}</p>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${
                                isCoachHonorMode
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  : pay.status === 'Lunas'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : pay.status === 'Menunggu Konfirmasi'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {isCoachHonorMode ? 'Bebas SPP' : pay.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-slate-200">{pay.paidDate || '-'}</p>
                            <p className="text-[10px] text-slate-400">{pay.paymentMethod || '-'}</p>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isCoachHonorMode ? (
                                <span className="text-[10px] text-slate-500 italic">Tidak Ada Tagihan Siswa</span>
                              ) : (
                                <>
                                  {pay.status !== 'Lunas' ? (
                                    <button
                                      onClick={() => onUpdatePaymentStatus(pay.id, 'Lunas')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-all shadow"
                                    >
                                      Set Lunas
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => downloadInvoicePdf(pay)}
                                      className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                                      title="Unduh Kuitansi PDF"
                                    >
                                      <Download className="w-3.5 h-3.5" /> Kuitansi
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleSendPaymentReminder(pay)}
                                    disabled={sentNoticeId === pay.id}
                                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Kirim Pengingat WA Orang Tua"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAGIHAN & REKAPITULASI SEKOLAH */}
      {activeTab === 'school_honor' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>
                Rekapitulasi tagihan yang dibebankan langsung ke pihak sekolah mitra berdasarkan <strong>Skema Honor Kedatangan Pelatih</strong>.
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              Bulan: Agustus 2026
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredSchools.map((sch) => {
              const mode = sch.financialModel || ((sch.coachHonorPerSession ?? 0) > 0 ? 'coach_honor' : 'monthly_fee');
              const isCoachHonorMode = mode === 'coach_honor';
              const sessionCount = schoolSessions[sch.id] || 4;
              const honorPerSession = sch.coachHonorPerSession || 0;
              const totalSchoolInvoice = isCoachHonorMode ? sessionCount * honorPerSession : 0;
              const isPaid = schoolInvoicePaid[sch.id] || false;
              const studentCountInSchool = students.filter((st) => st.schoolId === sch.id).length;

              return (
                <div
                  key={sch.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all ${
                    isCoachHonorMode ? 'border-amber-500/30' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{sch.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {sch.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PIC: <strong className="text-slate-200">{sch.contactPerson}</strong> ({sch.phone}) &bull; {studentCountInSchool} Siswa Terdaftar
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isCoachHonorMode
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isCoachHonorMode ? 'Skema: Honor Kedatangan Pelatih' : 'Skema: Iuran SPP Siswa'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Details */}
                  {isCoachHonorMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-amber-500/20">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jumlah Kedatangan / Sesi</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={sessionCount}
                            onChange={(e) =>
                              setSchoolSessions((prev) => ({ ...prev, [sch.id]: Number(e.target.value) || 1 }))
                            }
                            className="w-16 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-1.5 text-center font-bold font-mono"
                          />
                          <span className="text-xs text-slate-400">Sesi Selesai</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Honor / Kedatangan</span>
                        <p className="text-sm font-bold text-amber-300 font-mono">
                          Rp {honorPerSession.toLocaleString('id-ID')} <span className="text-[10px] text-slate-500 font-normal">/sesi</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Tagihan Sekolah</span>
                        <p className="text-lg font-black text-amber-400 font-mono">
                          Rp {totalSchoolInvoice.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Pembayaran Sekolah</span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border inline-block w-fit ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isPaid ? 'LUNAS DIANUT' : 'BELUM DIBAYAR SEKOLAH'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Coins className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-slate-200 font-semibold">Sekolah Menagihkan SPP Mandiri ke Orang Tua</p>
                          <p className="text-[11px] text-slate-400">
                            Tarif SPP: Rp {(sch.monthlyFeePerStudent || 0).toLocaleString('id-ID')} / bulan / siswa. Total potensi SPP dari {studentCountInSchool} siswa: Rp {((sch.monthlyFeePerStudent || 0) * studentCountInSchool).toLocaleString('id-ID')}.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 italic">Tagihan Sekolah: Rp 0</span>
                    </div>
                  )}

                  {/* Actions for School Invoices */}
                  {isCoachHonorMode && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => toggleSchoolPaid(sch.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                          isPaid
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {isPaid ? 'Batal Set Lunas' : 'Tandai Lunas Invoice Sekolah'}
                      </button>

                      <button
                        onClick={() => downloadSchoolInvoicePdf(sch, sessionCount, totalSchoolInvoice, 'Agustus 2026')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh Invoice Sekolah PDF
                      </button>

                      <button
                        onClick={() => handleSendSchoolInvoiceReminder(sch)}
                        disabled={sentNoticeId === `sch-${sch.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" /> Kirim Tagihan WA PIC
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
