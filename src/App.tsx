import React, { useState, useEffect } from 'react';
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
  Palette,
} from 'lucide-react';
import { Role, Student, School, Coach, Schedule, StudentAttendance, ArcheryScoreRecord, SppPayment, SystemNotification, UserAccount, BankAccountConfig, ColorSchemeId } from './types';
import { StorageService, INITIAL_BANK_CONFIG } from './services/storageService';
import { FirebaseService } from './services/firebaseService';
import { COLOR_SCHEMES } from './data/colorSchemes';
import { ColorSchemeModal } from './components/admin/ColorSchemeModal';
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
import { ExcelDataBackupModal } from './components/admin/ExcelDataBackupModal';

import { StudentPortal } from './components/student/StudentPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { CoachScanModal } from './components/coach/CoachScanModal';
import { NotificationCenterModal } from './components/admin/NotificationCenterModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ParentLoginModal } from './components/parent/ParentLoginModal';
import { ChangePasswordModal } from './components/admin/ChangePasswordModal';
import { UserManagementModal } from './components/admin/UserManagementModal';
import { ShieldCheck, Lock, KeyRound, ArrowRight, LogOut, UserPlus } from 'lucide-react';

const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'u-1',
    name: 'Administrator Utama',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-2',
    name: 'Pelatih Panahan Utama',
    username: 'pelatih',
    password: 'pelatih123',
    role: 'coach',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'u-3',
    name: 'Orang Tua (Wali Siswa)',
    username: 'orangtua',
    password: 'orangtua123',
    role: 'parent',
    assignedSchoolIds: ['sch-1'],
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('ALL');
  const [adminTab, setAdminTab] = useState<'scoring' | 'attendance' | 'payments' | 'master' | 'reports'>('scoring');

  // User Accounts & Authentication State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('panahan_user_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USER_ACCOUNTS;
  });

  const [currentUserSession, setCurrentUserSession] = useState<UserAccount | null>(null);

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
  const [isParentLoginModalOpen, setIsParentLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isColorSchemeModalOpen, setIsColorSchemeModalOpen] = useState(false);

  const [currentColorScheme, setCurrentColorScheme] = useState<ColorSchemeId>(() => {
    const saved = localStorage.getItem('panahan_color_scheme');
    if (saved && ['emerald', 'blue', 'purple', 'rose', 'cyan', 'amber', 'light'].includes(saved)) {
      return saved as ColorSchemeId;
    }
    return 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('panahan_color_scheme', currentColorScheme);
    document.documentElement.setAttribute('data-theme', currentColorScheme);
  }, [currentColorScheme]);

  const currentSchemeConfig = COLOR_SCHEMES.find((s) => s.id === currentColorScheme) || COLOR_SCHEMES[0];

  const isCoachRole = currentUserSession?.role === 'coach';

  const handleUpdateAdminCredentials = (newUsername: string, newPassword: string) => {
    const updated = { username: newUsername, password: newPassword };
    setAdminCredentials(updated);
    localStorage.setItem('panahan_admin_creds', JSON.stringify(updated));

    // Also update in users list if admin account exists
    setUsers((prev) => {
      const copy = prev.map((u) =>
        u.username === adminCredentials.username || u.role === 'admin'
          ? { ...u, username: newUsername, password: newPassword }
          : u
      );
      localStorage.setItem('panahan_user_accounts', JSON.stringify(copy));
      return copy;
    });
  };

  const handleAddUserAccount = (newUser: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const account: UserAccount = {
      ...newUser,
      id: 'u-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, account];
    setUsers(updated);
    localStorage.setItem('panahan_user_accounts', JSON.stringify(updated));
  };

  const handleDeleteUserAccount = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    localStorage.setItem('panahan_user_accounts', JSON.stringify(updated));
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUserSession(user);
    
    if (user.role === 'parent') {
      setCurrentRole('parent');
      setIsParentLoginModalOpen(false);
      setIsAdminLoginModalOpen(false);
      if (user.assignedSchoolIds && user.assignedSchoolIds.length > 0) {
        setSelectedSchoolId(user.assignedSchoolIds[0]);
      }
    } else {
      setIsAdminLoggedIn(true);
      setIsAdminLoginModalOpen(false);
      setIsParentLoginModalOpen(false);
      
      if (user.role === 'coach') {
        setCurrentRole('admin');
        setAdminTab('scoring');
        if (user.assignedSchoolIds && user.assignedSchoolIds.length > 0) {
          setSelectedSchoolId(user.assignedSchoolIds[0]);
        }
      } else {
        setCurrentRole('admin');
      }
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentUserSession(null);
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
  const [bankConfig, setBankConfig] = useState<BankAccountConfig>(INITIAL_BANK_CONFIG);

  // Real-time Firestore Database Subscriptions
  useEffect(() => {
    const unsubSchools = FirebaseService.subscribeCollection('schools', INITIAL_SCHOOLS, setSchools);
    const unsubStudents = FirebaseService.subscribeCollection('students', INITIAL_STUDENTS, setStudents);
    const unsubCoaches = FirebaseService.subscribeCollection('coaches', INITIAL_COACHES, setCoaches);
    const unsubSchedules = FirebaseService.subscribeCollection('schedules', INITIAL_SCHEDULES, setSchedules);
    const unsubAttendance = FirebaseService.subscribeCollection('studentAttendance', INITIAL_ATTENDANCE, setAttendance);
    const unsubScores = FirebaseService.subscribeCollection('scores', INITIAL_SCORES, setScores);
    const unsubPayments = FirebaseService.subscribeCollection('payments', INITIAL_PAYMENTS, setPayments);
    const unsubNotifications = FirebaseService.subscribeCollection('notifications', INITIAL_NOTIFICATIONS, setNotifications);
    const unsubBankConfig = FirebaseService.subscribeDoc('settings', 'bankConfig', INITIAL_BANK_CONFIG, setBankConfig);

    return () => {
      unsubSchools();
      unsubStudents();
      unsubCoaches();
      unsubSchedules();
      unsubAttendance();
      unsubScores();
      unsubPayments();
      unsubNotifications();
      unsubBankConfig();
    };
  }, []);

  const handleUpdateBankConfig = (newConfig: BankAccountConfig) => {
    setBankConfig(newConfig);
    StorageService.saveBankConfig(newConfig);
  };

  // Modals
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isExcelBackupModalOpen, setIsExcelBackupModalOpen] = useState(false);

  // Direct Smartphone Camera QR Scan URL Handler
  const [directQrNotification, setDirectQrNotification] = useState<{
    studentName: string;
    schoolName: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    if (students.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const qrStudentId = params.get('qrScanStudentId') || params.get('studentId');
    const nisnParam = params.get('nisn');

    if (qrStudentId || nisnParam) {
      const foundStudent = students.find(
        (s) => s.id === qrStudentId || s.nisn === nisnParam || s.id.includes(qrStudentId || '')
      );

      if (foundStudent) {
        const matchingSchedule = schedules.find((sch) => sch.schoolId === foundStudent.schoolId) || schedules[0];
        const schId = matchingSchedule ? matchingSchedule.id : 'sch-default';

        const today = new Date().toISOString().substring(0, 10);
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const record: StudentAttendance = {
          id: `att-direct-${Date.now()}-${foundStudent.id}`,
          scheduleId: schId,
          studentId: foundStudent.id,
          studentName: foundStudent.name,
          schoolId: foundStudent.schoolId,
          schoolName: foundStudent.schoolName,
          date: today,
          timeIn: timeNow,
          status: 'Hadir',
          method: 'Scan QR',
          notes: 'Presensi otomatis via Scan QR Smartphone Langsung Terkoneksi',
        };

        handleMarkAttendance(record);

        setDirectQrNotification({
          studentName: foundStudent.name,
          schoolName: foundStudent.schoolName,
          time: timeNow,
        });

        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [students.length, schedules.length]);

  // Restore Excel Data Handler
  const handleRestoreExcelData = (
    restored: {
      schools?: School[];
      students?: Student[];
      coaches?: Coach[];
      schedules?: Schedule[];
      attendance?: StudentAttendance[];
      scores?: ArcheryScoreRecord[];
      payments?: SppPayment[];
    },
    mode: 'merge' | 'replace'
  ) => {
    if (restored.schools && restored.schools.length > 0) {
      let nextSchools = restored.schools;
      if (mode === 'merge') {
        const existingMap = new Map<string, School>(schools.map((s) => [s.id, s]));
        restored.schools.forEach((s) => existingMap.set(s.id, s));
        nextSchools = Array.from(existingMap.values());
      }
      setSchools(nextSchools);
      StorageService.saveSchools(nextSchools);
    }

    if (restored.students && restored.students.length > 0) {
      let nextStudents = restored.students;
      if (mode === 'merge') {
        const existingMap = new Map<string, Student>(students.map((st) => [st.id, st]));
        restored.students.forEach((st) => existingMap.set(st.id, st));
        nextStudents = Array.from(existingMap.values());
      }
      setStudents(nextStudents);
      StorageService.saveStudents(nextStudents);
    }

    if (restored.coaches && restored.coaches.length > 0) {
      let nextCoaches = restored.coaches;
      if (mode === 'merge') {
        const existingMap = new Map<string, Coach>(coaches.map((c) => [c.id, c]));
        restored.coaches.forEach((c) => existingMap.set(c.id, c));
        nextCoaches = Array.from(existingMap.values());
      }
      setCoaches(nextCoaches);
      StorageService.saveCoaches(nextCoaches);
    }

    if (restored.schedules && restored.schedules.length > 0) {
      let nextSchedules = restored.schedules;
      if (mode === 'merge') {
        const existingMap = new Map<string, Schedule>(schedules.map((sch) => [sch.id, sch]));
        restored.schedules.forEach((sch) => existingMap.set(sch.id, sch));
        nextSchedules = Array.from(existingMap.values());
      }
      setSchedules(nextSchedules);
      StorageService.saveSchedules(nextSchedules);
    }

    if (restored.attendance && restored.attendance.length > 0) {
      let nextAtt = restored.attendance;
      if (mode === 'merge') {
        const existingMap = new Map<string, StudentAttendance>(attendance.map((att) => [att.id, att]));
        restored.attendance.forEach((att) => existingMap.set(att.id, att));
        nextAtt = Array.from(existingMap.values());
      }
      setAttendance(nextAtt);
      StorageService.saveStudentAttendance(nextAtt);
    }

    if (restored.scores && restored.scores.length > 0) {
      let nextScores = restored.scores;
      if (mode === 'merge') {
        const existingMap = new Map<string, ArcheryScoreRecord>(scores.map((sc) => [sc.id, sc]));
        restored.scores.forEach((sc) => existingMap.set(sc.id, sc));
        nextScores = Array.from(existingMap.values());
      }
      setScores(nextScores);
      StorageService.saveScores(nextScores);
    }

    if (restored.payments && restored.payments.length > 0) {
      let nextPayments = restored.payments;
      if (mode === 'merge') {
        const existingMap = new Map<string, SppPayment>(payments.map((p) => [p.id, p]));
        restored.payments.forEach((p) => existingMap.set(p.id, p));
        nextPayments = Array.from(existingMap.values());
      }
      setPayments(nextPayments);
      StorageService.savePayments(nextPayments);
    }
  };

  // Handlers
  const handleSaveScore = (record: ArcheryScoreRecord) => {
    const updated = [record, ...scores];
    setScores(updated);
    StorageService.saveScores(updated);
  };

  const handleMarkAttendance = (record: StudentAttendance) => {
    let updated: StudentAttendance[] = [];
    const idx = attendance.findIndex((a) => a.studentId === record.studentId && a.date === record.date);
    if (idx >= 0) {
      updated = [...attendance];
      updated[idx] = record;
    } else {
      updated = [record, ...attendance];
    }
    setAttendance(updated);
    StorageService.saveStudentAttendance(updated);
  };

  const handleUpdatePaymentStatus = (id: string, status: 'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi') => {
    const updated = payments.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            paidDate: status === 'Lunas' ? new Date().toISOString().substring(0, 10) : p.paidDate,
            paymentMethod: status === 'Lunas' ? p.paymentMethod || 'Manual Verifikasi Admin' : p.paymentMethod,
          }
        : p
    );
    setPayments(updated);
    StorageService.savePayments(updated);
  };

  const handlePaySppSuccess = (paymentId: string, method: string) => {
    const updated = payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'Lunas' as const,
            paidDate: new Date().toLocaleDateString('id-ID'),
            paymentMethod: method,
          }
        : p
    );
    setPayments(updated);
    StorageService.savePayments(updated);
  };

  const handleAddCoach = (newCoach: Coach) => {
    const updated = [...coaches, newCoach];
    setCoaches(updated);
    StorageService.saveCoaches(updated);
  };

  const handleEditCoach = (updatedCoach: Coach) => {
    const updated = coaches.map((c) => (c.id === updatedCoach.id ? updatedCoach : c));
    setCoaches(updated);
    StorageService.saveCoaches(updated);
  };

  const handleDeleteCoach = (coachId: string) => {
    const updated = coaches.filter((c) => c.id !== coachId);
    setCoaches(updated);
    StorageService.saveCoaches(updated);
  };

  const handleAddStudent = (newStudent: Student) => {
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    StorageService.saveStudents(updatedStudents);

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
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    const updatedStudents = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updatedStudents);
    StorageService.saveStudents(updatedStudents);

    // Also sync studentName in payment records if changed
    const updatedPayments = payments.map((p) =>
      p.studentId === updatedStudent.id
        ? { ...p, studentName: updatedStudent.name, schoolId: updatedStudent.schoolId, schoolName: updatedStudent.schoolName }
        : p
    );
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updatedStudents = students.filter((s) => s.id !== studentId);
    setStudents(updatedStudents);
    StorageService.saveStudents(updatedStudents);

    const updatedPayments = payments.filter((p) => p.studentId !== studentId);
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);
  };

  const handleAddSchool = (newSchool: School) => {
    const updated = [...schools, newSchool];
    setSchools(updated);
    StorageService.saveSchools(updated);
  };

  const handleEditSchool = (updatedSchool: School) => {
    const updatedSchools = schools.map((s) => (s.id === updatedSchool.id ? updatedSchool : s));
    setSchools(updatedSchools);
    StorageService.saveSchools(updatedSchools);

    // Automatically sync student SPP bills according to school financial model
    const isCoachHonorScheme = updatedSchool.financialModel === 'coach_honor';
    const newFee = isCoachHonorScheme ? 0 : (updatedSchool.monthlyFeePerStudent || 0);

    const updatedPayments = payments.map((p) => {
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
    });
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);
  };

  const handleDeleteSchool = (schoolId: string) => {
    // Delete school
    const updatedSchools = schools.filter((s) => s.id !== schoolId);
    setSchools(updatedSchools);
    StorageService.saveSchools(updatedSchools);

    // Synchronize: Delete all training session schedules linked to this school
    const updatedSchedules = schedules.filter((sch) => sch.schoolId !== schoolId);
    setSchedules(updatedSchedules);
    StorageService.saveSchedules(updatedSchedules);
  };

  const handleAddSchedule = (newSchedule: Schedule) => {
    const updated = [newSchedule, ...schedules];
    setSchedules(updated);
    StorageService.saveSchedules(updated);
  };

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    const updated = schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
    setSchedules(updated);
    StorageService.saveSchedules(updated);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const updated = schedules.filter((s) => s.id !== scheduleId);
    setSchedules(updated);
    StorageService.saveSchedules(updated);
  };

  const handleSendNotification = (notif: SystemNotification) => {
    const updated = [notif, ...notifications];
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  // User assigned schools filtering logic (for coaches and parents)
  const isParentRole = currentUserSession?.role === 'parent';

  const userAssignedSchoolIds =
    (currentUserSession?.role === 'coach' || currentUserSession?.role === 'parent') &&
    currentUserSession?.assignedSchoolIds &&
    currentUserSession.assignedSchoolIds.length > 0
      ? currentUserSession.assignedSchoolIds
      : null;

  const effectiveSchools = userAssignedSchoolIds
    ? schools.filter((s) => userAssignedSchoolIds.includes(s.id))
    : schools;

  const effectiveStudents = userAssignedSchoolIds
    ? students.filter((s) => userAssignedSchoolIds.includes(s.schoolId))
    : students;

  const effectiveSchedules = userAssignedSchoolIds
    ? schedules.filter((sch) => userAssignedSchoolIds.includes(sch.schoolId))
    : schedules;

  const effectiveAttendance = userAssignedSchoolIds
    ? attendance.filter((a) => userAssignedSchoolIds.includes(a.schoolId))
    : attendance;

  const effectiveScores = userAssignedSchoolIds
    ? scores.filter((sc) => userAssignedSchoolIds.includes(sc.schoolId))
    : scores;

  const effectivePayments = userAssignedSchoolIds
    ? payments.filter((p) => userAssignedSchoolIds.includes(p.schoolId))
    : payments;

  useEffect(() => {
    if (userAssignedSchoolIds && userAssignedSchoolIds.length > 0) {
      if (selectedSchoolId !== 'ALL' && !userAssignedSchoolIds.includes(selectedSchoolId)) {
        setSelectedSchoolId(userAssignedSchoolIds[0]);
      } else if (currentRole === 'parent' && selectedSchoolId === 'ALL' && userAssignedSchoolIds.length === 1) {
        setSelectedSchoolId(userAssignedSchoolIds[0]);
      }
    }
  }, [userAssignedSchoolIds, selectedSchoolId, currentRole]);

  // Filtered lists by selected school
  const filteredStudents = selectedSchoolId === 'ALL' ? effectiveStudents : effectiveStudents.filter((s) => s.schoolId === selectedSchoolId);
  const filteredScores = selectedSchoolId === 'ALL' ? effectiveScores : effectiveScores.filter((s) => s.schoolId === selectedSchoolId);
  const filteredPayments = selectedSchoolId === 'ALL' ? effectivePayments : effectivePayments.filter((p) => p.schoolId === selectedSchoolId);

  return (
    <div className={`min-h-screen ${currentSchemeConfig.bgClass} ${currentSchemeConfig.textClass} font-sans antialiased transition-colors duration-300 selection:bg-emerald-500 selection:text-slate-950`}>
      {/* Smartphone Direct QR Presensi Success Banner */}
      {directQrNotification && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-2xl flex items-center justify-between z-50 border-b border-emerald-400 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-200 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                Presensi QR Smartphone Terkoneksi Ke Sistem
              </p>
              <p className="text-sm font-bold">
                {directQrNotification.studentName} ({directQrNotification.schoolName}) - Hadir Jam {directQrNotification.time}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDirectQrNotification(null)}
            className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-100 font-bold text-xs transition-all"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Header Navbar */}
      <HeaderNavbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'admin' && !isAdminLoggedIn) {
            setIsAdminLoginModalOpen(true);
          } else if (role === 'parent' && currentUserSession?.role !== 'parent') {
            setIsParentLoginModalOpen(true);
          }
        }}
        schools={effectiveSchools}
        selectedSchoolId={selectedSchoolId}
        onSchoolChange={setSelectedSchoolId}
        unreadNotifCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => {
          if (currentRole === 'admin' && isAdminLoggedIn && !isCoachRole) {
            setIsNotifModalOpen(true);
          }
        }}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        isCoachRole={isCoachRole}
        onAdminLoginClick={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
        onOpenColorSchemeModal={() => setIsColorSchemeModalOpen(true)}
        onOpenExcelBackupModal={() => setIsExcelBackupModalOpen(true)}
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
              <h2 className="text-xl font-black text-white">Mode Admin Terkunci</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Silakan login sebagai Admin untuk mengakses dashboard pengelolaan, melakukan entri skor, mengabsen siswa, serta menambah, mengedit, atau menghapus data siswa dan sekolah.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Login Admin Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentRole('parent');
                  if (currentUserSession?.role !== 'parent') {
                    setIsParentLoginModalOpen(true);
                  }
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" /> Akses Portal Orang Tua
              </button>
            </div>
          </div>
        )}

        {currentRole === 'admin' && isAdminLoggedIn && (
          <div className="space-y-6">
            {/* Admin Header Status Bar with Logout, User Mgmt & Change Password */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isCoachRole
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">
                      Sesi {isCoachRole ? 'Pelatih' : 'Admin'} ({currentUserSession?.name || currentUserSession?.username || adminCredentials.username}) Terautentikasi
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCoachRole
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isCoachRole ? 'Akses Terbatas: Scoring & Presensi' : 'Akses Penuh'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isCoachRole
                      ? 'Anda memiliki akses khusus untuk membuka data scoring panahan dan presensi kehadiran sekolah yang Anda latih.'
                      : 'Anda memiliki akses penuh untuk mengedit data siswa, presensi, scoring, keuangan, dan kelola user.'}
                  </p>
                  {isCoachRole && (
                    <p className="text-[11px] text-amber-300 font-semibold mt-1">
                      Sekolah Dilatih:{' '}
                      <span className="text-slate-200">
                        {userAssignedSchoolIds
                          ? effectiveSchools.map((s) => s.name).join(', ') || 'Belum Ditugaskan'
                          : 'Semua Sekolah Mitra'}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!isCoachRole && (
                  <>
                    <button
                      onClick={() => setIsExcelBackupModalOpen(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-200" /> Backup & Restore Excel
                    </button>
                    <button
                      onClick={() => setIsUserManagementModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                    >
                      <UserPlus className="w-4 h-4" /> Kelola User
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsColorSchemeModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                  title="Ubah Skema Warna Tampilan"
                >
                  <Palette className="w-4 h-4 text-amber-400" /> Skema Warna
                </button>
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <KeyRound className="w-4 h-4 text-sky-400" /> Ubah Akun & Password
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow"
                >
                  <LogOut className="w-4 h-4 text-rose-400" /> Logout
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
                  <p className="text-2xl font-black text-amber-400">{effectiveSchools.length}</p>
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

              {!isCoachRole && (
                <>
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
                    <FileSpreadsheet className="w-4 h-4" /> Export Laporan
                  </button>
                </>
              )}
            </div>

            {/* Admin Active Tab Content */}
            {adminTab === 'scoring' && (
              <ArcheryScoring
                students={effectiveStudents}
                schools={effectiveSchools}
                schedules={effectiveSchedules}
                scores={effectiveScores}
                onSaveScore={handleSaveScore}
                selectedSchoolId={selectedSchoolId}
              />
            )}

            {adminTab === 'attendance' && (
              <AttendanceManagement
                attendance={effectiveAttendance}
                students={effectiveStudents}
                schedules={effectiveSchedules}
                schools={effectiveSchools}
                coaches={coaches}
                onMarkAttendance={handleMarkAttendance}
                onSendNotification={handleSendNotification}
                onUpdateSchedule={handleUpdateSchedule}
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
                bankConfig={bankConfig}
                onUpdateBankConfig={handleUpdateBankConfig}
              />
            )}

            {adminTab === 'master' && (
              <StudentSchoolManagement
                students={students}
                schools={schools}
                coaches={coaches}
                schedules={schedules}
                scores={scores}
                attendance={attendance}
                payments={payments}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onAddSchool={handleAddSchool}
                onEditSchool={handleEditSchool}
                onDeleteSchool={handleDeleteSchool}
                onAddSchedule={handleAddSchedule}
                onUpdateSchedule={handleUpdateSchedule}
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
                coaches={coaches}
                schedules={schedules}
                selectedSchoolId={selectedSchoolId}
                onOpenExcelBackupModal={() => setIsExcelBackupModalOpen(true)}
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
            bankConfig={bankConfig}
          />
        )}

        {currentRole === 'parent' && currentUserSession?.role !== 'parent' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden my-6">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-black text-white">Portal Orang Tua Terkunci</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Silakan login menggunakan akun Orang Tua/Wali yang telah dibuatkan oleh Admin untuk mengakses laporan perkembangan skoring, rekap presensi, dan status pembayaran SPP ananda.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsParentLoginModalOpen(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" /> Login Portal Orang Tua <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentRole === 'parent' && currentUserSession?.role === 'parent' && (
          <ParentPortal
            students={effectiveStudents}
            schools={effectiveSchools}
            attendance={effectiveAttendance}
            scores={effectiveScores}
            payments={effectivePayments}
            notifications={notifications}
            onPaySpp={handlePaySppSuccess}
            selectedSchoolId={selectedSchoolId}
            bankConfig={bankConfig}
            currentUserSession={currentUserSession}
            onLogout={handleLogout}
            onLoginClick={() => setIsParentLoginModalOpen(true)}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-slate-400 tracking-wide">
            copyright <a href="http://panahanbandung.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 underline transition-colors">©panahanbandung.com</a>
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Sistem Manajemen Ekstrakulikuler Panahan Bandung
          </p>
        </div>
      </footer>

      {/* Global Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        adminCredentials={adminCredentials}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onSelectParentRole={() => {
          setIsAdminLoginModalOpen(false);
          setIsParentLoginModalOpen(true);
        }}
      />

      <ParentLoginModal
        isOpen={isParentLoginModalOpen}
        onClose={() => setIsParentLoginModalOpen(false)}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToAdminLogin={() => {
          setIsParentLoginModalOpen(false);
          setIsAdminLoginModalOpen(true);
        }}
      />

      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        users={users}
        schools={schools}
        onAddUser={handleAddUserAccount}
        onDeleteUser={handleDeleteUserAccount}
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
        students={effectiveStudents}
        schedules={effectiveSchedules}
        onMarkAttendance={handleMarkAttendance}
      />

      <NotificationCenterModal
        isOpen={isNotifModalOpen && currentRole === 'admin' && isAdminLoggedIn && !isCoachRole}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        schools={schools}
        onSendNotification={handleSendNotification}
      />

      <ColorSchemeModal
        isOpen={isColorSchemeModalOpen}
        onClose={() => setIsColorSchemeModalOpen(false)}
        currentColorScheme={currentColorScheme}
        onSelectColorScheme={setCurrentColorScheme}
      />

      <ExcelDataBackupModal
        isOpen={isExcelBackupModalOpen}
        onClose={() => setIsExcelBackupModalOpen(false)}
        schools={schools}
        students={students}
        coaches={coaches}
        schedules={schedules}
        attendance={attendance}
        scores={scores}
        payments={payments}
        onRestoreData={handleRestoreExcelData}
      />
    </div>
  );
}
