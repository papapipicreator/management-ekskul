import React, { useState } from 'react';
import { ClipboardCheck, QrCode, CheckCircle2, XCircle, Clock, AlertCircle, Plus, Download, FileSpreadsheet, Send, Search, Filter, BookOpen, Save, BookMarked, User } from 'lucide-react';
import { StudentAttendance, Student, Schedule, School, SystemNotification, Coach } from '../../types';
import { exportAttendanceToPdf, exportAttendanceToExcel } from '../../utils/exportUtils';

interface AttendanceManagementProps {
  attendance: StudentAttendance[];
  students: Student[];
  schedules: Schedule[];
  schools: School[];
  coaches?: Coach[];
  onMarkAttendance: (record: StudentAttendance) => void;
  onSendNotification: (notif: SystemNotification) => void;
  onUpdateSchedule?: (schedule: Schedule) => void;
  selectedSchoolId: string;
  onOpenScanModal: () => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  attendance,
  students,
  schedules,
  schools,
  coaches = [],
  onMarkAttendance,
  onSendNotification,
  onUpdateSchedule,
  selectedSchoolId,
  onOpenScanModal,
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(schedules[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [downloadSchoolId, setDownloadSchoolId] = useState<string>(selectedSchoolId || 'ALL');

  const [materiInput, setMateriInput] = useState<string>('');
  const [evaluasiInput, setEvaluasiInput] = useState<string>('');
  const [coachNameInput, setCoachNameInput] = useState<string>('');
  const [coachIdInput, setCoachIdInput] = useState<string>('');
  const [isMateriSaved, setIsMateriSaved] = useState<boolean>(false);

  const handleDownloadSchoolAttendance = (type: 'excel' | 'pdf') => {
    const targetSchool = schools.find((s) => s.id === downloadSchoolId);
    const schoolName = downloadSchoolId === 'ALL' ? 'Semua Sekolah' : (targetSchool?.name || 'Sekolah Panahan');
    const recordsToExport = downloadSchoolId === 'ALL'
      ? attendance
      : attendance.filter((a) => a.schoolId === downloadSchoolId);

    if (type === 'excel') {
      exportAttendanceToExcel(recordsToExport, students, schoolName);
    } else {
      exportAttendanceToPdf(recordsToExport, students, schoolName);
    }
  };

  React.useEffect(() => {
    if (schedules.length > 0 && !schedules.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  const activeSchedule = schedules.find((s) => s.id === selectedScheduleId) || schedules[0];

  React.useEffect(() => {
    if (activeSchedule) {
      const assignedCoaches = coaches.filter((c) => c.assignedSchools.includes(activeSchedule.schoolId));
      const schObj = schools.find((s) => s.id === activeSchedule.schoolId);

      // Find matching coach: prioritize coach assigned to this school
      let matchedCoach = assignedCoaches.find((c) => c.id === activeSchedule.coachId || c.name.toLowerCase() === activeSchedule.coachName?.toLowerCase());
      if (!matchedCoach && assignedCoaches.length > 0) {
        matchedCoach = assignedCoaches[0];
      }
      if (!matchedCoach && activeSchedule.coachId) {
        matchedCoach = coaches.find((c) => c.id === activeSchedule.coachId);
      }
      if (!matchedCoach && activeSchedule.coachName) {
        matchedCoach = coaches.find((c) => c.name.toLowerCase() === activeSchedule.coachName.toLowerCase());
      }
      if (!matchedCoach && schObj?.headCoach) {
        matchedCoach = coaches.find((c) => schObj.headCoach?.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(schObj.headCoach?.toLowerCase()));
      }

      setMateriInput(activeSchedule.materiLatihan || activeSchedule.targetFocus || '');
      setEvaluasiInput(activeSchedule.evaluasiLatihan || '');
      setCoachIdInput(matchedCoach ? matchedCoach.id : (activeSchedule.coachId || 'custom'));
      setCoachNameInput(matchedCoach ? matchedCoach.name : (activeSchedule.coachName || schObj?.headCoach || 'Pelatih Kepala'));
      setIsMateriSaved(false);
    }
  }, [activeSchedule?.id, activeSchedule?.schoolId, coaches]);

  const handleSaveMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchedule) return;

    const selectedCoachObj = coaches.find((c) => c.id === coachIdInput);
    const finalCoachName = selectedCoachObj ? selectedCoachObj.name : (coachNameInput || activeSchedule.coachName);
    const finalCoachId = selectedCoachObj ? selectedCoachObj.id : (coachIdInput !== 'custom' ? coachIdInput : activeSchedule.coachId);

    const updatedSchd: Schedule = {
      ...activeSchedule,
      coachId: finalCoachId,
      coachName: finalCoachName,
      materiLatihan: materiInput,
      evaluasiLatihan: evaluasiInput,
    };

    onUpdateSchedule?.(updatedSchd);
    setIsMateriSaved(true);
    setTimeout(() => setIsMateriSaved(false), 3500);
  };

  // Available students for this schedule's school
  const targetSchoolId = activeSchedule ? activeSchedule.schoolId : selectedSchoolId;
  const filteredStudents = targetSchoolId === 'ALL'
    ? students
    : students.filter((s) => s.schoolId === targetSchoolId);

  // Search & Filter Attendance Records
  const displayAttendance = attendance.filter((a) => {
    const matchSchool = selectedSchoolId === 'ALL' || a.schoolId === selectedSchoolId;
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchSearch = a.studentName.toLowerCase().includes(search.toLowerCase());
    return matchSchool && matchStatus && matchSearch;
  });

  const handleQuickMark = (student: Student, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => {
    const newRecord: StudentAttendance = {
      id: `att-${Date.now()}-${student.id}`,
      scheduleId: selectedScheduleId,
      studentId: student.id,
      studentName: student.name,
      schoolId: student.schoolId,
      schoolName: student.schoolName,
      date,
      timeIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status,
      method: 'Manual Pelatih',
    };

    onMarkAttendance(newRecord);

    // Auto-send notification to parent if absent / izin
    if (status !== 'Hadir') {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: `Informasi Kehadiran Panahan - ${student.name}`,
        message: `Status presensi latihan panahan Ananda ${student.name} pada ${date} dicatat sebagai ${status.toUpperCase()}.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'attendance',
        targetSchoolId: student.schoolId,
        read: false,
        channelSent: 'WhatsApp',
      };
      onSendNotification(notif);
    }
  };

  const getAttendanceForStudent = (studentId: string) => {
    return attendance.find((a) => a.studentId === studentId && a.date === date);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            Presensi Kehadiran & Sesi Latihan
          </h2>
          <p className="text-xs text-slate-400">
            Pencatatan presensi realtime via QR Code scanner atau input manual pelatih dengan Notifikasi WhatsApp Orang Tua.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <QrCode className="w-4 h-4" /> Buka Camera QR Scanner
          </button>
          <button
            onClick={() => exportAttendanceToPdf(displayAttendance, students)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium"
            title="Export PDF"
          >
            <Download className="w-4 h-4 text-rose-400" />
          </button>
          <button
            onClick={() => exportAttendanceToExcel(displayAttendance, students)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Download Presensi Kehadiran Siswa Per Sekolah Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Download className="w-4 h-4" /> Download Data Presensi Kehadiran Siswa Per Sekolah
          </h3>
          <p className="text-[11px] text-slate-300">
            Mencakup data: <strong className="text-white">Nama Siswa, Kelas, Hari Latihan, Tanggal Latihan, & Data Kehadiran</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={downloadSchoolId}
            onChange={(e) => setDownloadSchoolId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">🏢 Semua Sekolah ({attendance.length} Record)</option>
            {schools.map((sch) => {
              const count = attendance.filter((a) => a.schoolId === sch.id).length;
              return (
                <option key={sch.id} value={sch.id}>
                  {sch.name} ({count} Data)
                </option>
              );
            })}
          </select>

          <button
            onClick={() => handleDownloadSchoolAttendance('excel')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
          </button>
          <button
            onClick={() => handleDownloadSchoolAttendance('pdf')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF (.pdf)
          </button>
        </div>
      </div>

      {/* Schedule & Date Picker Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Pilih Jadwal Sesi Latihan
          </label>
          <select
            value={selectedScheduleId}
            onChange={(e) => setSelectedScheduleId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            {schedules.map((s) => {
              const assigned = coaches.filter((c) => c.assignedSchools.includes(s.schoolId));
              const displayCoachName = assigned.length > 0 ? assigned[0].name : (s.coachName || 'Pelatih');
              return (
                <option key={s.id} value={s.id}>
                  {s.schoolName} - {s.dayOfWeek} ({s.timeSlot}) • Coach: {displayCoachName}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Tanggal Presensi
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Cari Nama Siswa
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik nama siswa..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Form Jurnal & Materi Latihan Pelatih */}
      {activeSchedule && (() => {
        const schoolCoaches = coaches.filter((c) => c.assignedSchools.includes(activeSchedule.schoolId));
        const otherCoaches = coaches.filter((c) => !c.assignedSchools.includes(activeSchedule.schoolId));

        return (
          <form onSubmit={handleSaveMateri} className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-md animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Form Isian Materi Latihan Pelatih
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sekolah: <strong className="text-emerald-400">{activeSchedule.schoolName}</strong> ({activeSchedule.date || date}) • Coach: <strong className="text-emerald-300 font-bold">{coachNameInput || activeSchedule.coachName}</strong>
                </p>
              </div>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isMateriSaved
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                }`}
              >
                {isMateriSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Materi & Pelatih Disimpan!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Materi Latihan
                  </>
                )}
              </button>
            </div>

            {/* Coach Selection per School */}
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <label className="text-xs font-bold text-white block">
                    Pelatih Mengajar (Coach):
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Pilih nama pelatih yang bertugas mengajar di <span className="text-emerald-400 font-semibold">{activeSchedule.schoolName}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 min-w-[280px]">
                <select
                  value={coachIdInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCoachIdInput(val);
                    const found = coaches.find((c) => c.id === val);
                    if (found) {
                      setCoachNameInput(found.name);
                    }
                  }}
                  className="w-full bg-slate-900 border border-emerald-500/40 text-xs text-white rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  {schoolCoaches.length > 0 && (
                    <optgroup label={`Pelatih Khusus ${activeSchedule.schoolName}`}>
                      {schoolCoaches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.roleTitle ? `(${c.roleTitle})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {otherCoaches.length > 0 && (
                    <optgroup label="Daftar Pelatih Lainnya">
                      {otherCoaches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <option value="custom">✏️ Ketik Nama Pelatih Manual</option>
                </select>

                {coachIdInput === 'custom' && (
                  <input
                    type="text"
                    value={coachNameInput}
                    onChange={(e) => setCoachNameInput(e.target.value)}
                    placeholder="Contoh: Coach Hendra, S.Pd"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-semibold"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-emerald-300 block mb-1">
                  Rincian Materi Latihan yang Diberikan:
                </label>
                <textarea
                  value={materiInput}
                  onChange={(e) => setMateriInput(e.target.value)}
                  rows={3}
                  placeholder="Contoh:&#10;1. Pemanasan & Stretching bahu (15 mnt)&#10;2. Drill teknik Anchor & Release jarak 18 meter&#10;3. Skoring 3 End (18 anak panah)"
                  className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-300 block mb-1">
                  Evaluasi / Catatan Hasil Latihan Pelatih:
                </label>
                <textarea
                  value={evaluasiInput}
                  onChange={(e) => setEvaluasiInput(e.target.value)}
                  rows={3}
                  placeholder="Contoh:&#10;Para atlet pemula sudah menguasai stance, namun perlu latihan ekstra untuk konsistensi drawing hand..."
                  className="w-full bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          </form>
        );
      })()}

      {/* Roster & Presensi Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Daftar Presensi Atlet Siswa ({filteredStudents.length} Siswa)
            </h3>
            <p className="text-[11px] text-slate-400">
              {activeSchedule?.schoolName} • {activeSchedule?.location} • Pelatih: <strong className="text-emerald-300 font-semibold">{coachNameInput || activeSchedule?.coachName}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1"
            >
              <option value="ALL">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Alpha">Alpha</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredStudents.map((std) => {
            const att = getAttendanceForStudent(std.id);

            return (
              <div
                key={std.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all shadow-sm"
              >
                {/* Student Info Header (Nama diatas) */}
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={std.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={std.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white leading-tight break-words">{std.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {std.grade} • {std.bowType} ({std.targetDistance})
                    </p>
                    {att && (
                      <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                        Jam: {att.timeIn} ({att.method})
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons (Hadir, Izin, Sakit, Alpha dibawah) */}
                <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-800/80 w-full">
                  <button
                    onClick={() => handleQuickMark(std, 'Hadir')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                      att?.status === 'Hadir'
                        ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-emerald-900/40'
                    }`}
                  >
                    Hadir
                  </button>
                  <button
                    onClick={() => handleQuickMark(std, 'Izin')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                      att?.status === 'Izin'
                        ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-amber-900/40'
                    }`}
                  >
                    Izin
                  </button>
                  <button
                    onClick={() => handleQuickMark(std, 'Sakit')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                      att?.status === 'Sakit'
                        ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-sky-900/40'
                    }`}
                  >
                    Sakit
                  </button>
                  <button
                    onClick={() => handleQuickMark(std, 'Alpha')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                      att?.status === 'Alpha'
                        ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-rose-900/40'
                    }`}
                  >
                    Alpha
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
