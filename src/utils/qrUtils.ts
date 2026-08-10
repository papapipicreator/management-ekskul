import { Student } from '../types';

/**
 * Generates a direct URL link for student attendance scanning.
 * When scanned by any smartphone camera app, it opens the app with query params,
 * connecting directly to the database system to record attendance.
 */
export const generateStudentQrData = (student: Student): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://panahanbandung.app';
  return `${origin}?qrScanStudentId=${student.id}&nisn=${student.nisn || ''}`;
};

/**
 * Returns an online API URL that generates a 300x300 QR Code image
 * encoding the direct presensi link for the student.
 */
export const getStudentQrCodeImgUrl = (student: Student): string => {
  const qrData = generateStudentQrData(student);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
};
