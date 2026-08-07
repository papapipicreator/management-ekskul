import React, { useState } from 'react';
import { ClipboardCheck, QrCode, CheckCircle2, XCircle, Clock, AlertCircle, Plus, Download, FileSpreadsheet, Send, Search, Filter } from 'lucide-react';
import { StudentAttendance, Student, Schedule, School, SystemNotification } from '../../types';
import { exportAttendanceToPdf, exportAttendanceToExcel } from '../../utils/exportUtils';

interface AttendanceManagementProps {
  attendance: StudentAttendance[];
  students: Student[];
  schedules: Schedule[];
  schools: School[];
  onMarkAttendance: (record: StudentAttendance) => void;
  onSendNotification: (notif: SystemNotification) => void;
  selectedSchoolId: string;
  onOpenScanModal: () => void;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  attendance,
  students,
  schedules,
  schools,
  onMarkAttendance,
  onSendNotification,
  selectedSchoolId,
  onOpenScanModal,
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(schedules[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const activeSchedule = schedules.find((s) => s.id === selectedScheduleId);

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
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.schoolName} - {s.dayOfWeek} ({s.timeSlot})
              </option>
            ))}
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

      {/* Roster & Presensi Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Daftar Presensi Atlet Siswa ({filteredStudents.length} Siswa)
            </h3>
            <p className="text-[11px] text-slate-400">
              {activeSchedule?.schoolName} • {activeSchedule?.location} • Pelatih: {activeSchedule?.coachName}
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
            const isPresent = att?.status === 'Hadir';

            return (
              <div
                key={std.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={std.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={std.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{std.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {std.grade} • {std.bowType} ({std.targetDistance})
                    </p>
                    {att && (
                      <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                        Jam: {att.timeIn} ({att.method})
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickMark(std, 'Hadir')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      att?.status === 'Hadir'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-emerald-900/40'
                    }`}
                  >
                    Hadir
                  </button>
                  <button
                    onClick={() => handleQuickMark(std, 'Izin')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      att?.status === 'Izin'
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-amber-900/40'
                    }`}
                  >
                    Izin
                  </button>
                  <button
                    onClick={() => handleQuickMark(std, 'Sakit')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      att?.status === 'Sakit'
                        ? 'bg-sky-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-sky-900/40'
                    }`}
                  >
                    Sakit
                  </button>
                  <button
                    onClick={() => handleQuickMark(std, 'Alpha')}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      att?.status === 'Alpha'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-900/40'
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
