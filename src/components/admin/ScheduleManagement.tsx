import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Edit, Clock, MapPin, User, Target, Send, CheckCircle2 } from 'lucide-react';
import { Schedule, School, Coach, TargetDistance, SystemNotification } from '../../types';

interface ScheduleManagementProps {
  schedules: Schedule[];
  schools: School[];
  coaches: Coach[];
  onAddSchedule: (schedule: Schedule) => void;
  onUpdateSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onTriggerNotification: (notif: SystemNotification) => void;
  selectedSchoolId: string;
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  schedules,
  schools,
  coaches,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onTriggerNotification,
  selectedSchoolId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sentReminderId, setSentReminderId] = useState<string | null>(null);

  // Form State
  const [schoolId, setSchoolId] = useState(schools[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-10');
  const [timeStart, setTimeStart] = useState('15:30');
  const [timeEnd, setTimeEnd] = useState('17:30');
  const [location, setLocation] = useState('');
  const [coachId, setCoachId] = useState(coaches[0]?.id || '');
  const [targetFocus, setTargetFocus] = useState('Teknik Stance, Anchor Point & Release');
  const [targetDistance, setTargetDistance] = useState<TargetDistance>('20m');
  const [materiLatihan, setMateriLatihan] = useState('1. Pemanasan & Stretching\n2. Drill Form Anchor & Release 18m\n3. Simulasi Scoring 3 End (18 anak panah)');
  const [evaluasiLatihan, setEvaluasiLatihan] = useState('Para atlet sudah konsisten di grup kuning/merah. Rata-rata release makin stabil.');
  const [notes, setNotes] = useState('');

  const filteredSchedules = selectedSchoolId === 'ALL'
    ? schedules
    : schedules.filter((s) => s.schoolId === selectedSchoolId);

  const handleSchoolChange = (selectedSchId: string) => {
    setSchoolId(selectedSchId);
    const sch = schools.find((s) => s.id === selectedSchId);
    if (sch) {
      setLocation(sch.address || 'Lapangan Sekolah');
    }
    const assignedCoach = coaches.find((c) => c.assignedSchools.includes(selectedSchId));
    if (assignedCoach) {
      setCoachId(assignedCoach.id);
    } else if (sch?.headCoach) {
      const head = coaches.find((c) => c.name.toLowerCase().includes(sch.headCoach!.toLowerCase()) || sch.headCoach!.toLowerCase().includes(c.name.toLowerCase()));
      if (head) setCoachId(head.id);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    const targetSchId = selectedSchoolId !== 'ALL' ? selectedSchoolId : schools[0]?.id || '';
    setSchoolId(targetSchId);
    setTitle('Latihan Rutin Panahan');
    setDate('2026-08-15');
    setTimeStart('15:30');
    setTimeEnd('17:30');
    const sch = schools.find((s) => s.id === targetSchId);
    setLocation(sch ? sch.address : 'Lapangan Panahan Sekolah');
    const assignedCoach = coaches.find((c) => c.assignedSchools.includes(targetSchId));
    setCoachId(assignedCoach ? assignedCoach.id : (coaches[0]?.id || ''));
    setTargetFocus('Skoring & Grouping Anak Panah');
    setTargetDistance('20m');
    setMateriLatihan('1. Pemanasan & Stabilitas Bahu\n2. Drill Form Anchor & Release 18m\n3. Simulasi Skoring 6 End');
    setEvaluasiLatihan('');
    setNotes('Bawa pelindung dada dan finger tab.');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (schd: Schedule) => {
    setEditingSchedule(schd);
    setSchoolId(schd.schoolId);
    setTitle(schd.title || '');
    setDate(schd.date);
    setTimeStart(schd.timeStart || '');
    setTimeEnd(schd.timeEnd || '');
    setLocation(schd.location);
    setCoachId(schd.coachId);
    setTargetFocus(schd.targetFocus || '');
    setTargetDistance(schd.targetDistance || '20m');
    setMateriLatihan(schd.materiLatihan || schd.targetFocus || '');
    setEvaluasiLatihan(schd.evaluasiLatihan || '');
    setNotes(schd.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sch = schools.find((s) => s.id === schoolId);
    const coach = coaches.find((c) => c.id === coachId);

    if (editingSchedule) {
      const updated: Schedule = {
        ...editingSchedule,
        schoolId,
        schoolName: sch ? sch.name : 'Sekolah Panahan',
        title,
        date,
        timeStart,
        timeEnd,
        location: location || (sch ? sch.address : 'Lapangan Sekolah'),
        coachId,
        coachName: coach ? coach.name : 'Pelatih Utama',
        targetFocus,
        targetDistance,
        materiLatihan,
        evaluasiLatihan,
        notes,
      };
      onUpdateSchedule(updated);
    } else {
      const newSchd: Schedule = {
        id: `schd-${Date.now()}`,
        schoolId,
        schoolName: sch ? sch.name : 'Sekolah Panahan',
        title,
        date,
        timeStart,
        timeEnd,
        location: location || (sch ? sch.address : 'Lapangan Sekolah'),
        coachId,
        coachName: coach ? coach.name : 'Pelatih Utama',
        targetFocus,
        targetDistance,
        materiLatihan,
        evaluasiLatihan,
        notes,
      };
      onAddSchedule(newSchd);
    }
    setIsModalOpen(false);
  };

  const handleSendScheduleReminder = (schd: Schedule) => {
    const notif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Pengingat Latihan Panahan (${schd.schoolName})`,
      message: `Yth. Orang Tua. Mengingatkan jadwal latihan ${schd.title} pada ${schd.date} jam ${schd.timeStart} - ${schd.timeEnd} di ${schd.location}. Target: ${schd.targetDistance}. Coach: ${schd.coachName}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'schedule',
      targetSchoolId: schd.schoolId,
      read: false,
      channelSent: 'WhatsApp',
    };
    onTriggerNotification(notif);
    setSentReminderId(schd.id);
    setTimeout(() => setSentReminderId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Kelola Jadwal Latihan Panahan
          </h2>
          <p className="text-xs text-slate-400">
            Atur tanggal, lokasi, pelatih, target jarak, dan kirim pengingat otomatis ke WhatsApp orang tua.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Buat Jadwal Latihan
        </button>
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchedules.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            Belum ada jadwal latihan terdaftar untuk sekolah ini.
          </div>
        ) : (
          filteredSchedules.map((schd) => (
            <div
              key={schd.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Target Jarak: {schd.targetDistance}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight mt-1">{schd.title}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{schd.schoolName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-white">{schd.date}</strong> | {schd.timeStart} - {schd.timeEnd} WIB
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="line-clamp-1">{schd.location}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Pelatih: <strong className="text-white">{schd.coachName}</strong></span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Materi Utama: <em className="text-slate-200">{schd.targetFocus}</em></span>
                  </p>
                </div>

                {schd.materiLatihan && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      📋 Materi Latihan Pelatih:
                    </span>
                    <p className="text-[11px] text-slate-200 whitespace-pre-line leading-relaxed">
                      {schd.materiLatihan}
                    </p>
                  </div>
                )}

                {schd.evaluasiLatihan && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      📝 Evaluasi Sesi Latihan:
                    </span>
                    <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed italic">
                      "{schd.evaluasiLatihan}"
                    </p>
                  </div>
                )}

                {schd.notes && (
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 italic">
                    💡 "{schd.notes}"
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleSendScheduleReminder(schd)}
                  disabled={sentReminderId === schd.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    sentReminderId === schd.id
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {sentReminderId === schd.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pengingat Terkirim!
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Kirim Pengingat WA
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(schd)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Jadwal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(schd.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              {editingSchedule ? 'Edit Jadwal Latihan' : 'Buat Jadwal Latihan Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pilih Sekolah
                </label>
                <select
                  value={schoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Judul Sesi Latihan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Latihan Rutin & Simulasi Skoring 20m"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="text"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    placeholder="15:30"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="text"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    placeholder="17:30"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Pelatih Penanggung Jawab
                  </label>
                  <select
                    value={coachId}
                    onChange={(e) => setCoachId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Jarak
                  </label>
                  <select
                    value={targetDistance}
                    onChange={(e) => setTargetDistance(e.target.value as TargetDistance)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="5m">5 Meter</option>
                    <option value="7m">7 Meter</option>
                    <option value="10m">10 Meter</option>
                    <option value="15m">15 Meter</option>
                    <option value="18m">18 Meter</option>
                    <option value="20m">20 Meter</option>
                    <option value="30m">30 Meter</option>
                    <option value="50m">50 Meter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Lokasi Lapangan
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lapangan Olahraga Utama"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Materi Focus Latihan (Singkat)
                </label>
                <input
                  type="text"
                  value={targetFocus}
                  onChange={(e) => setTargetFocus(e.target.value)}
                  placeholder="Contoh: Form Release & Stance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400 block mb-1">
                  Rincian Materi Latihan Pelatih
                </label>
                <textarea
                  value={materiLatihan}
                  onChange={(e) => setMateriLatihan(e.target.value)}
                  rows={3}
                  placeholder="Isi rincian materi, misal:&#10;1. Pemanasan & Stretching&#10;2. Drill Anchor & Release 18m&#10;3. Simulasi Skoring 6 End"
                  className="w-full bg-slate-800 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1">
                  Evaluasi & Catatan Hasil Latihan Pelatih
                </label>
                <textarea
                  value={evaluasiLatihan}
                  onChange={(e) => setEvaluasiLatihan(e.target.value)}
                  rows={2}
                  placeholder="Ringkasan hasil/perkembangan siswa pada sesi ini..."
                  className="w-full bg-slate-800 border border-amber-500/30 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-amber-500 placeholder-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Catatan Tambahan untuk Siswa / Orang Tua
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Perlengkapan wajib, pakaian, dll..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Buat Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Hapus Jadwal Latihan</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal latihan ini?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteSchedule(deletingId);
                  setDeletingId(null);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
