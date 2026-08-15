import React, { useState } from 'react';
import { Target, Award, CreditCard, QrCode, Calendar, CheckCircle2, TrendingUp, Download, Sparkles, AlertCircle, Bell } from 'lucide-react';
import { Student, StudentAttendance, ArcheryScoreRecord, SppPayment, Schedule, BankAccountConfig, SystemNotification } from '../../types';
import { getStudentQrCodeImgUrl } from '../../utils/qrUtils';

interface StudentPortalProps {
  student: Student;
  attendance: StudentAttendance[];
  scores: ArcheryScoreRecord[];
  payments: SppPayment[];
  schedules: Schedule[];
  notifications?: SystemNotification[];
  onPaySpp?: (paymentId: string, method: string) => void;
  bankConfig?: BankAccountConfig;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  attendance,
  scores,
  payments,
  schedules,
  notifications = [],
  onPaySpp,
  bankConfig,
}) => {
  // Student specific data
  const myAttendance = attendance.filter((a) => a.studentId === student.id);
  const myScores = scores.filter((s) => s.studentId === student.id);
  const myPayments = payments.filter((p) => p.studentId === student.id);
  const mySchedule = schedules.find((s) => s.schoolId === student.schoolId);

  // Statistics
  const latestScore = myScores[0] || myScores[myScores.length - 1];
  const totalArrowCount = myScores.reduce((acc, curr) => acc + curr.ends.flatMap((e) => e.arrows).length, 0);
  const highestScore = myScores.length > 0 ? Math.max(...myScores.map((s) => s.totalScore)) : 0;
  const totalPresenceCount = myAttendance.filter((a) => a.status === 'Hadir').length;

  // Filter notifications: Only public/general announcements OR announcements for student's school
  const relevantNotifications = notifications.filter((n) => {
    if (!n.targetSchoolId || n.targetSchoolId === 'ALL') return true;
    if (n.targetSchoolId === student.schoolId) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Student Identity Card Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={student.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg"
          />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Kartu Anggota Atlet Panahan
            </span>
            <h1 className="text-xl font-black text-white">{student.name}</h1>
            <p className="text-xs text-slate-300">
              {student.schoolName} • {student.grade}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-md font-medium border border-slate-700">
                {student.bowType}
              </span>
              <span className="bg-slate-800 text-sky-300 px-2.5 py-0.5 rounded-md font-medium border border-slate-700">
                Jarak: {student.targetDistance}
              </span>
            </div>
          </div>
        </div>

        {/* Digital Member QR Code */}
        <div className="bg-white p-3.5 rounded-2xl shadow-xl text-center space-y-1.5 text-slate-900 border-2 border-emerald-500/30">
          <img src={getStudentQrCodeImgUrl(student)} alt="QR Member" className="w-24 h-24 mx-auto" />
          <div>
            <p className="text-[10px] font-mono font-black text-slate-900">NISN: {student.nisn}</p>
            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-tight">Direct Presensi HP</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Skor Tertinggi</span>
          <p className="text-2xl font-black text-amber-400">{highestScore} <span className="text-xs text-slate-500">/ 360</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rata-Rata Arrow</span>
          <p className="text-2xl font-black text-emerald-400">{latestScore ? latestScore.averageArrow.toFixed(2) : '-'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Kehadiran</span>
          <p className="text-2xl font-black text-sky-400">{totalPresenceCount} <span className="text-xs text-slate-500">Sesi</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Anak Panah Dilepas</span>
          <p className="text-2xl font-black text-purple-400">{totalArrowCount} <span className="text-xs text-slate-500">Arrows</span></p>
        </div>
      </div>

      {/* Main Grid: Scoring History & SPP Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scores & Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" /> Hasil Rekapitulasi Evaluasi Skoring Panahan
            </h3>

            {myScores.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada catatan skor panahan terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {myScores.map((sc) => (
                  <div key={sc.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono">{sc.date}</span>
                      <span className="text-amber-400 font-bold">{sc.bowType} ({sc.distance})</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-2xl font-black text-amber-400">{sc.totalScore}</span>
                        <span className="text-xs text-slate-500"> / {sc.maxPossibleScore}</span>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-emerald-400 font-bold block">Rata-rata: {sc.averageArrow.toFixed(2)}</span>
                        <span className="text-slate-400 text-[10px]">10s: {sc.tenCount} | Xs: {sc.xCount}</span>
                      </div>
                    </div>

                    <p className="text-xs italic text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      "{sc.coachNotes}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: SPP Bills & Portal Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Tagihan SPP Ekstrakurikuler
            </h3>

            <div className="space-y-3">
              {myPayments.map((p) => {
                const isFreeSpp = p.amount === 0;

                return (
                  <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{p.month}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isFreeSpp
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                            : p.status === 'Lunas'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isFreeSpp ? 'Bebas SPP' : p.status}
                      </span>
                    </div>

                    {isFreeSpp ? (
                      <div>
                        <p className="text-lg font-black text-sky-400">Rp 0</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Sekolah kamu menggunakan skema Honor Kedatangan Pelatih. Bebas tagihan SPP bulanan.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-black text-amber-400">
                          Rp {p.amount.toLocaleString('id-ID')}
                        </p>

                        {p.status !== 'Lunas' ? (
                          <p className="text-[10px] text-amber-400 font-mono">Status: {p.status} (Dikonfirmasi oleh Admin)</p>
                        ) : (
                          <p className="text-[10px] text-emerald-400 font-mono">Lunas: {p.paidDate} ({p.paymentMethod})</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" /> Informasi & Pengumuman Ekskul
            </h3>

            {relevantNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Tidak ada pengumuman baru untuk sekolah kamu.
              </p>
            ) : (
              <div className="space-y-3">
                {relevantNotifications.map((n) => (
                  <div key={n.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-400 block">{n.title}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-purple-500/20 text-purple-300 border-purple-500/30 shrink-0">
                        {!n.targetSchoolId || n.targetSchoolId === 'ALL' ? 'Pengumuman Umum' : 'Khusus Sekolah'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                    <span className="text-[9px] text-slate-500 font-mono block pt-1">{n.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
