import React, { useState } from 'react';
import { Target, Award, CreditCard, Bell, Download, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';
import { Student, StudentAttendance, ArcheryScoreRecord, SppPayment, SystemNotification } from '../../types';
import { exportScoresToPdf, downloadInvoicePdf } from '../../utils/exportUtils';
import { SppPaymentModal } from '../student/SppPaymentModal';

interface ParentPortalProps {
  students: Student[];
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  notifications: SystemNotification[];
  onPaySpp: (paymentId: string, method: string) => void;
  selectedSchoolId?: string;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  attendance,
  scores,
  payments,
  notifications,
  onPaySpp,
  selectedSchoolId = 'ALL',
}) => {
  const filteredStudents =
    selectedSchoolId && selectedSchoolId !== 'ALL'
      ? students.filter((s) => s.schoolId === selectedSchoolId)
      : students;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<SppPayment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const activeStudent =
    filteredStudents.find((s) => s.id === selectedStudentId) || filteredStudents[0];

  const childAttendance = attendance.filter((a) => a.studentId === activeStudent?.id);
  const childScores = scores.filter((s) => s.studentId === activeStudent?.id);
  const childPayments = payments.filter((p) => p.studentId === activeStudent?.id);

  const latestScore = childScores[0] || childScores[childScores.length - 1];

  const handleOpenPayment = (p: SppPayment) => {
    setSelectedPayment(p);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Parent Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/30">
            Portal Pemantauan Orang Tua / Wali
          </span>
          <h1 className="text-xl font-black text-white mt-1">
            Laporan Perkembangan Panahan Ananda
          </h1>
          <p className="text-xs text-slate-400">
            Monitor presensi, skor evaluasi pelatih, serta status SPP bulanan.
          </p>
        </div>

        {/* Child Selector */}
        <div className="w-full sm:w-auto">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Pilih Putra/Putri Anda:
          </label>
          <select
            value={activeStudent?.id || ''}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 font-bold"
          >
            {filteredStudents.length === 0 ? (
              <option value="">Tidak ada siswa di sekolah ini</option>
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

      {/* Child Profile Card */}
      {activeStudent && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={activeStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={activeStudent.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
            />
            <div>
              <h2 className="text-sm font-bold text-white">{activeStudent.name}</h2>
              <p className="text-xs text-slate-400">{activeStudent.schoolName} • {activeStudent.grade}</p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                Busur: {activeStudent.bowType} ({activeStudent.targetDistance})
              </p>
            </div>
          </div>

          <button
            onClick={() => exportScoresToPdf(childScores, `Laporan Orang Tua - ${activeStudent.name}`)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Download className="w-4 h-4" /> Unduh Rapot Panahan PDF
          </button>
        </div>
      )}

      {/* Main Grid: Score History & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evaluasi & Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" /> Catatan Perkembangan & Evaluasi Pelatih
            </h3>

            {childScores.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada catatan skor panahan.</p>
            ) : (
              <div className="space-y-3">
                {childScores.map((sc) => (
                  <div key={sc.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono">{sc.date}</span>
                      <span className="text-amber-400 font-bold">{sc.bowType} ({sc.distance})</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-2xl font-black text-amber-400">{sc.totalScore}</span>
                        <span className="text-xs text-slate-500"> / {sc.maxPossibleScore}</span>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-emerald-400 font-bold block">Rata-rata: {sc.averageArrow.toFixed(2)}</span>
                        <span className="text-slate-400 text-[10px]">10s: {sc.tenCount} | Xs: {sc.xCount}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">
                        Pesan Evaluasi Pelatih:
                      </span>
                      <p className="text-xs italic text-slate-200">"{sc.coachNotes}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: SPP Payments */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Status SPP Bulanan
            </h3>

            <div className="space-y-3">
              {childPayments.map((p) => {
                const isFreeSpp = p.amount === 0;

                return (
                  <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{p.month}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isFreeSpp
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                            : p.status === 'Lunas'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isFreeSpp ? 'Bebas SPP' : p.status}
                      </span>
                    </div>

                    {isFreeSpp ? (
                      <div>
                        <p className="text-lg font-black text-sky-400">Rp 0</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Sekolah ananda menggunakan skema Honor Kedatangan Pelatih. Bebas tagihan SPP bulanan.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-black text-amber-400">
                          Rp {p.amount.toLocaleString('id-ID')}
                        </p>

                        {p.status !== 'Lunas' ? (
                          <button
                            onClick={() => handleOpenPayment(p)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Bayar SPP Online (QRIS/Bank)
                          </button>
                        ) : (
                          <button
                            onClick={() => downloadInvoicePdf(p)}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-xl font-medium"
                          >
                            Unduh Kuitansi PDF
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <SppPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          payment={selectedPayment}
          onPaymentSuccess={onPaySpp}
        />
      )}
    </div>
  );
};
