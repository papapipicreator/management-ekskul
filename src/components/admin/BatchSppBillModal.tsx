import React, { useState, useMemo } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  PlusCircle,
  ShieldCheck,
  Coins,
  Sparkles,
  Info
} from 'lucide-react';
import { School, Student, SppPayment, SystemNotification } from '../../types';

interface BatchSppBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  students: Student[];
  existingPayments: SppPayment[];
  onGenerateBatchPayments: (newPayments: SppPayment[], notifyParents: boolean) => void;
}

export const BatchSppBillModal: React.FC<BatchSppBillModalProps> = ({
  isOpen,
  onClose,
  schools,
  students,
  existingPayments,
  onGenerateBatchPayments,
}) => {
  // Filter schools that use the monthly_fee financial model (iuran bulanan)
  const monthlyFeeSchools = useMemo(() => {
    return schools.filter((sch) => {
      const mode = sch.financialModel || ((sch.coachHonorPerSession ?? 0) > 0 ? 'coach_honor' : 'monthly_fee');
      return mode === 'monthly_fee';
    });
  }, [schools]);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    monthlyFeeSchools.length > 0 ? monthlyFeeSchools[0].id : 'ALL_IURAN'
  );

  const [targetMonth, setTargetMonth] = useState<string>('Agustus 2026');
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState<string>('2026-08-10');
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [autoNotify, setAutoNotify] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Selected school object (if specific school is chosen)
  const currentSchool = schools.find((s) => s.id === selectedSchoolId);

  // Default fee amount based on selection
  const effectiveDefaultFee = currentSchool
    ? currentSchool.monthlyFeePerStudent || 150000
    : 150000;

  const actualFeeAmount = typeof customAmount === 'number' && customAmount > 0 ? customAmount : effectiveDefaultFee;

  // Target students to generate bills for
  const targetStudents = students.filter((st) => {
    if (st.status && st.status !== 'Aktif') return false; // skip non-active students
    if (selectedSchoolId === 'ALL_IURAN') {
      const sch = schools.find((s) => s.id === st.schoolId);
      const mode = sch?.financialModel || ((sch?.coachHonorPerSession ?? 0) > 0 ? 'coach_honor' : 'monthly_fee');
      return mode === 'monthly_fee';
    }
    return st.schoolId === selectedSchoolId;
  });

  // Calculate duplicates & final list of new bills
  const billCandidates = targetStudents.map((std) => {
    const stdSchool = schools.find((s) => s.id === std.schoolId);
    const fee = typeof customAmount === 'number' && customAmount > 0
      ? customAmount
      : (stdSchool?.monthlyFeePerStudent || 150000);

    const alreadyExists = existingPayments.some(
      (p) => p.studentId === std.id && p.month.trim().toLowerCase() === targetMonth.trim().toLowerCase()
    );

    return {
      student: std,
      school: stdSchool,
      amount: fee,
      isDuplicate: alreadyExists,
    };
  });

  const studentsToGenerate = skipDuplicates
    ? billCandidates.filter((c) => !c.isDuplicate)
    : billCandidates;

  const totalAmountToPublish = studentsToGenerate.reduce((sum, item) => sum + item.amount, 0);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentsToGenerate.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const yearMonthCode = new Date().getFullYear().toString() + String(new Date().getMonth() + 1).padStart(2, '0');
      
      const newPayments: SppPayment[] = studentsToGenerate.map((item, idx) => {
        const randCode = Math.floor(100 + Math.random() * 900);
        return {
          id: `pay-batch-${Date.now()}-${idx}-${item.student.id}`,
          studentId: item.student.id,
          studentName: item.student.name,
          schoolId: item.student.schoolId,
          schoolName: item.student.schoolName || item.school?.name || 'Sekolah Mitra',
          month: targetMonth,
          amount: item.amount,
          status: 'Belum Bayar',
          invoiceNumber: `INV/PAN/${yearMonthCode}/${randCode}`,
          dueDate: dueDate || new Date().toISOString().substring(0, 10),
        };
      });

      onGenerateBatchPayments(newPayments, autoNotify);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const presetMonths = [
    'Agustus 2026',
    'September 2026',
    'Oktober 2026',
    'November 2026',
    'Desember 2026',
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Top Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-purple-400">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Terbitkan Tagihan SPP Massal per Sekolah
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Batch Generator
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Terbitkan tagihan iuran bulanan untuk seluruh siswa di sekolah mitra bertarif SPP sekaligus.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: School & Month Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* School Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-400" /> Pilih Sekolah Target
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setCustomAmount('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="ALL_IURAN">
                  🌐 Semua Sekolah Mitra dengan Skema SPP/Iuran ({monthlyFeeSchools.length} Sekolah)
                </option>
                {schools.map((sch) => {
                  const isCoachHonor = sch.financialModel === 'coach_honor' || (sch.coachHonorPerSession ?? 0) > 0;
                  return (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} &mdash; {isCoachHonor ? 'Bebas SPP (Honor Sekolah)' : `Rp ${(sch.monthlyFeePerStudent || 150000).toLocaleString('id-ID')}/siswa`}
                    </option>
                  );
                })}
              </select>

              {/* School Scheme Badge Note */}
              {currentSchool && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>
                    Skema Resmi: <strong className="text-purple-300">{currentSchool.financialModel === 'coach_honor' ? 'Honor Sekolah (Bebas SPP)' : 'Iuran Siswa Bulanan'}</strong> &bull; Tarif Standar: <strong className="text-emerald-400">Rp {(currentSchool.monthlyFeePerStudent || 150000).toLocaleString('id-ID')}</strong>
                  </span>
                </p>
              )}
            </div>

            {/* Target Month Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" /> Bulan / Periode Tagihan
              </label>
              <input
                type="text"
                required
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                placeholder="Contoh: September 2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />

              {/* Preset Month Quick Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {presetMonths.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMonth(m)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      targetMonth === m
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Fee Amount & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Nominal SPP per Siswa (Rp)</span>
                <span className="text-[10px] text-slate-500 font-normal">Kosongkan jika menggunakan tarif standar sekolah</span>
              </label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`Standar Tarif: Rp ${effectiveDefaultFee.toLocaleString('id-ID')}`}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tanggal Jatuh Tempo Pembayaran</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Options (Duplicates & Notifications) */}
          <div className="space-y-2 bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-purple-200">
                Abaikan siswa yang sudah memiliki tagihan untuk bulan <strong>{targetMonth}</strong> (Cegah duplikasi tagihan)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoNotify}
                onChange={(e) => setAutoNotify(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-purple-200">
                Kirimkan notifikasi tagihan SPP baru otomatis ke Portal Orang Tua / WhatsApp
              </span>
            </label>
          </div>

          {/* Section 4: Live Target Preview List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" /> Daftar Siswa Penerima Tagihan ({billCandidates.length} Siswa)
              </h3>
              <span className="text-xs text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                {studentsToGenerate.length} Siap Diterbitkan &bull; Total Rp {totalAmountToPublish.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800/60">
              {billCandidates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Tidak ada siswa aktif ditemukan pada sekolah target yang dipilih.
                </div>
              ) : (
                billCandidates.map((item) => {
                  const isSkipped = item.isDuplicate && skipDuplicates;

                  return (
                    <div
                      key={item.student.id}
                      className={`p-3 px-4 flex items-center justify-between text-xs transition-colors ${
                        isSkipped ? 'opacity-40 bg-slate-900/40' : 'hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSkipped
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {item.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            <span>{item.student.name}</span>
                            {item.student.nisn && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                NISN: {item.student.nisn}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.school?.name || item.student.schoolName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="font-extrabold text-emerald-400">
                            Rp {item.amount.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[10px] text-slate-500">Jatuh Tempo: {dueDate}</p>
                        </div>

                        {item.isDuplicate ? (
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                            {skipDuplicates ? 'Akan Dilewati' : 'Tagihan Ganda'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Siap
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Diterbitkan untuk: <strong className="text-white">{studentsToGenerate.length} Siswa</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isSubmitting || studentsToGenerate.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Terbitkan {studentsToGenerate.length} Tagihan SPP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
