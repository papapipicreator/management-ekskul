export type Role = 'admin' | 'coach' | 'student' | 'parent';
export type UserRole = Role;

export type BowType = 'Standard Bow' | 'Recurve' | 'Barebow' | 'Compound' | 'Horsebow';
export type TargetDistance = '5m' | '7m' | '10m' | '15m' | '18m' | '20m' | '30m' | '50m';

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson?: string;
  phone: string;
  activeStudentsCount: number;
  monthlyFeePerStudent?: number;
  coachHonorPerSession?: number;
  financialModel?: 'monthly_fee' | 'coach_honor';
  headCoach?: string;
  practiceDays?: string | string[];
}

export interface Student {
  id: string;
  name: string;
  nisn?: string;
  nis?: string;
  schoolId: string;
  schoolName: string;
  grade?: string;
  classGrade?: string;
  gender?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  bowType: BowType;
  targetDistance: TargetDistance;
  qrCodeUrl?: string;
  joinDate?: string;
  joinedDate?: string;
  status?: 'Aktif' | 'Cuti' | 'Alumni';
  avatarUrl?: string;
}

export interface Coach {
  id: string;
  name: string;
  licenseNumber?: string;
  assignedSchools: string[];
  phone: string;
  roleTitle?: string;
  specialization?: string;
  email?: string;
  avatarUrl?: string;
}

export interface Schedule {
  id: string;
  title?: string;
  schoolId: string;
  schoolName: string;
  dayOfWeek?: string;
  timeSlot?: string;
  timeStart?: string;
  timeEnd?: string;
  location: string;
  coachId: string;
  coachName: string;
  date: string;
  targetCount?: number;
  targetFocus?: string;
  targetDistance?: string;
  materiLatihan?: string;
  evaluasiLatihan?: string;
  notes?: string;
}

export interface StudentAttendance {
  id: string;
  scheduleId: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  schoolName?: string;
  date: string;
  timeIn?: string;
  checkInTime?: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  method?: 'Scan QR' | 'Manual Pelatih';
  notes?: string;
}

export interface CoachAttendance {
  id: string;
  coachId: string;
  coachName: string;
  scheduleId: string;
  schoolId?: string;
  schoolName?: string;
  date: string;
  timeIn?: string;
  checkInTime?: string;
  checkOutTime?: string;
  locationNotes?: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  notes?: string;
}

export interface ArcheryScoreEnd {
  endNumber: number; // 1 to 6
  arrows: (number | string)[]; // array of 6 arrow scores (0 to 10 or 'X')
}

export interface ArcheryScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  scheduleId: string;
  date: string;
  distance: TargetDistance;
  bowType: BowType;
  ends: ArcheryScoreEnd[];
  totalScore: number;
  maxPossibleScore: number;
  tenCount: number;
  xCount: number;
  averageArrow: number;
  coachNotes: string;
}

export interface SppPayment {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  schoolName: string;
  month: string; // e.g. 'Agustus 2026'
  amount: number;
  status: 'Lunas' | 'Belum Bayar' | 'Menunggu Konfirmasi';
  invoiceNumber: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'attendance' | 'scoring' | 'payment' | 'announcement' | 'schedule' | 'report';
  targetSchoolId?: string;
  read: boolean;
  channelSent?: 'WhatsApp' | 'Portal' | 'Email';
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'coach';
  assignedSchoolIds?: string[];
  createdAt: string;
}

export interface BankAccountConfig {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisNmid: string;
  instructions?: string;
}

export type ColorSchemeId = 'emerald' | 'blue' | 'purple' | 'rose' | 'cyan' | 'amber' | 'light';

export interface ColorSchemeConfig {
  id: ColorSchemeId;
  name: string;
  badge: string;
  description: string;
  primaryColorHex: string;
  accentColorHex: string;
  bgMode: 'dark' | 'light';
  bgClass: string;
  textClass: string;
  primaryBgClass: string;
  primaryHoverBgClass: string;
  primaryTextClass: string;
  primaryBorderClass: string;
}

