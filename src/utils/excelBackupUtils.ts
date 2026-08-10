import * as XLSX from 'xlsx';
import {
  School,
  Student,
  Coach,
  Schedule,
  StudentAttendance,
  ArcheryScoreRecord,
  SppPayment,
} from '../types';

export const exportFullDatabaseToExcel = (data: {
  schools: School[];
  students: Student[];
  coaches: Coach[];
  schedules: Schedule[];
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
}) => {
  const wb = XLSX.utils.book_new();

  // 1. Sekolah
  const schoolSheetData = data.schools.map((s, idx) => ({
    No: idx + 1,
    ID: s.id,
    Kode: s.code || `SCH-${idx + 1}`,
    'Nama Sekolah': s.name,
    Alamat: s.address || '',
    'Kontak PIC': s.contactPerson || '',
    Telepon: s.phone || '',
    'Pelatih Utama': s.headCoach || '',
    'Hari Latihan': Array.isArray(s.practiceDays) ? s.practiceDays.join(', ') : s.practiceDays || '',
    'Model Keuangan': s.financialModel || 'monthly_fee',
    'SPP Bulanan (Rp)': s.monthlyFeePerStudent || 0,
    'Honor Pelatih Per Sesi (Rp)': s.coachHonorPerSession || 0,
    'Jumlah Siswa Aktif': s.activeStudentsCount || 0,
  }));
  const wsSchools = XLSX.utils.json_to_sheet(schoolSheetData);
  XLSX.utils.book_append_sheet(wb, wsSchools, 'Sekolah');

  // 2. Siswa
  const studentSheetData = data.students.map((st, idx) => ({
    No: idx + 1,
    ID: st.id,
    NISN: st.nisn || '',
    'Nama Siswa': st.name,
    'ID Sekolah': st.schoolId,
    'Nama Sekolah': st.schoolName,
    Kelas: st.grade || st.classGrade || '',
    'Nama Orang Tua': st.parentName || 'Orang Tua / Wali',
    'Telepon Orang Tua': st.parentPhone || '',
    'Jenis Busur': st.bowType || 'Standard Bow',
    'Jarak Target': st.targetDistance || '10m',
    'Tanggal Masuk': st.joinDate || st.joinedDate || '',
    Status: st.status || 'Aktif',
  }));
  const wsStudents = XLSX.utils.json_to_sheet(studentSheetData);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Siswa');

  // 3. Pelatih
  const coachSheetData = data.coaches.map((c, idx) => ({
    No: idx + 1,
    ID: c.id,
    'Nama Pelatih': c.name,
    'Peran / Gelar': c.roleTitle || '',
    Telepon: c.phone || '',
    'Keahlian Khusus': c.specialization || '',
    'No Lisensi': c.licenseNumber || '',
    'ID Sekolah Terlibat': (c.assignedSchools || []).join(', '),
  }));
  const wsCoaches = XLSX.utils.json_to_sheet(coachSheetData);
  XLSX.utils.book_append_sheet(wb, wsCoaches, 'Pelatih');

  // 4. Jadwal
  const scheduleSheetData = data.schedules.map((sch, idx) => ({
    No: idx + 1,
    ID: sch.id,
    'ID Sekolah': sch.schoolId,
    'Nama Sekolah': sch.schoolName,
    'Hari Latihan': sch.dayOfWeek || 'Rabu & Sabtu',
    'Jam Latihan': sch.timeSlot || '15:30 - 17:00 WIB',
    'Tanggal Sesi': sch.date || new Date().toISOString().substring(0, 10),
    'Lokasi Field': sch.location || 'Lapangan Archery',
    'ID Pelatih': sch.coachId,
    'Nama Pelatih': sch.coachName,
    'Bantalan Target': sch.targetCount || 6,
  }));
  const wsSchedules = XLSX.utils.json_to_sheet(scheduleSheetData);
  XLSX.utils.book_append_sheet(wb, wsSchedules, 'Jadwal');

  // 5. Presensi
  const attendanceSheetData = data.attendance.map((att, idx) => ({
    No: idx + 1,
    ID: att.id,
    'ID Jadwal': att.scheduleId || 'schd-1',
    'ID Siswa': att.studentId,
    'Nama Siswa': att.studentName,
    'ID Sekolah': att.schoolId,
    'Nama Sekolah': att.schoolName || '',
    Tanggal: att.date,
    'Status Presensi': att.status,
    'Waktu Masuk': att.timeIn || att.checkInTime || '',
    Metode: att.method || 'Scan QR',
    Catatan: att.notes || '',
  }));
  const wsAttendance = XLSX.utils.json_to_sheet(attendanceSheetData);
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Presensi');

  // 6. Skor
  const scoreSheetData = data.scores.map((sc, idx) => ({
    No: idx + 1,
    ID: sc.id,
    'ID Jadwal': sc.scheduleId || 'schd-1',
    'ID Siswa': sc.studentId,
    'Nama Siswa': sc.studentName,
    'ID Sekolah': sc.schoolId,
    Tanggal: sc.date,
    'Jenis Busur': sc.bowType,
    'Jarak Target': sc.distance,
    'Total Skor': sc.totalScore,
    'Maks Skor': sc.maxPossibleScore,
    'Rata Arrow': sc.averageArrow,
    'Jumlah 10s': sc.tenCount,
    'Jumlah Xs': sc.xCount,
    'Evaluasi Pelatih': sc.coachNotes || '',
  }));
  const wsScores = XLSX.utils.json_to_sheet(scoreSheetData);
  XLSX.utils.book_append_sheet(wb, wsScores, 'Skor');

  // 7. Pembayaran SPP
  const paymentSheetData = data.payments.map((p, idx) => ({
    No: idx + 1,
    ID: p.id,
    'No Invoice': p.invoiceNumber,
    'ID Siswa': p.studentId,
    'Nama Siswa': p.studentName,
    'ID Sekolah': p.schoolId,
    'Nama Sekolah': p.schoolName,
    Bulan: p.month,
    'Nominal (Rp)': p.amount,
    Status: p.status,
    'Jatuh Tempo': p.dueDate || '',
    'Tanggal Bayar': p.paidDate || '',
    'Metode Pembayaran': p.paymentMethod || '',
  }));
  const wsPayments = XLSX.utils.json_to_sheet(paymentSheetData);
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Pembayaran SPP');

  const dateStr = new Date().toISOString().substring(0, 10);
  XLSX.writeFile(wb, `Panahan_Bandung_Full_Backup_${dateStr}.xlsx`);
};

