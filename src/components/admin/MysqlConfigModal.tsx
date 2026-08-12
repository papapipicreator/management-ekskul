import React, { useState, useEffect } from 'react';
import { Database, Server, Download, CheckCircle2, AlertCircle, RefreshCw, Globe, Key, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { MysqlService } from '../../services/mysqlService';
import { School, Coach, Student, Schedule, StudentAttendance, CoachAttendance, ArcheryScoreRecord, SppPayment, SystemNotification, BankAccountConfig } from '../../types';

interface MysqlConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  allData: {
    schools: School[];
    coaches: Coach[];
    students: Student[];
    schedules: Schedule[];
    studentAttendance: StudentAttendance[];
    coachAttendance: CoachAttendance[];
    scores: ArcheryScoreRecord[];
    payments: SppPayment[];
    notifications: SystemNotification[];
    users: any[];
    bankConfig?: BankAccountConfig;
    adminCredentials?: any;
  };
}

export const MysqlConfigModal: React.FC<MysqlConfigModalProps> = ({
  isOpen,
  onClose,
  allData,
}) => {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [activeEngine, setActiveEngine] = useState<'mysql' | 'firebase' | 'local'>('mysql');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; database?: string } | null>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiUrl(MysqlService.getApiUrl());
      setActiveEngine(MysqlService.getStorageEngine());
      setTestResult(null);
      setMigrationStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiUrl = () => {
    MysqlService.setApiUrl(apiUrl);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    MysqlService.setApiUrl(apiUrl);
    const res = await MysqlService.testConnection(apiUrl);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleMigrateData = async () => {
    setIsMigrating(true);
    setMigrationStatus('Sedang mengirimkan seluruh data koleksi ke MySQL Shared Hosting...');
    MysqlService.setApiUrl(apiUrl);

    const res = await MysqlService.migrateAllToMysql(allData);
    if (res.success) {
      setMigrationStatus('✅ Berhasil! Seluruh data lokal & cloud telah disinkronkan ke database MySQL Shared Hosting.');
    } else {
      setMigrationStatus(`❌ Gagal: ${res.message}`);
    }
    setIsMigrating(false);
  };

  const handleSelectEngine = (engine: 'mysql' | 'firebase' | 'local') => {
    setActiveEngine(engine);
    MysqlService.setStorageEngine(engine);
  };

  const downloadFile = (filename: string, path: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Migrasi & Pengaturan Database MySQL Shared Hosting
              </h2>
              <p className="text-xs text-slate-400">Hubungkan aplikasi dengan cPanel / MySQL Server Shared Hosting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Storage Engine Switcher */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">Pilih Mode Database Aktif Utama:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectEngine('mysql')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  activeEngine === 'mysql'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs">MySQL Hosting</div>
                  <div className="text-[10px] opacity-70">Custom cPanel / PHP API</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectEngine('firebase')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  activeEngine === 'firebase'
                    ? 'bg-amber-600/20 border-amber-500 text-white font-bold ring-1 ring-amber-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs">Firebase Cloud</div>
                  <div className="text-[10px] opacity-70">Google Firestore Realtime</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectEngine('local')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                  activeEngine === 'local'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs">Local Browser</div>
                  <div className="text-[10px] opacity-70">Offline LocalStorage</div>
                </div>
              </button>
            </div>
          </div>

          {/* Endpoint Configuration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Endpoint URL REST API MySQL (Shared Hosting)
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Masukkan URL ke file <code className="text-amber-300 font-mono">api.php</code> yang telah Anda upload di domain shared hosting Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => {
                  setApiUrl(e.target.value);
                  handleSaveApiUrl();
                }}
                placeholder="https://namadomainku.com/api.php"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !apiUrl}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shrink-0"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Tes Koneksi
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Download Resources */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" /> Unduh Berkas Siap Pakai untuk Shared Hosting
            </h3>
            <p className="text-[11px] text-slate-400">
              Unduh dua berkas di bawah ini untuk dipasang pada cPanel / Shared Hosting Anda:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => downloadFile('api.php', '/api.php')}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs font-semibold text-white flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div>
                    <div>1. File Backend Script (api.php)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Upload ke folder public_html</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                type="button"
                onClick={() => downloadFile('database_schema.sql', '/database_schema.sql')}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-xs font-semibold text-white flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div>2. Schema SQL (database_schema.sql)</div>
                    <div className="text-[10px] text-slate-400 font-normal">Import di phpMyAdmin</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Data Synchronization */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400" /> Sinkronkan & Migrasikan Data ke MySQL
            </h3>
            <p className="text-[11px] text-slate-400">
              Kirimkan seluruh data aktif saat ini (Sekolah, Siswa, Pelatih, Presensi, Nilai, SPP, Pengumuman, Akun) ke database MySQL Shared Hosting Anda.
            </p>

            <button
              type="button"
              onClick={handleMigrateData}
              disabled={isMigrating || !apiUrl}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isMigrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
              Migrasikan Seluruh Data ke MySQL Shared Hosting Sekarang
            </button>

            {migrationStatus && (
              <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono">
                {migrationStatus}
              </p>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-xl space-y-2 text-xs text-blue-200 leading-relaxed">
            <div className="font-bold text-blue-300 flex items-center gap-2">
              📌 Panduan Langkah Pemasangan di cPanel / Shared Hosting:
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
              <li>
                Buka cPanel Shared Hosting Anda (Hostinger, Niagahoster, Rumahweb, Dll) & buat database MySQL baru di menu <strong>MySQL Databases</strong> (misal: <code className="text-amber-300 font-mono">db_panahan</code>).
              </li>
              <li>
                Buka <strong>phpMyAdmin</strong>, pilih database tersebut, lalu klik <strong>Import</strong> dan upload file <code className="text-amber-300 font-mono">database_schema.sql</code>.
              </li>
              <li>
                Upload file <code className="text-amber-300 font-mono">api.php</code> ke folder <code className="text-amber-300 font-mono">public_html</code> domain Anda. Edit variabel <code className="text-amber-300 font-mono">$db_name, $db_user, $db_pass</code> di bagian atas file <code className="text-amber-300 font-mono">api.php</code>.
              </li>
              <li>
                Masukkan URL API tersebut pada kolom di atas (misal: <code className="text-amber-300 font-mono">https://domainku.com/api.php</code>), klik <strong>Tes Koneksi</strong>, lalu klik <strong>Migrasikan Data</strong>.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
