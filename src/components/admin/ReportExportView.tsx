import React, { useState } from 'react';
import { FileSpreadsheet, Download, ClipboardCheck, Target, CreditCard, Award, CheckCircle2, School as SchoolIcon } from 'lucide-react';
import { StudentAttendance, ArcheryScoreRecord, SppPayment, Student, School } from '../../types';
import {
  exportAttendanceToPdf,
  exportAttendanceToExcel,
  exportScoresToPdf,
  exportScoresToExcel,
  exportPaymentsToPdf,
  exportPaymentsToExcel,
  downloadInvoicePdf
} from '../../utils/exportUtils';

interface ReportExportViewProps {
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  students: Student[];
  schools: School[];
  selectedSchoolId: string;
}

export const ReportExportView: React.FC<ReportExportViewProps> = ({
  attendance,
  scores,
  payments,
  students,
  schools,
  selectedSchoolId,
}) => {
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>(students[0]?.id || '');
  const activeStudent = students.find((s) => s.id === selectedStudentForReport) || students[0];

  const activeSchoolName = selectedSchoolId === 'ALL'
    ? 'Semua Sekolah'
    : schools.find((s) => s.id === selectedSchoolId)?.name || 'Sekolah Panahan';

  const filteredAttendance = selectedSchoolId === 'ALL' ? attendance : attendance.filter((a) => a.schoolId === selectedSchoolId);
  const filteredScores = selectedSchoolId === 'ALL' ? scores : scores.filter((s) => s.schoolId === selectedSchoolId);
  const filteredPayments = selectedSchoolId === 'ALL' ? payments : payments.filter((p) => p.schoolId === selectedSchoolId);

  // Student specific downloads
  const handleDownloadStudentReportCard = () => {
    if (!activeStudent) return;
    const studentScores = scores.filter((sc) => sc.studentId === activeStudent.id);
    exportScoresToPdf(
      studentScores,
      `Laporan Bulanan - ${activeStudent.name}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          Pusat Export Laporan Administrasi Pelatih (PDF & Excel)
        </h2>
        <p className="text-xs text-slate-400">
          Unduh laporan resmi kehadiran, hasil evaluasi skoring panahan, rekapitulasi keuangan SPP, serta kartu perkembangan bulanan orang tua.
        </p>
      </div>

      {/* 4 Major Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Attendance Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Laporan Rekapitulasi Presensi Kehadiran</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memuat data kehadiran presensi siswa dan pelatih per sesi latihan, jumlah jam masuk, serta catatan ketidakhadiran ({filteredAttendance.length} catatan).
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportAttendanceToPdf(filteredAttendance, students, activeSchoolName)}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => exportAttendanceToExcel(filteredAttendance, students, activeSchoolName)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* Card 2: Archery Scoring Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Laporan Perkembangan & Skor Panahan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memuat total skor panahan (10m - 30m), rasio 10s & Xs, rata-rata anak panah, dan catatan evaluasi teknik dari pelatih ({filteredScores.length} rekam skor).
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportScoresToPdf(filteredScores, activeSchoolName)}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => exportScoresToExcel(filteredScores, activeSchoolName)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* Card 3: Financial SPP Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Laporan Rekapitulasi Keuangan SPP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memuat ringkasan status pembayaran SPP bulanan (Lunas & Belum Bayar), nomor kuitansi invoice, serta metode transfer online.
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportPaymentsToPdf(filteredPayments, 'Agustus 2026')}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => exportPaymentsToExcel(filteredPayments)}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>

        {/* Card 4: Parent Monthly Evaluation Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Cetak Kartu Laporan Orang Tua Per Siswa</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pilih nama siswa atlet untuk mengunduh laporan rapot perkembangan individu lengkap dengan evaluasi pelatih.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Pilih Nama Atlet Siswa:
              </label>
              <select
                value={selectedStudentForReport}
                onChange={(e) => setSelectedStudentForReport(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 font-bold"
              >
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} ({std.schoolName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadStudentReportCard}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all"
            >
              <Download className="w-4 h-4" /> Unduh Kartu Laporan ({activeStudent?.name.split(' ')[0]})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
