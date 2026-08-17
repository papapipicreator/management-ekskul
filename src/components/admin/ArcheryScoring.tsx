import React, { useState } from 'react';
import { Target, Award, Plus, Save, Download, FileSpreadsheet, TrendingUp, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { ArcheryScoreRecord, Student, School, Schedule, ArcheryScoreEnd, BowType, TargetDistance } from '../../types';
import { exportScoresToPdf, exportScoresToExcel } from '../../utils/exportUtils';

interface ArcheryScoringProps {
  students: Student[];
  schools: School[];
  schedules: Schedule[];
  scores: ArcheryScoreRecord[];
  onSaveScore: (record: ArcheryScoreRecord) => void;
  selectedSchoolId: string;
}

export const ArcheryScoring: React.FC<ArcheryScoringProps> = ({
  students,
  schools,
  schedules,
  scores,
  onSaveScore,
  selectedSchoolId,
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'history'>('input');

  // Filtered Students & Schedules
  const availableStudents = selectedSchoolId === 'ALL'
    ? students
    : students.filter((s) => s.schoolId === selectedSchoolId);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(availableStudents[0]?.id || '');
  const activeStudent = students.find((s) => s.id === selectedStudentId) || availableStudents[0];

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(schedules[0]?.id || '');
  const activeSchedule = schedules.find((schd) => schd.id === selectedScheduleId) || schedules[0];

  React.useEffect(() => {
    if (availableStudents.length > 0 && !availableStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(availableStudents[0].id);
    }
  }, [availableStudents, selectedStudentId]);

  React.useEffect(() => {
    if (schedules.length > 0 && !schedules.some((s) => s.id === selectedScheduleId)) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  const [bowType, setBowType] = useState<BowType>(activeStudent?.bowType || 'Standard Bow');
  const [distance, setDistance] = useState<TargetDistance>(activeStudent?.targetDistance || '20m');
  const [coachNotes, setCoachNotes] = useState<string>('');

  // Ends scoring state (6 Ends, each 6 arrows) initialized empty
  const [ends, setEnds] = useState<(number | string)[][]>([
    [], // End 1
    [], // End 2
    [], // End 3
    [], // End 4
    [], // End 5
    [], // End 6
  ]);

  const [activeEndIndex, setActiveEndIndex] = useState<number>(0);

  // Helper to convert arrow score (including 'X') to numeric points
  const getArrowNumericValue = (val: number | string): number => {
    if (val === 'X' || val === 'x') return 10;
    if (typeof val === 'number') return val;
    const num = parseInt(String(val), 10);
    return isNaN(num) ? 0 : num;
  };

  // Update score for arrow in current end
  const handleScoreInput = (value: number | string) => {
    const newEnds = [...ends];
    const currentEnd = [...newEnds[activeEndIndex]];

    if (currentEnd.length < 6) {
      currentEnd.push(value);
    } else {
      currentEnd.shift();
      currentEnd.push(value);
    }
    newEnds[activeEndIndex] = currentEnd;
    setEnds(newEnds);
  };

  const handleClearCurrentEnd = () => {
    const newEnds = [...ends];
    newEnds[activeEndIndex] = [];
    setEnds(newEnds);
  };

  const handleResetAllEnds = () => {
    setEnds([[], [], [], [], [], []]);
    setActiveEndIndex(0);
  };

  // Score calculations
  const allArrows = ends.flat();
  const totalScore = allArrows.reduce((acc, curr) => acc + getArrowNumericValue(curr), 0);
  const totalArrowsCount = allArrows.length;
  const maxPossibleScore = 360; // 6 ends * 6 arrows * 10
  const xCount = allArrows.filter((a) => a === 'X' || a === 'x').length;
  const tenCount = allArrows.filter((a) => a === 10 || a === '10' || a === 'X' || a === 'x').length;
  const averageArrow = totalArrowsCount > 0 ? totalScore / totalArrowsCount : 0;

  const handleSave = () => {
    if (!activeStudent) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    const formattedEnds: ArcheryScoreEnd[] = ends.map((arrs, idx) => ({
      endNumber: idx + 1,
      arrows: arrs,
    }));

    const newRecord: ArcheryScoreRecord = {
      id: `scr-${Date.now()}`,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      schoolId: activeStudent.schoolId,
      scheduleId: selectedScheduleId,
      date: activeSchedule ? activeSchedule.date : new Date().toISOString().substring(0, 10),
      distance,
      bowType,
      ends: formattedEnds,
      totalScore,
      maxPossibleScore,
      tenCount,
      xCount,
      averageArrow,
      coachNotes,
    };

    onSaveScore(newRecord);
    alert(`✅ Skor Panahan ${activeStudent.name} (Total: ${totalScore}) berhasil disimpan!`);
    setEnds([[], [], [], [], [], []]);
    setCoachNotes('');
    setActiveTab('history');
  };

  // Filter score history
  const filteredScores = selectedSchoolId === 'ALL'
    ? scores
    : scores.filter((sc) => sc.schoolId === selectedSchoolId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Input & Evaluasi Skor Panahan Digital
          </h2>
          <p className="text-xs text-slate-400">
            Papan skoring standar World Archery (10 Meter s/d 50 Meter, End 1-6, Rata-rata per anak panah).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportScoresToPdf(filteredScores, 'Rekapitulasi Skor')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" /> Export PDF
          </button>
          <button
            onClick={() => exportScoresToExcel(filteredScores, 'Rekapitulasi Skor')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Excel
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'input'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎯 Papan Input Skor Panahan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📜 Riwayat & Grafik Evaluasi ({filteredScores.length})
        </button>
      </div>

      {activeTab === 'input' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Target Selector & Target Face */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pilih Atlet & Spesifikasi Target
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Pilih Atlet Siswa
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  const s = students.find((st) => st.id === e.target.value);
                  if (s) {
                    setBowType(s.bowType);
                    setDistance(s.targetDistance);
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                {availableStudents.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} - {std.schoolName} ({std.bowType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Jenis Busur
                </label>
                <select
                  value={bowType}
                  onChange={(e) => setBowType(e.target.value as BowType)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2"
                >
                  <option value="Standard Bow">Standard Bow</option>
                  <option value="Recurve">Recurve</option>
                  <option value="Barebow">Barebow</option>
                  <option value="Compound">Compound</option>
                  <option value="Horsebow">Horsebow</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Jarak Target
                </label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value as TargetDistance)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2"
                >
                  <option value="5m">5 Meter</option>
                  <option value="7m">7 Meter</option>
                  <option value="10m">10 Meter</option>
                  <option value="15m">15 Meter</option>
                  <option value="18m">18 Meter</option>
                  <option value="20m">20 Meter</option>
                  <option value="30m">30 Meter</option>
                  <option value="50m">50 Meter</option>
                </select>
              </div>
            </div>

            {/* Target Face Graphical Representation */}
            <div className="pt-2 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Visual Cincin Sasaran World Archery
              </p>
              
              {/* Target Face Rings: Outer White -> Black -> Blue -> Red -> Inner Yellow */}
              <div className="w-56 h-56 mx-auto rounded-full bg-white border-4 border-slate-300 flex items-center justify-center shadow-xl relative transition-transform hover:scale-105">
                {/* Hitam Ring (3-4) */}
                <div className="w-44 h-44 rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center">
                  {/* Biru Ring (5-6) */}
                  <div className="w-32 h-32 rounded-full bg-sky-500 border-4 border-sky-600 flex items-center justify-center">
                    {/* Merah Ring (7-8) */}
                    <div className="w-20 h-20 rounded-full bg-red-600 border-4 border-red-700 flex items-center justify-center">
                      {/* Kuning / Emas Ring Paling Dalam (9-10 & X) */}
                      <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-yellow-500 flex items-center justify-center shadow-inner">
                        <span className="text-xs font-black text-slate-950">+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Ring Legend */}
              <div className="grid grid-cols-5 gap-1 text-[9px] font-bold text-center pt-1">
                <div className="bg-yellow-400 text-slate-950 py-1 px-0.5 rounded-md border border-yellow-500">
                  <span>9-10 (Kuning)</span>
                </div>
                <div className="bg-red-600 text-white py-1 px-0.5 rounded-md border border-red-700">
                  <span>7-8 (Merah)</span>
                </div>
                <div className="bg-sky-500 text-white py-1 px-0.5 rounded-md border border-sky-600">
                  <span>5-6 (Biru)</span>
                </div>
                <div className="bg-slate-950 text-slate-200 py-1 px-0.5 rounded-md border border-slate-800">
                  <span>3-4 (Hitam)</span>
                </div>
                <div className="bg-slate-100 text-slate-900 py-1 px-0.5 rounded-md border border-slate-300">
                  <span>1-2 (Putih)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Scoring Pad & Ends Table */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            {/* Realtime KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Skor</span>
                <span className="text-lg sm:text-xl font-black text-amber-400">{totalScore}</span>
                <span className="text-[10px] text-slate-500 block">/ {maxPossibleScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rata-Rata</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">{averageArrow.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">per anak panah</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jumlah 10s</span>
                <span className="text-lg sm:text-xl font-black text-yellow-300">{tenCount}</span>
                <span className="text-[10px] text-slate-500 block">Emas</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jumlah Xs</span>
                <span className="text-lg sm:text-xl font-black text-sky-400">{xCount}</span>
                <span className="text-[10px] text-slate-500 block">Bullseye</span>
              </div>
            </div>

            {/* End Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Pilih Seri (End 1 s/d 6):</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearCurrentEnd}
                    className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Hapus End Ini
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllEnds}
                    className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Semua End
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const endSum = ends[idx]?.reduce((a, b) => a + getArrowNumericValue(b), 0) || 0;
                  const isCurrent = activeEndIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveEndIndex(idx)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-[10px] block opacity-80">End {idx + 1}</span>
                      <span className="text-xs font-bold">{endSum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current End Arrow Values Display */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Hasil Anak Panah Seri ke-{activeEndIndex + 1}:
              </span>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                  const val = ends[activeEndIndex]?.[slotIdx];
                  let badgeBg = 'bg-slate-900 border-slate-700 text-slate-500';
                  let displayVal = '-';
                  if (val !== undefined) {
                    const numVal = getArrowNumericValue(val);
                    displayVal = val === 'X' ? 'X' : val === 0 ? 'M' : String(val);

                    if (val === 'X') badgeBg = 'bg-amber-400 text-slate-950 font-black border-amber-300 ring-2 ring-amber-400/50';
                    else if (numVal >= 9) badgeBg = 'bg-yellow-400 text-slate-950 font-black border-yellow-500';
                    else if (numVal >= 7) badgeBg = 'bg-red-600 text-white font-bold border-red-700';
                    else if (numVal >= 5) badgeBg = 'bg-sky-500 text-white font-bold border-sky-600';
                    else if (numVal >= 3) badgeBg = 'bg-slate-950 text-slate-100 font-bold border-slate-800';
                    else if (numVal >= 1) badgeBg = 'bg-white text-slate-950 font-bold border-slate-300';
                    else badgeBg = 'bg-slate-700 text-slate-300 font-bold border-slate-600';
                  }

                  return (
                    <div
                      key={slotIdx}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm shadow ${badgeBg}`}
                    >
                      {displayVal}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Numeric Keypad Buttons */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Klik Skor Anak Panah (Sesuai Cincin Target):
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {(['X', 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] as (number | string)[]).map((scoreVal) => (
                  <button
                    key={String(scoreVal)}
                    type="button"
                    onClick={() => handleScoreInput(scoreVal)}
                    className={`py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow ${
                      scoreVal === 'X'
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 hover:bg-amber-300 hover:shadow-amber-500/20 shadow-md ring-1 ring-amber-400/50'
                        : typeof scoreVal === 'number' && scoreVal >= 9
                        ? 'bg-yellow-400/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-400 hover:text-slate-950'
                        : typeof scoreVal === 'number' && scoreVal >= 7
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-600 hover:text-white'
                        : typeof scoreVal === 'number' && scoreVal >= 5
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500 hover:text-white'
                        : typeof scoreVal === 'number' && scoreVal >= 3
                        ? 'bg-slate-950/80 text-slate-200 border-slate-700 hover:bg-slate-900 hover:text-white'
                        : typeof scoreVal === 'number' && scoreVal >= 1
                        ? 'bg-slate-100/20 text-slate-100 border-slate-300/40 hover:bg-white hover:text-slate-950'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {scoreVal === 'X' ? 'X (10)' : scoreVal === 0 ? 'M (Miss)' : scoreVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Coach Evaluation Note */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Catatan Evaluasi Pelatih untuk Siswa & Orang Tua
              </label>
              <textarea
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                rows={2}
                placeholder="Catatan teknik, release, stance, atau poin evaluasi..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan Hasil Skor Panahan Siswa
            </button>
          </div>
        </div>
      ) : (
        /* Score History Table */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-200 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Tanggal / Siswa</th>
                  <th className="py-3.5 px-4">Busur & Jarak</th>
                  <th className="py-3.5 px-4">Total Skor</th>
                  <th className="py-3.5 px-4">Rata-Rata</th>
                  <th className="py-3.5 px-4">10s & Xs</th>
                  <th className="py-3.5 px-4">Evaluasi Pelatih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                      Belum ada riwayat skor terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <p className="font-bold text-slate-100">{sc.studentName}</p>
                        <p className="text-[10px] text-slate-400">{sc.date}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                          {sc.bowType} ({sc.distance})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-sm font-black text-amber-400">{sc.totalScore} / {sc.maxPossibleScore}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-xs font-bold text-emerald-400">{sc.averageArrow.toFixed(2)}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-xs text-slate-300 font-medium">10s: {sc.tenCount} | Xs: {sc.xCount}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <p className="text-xs italic max-w-xs line-clamp-2">"{sc.coachNotes}"</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
