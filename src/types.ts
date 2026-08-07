export type Role = 'admin' | 'coach' | 'student' | 'parent';

export type BowType = 'Standard Bow' | 'Recurve' | 'Barebow' | 'Compound';
export type TargetDistance = '5m' | '7m' | '10m' | '15m' | '18m' | '20m' | '30m' | '50m';

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  phone: string;
  activeStudentsCount: number;
  monthlyFeePerStudent?: number;
  coachHonorPerSession?: number;
  financialModel?: 'monthly_fee' | 'coach_honor';
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  schoolId: string;
  schoolName: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  bowType: BowType;
  targetDistance: TargetDistance;
  qrCodeUrl: string;
  joinDate: string;
  status: 'Aktif' | 'Cuti' | 'Alumni';
  avatarUrl?: string;
}

export interface Coach {
  id: string;
  name: string;
  licenseNumber: string;
  assignedSchools: string[];
  phone: string;
  roleTitle: string;
  avatarUrl?: string;
}

export interface Schedule {
  id: string;
  schoolId: string;
  schoolName: string;
  dayOfWeek: string;
  timeSlot: string;
  location: string;
  coachId: string;
  coachName: string;
  date: string;
  targetCount: number;
}

export interface StudentAttendance {
  id: string;
  scheduleId: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  schoolName: string;
  date: string;
  timeIn: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  method: 'Scan QR' | 'Manual Pelatih';
  notes?: string;
}

export interface ArcheryScoreEnd {
  endNumber: number; // 1 to 6
  arrows: number[]; // array of 6 arrow scores (0 to 10)
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
  type: 'attendance' | 'scoring' | 'payment' | 'announcement';
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
  createdAt: string;
}
