import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Database,
  Info,
} from 'lucide-react';
import {
  School,
  Student,
  Coach,
  Schedule,
  StudentAttendance,
  ArcheryScoreRecord,
  SppPayment,
} from '../../types';
import {
  exportFullDatabaseToExcel,
  parseExcelBackupFile,
  ParsedBackupData,
} from '../../utils/excelBackupUtils';

interface ExcelDataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  students: Student[];
  coaches: Coach[];
  schedules: Schedule[];
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  onRestoreData: (
    restored: {
      schools?: School[];
      students?: Student[];
      coaches?: Coach[];
      schedules?: Schedule[];
      attendance?: StudentAttendance[];
      scores?: ArcheryScoreRecord[];
      payments?: SppPayment[];
    },
    mode: 'merge' | 'replace'
  ) => void;
}

export const ExcelDataBackupModal: React.FC<ExcelDataBackupModalProps> = ({
  isOpen,
  onClose,
  schools,
  students,
  coaches,
  schedules,
  attendance,
  scores,
  payments,
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedBackupData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportFullExcel = () => {
    exportFullDatabaseToExcel({
      schools,
      students,
      coaches,
      schedules,
      attendance,
      scores,
      payments,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsParsing(true);
    setErrorMessage('');
    setRestoreSuccess(false);

    try {
      const data = await parseExcelBackupFile(file);
      setParsedResult(data);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      setErrorMessage('Gagal membaca berkas Excel. Pastikan format berkas valid (.xlsx/.xls).');
      setParsedResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmRestore = () => {
    if (!parsedResult) return;

    onRestoreData(
      {
        schools: parsedResult.schools.length > 0 ? parsedResult.schools : undefined,
        students: parsedResult.students.length > 0 ? parsedResult.students : undefined,
        coaches: parsedResult.coaches.length > 0 ? parsedResult.coaches : undefined,
        schedules: parsedResult.schedules.length > 0 ? parsedResult.schedules : undefined,
        attendance: parsedResult.attendance.length > 0 ? parsedResult.attendance : undefined,
        scores: parsedResult.scores.length > 0 ? parsedResult.scores : undefined,
        payments: parsedResult.payments.length > 0 ? parsedResult.payments : undefined,
      },
      importMode
    );

    setRestoreSuccess(true);
    setTimeout(() => {
      setRestoreSuccess(false);
      onClose();
    }, 1800);
  };

  const totalRecordsParsed = parsedResult
    ? parsedResult.schools.length +
      parsedResult.students.length +
      parsedResult.coaches.length +
      parsedResult.schedules.length +
      parsedResult.attendance.length +
      parsedResult.scores.length +
      parsedResult.payments.length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Manajemen Data Excel (Backup & Restore)
              </h3>
              <p className="text-xs text-slate-400">
                Unduh database lengkap ke Excel atau unggah berkas Excel untuk memulihkan data.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Download className="w-4 h-4" /> Export / Unduh Excel Database
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-4 h-4" /> Import / Restore Data dari Excel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {restoreSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Restore Data Excel Berhasil!</h4>
                <p className="text-xs text-emerald-300">
                  Data telah diperbarui dan disinkronkan ke penyimpanan lokal serta Cloud Firestore DB.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" /> Ringkasan Total Data Siap Ekspor
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Multi-Sheet Workbook (.xlsx)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400">Mitra Sekolah</p>
                    <p className="text-sm font-black text-emerald-400">{schools.length}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400">Siswa Atlet</p>
                    <p className="text-sm font-black text-sky-400">{students.length}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400">Tim Pelatih</p>
                    <p className="text-sm font-black text-purple-400">{coaches.length}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400">Jadwal Sesi</p>
                    <p className="text-sm font-black text-amber-400">{schedules.length}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400">Presensi Sesi</p>
                    <p className="text-sm font-black text-slate-200">{attendance.length}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400">Rekam Skor</p>
                    <p className="text-sm font-black text-rose-400">{scores.length}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 col-span-2">
                    <p className="text-[10px] text-slate-400">Catatan SPP</p>
                    <p className="text-sm font-black text-emerald-400">{payments.length} Invoice</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed flex gap-3">
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p>
                  Berkas Excel yang dihasilkan berisi 7 lembar kerja (sheets) terpisah untuk setiap kategori data.
                  Anda dapat menggunakan berkas hasil unduhan ini sebagai cadangan (backup) resmi atau untuk diimpor kembali sewaktu-waktu.
                </p>
              </div>

              <button
                onClick={handleExportFullExcel}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-5 h-5" /> Unduh Database Lengkap Format Excel (.xlsx)
              </button>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* File Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-sky-500 bg-slate-950 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-3 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {selectedFileName ? selectedFileName : 'Klik untuk Pilih Berkas Excel / CSV'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mendukung format .xlsx, .xls, atau .csv (Maksimal 10 MB)
                  </p>
                </div>
              </div>

              {isParsing && (
                <div className="text-center py-4 space-y-2 text-sky-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Membaca dan Menganalisis Berkas Excel...</p>
                </div>
              )}

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMessage}
                </div>
              )}

              {parsedResult && !isParsing && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" /> Hasil Analisis Excel
                    </span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Total {totalRecordsParsed} Data Ditemukan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Sekolah</span>
                      <span className="font-bold text-white">{parsedResult.schools.length} record</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Siswa</span>
                      <span className="font-bold text-white">{parsedResult.students.length} record</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Pelatih</span>
                      <span className="font-bold text-white">{parsedResult.coaches.length} record</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Jadwal</span>
                      <span className="font-bold text-white">{parsedResult.schedules.length} record</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Presensi</span>
                      <span className="font-bold text-white">{parsedResult.attendance.length} record</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Skor</span>
                      <span className="font-bold text-white">{parsedResult.scores.length} record</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 col-span-2">
                      <span className="text-slate-400 block text-[10px]">SPP Payments</span>
                      <span className="font-bold text-white">{parsedResult.payments.length} record</span>
                    </div>
                  </div>

                  {/* Mode Restore Selector */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Metode Pemulihan Data (Restore):</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          importMode === 'merge'
                            ? 'bg-sky-600/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="font-bold">Gabungkan Data (Merge)</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Menambahkan data baru & memperbarui record yang ID-nya sama.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          importMode === 'replace'
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="font-bold text-rose-400">Timpa Semua (Replace)</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Mengganti total dataset aplikasi dengan isi berkas Excel ini.
                        </p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmRestore}
                    disabled={totalRecordsParsed === 0}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Konfirmasi Restore Data Kebadan Aplikasi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
