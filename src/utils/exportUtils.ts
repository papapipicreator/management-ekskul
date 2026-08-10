import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { StudentAttendance, ArcheryScoreRecord, SppPayment, Student } from '../types';

export const exportAttendanceToPdf = (
  records: StudentAttendance[],
  students: Student[],
  schoolName: string = 'Semua Sekolah'
) => {
  const getDayName = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return days[d.getDay()];
    } catch {
      return '-';
    }
  };

  const doc = new jsPDF();
  doc.setFontSize(15);
  doc.text('PANAHAN BANDUNG - LAPORAN PRESENSI KEHADIRAN SISWA', 14, 15);
  doc.setFontSize(10);
  doc.text(`Sekolah: ${schoolName} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

  const tableData = records.map((r, idx) => {
    const student = students.find((s) => s.id === r.studentId || s.name.toLowerCase() === r.studentName.toLowerCase());
    const kelas = student?.grade || student?.classGrade || '–';
    const hari = getDayName(r.date);
    return [
      idx + 1,
      r.studentName,
      kelas,
      r.schoolName || schoolName,
      `${hari}, ${r.date}`,
      r.status,
      r.timeIn || '-',
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [['No', 'Nama Siswa', 'Kelas', 'Sekolah', 'Hari & Tgl Latihan', 'Data Kehadiran', 'Jam Masuk']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(`Presensi_Siswa_${schoolName.replace(/\s+/g, '_')}.pdf`);
};

export const exportAttendanceToExcel = (
  records: StudentAttendance[],
  students: Student[],
  schoolName: string = 'Semua Sekolah'
) => {
  const getDayName = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return days[d.getDay()];
    } catch {
      return '-';
    }
  };

  const data = records.map((r, idx) => {
    const student = students.find((s) => s.id === r.studentId || s.name.toLowerCase() === r.studentName.toLowerCase());
    const kelas = student?.grade || student?.classGrade || '–';
    return {
      No: idx + 1,
      'Nama Siswa': r.studentName,
      Kelas: kelas,
      'Nama Sekolah': r.schoolName || schoolName,
      'Hari Latihan': getDayName(r.date),
      'Tanggal Latihan': r.date,
      'Data Kehadiran': r.status,
      'Jam Masuk': r.timeIn || '-',
      Metode: r.method || 'Manual',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi Siswa');
  XLSX.writeFile(workbook, `Data_Presensi_Siswa_${schoolName.replace(/\s+/g, '_')}.xlsx`);
};

export const exportScoresToPdf = (
  scores: ArcheryScoreRecord[],
  title: string = 'Rekapitulasi Skor'
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`PANAHAN BANDUNG - ${title.toUpperCase()}`, 14, 15);
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

  const tableData = scores.map((s, idx) => [
    idx + 1,
    s.date,
    s.studentName,
    `${s.bowType} (${s.distance})`,
    `${s.totalScore} / ${s.maxPossibleScore}`,
    s.averageArrow.toFixed(2),
    `10s: ${s.tenCount} | Xs: ${s.xCount}`,
    s.coachNotes,
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['No', 'Tanggal', 'Nama Atlet', 'Busur & Jarak', 'Total Skor', 'Rata-Rata', 'Emas (10/X)', 'Catatan Pelatih']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11] },
  });

  doc.save(`Skor_Panahan_${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportScoresToExcel = (
  scores: ArcheryScoreRecord[],
  title: string = 'Rekapitulasi Skor'
) => {
  const data = scores.map((s, idx) => ({
    No: idx + 1,
    Tanggal: s.date,
    'Nama Atlet': s.studentName,
    'Jenis Busur': s.bowType,
    Jarak: s.distance,
    'Total Skor': s.totalScore,
    'Maks Skor': s.maxPossibleScore,
    'Rata-Rata Arrow': s.averageArrow.toFixed(2),
    'Jumlah 10s': s.tenCount,
    'Jumlah Xs': s.xCount,
    'Evaluasi Pelatih': s.coachNotes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Skor Panahan');
  XLSX.writeFile(workbook, `Skor_Panahan_${title.replace(/\s+/g, '_')}.xlsx`);
};

export const exportPaymentsToPdf = (
  payments: SppPayment[],
  monthPeriod: string = 'Agustus 2026'
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('PANAHAN BANDUNG - LAPORAN REKAPITULASI SPP BULANAN', 14, 15);
  doc.setFontSize(10);
  doc.text(`Periode: ${monthPeriod} | Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

  const tableData = payments.map((p, idx) => [
    idx + 1,
    p.invoiceNumber,
    p.studentName,
    p.schoolName,
    `Rp ${p.amount.toLocaleString('id-ID')}`,
    p.status,
    p.paidDate || '-',
    p.paymentMethod || '-',
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['No', 'No. Invoice', 'Nama Siswa', 'Sekolah', 'Nominal SPP', 'Status', 'Tgl Bayar', 'Metode']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [14, 116, 144] },
  });

  doc.save(`Rekap_SPP_Panahan_${monthPeriod.replace(/\s+/g, '_')}.pdf`);
};

export const exportPaymentsToExcel = (payments: SppPayment[]) => {
  const data = payments.map((p, idx) => ({
    No: idx + 1,
    'No Invoice': p.invoiceNumber,
    'Nama Siswa': p.studentName,
    Sekolah: p.schoolName,
    Bulan: p.month,
    'Nominal (Rp)': p.amount,
    Status: p.status,
    'Jatuh Tempo': p.dueDate,
    'Tanggal Bayar': p.paidDate || '-',
    'Metode Pembayaran': p.paymentMethod || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap SPP');
  XLSX.writeFile(workbook, `Rekap_SPP_Panahan.xlsx`);
};

export const downloadInvoicePdf = (payment: SppPayment) => {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42); // slate 900
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('PANAHAN BANDUNG OFFICIAL', 14, 20);
  doc.setFontSize(10);
  doc.text('KUITANSI PEMBAYARAN SPP PANAHAN RESMI', 14, 28);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(`No. Kuitansi: ${payment.invoiceNumber}`, 14, 52);
  doc.text(`Tanggal: ${payment.paidDate || new Date().toLocaleDateString('id-ID')}`, 14, 60);

  doc.setLineWidth(0.5);
  doc.line(14, 65, 196, 65);

  doc.setFontSize(11);
  doc.text(`Telah Terima Dari : ${payment.studentName}`, 14, 78);
  doc.text(`Asal Sekolah      : ${payment.schoolName}`, 14, 88);
  doc.text(`Untuk Pembayaran   : SPP Ekstrakurikuler Panahan Bulanan (${payment.month})`, 14, 98);
  doc.text(`Metode Bayar       : ${payment.paymentMethod || 'QRIS Digital Transfer'}`, 14, 108);

  doc.setFillColor(240, 253, 244); // light green
  doc.rect(14, 118, 182, 20, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(14);
  doc.text(`JUMLAH: Rp ${payment.amount.toLocaleString('id-ID')}`, 20, 131);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('Status: TERVERIFIKASI LUNAS (SYSTEM AUTOMATED RECEIPT)', 14, 150);
  doc.text('Terima kasih atas keikutsertaan Anda dalam program pengembangan bakat panahan.', 14, 156);

  doc.save(`Kuitansi_SPP_${payment.studentName.replace(/\s+/g, '_')}_${payment.month}.pdf`);
};

export const downloadSchoolInvoicePdf = (
  school: { name: string; contactPerson: string; phone: string; coachHonorPerSession?: number },
  sessionCount: number,
  totalAmount: number,
  monthPeriod: string = 'Agustus 2026'
) => {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42); // slate 900
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('INVOICE TAGIHAN EKSTRAKURIKULER PANAHAN', 14, 20);
  doc.setFontSize(10);
  doc.text(`PANAHAN BANDUNG MANAGEMENT • Periode: ${monthPeriod}`, 14, 28);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(`Ditagihkan Kepada : ${school.name}`, 14, 52);
  doc.text(`Kontak / PIC      : ${school.contactPerson} (${school.phone})`, 14, 60);
  doc.text(`Tanggal Invoice   : ${new Date().toLocaleDateString('id-ID')}`, 14, 68);

  doc.setLineWidth(0.5);
  doc.line(14, 73, 196, 73);

  autoTable(doc, {
    startY: 78,
    head: [['Deskripsi Layanan Panahan', 'Jumlah Sesi Kedatangan', 'Tarif Honor / Sesi', 'Total Tagihan']],
    body: [
      [
        `Honor Kedatangan Pelatih Panahan - ${school.name} (${monthPeriod})`,
        `${sessionCount} Sesi Kehadiran`,
        `Rp ${(school.coachHonorPerSession || 0).toLocaleString('id-ID')}`,
        `Rp ${totalAmount.toLocaleString('id-ID')}`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [217, 119, 6] },
  });

  doc.setFillColor(254, 243, 199); // amber 100
  doc.rect(14, 110, 182, 22, 'F');
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(14);
  doc.text(`TOTAL DITAGIHKAN SEKOAH: Rp ${totalAmount.toLocaleString('id-ID')}`, 20, 124);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('Catatan: Siswa di sekolah ini BEBAS SPP karena menggunakan skema Honor Kedatangan Pelatih.', 14, 142);
  doc.text('Mohon transfer pembayaran ke rekening resmi Panahan Bandung sebelum tanggal 10 bulan berjalan.', 14, 148);

  doc.save(`Invoice_Sekolah_${school.name.replace(/\s+/g, '_')}_${monthPeriod.replace(/\s+/g, '_')}.pdf`);
};
