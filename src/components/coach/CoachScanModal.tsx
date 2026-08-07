import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, AlertCircle, Camera, RefreshCw, UserCheck } from 'lucide-react';
import { Student, StudentAttendance, Schedule } from '../../types';
import confetti from 'canvas-confetti';

interface CoachScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  schedules: Schedule[];
  onMarkAttendance: (record: StudentAttendance) => void;
}

export const CoachScanModal: React.FC<CoachScanModalProps> = ({
  isOpen,
  onClose,
  students,
  schedules,
  onMarkAttendance,
}) => {
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.id || '');
  const [isScanning, setIsScanning] = useState(true);

  if (!isOpen) return null;

  const handleSimulateScan = (student: Student) => {
    setScannedStudent(student);
    setIsScanning(false);

    // Fire celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const sch = schedules.find((s) => s.id === selectedScheduleId);
    const newRecord: StudentAttendance = {
      id: `att-${Date.now()}-${student.id}`,
      scheduleId: selectedScheduleId,
      studentId: student.id,
      studentName: student.name,
      schoolId: student.schoolId,
      schoolName: student.schoolName,
      date: new Date().toISOString().substring(0, 10),
      timeIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'Hadir',
      method: 'Scan QR',
      notes: 'Presensi otomatis via Scanner QR Kode Lapangan',
    };

    onMarkAttendance(newRecord);
  };

  const handleScanNext = () => {
    setScannedStudent(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Scanner Presensi Lapangan</h3>
              <p className="text-[11px] text-slate-300">Presensi Cepat Siswa Atlet Panahan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Pilih Sesi Latihan Aktif
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 font-bold"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.schoolName} ({s.timeSlot})
                </option>
              ))}
            </select>
          </div>

          {isScanning ? (
            <div className="space-y-4">
              {/* Simulated Camera Viewfinder */}
              <div className="relative w-full h-56 bg-slate-950 rounded-2xl border-2 border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                <div className="w-40 h-40 border-2 border-emerald-400 border-dashed rounded-xl flex items-center justify-center animate-pulse">
                  <QrCode className="w-20 h-20 text-emerald-400 opacity-60" />
                </div>
                <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Kamera Aktif (Ready)
                </div>
              </div>

              {/* Quick Select Buttons for Simulation */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Simulasi Scan Kartu QR Siswa:
                </p>
                <div className="space-y-2">
                  {students.map((std) => (
                    <button
                      key={std.id}
                      onClick={() => handleSimulateScan(std)}
                      className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left flex items-center justify-between text-xs transition-all"
                    >
                      <div>
                        <span className="font-bold text-white block">{std.name}</span>
                        <span className="text-[10px] text-slate-400">{std.schoolName} • {std.bowType}</span>
                      </div>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Success Scan Result View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Presensi Berhasil Terverifikasi!</h3>
                <p className="text-sm font-bold text-emerald-400">{scannedStudent?.name}</p>
                <p className="text-xs text-slate-400">
                  {scannedStudent?.schoolName} • {scannedStudent?.grade}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Waktu: {new Date().toLocaleTimeString('id-ID')} | Status: HADIR
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleScanNext}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
                >
                  <RefreshCw className="w-4 h-4" /> Scan Kartu Siswa Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
