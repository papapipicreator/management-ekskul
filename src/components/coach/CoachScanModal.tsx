import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, CheckCircle2, AlertCircle, Camera, RefreshCw, UserCheck, Upload, SwitchCamera, Wifi } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
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
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'simulate'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  // Sync selected schedule when schedules prop updates
  useEffect(() => {
    if (schedules.length > 0 && !schedules.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules]);

  // Start / Stop Camera Scanner Lifecycle
  useEffect(() => {
    if (!isOpen || !isScanning || scanMode !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;
    const qrRegionId = 'html5-qrcode-reader';

    const startCamera = async () => {
      setCameraError(null);
      setIsCameraActive(false);

      try {
        // Ensure element exists in DOM
        const el = document.getElementById(qrRegionId);
        if (!el) return;

        if (!html5QrcodeRef.current) {
          html5QrcodeRef.current = new Html5Qrcode(qrRegionId);
        }

        const qrCode = html5QrcodeRef.current;
        if (qrCode.isScanning) {
          await qrCode.stop();
        }

        const config = { fps: 10, qrbox: { width: 220, height: 220 } };

        await qrCode.start(
          facingMode === 'environment' ? { facingMode: 'environment' } : { facingMode: 'user' },
          config,
          (decodedText) => {
            if (isMounted) {
              handleProcessQrText(decodedText);
            }
          },
          () => {
            // Ignore scan frame error
          }
        );

        if (isMounted) {
          setIsCameraActive(true);
        }
      } catch (err: any) {
        console.warn('Camera start error:', err);
        if (!isMounted) return;

        // Try fallback to user camera if environment camera failed
        if (facingMode === 'environment') {
          try {
            const qrCode = html5QrcodeRef.current;
            if (qrCode) {
              await qrCode.start(
                { facingMode: 'user' },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decodedText) => handleProcessQrText(decodedText),
                () => {}
              );
              setIsCameraActive(true);
              setFacingMode('user');
              return;
            }
          } catch (e2) {
            console.warn('Fallback camera failed:', e2);
          }
        }

        setCameraError(
          'Akses kamera smartphone belum diizinkan atau tidak ditemukan. Gunakan "Upload Foto QR" atau "Simulasi Scan".'
        );
        setIsCameraActive(false);
      }
    };

    // Small delay to ensure modal transition finished rendering DOM
    const timer = setTimeout(startCamera, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, isScanning, scanMode, facingMode]);

  const stopCamera = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        await html5QrcodeRef.current.clear();
      } catch (e) {
        // ignore stop error
      }
    }
    setIsCameraActive(false);
  };

  const handleProcessQrText = (decodedText: string) => {
    let foundStudent: Student | undefined;

    // 1. Try URL parse (?qrScanStudentId=... or ?studentId=... or ?nisn=...)
    if (decodedText.includes('qrScanStudentId=') || decodedText.includes('studentId=') || decodedText.includes('nisn=')) {
      try {
        const url = new URL(decodedText, window.location.origin);
        const stdId = url.searchParams.get('qrScanStudentId') || url.searchParams.get('studentId');
        const nisn = url.searchParams.get('nisn');

        if (stdId) {
          foundStudent = students.find((s) => s.id === stdId);
        }
        if (!foundStudent && nisn) {
          foundStudent = students.find((s) => s.nisn === nisn || s.id.includes(nisn));
        }
      } catch (e) {
        // invalid URL format, ignore
      }
    }

    // 2. Try JSON object string
    if (!foundStudent) {
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.studentId) {
          foundStudent = students.find((s) => s.id === parsed.studentId);
        }
        if (!foundStudent && parsed.nisn) {
          foundStudent = students.find((s) => s.nisn === parsed.nisn);
        }
      } catch (e) {
        // not JSON
      }
    }

    // 3. Raw Text match (STD-0089123456 or std-123 or NISN or Name)
    if (!foundStudent) {
      const clean = decodedText.trim();
      foundStudent = students.find(
        (s) =>
          s.id.toLowerCase() === clean.toLowerCase() ||
          s.nisn.toLowerCase() === clean.toLowerCase() ||
          `std-${s.nisn}`.toLowerCase() === clean.toLowerCase() ||
          clean.toLowerCase().includes(s.nisn.toLowerCase()) ||
          s.name.toLowerCase() === clean.toLowerCase()
      );
    }

    if (foundStudent) {
      handleSimulateScan(foundStudent);
    } else {
      alert(`⚠️ QR Code terbaca: "${decodedText}", namun ID/NISN siswa tidak ditemukan dalam database presensi.`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5Qrcode = new Html5Qrcode('html5-qrcode-file-helper');
      const decodedText = await html5Qrcode.scanFile(file, true);
      handleProcessQrText(decodedText);
    } catch (err) {
      alert('❌ Tidak dapat membaca kode QR dari foto. Pastikan gambar QR Code terlihat jelas dan memiliki pencahayaan cukup.');
    }
  };

  const handleSimulateScan = (student: Student) => {
    stopCamera();
    setScannedStudent(student);
    setIsScanning(false);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    const targetSchId = selectedScheduleId || schedules[0]?.id || '';
    const sch = schedules.find((s) => s.id === targetSchId);

    const newRecord: StudentAttendance = {
      id: `att-${Date.now()}-${student.id}`,
      scheduleId: targetSchId,
      studentId: student.id,
      studentName: student.name,
      schoolId: student.schoolId,
      schoolName: student.schoolName,
      date: new Date().toISOString().substring(0, 10),
      timeIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'Hadir',
      method: 'Scan QR',
      notes: `Presensi otomatis via Scanner QR Smartphone (${sch ? sch.schoolName : 'Sesi Latihan'})`,
    };

    onMarkAttendance(newRecord);
  };

  const handleScanNext = () => {
    setScannedStudent(null);
    setIsScanning(true);
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Hidden helper for file scan */}
      <div id="html5-qrcode-file-helper" className="hidden"></div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
        <div className="p-5 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Scanner Presensi Lapangan
              </h3>
              <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3 animate-pulse text-emerald-400" /> Terkoneksi ke Sistem Database
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Schedule Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Sesi Latihan Aktif Dituju:
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.schoolName} ({s.timeSlot || s.date}) • {s.coachName}
                </option>
              ))}
            </select>
          </div>

          {isScanning ? (
            <div className="space-y-4">
              {/* Scan Mode Tabs */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setScanMode('camera')}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    scanMode === 'camera'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Kamera HP
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('upload')}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    scanMode === 'upload'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Foto
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('simulate')}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                    scanMode === 'simulate'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Pilih Siswa
                </button>
              </div>

              {/* MODE 1: LIVE SMARTPHONE CAMERA SCANNER */}
              {scanMode === 'camera' && (
                <div className="space-y-3">
                  <div className="relative w-full min-h-[240px] bg-slate-950 rounded-2xl border-2 border-emerald-500/50 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                    {/* Html5Qrcode DOM Container */}
                    <div id="html5-qrcode-reader" className="w-full h-full min-h-[240px] object-cover"></div>

                    {!isCameraActive && !cameraError && (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
                        <Camera className="w-10 h-10 text-emerald-400 animate-bounce mb-2" />
                        <p className="text-xs font-bold text-slate-200">Menghubungkan Kamera Smartphone...</p>
                        <p className="text-[10px] text-slate-400 mt-1">Izinkan browser mengakses kamera smartphone Anda.</p>
                      </div>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-amber-400" />
                        <p className="text-xs font-bold text-amber-300 leading-snug">{cameraError}</p>
                        <button
                          onClick={() => setFacingMode((p) => (p === 'environment' ? 'user' : 'environment'))}
                          className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold border border-slate-700"
                        >
                          Coba Ganti Kamera HP
                        </button>
                      </div>
                    )}

                    {isCameraActive && (
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                        <span className="bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 backdrop-blur-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Kamera Terkoneksi
                        </span>
                        <button
                          type="button"
                          onClick={handleToggleFacingMode}
                          className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 text-white p-1.5 rounded-full border border-slate-700 backdrop-blur-sm flex items-center gap-1 text-[10px] px-2 font-bold"
                          title="Ganti Kamera Depan/Belakang"
                        >
                          <SwitchCamera className="w-3.5 h-3.5" /> Flip Kamera
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    Arahkan kamera HP ke Kartu QR Siswa atau Layar HP Siswa. Sistem akan mencatat presensi secara otomatis.
                  </p>
                </div>
              )}

              {/* MODE 2: UPLOAD QR PHOTO */}
              {scanMode === 'upload' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-emerald-500/40 rounded-2xl p-6 bg-slate-950/60 text-center space-y-3">
                    <QrCode className="w-12 h-12 text-emerald-400 mx-auto" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Upload Foto / Screenshot Kode QR Siswa</h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Pilih foto QR Code dari galeri smartphone Anda untuk diproses oleh sistem.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all">
                      <Upload className="w-4 h-4" /> Pilih Foto QR dari Galeri
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* MODE 3: QUICK SIMULATE SELECT */}
              {scanMode === 'simulate' && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Klik Nama Siswa Atlet Untuk Presensi Cepat:
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {students.map((std) => (
                      <button
                        key={std.id}
                        onClick={() => handleSimulateScan(std)}
                        className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left flex items-center justify-between text-xs transition-all"
                      >
                        <div>
                          <span className="font-bold text-white block">{std.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {std.schoolName} • NISN: {std.nisn || '-'}
                          </span>
                        </div>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SUCCESS ATTENDANCE RECORDED VIEW */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded-full border border-emerald-500/30">
                  ⚡ Terkoneksi & Tercatat Di Sistem
                </span>
                <h3 className="text-base font-bold text-white pt-1">Presensi QR Berhasil Terdaftar!</h3>
                <p className="text-base font-black text-emerald-400">{scannedStudent?.name}</p>
                <p className="text-xs text-slate-300">
                  {scannedStudent?.schoolName} • Kelas: {scannedStudent?.grade || '-'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono pt-1">
                  Jam Masuk: {new Date().toLocaleTimeString('id-ID')} | Status: HADIR
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleScanNext}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Scan QR Siswa Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
