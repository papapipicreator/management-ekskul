import React, { useState } from 'react';
import { School as SchoolIcon, Plus, Trash2, Edit, MapPin, Phone, User, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { School, Student } from '../../types';

interface SchoolManagementProps {
  schools: School[];
  students: Student[];
  onAddSchool: (school: School) => void;
  onUpdateSchool: (school: School) => void;
  onDeleteSchool: (schoolId: string) => void;
}

export const SchoolManagement: React.FC<SchoolManagementProps> = ({
  schools,
  students,
  onAddSchool,
  onUpdateSchool,
  onDeleteSchool,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchoolId, setDeletingSchoolId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [headCoach, setHeadCoach] = useState('');
  const [phone, setPhone] = useState('');
  const [practiceDays, setPracticeDays] = useState<string[]>(['Senin', 'Kamis']);

  const handleOpenAddModal = () => {
    setEditingSchool(null);
    setName('');
    setCode('');
    setAddress('');
    setHeadCoach('');
    setPhone('');
    setPracticeDays(['Senin', 'Kamis']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch: School) => {
    setEditingSchool(sch);
    setName(sch.name);
    setCode(sch.code);
    setAddress(sch.address);
    setHeadCoach(sch.headCoach);
    setPhone(sch.phone);
    setPracticeDays(sch.practiceDays || ['Senin', 'Kamis']);
    setIsModalOpen(true);
  };

  const handleDayToggle = (day: string) => {
    if (practiceDays.includes(day)) {
      setPracticeDays(practiceDays.filter((d) => d !== day));
    } else {
      setPracticeDays([...practiceDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchool) {
      const updated: School = {
        ...editingSchool,
        name,
        code,
        address,
        headCoach,
        phone,
        practiceDays,
      };
      onUpdateSchool(updated);
    } else {
      const newSch: School = {
        id: `sch-${Date.now()}`,
        name,
        code: code || `SCH${Math.floor(Math.random() * 1000)}`,
        address,
        headCoach,
        phone,
        activeStudentsCount: 0,
        practiceDays,
      };
      onAddSchool(newSch);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deletingSchoolId) {
      onDeleteSchool(deletingSchoolId);
      setDeletingSchoolId(null);
    }
  };

  const ALL_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-emerald-400" />
            Kelola Data Sekolah Mitra Panahan
          </h2>
          <p className="text-xs text-slate-400">
            Tambah dan atur profil sekolah, lokasi lapangan panahan, serta pelatih penanggung jawab.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Sekolah Baru
        </button>
      </div>

      {/* Schools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schools.map((sch) => {
          const studentCount = students.filter((s) => s.schoolId === sch.id).length;
          return (
            <div
              key={sch.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <SchoolIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{sch.name}</h3>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {sch.code}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="line-clamp-1">{sch.address}</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Coach: <strong className="text-white">{sch.headCoach}</strong></span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{sch.phone}</span>
                  </p>
                </div>

                {/* Days Pill */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Jadwal:
                  </span>
                  {sch.practiceDays?.map((d) => (
                    <span key={d} className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium">
                  👥 <strong className="text-white">{studentCount}</strong> Siswa Terdaftar
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(sch)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Sekolah"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingSchoolId(sch.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hapus Sekolah"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit School Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SchoolIcon className="w-5 h-5 text-emerald-400" />
              {editingSchool ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SMAN 1 Merdeka Jakarta"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kode Singkatan
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: SMAN1JKT"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    No. Telepon / WA Sekolah
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alamat Lengkap / Lokasi Lapangan
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Pemuda No. 45..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pelatih Kepala (Coach in Charge)
                </label>
                <input
                  type="text"
                  value={headCoach}
                  onChange={(e) => setHeadCoach(e.target.value)}
                  placeholder="Contoh: Coach Hendra Wijaya, S.Pd"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Hari Rutin Latihan Ekstrakurikuler
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ALL_DAYS.map((day) => {
                    const isSelected = practiceDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
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
                  {editingSchool ? 'Simpan Perubahan' : 'Tambah Sekolah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSchoolId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Sekolah</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data sekolah ini dari sistem?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingSchoolId(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
