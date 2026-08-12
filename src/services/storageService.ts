import {
  School, Coach, Student, Schedule, StudentAttendance,
  CoachAttendance, ArcheryScoreRecord, SppPayment, SystemNotification,
  BankAccountConfig
} from '../types';
import {
  INITIAL_SCHOOLS, INITIAL_COACHES, INITIAL_STUDENTS, INITIAL_SCHEDULES,
  INITIAL_STUDENT_ATTENDANCE, INITIAL_COACH_ATTENDANCE, INITIAL_SCORES,
  INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS
} from '../data/initialData';
import { FirebaseService } from './firebaseService';

export const INITIAL_BANK_CONFIG: BankAccountConfig = {
  bankName: 'Bank Syariah Indonesia (BSI)',
  accountNumber: '7829102938',
  accountHolder: 'Panahan Bandung Official',
  qrisNmid: 'ID10293847120 - Panahan Bandung Official',
  instructions: 'Harap cantumkan Nama Siswa & Bulan Tagihan saat melakukan transfer.',
};

const KEYS = {
  SCHOOLS: 'panahan_schools_v1',
  COACHES: 'panahan_coaches_v1',
  STUDENTS: 'panahan_students_v1',
  SCHEDULES: 'panahan_schedules_v1',
  STUDENT_ATTENDANCE: 'panahan_student_att_v1',
  COACH_ATTENDANCE: 'panahan_coach_att_v1',
  SCORES: 'panahan_scores_v1',
  PAYMENTS: 'panahan_payments_v1',
  NOTIFICATIONS: 'panahan_notifications_v1',
  BANK_CONFIG: 'panahan_bank_config_v1',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const StorageService = {
  getSchools: (): School[] => getItem(KEYS.SCHOOLS, INITIAL_SCHOOLS),
  saveSchools: (schools: School[]) => {
    setItem(KEYS.SCHOOLS, schools);
    FirebaseService.syncCollection('schools', schools);
  },

  getCoaches: (): Coach[] => getItem(KEYS.COACHES, INITIAL_COACHES),
  saveCoaches: (coaches: Coach[]) => {
    setItem(KEYS.COACHES, coaches);
    FirebaseService.syncCollection('coaches', coaches);
  },

  getStudents: (): Student[] => getItem(KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (students: Student[]) => {
    setItem(KEYS.STUDENTS, students);
    FirebaseService.syncCollection('students', students);
  },

  getSchedules: (): Schedule[] => getItem(KEYS.SCHEDULES, INITIAL_SCHEDULES),
  saveSchedules: (schedules: Schedule[]) => {
    setItem(KEYS.SCHEDULES, schedules);
    FirebaseService.syncCollection('schedules', schedules);
  },

  getStudentAttendance: (): StudentAttendance[] => getItem(KEYS.STUDENT_ATTENDANCE, INITIAL_STUDENT_ATTENDANCE),
  saveStudentAttendance: (att: StudentAttendance[]) => {
    setItem(KEYS.STUDENT_ATTENDANCE, att);
    FirebaseService.syncCollection('studentAttendance', att);
  },

  getCoachAttendance: (): CoachAttendance[] => getItem(KEYS.COACH_ATTENDANCE, INITIAL_COACH_ATTENDANCE),
  saveCoachAttendance: (att: CoachAttendance[]) => {
    setItem(KEYS.COACH_ATTENDANCE, att);
    FirebaseService.syncCollection('coachAttendance', att);
  },

  getScores: (): ArcheryScoreRecord[] => getItem(KEYS.SCORES, INITIAL_SCORES),
  saveScores: (scores: ArcheryScoreRecord[]) => {
    setItem(KEYS.SCORES, scores);
    FirebaseService.syncCollection('scores', scores);
  },

  getPayments: (): SppPayment[] => getItem(KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (payments: SppPayment[]) => {
    setItem(KEYS.PAYMENTS, payments);
    FirebaseService.syncCollection('payments', payments);
  },

  getNotifications: (): SystemNotification[] => getItem(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  saveNotifications: (notifs: SystemNotification[]) => {
    setItem(KEYS.NOTIFICATIONS, notifs);
    FirebaseService.syncCollection('notifications', notifs);
  },

  getBankConfig: (): BankAccountConfig => getItem(KEYS.BANK_CONFIG, INITIAL_BANK_CONFIG),
  saveBankConfig: (config: BankAccountConfig) => {
    setItem(KEYS.BANK_CONFIG, config);
    FirebaseService.saveBankConfig(config);
  },

  saveUsers: (users: any[]) => {
    setItem('panahan_user_accounts', users);
    FirebaseService.syncCollection('users', users);
  },

  saveAdminCredentials: (creds: { username: string; password: string }) => {
    setItem('panahan_admin_creds', creds);
    FirebaseService.saveAdminCredentials(creds);
  },

  resetAllData: () => {
    localStorage.removeItem(KEYS.SCHOOLS);
    localStorage.removeItem(KEYS.COACHES);
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.SCHEDULES);
    localStorage.removeItem(KEYS.STUDENT_ATTENDANCE);
    localStorage.removeItem(KEYS.COACH_ATTENDANCE);
    localStorage.removeItem(KEYS.SCORES);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.BANK_CONFIG);
  }
};

