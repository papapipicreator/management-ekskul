import React, { useState } from 'react';
import { X, Bell, Send, CheckCircle2, MessageSquare, Mail, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { SystemNotification, School, Student } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onSendBroadcast: (newNotif: SystemNotification) => void;
  schools: School[];
  students: Student[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onSendBroadcast,
  schools,
  students,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'broadcast'>('inbox');
  const [broadcastType, setBroadcastType] = useState<'schedule' | 'report' | 'payment'>('schedule');
  const [targetSchoolId, setTargetSchoolId] = useState<string>('ALL');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTriggerPreset = (type: 'schedule' | 'report' | 'payment') => {
    setBroadcastType(type);
    if (type === 'schedule') {
      setCustomTitle('Pengingat Jadwal Latihan Panahan Hari Ini');
      setCustomMessage('Yth. Orang Tua/Wali Siswa. Mengingatkan jadwal latihan Panahan sore ini pukul 15.30 di Lapangan Sekolah. Harap memastikan putra/putri Anda membawa kelengkapan perlengkapan panahan. Terima kasih.');
    } else if (type === 'report') {
      setCustomTitle('Laporan Perkembangan Bulanan Panahan Siswa');
      setCustomMessage('Yth. Orang Tua/Wali. Laporan perkembangan skor panahan & absensi bulan ini telah terbit. Silakan unduh melalui Portal Orang Tua di PanahanEdu.');
    } else if (type === 'payment') {
      setCustomTitle('Pengingat Pembayaran SPP Ekstrakurikuler Panahan');
      setCustomMessage('Yth. Orang Tua/Wali. Tagihan SPP Panahan bulan Agustus 2026 sebesar Rp 150.000 jatuh tempo segera. Pembayaran dapat dilakukan dengan QRIS/Transfer Bank.');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: customTitle || 'Notifikasi Otomatis PanahanEdu',
      message: customMessage || 'Pesan notifikasi berhasil dikirimkan.',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: broadcastType,
      targetSchoolId: targetSchoolId === 'ALL' ? undefined : targetSchoolId,
      read: false,
      channelSent: selectedChannel,
    };

    onSendBroadcast(newNotif);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setActiveTab('inbox');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sistem Notifikasi Otomatis</h3>
              <p className="text-xs text-slate-400">Pengingat Jadwal Latihan & Laporan Perkembangan Orang Tua</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'inbox'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Riwayat Notifikasi ({notifications.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('broadcast');
              if (!customTitle) handleTriggerPreset('schedule');
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'broadcast'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Kirim Pengingat WhatsApp / Email
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'inbox' ? (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Belum ada riwayat notifikasi terkirim.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => onMarkAsRead(notif.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            notif.type === 'schedule'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : notif.type === 'report'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {notif.type === 'schedule'
                            ? 'Jadwal Latihan'
                            : notif.type === 'report'
                            ? 'Laporan Bulanan'
                            : 'Pembayaran SPP'}
                        </span>
                        {notif.channelSent && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                            {notif.channelSent === 'WhatsApp' ? (
                              <MessageSquare className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Mail className="w-3 h-3 text-sky-400" />
                            )}
                            {notif.channelSent}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 mb-1">{notif.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {broadcastSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Notifikasi otomatis berhasil dikirimkan ke WhatsApp Orang Tua!
                </div>
              )}

              {/* Preset Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Pilih Jenis Pengingat Otomatis
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTriggerPreset('schedule')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      broadcastType === 'schedule'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-emerald-400 mb-1" />
                    Pengingat Jadwal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerPreset('report')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      broadcastType === 'report'
                        ? 'bg-sky-950/60 border-sky-500 text-white font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-sky-400 mb-1" />
                    Laporan Perkembangan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerPreset('payment')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      broadcastType === 'payment'
                        ? 'bg-amber-950/60 border-amber-500 text-white font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 mb-1" />
                    Tagihan SPP
                  </button>
                </div>
              </div>

              {/* School Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Target Sekolah
                  </label>
                  <select
                    value={targetSchoolId}
                    onChange={(e) => setTargetSchoolId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">Semua Sekolah Terdaftar ({students.length} Orang Tua)</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Saluran Komunikasi
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('WhatsApp')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${
                        selectedChannel === 'WhatsApp'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp API
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('Email')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${
                        selectedChannel === 'Email'
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" /> Email Gateway
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Message */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Judul notifikasi..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Pesan Notifikasi Kepada Orang Tua
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  placeholder="Tulis pesan pengingat..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Message Preview Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Pratinjau Pesan Terkirim ({selectedChannel})
                </p>
                <p className="text-xs text-emerald-400 font-semibold">{customTitle || 'Judul Notifikasi'}</p>
                <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{customMessage}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inbox')}
                  className="px-4 py-2 text-xs rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Sekarang
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
