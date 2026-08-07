import React, { useState } from 'react';
import {
  Target,
  ClipboardCheck,
  CreditCard,
  Users,
  FileSpreadsheet,
  Award,
  TrendingUp,
  School as SchoolIcon,
  Bell,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  QrCode,
} from 'lucide-react';
import { Role, Student, School, Coach, Schedule, StudentAttendance, ArcheryScoreRecord, SppPayment, SystemNotification } from './types';
import {
  INITIAL_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_COACHES,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE,
  INITIAL_SCORES,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';

import { HeaderNavbar } from './components/common/HeaderNavbar';
import { AttendanceManagement } from './components/admin/AttendanceManagement';
import { ArcheryScoring } from './components/admin/ArcheryScoring';
import { PaymentManagement } from './components/admin/PaymentManagement';
import { StudentSchoolManagement } from './components/admin/StudentSchoolManagement';
import { ReportExportView } from './components/admin/ReportExportView';

import { StudentPortal } from './components/student/StudentPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { CoachScanModal } from './components/coach/CoachScanModal';
import { NotificationCenterModal } from './components/admin/NotificationCenterModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ChangePasswordModal } from './components/admin/ChangePasswordModal';
import { ShieldCheck, Lock, KeyRound, ArrowRight, LogOut } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('ALL');
  const [adminTab, setAdminTab] = useState<'scoring' | 'attendance' | 'payments' | 'master' | 'reports'>('scoring');

  // Admin Auth & Credentials State
  const [adminCredentials, setAdminCredentials] = useState<{ username: string; password: string }>(() => {
    const saved = localStorage.getItem('panahan_admin_creds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return { username: 'admin', password: 'admin123' };
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleUpdateAdminCredentials = (newUsername: string, newPassword: string) => {
    const updated = { username: newUsername, password: newPassword };
    setAdminCredentials(updated);
    localStorage.setItem('panahan_admin_creds', JSON.stringify(updated));
  };

  // Application State
  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [attendance, setAttendance] = useState<StudentAttendance[]>(INITIAL_ATTENDANCE);
  const [scores, setScores] = useState<ArcheryScoreRecord[]>(INITIAL_SCORES);
  const [payments, setPayments] = useState<SppPayment[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Modals
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  // Handlers
  const handleSaveScore = (record: ArcheryScoreRecord) => {
    setScores((prev) => [record, ...prev]);
  };

  const handleMarkAttendance = (record: StudentAttendance) => {
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.studentId === record.studentId && a.date === record.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  };

  const handleUpdatePaymentStatus = (id: string, status: 'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi') => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              paidDate: status === 'Lunas' ? new Date().toISOString().substring(0, 10) : p.paidDate,
              paymentMethod: status === 'Lunas' ? p.paymentMethod || 'Manual Verifikasi Admin' : p.paymentMethod,
            }
          : p
      )
    );
  };

  const handlePaySppSuccess = (paymentId: string, method: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'Lunas',
              paidDate: new Date().toLocaleDateString('id-ID'),
              paymentMethod: method,
            }
          : p
      )
    );
  };

  const handleAddCoach = (newCoach: Coach) => {
    setCoaches((prev) => [...prev, newCoach]);
  };

  const handleEditCoach = (updatedCoach: Coach) => {
    setCoaches((prev) => prev.map((c) => (c.id === updatedCoach.id ? updatedCoach : c)));
  };

  const handleDeleteCoach = (coachId: string) => {
    setCoaches((prev) => prev.filter((c) => c.id !== coachId));
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [...prev, newStudent]);

    // Automatically generate initial SPP Payment bill according to school financial scheme
    const schoolObj = schools.find((s) => s.id === newStudent.schoolId);
    const isCoachHonorScheme = schoolObj?.financialModel === 'coach_honor';
    const newPaymentAmount = isCoachHonorScheme ? 0 : (schoolObj?.monthlyFeePerStudent || 150000);

    const newPayment: SppPayment = {
      id: `pay-${Date.now()}`,
      studentId: newStudent.id,
      studentName: newStudent.name,
      schoolId: newStudent.schoolId,
      schoolName: newStudent.schoolName,
      month: 'Agustus 2026',
      amount: newPaymentAmount,
      status: isCoachHonorScheme ? 'Lunas' : 'Belum Bayar',
      invoiceNumber: `INV/PAN/202608/${Math.floor(100 + Math.random() * 900)}`,
      dueDate: '2026-08-10',
      paidDate: isCoachHonorScheme ? new Date().toISOString().substring(0, 10) : undefined,
      paymentMethod: isCoachHonorScheme ? 'Skema Honor Sekolah' : undefined,
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    // Also sync studentName in payment records if changed
    setPayments((prev) =>
      prev.map((p) => (p.studentId === updatedStudent.id ? { ...p, studentName: updatedStudent.name, schoolId: updatedStudent.schoolId, schoolName: updatedStudent.schoolName } : p))
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setPayments((prev) => prev.filter((p) => p.studentId !== studentId));
  };

  const handleAddSchool = (newSchool: School) => {
    setSchools((prev) => [...prev, newSchool]);
  };

  const handleEditSchool = (updatedSchool: School) => {
    setSchools((prev) => prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s)));

    // Automatically sync student SPP bills according to school financial model
    const isCoachHonorScheme = updatedSchool.financialModel === 'coach_honor';
    const newFee = isCoachHonorScheme ? 0 : (updatedSchool.monthlyFeePerStudent || 0);

    setPayments((prev) =>
      prev.map((p) => {
        if (p.schoolId === updatedSchool.id) {
          return {
            ...p,
            schoolName: updatedSchool.name,
            amount: newFee,
            status: isCoachHonorScheme ? 'Lunas' : p.status,
            paymentMethod: isCoachHonorScheme ? 'Skema Honor Sekolah' : p.paymentMethod,
          };
        }
        return p;
      })
    );
  };

  const handleDeleteSchool = (schoolId: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== schoolId));
  };

  const handleAddSchedule = (newSchedule: Schedule) => {
    setSchedules((prev) => [newSchedule, ...prev]);
  };

  const handleSendNotification = (notif: SystemNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  // Filtered lists by selected school
  const filteredStudents = selectedSchoolId === 'ALL' ? students : students.filter((s) => s.schoolId === selectedSchoolId);
  const filteredScores = selectedSchoolId === 'ALL' ? scores : scores.filter((s) => s.schoolId === selectedSchoolId);
  const filteredPayments = selectedSchoolId === 'ALL' ? payments : payments.filter((p) => p.schoolId === selectedSchoolId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Navbar */}
      <HeaderNavbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'admin' && !isAdminLoggedIn) {
            setIsAdminLoginModalOpen(true);
          }
        }}
        schools={schools}
        selectedSchoolId={selectedSchoolId}
        onSchoolChange={setSelectedSchoolId}
        unreadNotifCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLoginClick={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Role View Conditional Rendering */}
        {currentRole === 'admin' && !isAdminLoggedIn && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden my-6">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-black text-white">Mode Admin / Pelatih Terkunci</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Silakan login sebagai Admin / Pelatih untuk mengakses dashboard pengelolaan, melakukan entri skor, mengabsen siswa, serta menambah, mengedit, atau menghapus data siswa dan sekolah.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 inline-flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Login Admin Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentRole === 'admin' && isAdminLoggedIn && (
          <div className="space-y-6">
            {/* Admin Header Status Bar with Logout & Change Password */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">Sesi Admin ({adminCredentials.username}) Terautentikasi</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Anda memiliki akses penuh untuk mengedit data siswa, presensi, scoring, dan keuangan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <KeyRound className="w-4 h-4 text-sky-400" /> Ubah Akun & Password
                </button>
                <button
                  onClick={() => setIsAdminLoggedIn(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow"
                >
                  <LogOut className="w-4 h-4 text-rose-400" /> Logout Admin
                </button>
              </div>
            </div>

            {/* Admin Overview Stats KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Atlet Siswa</span>
                  <p className="text-2xl font-black text-white">{filteredStudents.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sekolah Mitra</span>
                  <p className="text-2xl font-black text-amber-400">{schools.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <SchoolIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Rekam Skor</span>
                  <p className="text-2xl font-black text-sky-400">{filteredScores.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">SPP Terbayar</span>
                  <p className="text-2xl font-black text-emerald-400">
                    {filteredPayments.filter((p) => p.status === 'Lunas').length} / {filteredPayments.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Admin Module Sub-Navigation Bar */}
            <div className="flex flex-wrap border-b border-slate-800 bg-slate-900/80 p-1.5 rounded-2xl gap-1">
              <button
                onClick={() => setAdminTab('scoring')}
                className={`flex-1 min-w-[130px] py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  adminTab === 'scoring'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-4 h-4" /> Scoring Panahan
              </button>

              <button
                onClick={() => setAdminTab('attendance')}
                className={`flex-1 min-w-[130px] py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  adminTab === 'attendance'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" /> Presensi Kehadiran
              </button>

              <button
                onClick={() => setAdminTab('payments')}
                className={`flex-1 min-w-[130px] py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  adminTab === 'payments'
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Keuangan SPP
              </button>

              <button
                onClick={() => setAdminTab('master')}
                className={`flex-1 min-w-[130px] py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  adminTab === 'master'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> Siswa & Sekolah
              </button>

              <button
                onClick={() => setAdminTab('reports')}
                className={`flex-1 min-w-[130px] py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  adminTab === 'reports'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Pusat Export Laporan
              </button>
            </div>

            {/* Admin Active Tab Content */}
            {adminTab === 'scoring' && (
              <ArcheryScoring
                students={students}
                schools={schools}
                schedules={schedules}
                scores={scores}
                onSaveScore={handleSaveScore}
                selectedSchoolId={selectedSchoolId}
              />
            )}

            {adminTab === 'attendance' && (
              <AttendanceManagement
                attendance={attendance}
                students={students}
                schedules={schedules}
                schools={schools}
                onMarkAttendance={handleMarkAttendance}
                onSendNotification={handleSendNotification}
                selectedSchoolId={selectedSchoolId}
                onOpenScanModal={() => setIsScanModalOpen(true)}
              />
            )}

            {adminTab === 'payments' && (
              <PaymentManagement
                payments={payments}
                students={students}
                schools={schools}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                onSendNotification={handleSendNotification}
                selectedSchoolId={selectedSchoolId}
              />
            )}

            {adminTab === 'master' && (
              <StudentSchoolManagement
                students={students}
                schools={schools}
                coaches={coaches}
                schedules={schedules}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onAddSchool={handleAddSchool}
                onEditSchool={handleEditSchool}
                onDeleteSchool={handleDeleteSchool}
                onAddSchedule={handleAddSchedule}
                onAddCoach={handleAddCoach}
                onEditCoach={handleEditCoach}
                onDeleteCoach={handleDeleteCoach}
                selectedSchoolId={selectedSchoolId}
              />
            )}

            {adminTab === 'reports' && (
              <ReportExportView
                attendance={attendance}
                scores={scores}
                payments={payments}
                students={students}
                schools={schools}
                selectedSchoolId={selectedSchoolId}
              />
            )}
          </div>
        )}

        {currentRole === 'student' && (
          <StudentPortal
            student={students[0]}
            attendance={attendance}
            scores={scores}
            payments={payments}
            schedules={schedules}
            onPaySpp={handlePaySppSuccess}
          />
        )}

        {currentRole === 'parent' && (
          <ParentPortal
            students={students}
            attendance={attendance}
            scores={scores}
            payments={payments}
            notifications={notifications}
            onPaySpp={handlePaySppSuccess}
            selectedSchoolId={selectedSchoolId}
          />
        )}
      </main>

      {/* Global Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        adminCredentials={adminCredentials}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminLoginModalOpen(false);
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentCredentials={adminCredentials}
        onUpdateCredentials={handleUpdateAdminCredentials}
      />

      <CoachScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        students={students}
        schedules={schedules}
        onMarkAttendance={handleMarkAttendance}
      />

      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        schools={schools}
        onSendNotification={handleSendNotification}
      />
    </div>
  );
}
