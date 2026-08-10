import React, { useState } from 'react';
import { FileSpreadsheet, Download, ClipboardCheck, Target, CreditCard, Award, Database, Upload, FileUp, CheckCircle2 } from 'lucide-react';
import { StudentAttendance, ArcheryScoreRecord, SppPayment, Student, School, Coach, Schedule } from '../../types';
import { exportFullDatabaseToExcel } from '../../utils/excelBackupUtils';
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
  coaches?: Coach[];
  schedules?: Schedule[];
  selectedSchoolId: string;
  onOpenExcelBackupModal?: () => void;
}

export const ReportExportView: React.FC<ReportExportViewProps> = ({
  attendance,
  scores,
  payments,
  students,
  schools,
  coaches = [],
  schedules = [],
  selectedSchoolId,
  onOpenExcelBackupModal,
}) => {
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<string>(students[0]?.id || '');
  const [attendanceSchoolFilter, setAttendanceSchoolFilter] = useState<string>(selectedSchoolId || 'ALL');

  const activeStudent = students.find((s) => s.id === selectedStudentForReport) || students[0];

  const activeSchoolName = selectedSchoolId === 'ALL'
    ? 'Semua Sekolah'
    : schools.find((s) => s.id === selectedSchoolId)?.name || 'Sekolah Panahan';

  const selectedAttendanceSchool = schools.find((s) => s.id === attendanceSchoolFilter);
  const selectedAttendanceSchoolName = attendanceSchoolFilter === 'ALL'
    ? 'Semua Sekolah'
    : selectedAttendanceSchool?.name || 'Sekolah Panahan';

  const exportAttendanceList = attendanceSchoolFilter === 'ALL'
    ? attendance
    : attendance.filter((a) => a.schoolId === attendanceSchoolFilter);

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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Pusat Export Laporan & Backup Data Excel
          </h2>
          <p className="text-xs text-slate-400">
            Unduh laporan resmi kehadiran, hasil evaluasi skoring, rekapitulasi SPP, atau cadangkan/pulihkan seluruh database aplikasi via Excel.
          </p>
        </div>
        {onOpenExcelBackupModal && (
          <button
            onClick={onOpenExcelBackupModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0"
          >
            <Database className="w-4 h-4 text-emerald-200" /> Kelola Backup & Restore Excel
          </button>
        )}
      </div>

      {/* Featured Full Database Excel Backup & Restore Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-emerald-400">
          <Database className="w-48 h-48" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Fitur Utama 2026
              </span>
              <span className="text-[10px] font-bold text-slate-400">7-Sheet Excel Master</span>
            </div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Download & Restore Database Lengkap (Excel)
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ekspor seluruh data aplikasi (Sekolah, Siswa, Pelatih, Jadwal, Presensi, Skor, & SPP) ke dalam satu file Excel multi-sheet, atau unggah kembali file Excel untuk memulihkan (restore) data secara instan.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0 relative z-10">
            <button
              onClick={() => exportFullDatabaseToExcel({ schools, students, coaches, schedules, attendance, scores, payments })}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-4 h-4" /> Download Full Excel (.xlsx)
            </button>
            {onOpenExcelBackupModal && (
              <button
                onClick={onOpenExcelBackupModal}
                className="px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Upload className="w-4 h-4" /> Restore Data dari Excel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-3 border-t border-slate-800/80 text-[11px] relative z-10">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Sekolah</span>
            <span className="font-bold text-emerald-400">{schools.length} Data</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Siswa</span>
            <span className="font-bold text-sky-400">{students.length} Data</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Pelatih</span>
            <span className="font-bold text-purple-400">{coaches.length} Data</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Jadwal</span>
            <span className="font-bold text-amber-400">{schedules.length} Data</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Presensi</span>
            <span className="font-bold text-slate-200">{attendance.length} Data</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Skor</span>
            <span className="font-bold text-rose-400">{scores.length} Data</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">SPP</span>
            <span className="font-bold text-emerald-400">{payments.length} Data</span>
          </div>
        </div>
      </div>

      {/* 4 Major Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Attendance Report */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Laporan Presensi Kehadiran Siswa Berdasarkan Sekolah</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Data yang terunduh mencakup: <strong className="text-emerald-300">Nama Siswa, Kelas, Hari Latihan, Tanggal Latihan, & Data Kehadiran</strong> ({exportAttendanceList.length} catatan).
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Pilih Sekolah Untuk Diunduh:
              </label>
              <select
                value={attendanceSchoolFilter}
                onChange={(e) => setAttendanceSchoolFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 font-bold"
              >
                <option value="ALL">🏢 Semua Sekolah ({attendance.length} Record)</option>
                {schools.map((sch) => {
                  const cnt = attendance.filter((a) => a.schoolId === sch.id).length;
                  return (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({cnt} Data Presensi)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportAttendanceToPdf(exportAttendanceList, students, selectedAttendanceSchoolName)}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => exportAttendanceToExcel(exportAttendanceList, students, selectedAttendanceSchoolName)}
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