export interface ParsedBackupData {
  schools: School[];
  students: Student[];
  coaches: Coach[];
  schedules: Schedule[];
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  rawSheetNames: string[];
}

export const parseExcelBackupFile = async (file: File): Promise<ParsedBackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetNames = workbook.SheetNames;

        const parsed: ParsedBackupData = {
          schools: [],
          students: [],
          coaches: [],
          schedules: [],
          attendance: [],
          scores: [],
          payments: [],
          rawSheetNames: sheetNames,
        };

        sheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows: any[] = XLSX.utils.sheet_to_json(sheet);
          const nameLower = sheetName.toLowerCase().trim();

          if (nameLower.includes('sekolah') || nameLower.includes('school')) {
            parsed.schools = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `sch-imp-${Date.now()}-${i}`),
              code: String(r['Kode'] || r['code'] || `SCH-${i + 1}`),
              name: String(r['Nama Sekolah'] || r['name'] || `Sekolah ${i + 1}`),
              address: String(r['Alamat'] || r['address'] || ''),
              contactPerson: String(r['Kontak PIC'] || r['contactPerson'] || ''),
              phone: String(r['Telepon'] || r['phone'] || ''),
              headCoach: String(r['Pelatih Utama'] || r['headCoach'] || 'Pelatih Panahan'),
              practiceDays: String(r['Hari Latihan'] || r['practiceDays'] || 'Rabu & Sabtu'),
              financialModel: (r['Model Keuangan'] === 'coach_honor' ? 'coach_honor' : 'monthly_fee') as 'monthly_fee' | 'coach_honor',
              monthlyFeePerStudent: Number(r['SPP Bulanan (Rp)']) || 0,
              coachHonorPerSession: Number(r['Honor Pelatih Per Sesi (Rp)']) || 0,
              activeStudentsCount: Number(r['Jumlah Siswa Aktif']) || 0,
            }));
          } else if (nameLower.includes('siswa') || nameLower.includes('student')) {
            parsed.students = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `std-imp-${Date.now()}-${i}`),
              nisn: String(r['NISN'] || r['nisn'] || `100200${i}`),
              name: String(r['Nama Siswa'] || r['name'] || `Siswa ${i + 1}`),
              schoolId: String(r['ID Sekolah'] || r['schoolId'] || 'sch-1'),
              schoolName: String(r['Nama Sekolah'] || r['schoolName'] || 'Sekolah Panahan'),
              grade: String(r['Kelas'] || r['grade'] || 'VII-A'),
              parentName: String(r['Nama Orang Tua'] || r['parentName'] || 'Orang Tua / Wali'),
              parentPhone: String(r['Telepon Orang Tua'] || r['parentPhone'] || ''),
              bowType: (r['Jenis Busur'] || 'Standard Bow') as any,
              targetDistance: (r['Jarak Target'] || '10m') as any,
              joinDate: String(r['Tanggal Masuk'] || r['joinDate'] || new Date().toISOString().substring(0, 10)),
              status: (r['Status'] || 'Aktif') as 'Aktif' | 'Cuti' | 'Alumni',
            }));
          } else if (nameLower.includes('pelatih') || nameLower.includes('coach')) {
            parsed.coaches = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `cch-imp-${Date.now()}-${i}`),
              name: String(r['Nama Pelatih'] || r['name'] || `Pelatih ${i + 1}`),
              roleTitle: String(r['Peran / Gelar'] || r['roleTitle'] || 'Pelatih Panahan'),
              phone: String(r['Telepon'] || r['phone'] || ''),
              specialization: String(r['Keahlian Khusus'] || r['specialization'] || 'Recurve & Standard'),
              licenseNumber: String(r['No Lisensi'] || r['licenseNumber'] || ''),
              assignedSchools: String(r['ID Sekolah Terlibat'] || '').split(',').map((s) => s.trim()).filter(Boolean),
            }));
          } else if (nameLower.includes('jadwal') || nameLower.includes('schedule')) {
            parsed.schedules = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `schd-imp-${Date.now()}-${i}`),
              schoolId: String(r['ID Sekolah'] || r['schoolId'] || 'sch-1'),
              schoolName: String(r['Nama Sekolah'] || r['schoolName'] || 'Sekolah'),
              dayOfWeek: String(r['Hari Latihan'] || r['dayOfWeek'] || 'Rabu & Sabtu'),
              timeSlot: String(r['Jam Latihan'] || r['timeSlot'] || '15:30 - 17:00 WIB'),
              date: String(r['Tanggal Sesi'] || r['date'] || new Date().toISOString().substring(0, 10)),
              location: String(r['Lokasi Field'] || r['location'] || 'Lapangan Archery'),
              coachId: String(r['ID Pelatih'] || r['coachId'] || 'coach-1'),
              coachName: String(r['Nama Pelatih'] || r['coachName'] || 'Pelatih Panahan'),
              targetCount: Number(r['Bantalan Target']) || 6,
            }));
          } else if (nameLower.includes('presensi') || nameLower.includes('attendance')) {
            parsed.attendance = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `att-imp-${Date.now()}-${i}`),
              scheduleId: String(r['ID Jadwal'] || r['scheduleId'] || 'schd-1'),
              studentId: String(r['ID Siswa'] || r['studentId'] || 'std-1'),
              studentName: String(r['Nama Siswa'] || r['studentName'] || 'Siswa'),
              schoolId: String(r['ID Sekolah'] || r['schoolId'] || 'sch-1'),
              schoolName: String(r['Nama Sekolah'] || r['schoolName'] || 'Sekolah'),
              date: String(r['Tanggal'] || r['date'] || new Date().toISOString().substring(0, 10)),
              status: (r['Status Presensi'] || r['status'] || 'Hadir') as any,
              timeIn: String(r['Waktu Masuk'] || r['timeIn'] || '15:30'),
              method: String(r['Metode'] || r['method'] || 'Scan QR') as any,
              notes: String(r['Catatan'] || r['notes'] || ''),
            }));
          } else if (nameLower.includes('skor') || nameLower.includes('score')) {
            parsed.scores = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `scr-imp-${Date.now()}-${i}`),
              scheduleId: String(r['ID Jadwal'] || r['scheduleId'] || 'schd-1'),
              studentId: String(r['ID Siswa'] || r['studentId'] || 'std-1'),
              studentName: String(r['Nama Siswa'] || r['studentName'] || 'Siswa'),
              schoolId: String(r['ID Sekolah'] || r['schoolId'] || 'sch-1'),
              date: String(r['Tanggal'] || r['date'] || new Date().toISOString().substring(0, 10)),
              bowType: (r['Jenis Busur'] || 'Standard Bow') as any,
              distance: (r['Jarak Target'] || '10m') as any,
              ends: [
                { endNumber: 1, arrows: [10, 10, 9, 9, 8, 8] },
                { endNumber: 2, arrows: [10, 9, 9, 8, 8, 7] },
              ],
              totalScore: Number(r['Total Skor']) || 0,
              maxPossibleScore: Number(r['Maks Skor']) || 360,
              averageArrow: Number(r['Rata Arrow']) || 0,
              tenCount: Number(r['Jumlah 10s']) || 0,
              xCount: Number(r['Jumlah Xs']) || 0,
              coachNotes: String(r['Evaluasi Pelatih'] || r['coachNotes'] || ''),
            }));
          } else if (nameLower.includes('pembayaran') || nameLower.includes('spp') || nameLower.includes('payment')) {
            parsed.payments = rows.map((r, i) => ({
              id: String(r['ID'] || r['id'] || `pay-imp-${Date.now()}-${i}`),
              invoiceNumber: String(r['No Invoice'] || r['invoiceNumber'] || `INV-${Date.now()}`),
              studentId: String(r['ID Siswa'] || r['studentId'] || 'std-1'),
              studentName: String(r['Nama Siswa'] || r['studentName'] || 'Siswa'),
              schoolId: String(r['ID Sekolah'] || r['schoolId'] || 'sch-1'),
              schoolName: String(r['Nama Sekolah'] || r['schoolName'] || 'Sekolah'),
              month: String(r['Bulan'] || r['month'] || 'Agustus 2026'),
              amount: Number(r['Nominal (Rp)']) || 0,
              status: (r['Status'] || 'Lunas') as any,
              dueDate: String(r['Jatuh Tempo'] || r['dueDate'] || ''),
              paidDate: String(r['Tanggal Bayar'] || r['paidDate'] || ''),
              paymentMethod: String(r['Metode Pembayaran'] || r['paymentMethod'] || ''),
            }));
          }
        });

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
