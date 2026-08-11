import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit, Search, Phone, Mail, Award, Target, Filter, ShieldAlert, Eye } from 'lucide-react';
import { Student, School, BowType, TargetDistance, ArcheryScoreRecord, StudentAttendance, SppPayment } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';

interface StudentManagementProps {
  students: Student[];
  schools: School[];
  scores?: ArcheryScoreRecord[];
  attendance?: StudentAttendance[];
  payments?: SppPayment[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  selectedSchoolId: string;
  onUpdatePaymentStatus?: (
    paymentId: string,
    status: 'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi',
    paidDate?: string,
    paymentMethod?: string
  ) => void;
  onAddPaymentBill?: (newPayment: SppPayment) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  schools,
  scores = [],
  attendance = [],
  payments = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  selectedSchoolId,
  onUpdatePaymentStatus,
  onAddPaymentBill,
}) => {
  const [filterBow, setFilterBow] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Form State
  const [schoolId, setSchoolId] = useState(schools[0]?.id || '');
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [bowType, setBowType] = useState<BowType>('Standard Bow');
  const [targetDistance, setTargetDistance] = useState<TargetDistance>('20m');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchSchool = selectedSchoolId === 'ALL' || s.schoolId === selectedSchoolId;
    const matchBow = filterBow === 'ALL' || s.bowType === filterBow;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.parentName.toLowerCase().includes(search.toLowerCase());
    return matchSchool && matchBow && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setSchoolId(selectedSchoolId !== 'ALL' ? selectedSchoolId : schools[0]?.id || '');
    setName('');
    setNis('');
    setClassGrade('');
    setGender('Laki-laki');
    setBowType('Standard Bow');
    setTargetDistance('20m');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setSchoolId(std.schoolId);
    setName(std.name);
    setNis(std.nis);
    setClassGrade(std.classGrade);
    setGender(std.gender);
    setBowType(std.bowType);
    setTargetDistance(std.targetDistance);
    setParentName(std.parentName);
    setParentPhone(std.parentPhone);
    setParentEmail(std.parentEmail);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sch = schools.find((s) => s.id === schoolId);
    const schoolName = sch ? sch.name : 'Sekolah Panahan';

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        schoolId,
        schoolName,
        name,
        nis,
        classGrade,
        gender,
        bowType,
        targetDistance,
        parentName,
        parentPhone,
        parentEmail,
      };
      onUpdateStudent(updated);
    } else {
      const newStd: Student = {
        id: `std-${Date.now()}`,
        schoolId,
        schoolName,
        name,
        nis: nis || `${Math.floor(100000 + Math.random() * 900000)}`,
        classGrade,
        gender,
        bowType,
        targetDistance,
        parentName,
        parentPhone,
        parentEmail,
        joinedDate: new Date().toISOString().substring(0, 10),
      };
      onAddStudent(newStd);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deletingStudentId) {
      onDeleteStudent(deletingStudentId);
      setDeletingStudentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Kelola Data Atlet Siswa Panahan
          </h2>
          <p className="text-xs text-slate-400">
            Daftar atlet siswa, kategori busur panah, target jarak latihan, dan kontak orang tua.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa, NIS, atau orang tua..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterBow}
            onChange={(e) => setFilterBow(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Jenis Busur</option>
            <option value="Standard Bow">Standard Bow</option>
            <option value="Recurve">Recurve</option>
            <option value="Barebow">Barebow</option>
            <option value="Compound">Compound</option>
            <option value="Horsebow">Horsebow</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Siswa / NIS</th>
                <th className="py-3.5 px-4">Sekolah & Kelas</th>
                <th className="py-3.5 px-4">Kategori Busur</th>
                <th className="py-3.5 px-4">Jarak Target</th>
                <th className="py-3.5 px-4">Orang Tua / Kontak</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {std.name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-100">{std.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">NIS: {std.nis} ({std.gender})</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-xs font-semibold text-slate-200">{std.schoolName}</p>
                      <p className="text-[11px] text-slate-400">Kelas: {std.classGrade}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 inline-block font-medium">
                        {std.bowType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] bg-emerald-950/60 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-800/40 inline-block font-semibold">
                        {std.targetDistance}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-xs font-bold text-slate-200">{std.parentName}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> {std.parentPhone}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedStudentForDetail(std)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-[10px] font-bold flex items-center gap-1 shadow"
                          title="Lihat Profil & Riwayat Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(std)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(std.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Panahan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pilih Sekolah
                </label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
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
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky Pratama"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    NIS / Nomor Induk
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="20241001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kelas / Grade
                  </label>
                  <input
                    type="text"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    placeholder="Contoh: XI IPA 2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jenis Busur
                  </label>
                  <select
                    value={bowType}
                    onChange={(e) => setBowType(e.target.value as BowType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Standard Bow">Standard Bow</option>
                    <option value="Recurve">Recurve</option>
                    <option value="Barebow">Barebow</option>
                    <option value="Compound">Compound</option>
                    <option value="Horsebow">Horsebow</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jarak Target
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

              <hr className="border-slate-800 my-2" />

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Contoh: Bapak Rahmat Hidayat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    No. WhatsApp Orang Tua
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="081299887766"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Email Orang Tua
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="orangtua@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
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
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudentId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Hapus Data Siswa</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa ini? Seluruh riwayat nilai dan absensi siswa akan ikut terhapus.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Student Profile Detail Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          school={schools.find((sch) => sch.id === selectedStudentForDetail.schoolId)}
          scores={scores}
          attendance={attendance}
          payments={payments}
          onClose={() => setSelectedStudentForDetail(null)}
          onEditStudent={(std) => {
            setSelectedStudentForDetail(null);
            handleOpenEditModal(std);
          }}
          onUpdatePaymentStatus={onUpdatePaymentStatus}
          onAddPaymentBill={onAddPaymentBill}
        />
      )}
    </div>
  );
};
