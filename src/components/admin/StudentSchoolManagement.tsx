import React, { useState } from 'react';
import { School as SchoolIcon, Users, UserPlus, Plus, Search, Edit3, Trash2, QrCode, Phone, MapPin, Award, Calendar, Clock, Target, UserCheck, Coins, Eye } from 'lucide-react';
import { Student, School, Coach, Schedule, BowType, TargetDistance, ArcheryScoreRecord, StudentAttendance, SppPayment } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';

interface StudentSchoolManagementProps {
  students: Student[];
  schools: School[];
  coaches: Coach[];
  schedules?: Schedule[];
  scores?: ArcheryScoreRecord[];
  attendance?: StudentAttendance[];
  payments?: SppPayment[];
  onAddStudent: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onAddSchool: (school: School) => void;
  onEditSchool?: (school: School) => void;
  onDeleteSchool?: (schoolId: string) => void;
  onAddSchedule?: (schedule: Schedule) => void;
  onAddCoach?: (coach: Coach) => void;
  onEditCoach?: (coach: Coach) => void;
  onDeleteCoach?: (coachId: string) => void;
  selectedSchoolId: string;
}

export const StudentSchoolManagement: React.FC<StudentSchoolManagementProps> = ({
  students,
  schools,
  coaches,
  schedules = [],
  scores = [],
  attendance = [],
  payments = [],
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onAddSchool,
  onEditSchool,
  onDeleteSchool,
  onAddSchedule,
  onAddCoach,
  onEditCoach,
  onDeleteCoach,
  selectedSchoolId,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'schools' | 'coaches'>('students');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Coach Management State
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [coachName, setCoachName] = useState('');
  const [coachLicense, setCoachLicense] = useState('');
  const [coachRoleTitle, setCoachRoleTitle] = useState('');
  const [coachPhone, setCoachPhone] = useState('');
  const [coachAssignedSchools, setCoachAssignedSchools] = useState<string[]>([]);
  const [coachAvatarUrl, setCoachAvatarUrl] = useState('');
  const [coachSearch, setCoachSearch] = useState('');

  // Student Form State & Handlers
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newSchoolId, setNewSchoolId] = useState(schools[0]?.id || '');
  const [newGrade, setNewGrade] = useState('Kelas 5');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('081234567890');
  const [newBowType, setNewBowType] = useState<BowType>('Standard Bow');
  const [newDistance, setNewDistance] = useState<TargetDistance>('10m');
  const [newStatus, setNewStatus] = useState<'Aktif' | 'Cuti' | 'Alumni'>('Aktif');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const resetStudentForm = () => {
    setEditingStudent(null);
    setNewStudentName('');
    setNewNisn('');
    setNewSchoolId(schools[0]?.id || '');
    setNewGrade('Kelas 5');
    setNewParentName('');
    setNewParentPhone('081234567890');
    setNewBowType('Standard Bow');
    setNewDistance('10m');
    setNewStatus('Aktif');
    setNewAvatarUrl('');
  };

  const handleOpenAddStudent = () => {
    resetStudentForm();
    setShowAddStudentModal(true);
  };

  const handleOpenEditStudent = (std: Student) => {
    setEditingStudent(std);
    setNewStudentName(std.name);
    setNewNisn(std.nisn);
    setNewSchoolId(std.schoolId);
    setNewGrade(std.grade);
    setNewParentName(std.parentName);
    setNewParentPhone(std.parentPhone);
    setNewBowType(std.bowType);
    setNewDistance(std.targetDistance);
    setNewStatus(std.status);
    setNewAvatarUrl(std.avatarUrl || '');
    setShowAddStudentModal(true);
  };

  const handleDeleteStudentConfirm = (std: Student) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus profile siswa atlet ${std.name} (${std.nisn})?`)) {
      onDeleteStudent?.(std.id);
    }
  };

  // School Form State & Handlers
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('081234567890');
  const [financialModel, setFinancialModel] = useState<'monthly_fee' | 'coach_honor'>('monthly_fee');
  const [newMonthlyFee, setNewMonthlyFee] = useState<number>(150000);
  const [newCoachHonor, setNewCoachHonor] = useState<number>(100000);

  // New School Training Session Schedule Form State
  const [newDayOfWeek, setNewDayOfWeek] = useState('Rabu & Sabtu');
  const [newTimeSlot, setNewTimeSlot] = useState('15:30 - 17:00 WIB');
  const [newLocation, setNewLocation] = useState('Lapangan Archery Sekolah');
  const [newCoachId, setNewCoachId] = useState(coaches[0]?.id || '');
  const [newTargetCount, setNewTargetCount] = useState(6);

  const resetSchoolForm = () => {
    setEditingSchool(null);
    setNewSchoolName('');
    setNewSchoolCode('');
    setNewAddress('');
    setNewContactPerson('');
    setNewPhone('081234567890');
    setFinancialModel('monthly_fee');
    setNewMonthlyFee(150000);
    setNewCoachHonor(100000);
    setNewDayOfWeek('Rabu & Sabtu');
    setNewTimeSlot('15:30 - 17:00 WIB');
    setNewLocation('Lapangan Archery Sekolah');
    setNewCoachId(coaches[0]?.id || '');
    setNewTargetCount(6);
  };

  const handleOpenAddSchool = () => {
    resetSchoolForm();
    setShowAddSchoolModal(true);
  };

  const handleOpenEditSchool = (sch: School) => {
    setEditingSchool(sch);
    setNewSchoolName(sch.name);
    setNewSchoolCode(sch.code);
    setNewAddress(sch.address);
    setNewContactPerson(sch.contactPerson);
    setNewPhone(sch.phone);

    const mode = sch.financialModel || ((sch.coachHonorPerSession ?? 0) > 0 && (sch.monthlyFeePerStudent ?? 0) === 0 ? 'coach_honor' : 'monthly_fee');
    setFinancialModel(mode);
    setNewMonthlyFee(sch.monthlyFeePerStudent || 150000);
    setNewCoachHonor(sch.coachHonorPerSession || 100000);
    setShowAddSchoolModal(true);
  };

  const handleDeleteSchoolConfirm = (sch: School) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus sekolah mitra "${sch.name}"? Semua jadwal sesi latihan yang terhubung dengan sekolah ini juga akan otomatis terhapus.`)) {
      onDeleteSchool?.(sch.id);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchSchool = selectedSchoolId === 'ALL' || s.schoolId === selectedSchoolId;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search);
    return matchSchool && matchSearch;
  });

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    const sch = schools.find((s) => s.id === newSchoolId) || schools[0];
    const generatedNisn = newNisn || `0089${Math.floor(100000 + Math.random() * 900000)}`;
    const avatarToUse = newAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: newStudentName,
        nisn: generatedNisn,
        schoolId: sch.id,
        schoolName: sch.name,
        grade: newGrade,
        parentName: newParentName || 'Orang Tua Siswa',
        parentPhone: newParentPhone,
        bowType: newBowType,
        targetDistance: newDistance,
        status: newStatus,
        avatarUrl: avatarToUse,
        qrCodeUrl: editingStudent.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STD-${generatedNisn}`,
      };
      onEditStudent?.(updated);
    } else {
      const created: Student = {
        id: `std-${Date.now()}`,
        name: newStudentName,
        nisn: generatedNisn,
        schoolId: sch.id,
        schoolName: sch.name,
        grade: newGrade,
        parentName: newParentName || 'Orang Tua Siswa',
        parentPhone: newParentPhone,
        bowType: newBowType,
        targetDistance: newDistance,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STD-${generatedNisn}`,
        joinDate: new Date().toISOString().substring(0, 10),
        status: newStatus || 'Aktif',
        avatarUrl: avatarToUse,
      };
      onAddStudent(created);
    }

    setShowAddStudentModal(false);
    resetStudentForm();
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName) return;

    if (editingSchool) {
      const updatedSchool: School = {
        ...editingSchool,
        name: newSchoolName,
        code: newSchoolCode || editingSchool.code,
        address: newAddress || editingSchool.address,
        contactPerson: newContactPerson || editingSchool.contactPerson,
        phone: newPhone || editingSchool.phone,
        financialModel: financialModel,
        monthlyFeePerStudent: financialModel === 'monthly_fee' ? (Number(newMonthlyFee) || 0) : 0,
        coachHonorPerSession: financialModel === 'coach_honor' ? (Number(newCoachHonor) || 0) : 0,
      };
      onEditSchool?.(updatedSchool);
    } else {
      const createdSchoolId = `sch-${Date.now()}`;
      const createdSchool: School = {
        id: createdSchoolId,
        name: newSchoolName,
        code: newSchoolCode || `SCH-${Math.floor(100 + Math.random() * 900)}`,
        address: newAddress || 'Jl. Pendidikan No. 1',
        contactPerson: newContactPerson || 'Koordinator Ekstra',
        phone: newPhone,
        activeStudentsCount: 0,
        financialModel: financialModel,
        monthlyFeePerStudent: financialModel === 'monthly_fee' ? (Number(newMonthlyFee) || 0) : 0,
        coachHonorPerSession: financialModel === 'coach_honor' ? (Number(newCoachHonor) || 0) : 0,
      };

      onAddSchool(createdSchool);

      // Create Schedule linked to this school
      if (onAddSchedule) {
        const assignedCoach = coaches.find((c) => c.id === newCoachId) || coaches[0];
        const createdSchedule: Schedule = {
          id: `schd-${Date.now()}`,
          schoolId: createdSchoolId,
          schoolName: newSchoolName,
          dayOfWeek: newDayOfWeek || 'Rabu & Sabtu',
          timeSlot: newTimeSlot || '15:30 - 17:00 WIB',
          location: newLocation || 'Lapangan Archery Sekolah',
          coachId: assignedCoach?.id || 'coach-1',
          coachName: assignedCoach?.name || 'Coach Fadli Archery',
          date: new Date().toISOString().substring(0, 10),
          targetCount: Number(newTargetCount) || 6,
        };
        onAddSchedule(createdSchedule);
      }
    }

    setShowAddSchoolModal(false);
    resetSchoolForm();
  };

  // Coach Handlers
  const resetCoachForm = () => {
    setEditingCoach(null);
    setCoachName('');
    setCoachLicense(`PERPANI-NAT-2026-${Math.floor(100 + Math.random() * 900)}`);
    setCoachRoleTitle('Pelatih Panahan Ekstrakurikuler');
    setCoachPhone('081234567890');
    setCoachAssignedSchools(schools.length > 0 ? [schools[0].id] : []);
    setCoachAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
  };

  const handleOpenAddCoach = () => {
    resetCoachForm();
    setShowCoachModal(true);
  };

  const handleOpenEditCoach = (c: Coach) => {
    setEditingCoach(c);
    setCoachName(c.name);
    setCoachLicense(c.licenseNumber);
    setCoachRoleTitle(c.roleTitle);
    setCoachPhone(c.phone);
    setCoachAssignedSchools(c.assignedSchools || []);
    setCoachAvatarUrl(c.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
    setShowCoachModal(true);
  };

  const handleSaveCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName) return;

    if (editingCoach) {
      const updated: Coach = {
        ...editingCoach,
        name: coachName,
        licenseNumber: coachLicense || 'PERPANI-NAT-2026-001',
        roleTitle: coachRoleTitle || 'Pelatih Panahan',
        phone: coachPhone || '081234567890',
        assignedSchools: coachAssignedSchools,
        avatarUrl: coachAvatarUrl || editingCoach.avatarUrl,
      };
      onEditCoach?.(updated);
    } else {
      const created: Coach = {
        id: `coach-${Date.now()}`,
        name: coachName,
        licenseNumber: coachLicense || `PERPANI-NAT-2026-${Math.floor(100 + Math.random() * 900)}`,
        roleTitle: coachRoleTitle || 'Pelatih Panahan',
        phone: coachPhone || '081234567890',
        assignedSchools: coachAssignedSchools,
        avatarUrl: coachAvatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      };
      onAddCoach?.(created);
    }

    setShowCoachModal(false);
    resetCoachForm();
  };

  const handleDeleteCoachConfirm = (c: Coach) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data pelatih "${c.name}"?`)) {
      onDeleteCoach?.(c.id);
    }
  };

  const toggleAssignedSchool = (schoolId: string) => {
    setCoachAssignedSchools((prev) =>
      prev.includes(schoolId) ? prev.filter((id) => id !== schoolId) : [...prev, schoolId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Manajemen Siswa, Sekolah Mitra & Pelatih
          </h2>
          <p className="text-xs text-slate-400">
            Registrasi siswa atlet panahan, penugasan pelatih (coaches), serta database sekolah ekstrakurikuler.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAddStudent}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-4 h-4" /> + Tambah Siswa
          </button>
          <button
            onClick={handleOpenAddSchool}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <SchoolIcon className="w-4 h-4 text-amber-400" /> + Tambah Sekolah
          </button>
          <button
            onClick={handleOpenAddCoach}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-4 h-4" /> + Tambah Pelatih
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'students' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          🎯 Siswa Atlet ({filteredStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('schools')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'schools' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏫 Sekolah Mitra ({schools.length})
        </button>
        <button
          onClick={() => setActiveTab('coaches')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'coaches' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          👨‍🏫 Pelatih (Coaches) ({coaches.length})
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama atau NISN siswa..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((std) => (
              <div
                key={std.id}
                onClick={() => setSelectedStudentForDetail(std)}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-sm transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={std.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={std.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 group-hover:border-emerald-400 transition-colors"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{std.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">NISN: {std.nisn}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                      {std.schoolName} ({std.grade})
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Jenis Busur:</span>
                    <span className="text-slate-200 font-bold">{std.bowType}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Jarak Target:</span>
                    <span className="text-amber-400 font-bold">{std.targetDistance}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Orang Tua:</span>
                    <span className="text-slate-300">{std.parentName}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedStudentForDetail(std)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow transition-colors"
                    title="Lihat Profil Lengkap Siswa"
                  >
                    <Eye className="w-3 h-3" /> Detail
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditStudent(std)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Edit Profile Siswa"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudentConfirm(std)}
                      className="px-2 py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Hapus Profile Siswa"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schools.map((sch) => {
            const schoolSchedules = schedules.filter((s) => s.schoolId === sch.id);
            return (
              <div key={sch.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      <SchoolIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-700">
                      {sch.code}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{sch.name}</h3>
                  <p className="text-xs text-slate-400 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    {sch.address}
                  </p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-300 font-medium">PIC: {sch.contactPerson}</p>
                      <p className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> {sch.phone}
                      </p>
                    </div>

                    {(() => {
                      const modelMode = sch.financialModel || ((sch.coachHonorPerSession ?? 0) > 0 && (sch.monthlyFeePerStudent ?? 0) === 0 ? 'coach_honor' : 'monthly_fee');
                      return (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <Coins className="w-3 h-3 text-emerald-400" /> Skema Keuangan:
                            </span>
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              modelMode === 'monthly_fee'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            }`}>
                              {modelMode === 'monthly_fee' ? 'Iuran Siswa Bulanan' : 'Honor Kedatangan Pelatih'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className={`p-2 rounded-lg border transition-all ${
                              modelMode === 'monthly_fee'
                                ? 'bg-slate-900/90 border-emerald-500/30'
                                : 'bg-slate-950/40 border-slate-850 opacity-50'
                            }`}>
                              <span className="text-slate-400 block text-[10px] font-medium">Iuran / Siswa</span>
                              {modelMode === 'monthly_fee' ? (
                                <span className="text-emerald-400 font-bold font-mono">
                                  Rp {(sch.monthlyFeePerStudent || 0).toLocaleString('id-ID')}<span className="text-[9px] font-normal text-slate-400">/bln</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium text-[10px] italic">Tidak Aktif</span>
                              )}
                            </div>

                            <div className={`p-2 rounded-lg border transition-all ${
                              modelMode === 'coach_honor'
                                ? 'bg-slate-900/90 border-amber-500/30'
                                : 'bg-slate-950/40 border-slate-850 opacity-50'
                            }`}>
                              <span className="text-slate-400 block text-[10px] font-medium">Honor Pelatih</span>
                              {modelMode === 'coach_honor' ? (
                                <span className="text-amber-300 font-bold font-mono">
                                  Rp {(sch.coachHonorPerSession || 0).toLocaleString('id-ID')}<span className="text-[9px] font-normal text-slate-400">/sesi</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium text-[10px] italic">Tidak Aktif</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Schedules Section */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Jadwal Sesi Latihan
                    </span>
                    {schoolSchedules.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">Belum ada jadwal latihan terdaftar</p>
                    ) : (
                      schoolSchedules.map((schd) => (
                        <div key={schd.id} className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/20 text-xs space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-amber-300">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-400" /> {schd.dayOfWeek}
                            </span>
                            <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
                              <Clock className="w-2.5 h-2.5" /> {schd.timeSlot}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                            <span className="flex items-center gap-1 text-slate-300">
                              <UserCheck className="w-3 h-3 text-emerald-400" /> {schd.coachName}
                            </span>
                            <span className="flex items-center gap-1 text-sky-400 font-medium">
                              <Target className="w-3 h-3" /> {schd.targetCount} Target
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSchool(sch)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Data
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSchoolConfirm(sch)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'coaches' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={coachSearch}
                onChange={(e) => setCoachSearch(e.target.value)}
                placeholder="Cari pelatih berdasarkan nama, nomor lisensi, atau spesialisasi..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              onClick={handleOpenAddCoach}
              className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow shrink-0"
            >
              <UserPlus className="w-4 h-4" /> + Tambah Pelatih Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches
              .filter((c) => {
                const matchSearch =
                  c.name.toLowerCase().includes(coachSearch.toLowerCase()) ||
                  c.licenseNumber.toLowerCase().includes(coachSearch.toLowerCase()) ||
                  c.roleTitle.toLowerCase().includes(coachSearch.toLowerCase());
                return matchSearch;
              })
              .map((c) => {
                const assignedSchoolObjs = schools.filter((s) => c.assignedSchools?.includes(s.id));
                return (
                  <div
                    key={c.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <img
                          src={c.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt={c.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500/40 shrink-0"
                        />
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white">{c.name}</h3>
                          <p className="text-xs text-sky-400 font-medium flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> {c.roleTitle}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block">
                            Lisensi: {c.licenseNumber}
                          </p>
                          <p className="text-xs text-slate-300 pt-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" /> {c.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sekolah Ditugaskan */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <SchoolIcon className="w-3 h-3 text-amber-400" /> Sekolah Ditugaskan ({assignedSchoolObjs.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {assignedSchoolObjs.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic">Belum ditugaskan di sekolah mitra</span>
                        ) : (
                          assignedSchoolObjs.map((sch) => (
                            <span
                              key={sch.id}
                              className="bg-amber-500/10 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-amber-500/20"
                            >
                              {sch.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenEditCoach(c)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Data
                      </button>
                      <button
                        onClick={() => handleDeleteCoachConfirm(c)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                {editingStudent ? 'Edit Profile Atlet Siswa' : 'Registrasi Atlet Siswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddStudentModal(false);
                  resetStudentForm();
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                    placeholder="Contoh: Ahmad Rizky"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">NISN (Nomor Induk)</label>
                  <input
                    type="text"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                    placeholder="Kosongkan untuk auto-generate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sekolah</label>
                  <select
                    value={newSchoolId}
                    onChange={(e) => setNewSchoolId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Kelas</label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                    placeholder="Contoh: Kelas 5B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Jenis Busur</label>
                  <select
                    value={newBowType}
                    onChange={(e) => setNewBowType(e.target.value as BowType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="Standard Bow">Standard Bow</option>
                    <option value="Recurve">Recurve</option>
                    <option value="Barebow">Barebow</option>
                    <option value="Compound">Compound</option>
                    <option value="Horsebow">Horsebow</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Jarak Target</label>
                  <select
                    value={newDistance}
                    onChange={(e) => setNewDistance(e.target.value as TargetDistance)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="5m">5m</option>
                    <option value="7m">7m</option>
                    <option value="10m">10m</option>
                    <option value="15m">15m</option>
                    <option value="18m">18m</option>
                    <option value="20m">20m</option>
                    <option value="30m">30m</option>
                    <option value="50m">50m</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama & HP Orang Tua</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Nama Orang Tua"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="No. WhatsApp"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status Keaktifan</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'Aktif' | 'Cuti' | 'Alumni')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">URL Foto Profile (Opsional)</label>
                  <input
                    type="url"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
                >
                  {editingStudent ? 'Update Profile Siswa' : 'Simpan Data Siswa'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    resetStudentForm();
                  }}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add School */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <SchoolIcon className="w-4 h-4 text-amber-400" />
                {editingSchool ? 'Edit Data Sekolah Mitra' : 'Tambah Sekolah Mitra & Jadwal Latihan'}
              </h3>
            </div>
            <form onSubmit={handleSaveSchool} className="space-y-4">
              {/* Data Profil Sekolah */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Info Sekolah Mitra</h4>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    required
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                    placeholder="Contoh: SDIT Nurul Fikri"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Alamat Sekolah</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                    placeholder="Contoh: Jl. Raya Kebon Jeruk No. 45"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">PIC / Kontak Sekolah</label>
                    <input
                      type="text"
                      value={newContactPerson}
                      onChange={(e) => setNewContactPerson(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                      placeholder="Contoh: Pak Supri (Guru Ekstra)"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">No. HP / WhatsApp PIC</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi Keuangan & Tarif Ekstrakurikuler */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Skema Keuangan & Tarif Sekolah</h4>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-medium">Pilih Salah Satu</span>
                </div>

                {/* Model Selector Buttons */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFinancialModel('monthly_fee')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                      financialModel === 'monthly_fee'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>1. Iuran Siswa Bulanan</span>
                    <span className={`w-2 h-2 rounded-full ${financialModel === 'monthly_fee' ? 'bg-white ring-2 ring-white/50' : 'bg-slate-700'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinancialModel('coach_honor')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
                      financialModel === 'coach_honor'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                        : 'bg-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>2. Honor Kedatangan</span>
                    <span className={`w-2 h-2 rounded-full ${financialModel === 'coach_honor' ? 'bg-white ring-2 ring-white/50' : 'bg-slate-700'}`} />
                  </button>
                </div>

                {/* Tarif Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-2xl border transition-all ${
                    financialModel === 'monthly_fee' ? 'bg-slate-800/80 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800/80 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-200">Iuran / SPP per Siswa</label>
                      {financialModel !== 'monthly_fee' && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Tidak Aktif</span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        disabled={financialModel !== 'monthly_fee'}
                        value={financialModel === 'monthly_fee' ? newMonthlyFee : 0}
                        onChange={(e) => setNewMonthlyFee(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-2.5 py-2 text-xs text-emerald-300 font-mono font-bold disabled:bg-slate-950 disabled:text-slate-600 disabled:border-slate-850"
                        placeholder="150000"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Ditagihkan per bulan ke orang tua/siswa</p>
                  </div>

                  <div className={`p-2.5 rounded-2xl border transition-all ${
                    financialModel === 'coach_honor' ? 'bg-slate-800/80 border-amber-500/50' : 'bg-slate-950/60 border-slate-800/80 opacity-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-200">Honor Pelatih / Kedatangan</label>
                      {financialModel !== 'coach_honor' && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Tidak Aktif</span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        disabled={financialModel !== 'coach_honor'}
                        value={financialModel === 'coach_honor' ? newCoachHonor : 0}
                        onChange={(e) => setNewCoachHonor(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-2.5 py-2 text-xs text-amber-300 font-mono font-bold disabled:bg-slate-950 disabled:text-slate-600 disabled:border-slate-850"
                        placeholder="100000"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Dibayarkan sekolah per sesi kehadiran pelatih</p>
                  </div>
                </div>
              </div>

              {/* Seksi Jadwal Sesi Latihan (Hanya saat tambah sekolah baru) */}
              {!editingSchool && (
                <div className="border-t border-slate-800 pt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h4 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Jadwal Sesi Latihan Perdana</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Hari Latihan</label>
                      <input
                        type="text"
                        value={newDayOfWeek}
                        onChange={(e) => setNewDayOfWeek(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                        placeholder="Contoh: Rabu & Sabtu"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Jam Sesi Latihan</label>
                      <input
                        type="text"
                        value={newTimeSlot}
                        onChange={(e) => setNewTimeSlot(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                        placeholder="Contoh: 15:30 - 17:00 WIB"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Lokasi Lapangan Panahan</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                      placeholder="Contoh: Lapangan Archery Utama Sekolah"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Pelatih Penanggung Jawab</label>
                      <select
                        value={newCoachId}
                        onChange={(e) => setNewCoachId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                      >
                        {coaches.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.roleTitle})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Target / Bantalan</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={newTargetCount}
                        onChange={(e) => setNewTargetCount(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20"
                >
                  {editingSchool ? (
                    <>
                      <Edit3 className="w-4 h-4" /> Simpan Perubahan Sekolah
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Simpan Sekolah & Jadwal
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSchoolModal(false);
                    resetSchoolForm();
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Coach */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                {editingCoach ? 'Edit Data Pelatih (Coach)' : 'Tambah Pelatih Panahan Baru'}
              </h3>
            </div>

            <form onSubmit={handleSaveCoach} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Lengkap & Gelar Pelatih</label>
                <input
                  type="text"
                  required
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  placeholder="Contoh: Coach Subhan, S.Pd., S.Or."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nomor Lisensi / Sertifikasi</label>
                  <input
                    type="text"
                    required
                    value={coachLicense}
                    onChange={(e) => setCoachLicense(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono"
                    placeholder="Contoh: PERPANI-NAT-2025-089"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    value={coachPhone}
                    onChange={(e) => setCoachPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                    placeholder="Contoh: 081122334455"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Spesialisasi / Jabatan (Role Title)</label>
                <input
                  type="text"
                  required
                  value={coachRoleTitle}
                  onChange={(e) => setCoachRoleTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  placeholder="Contoh: Pelatih Kepala (Level 2 PERPANI)"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">URL Foto Profil (Opsional)</label>
                <input
                  type="text"
                  value={coachAvatarUrl}
                  onChange={(e) => setCoachAvatarUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Penugasan Sekolah Mitra</label>
                <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-40 overflow-y-auto">
                  {schools.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Belum ada sekolah mitra terdaftar</p>
                  ) : (
                    schools.map((sch) => {
                      const isChecked = coachAssignedSchools.includes(sch.id);
                      return (
                        <label
                          key={sch.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isChecked ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30' : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          <span className="font-medium">{sch.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAssignedSchool(sch.id)}
                            className="w-4 h-4 accent-sky-500 rounded"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20"
                >
                  <Plus className="w-4 h-4" /> {editingCoach ? 'Simpan Perubahan' : 'Tambah Pelatih'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCoachModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
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
          onEditStudent={handleOpenEditStudent}
        />
      )}
    </div>
  );
};
