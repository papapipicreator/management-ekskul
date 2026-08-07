import React, { useState } from 'react';
import { X, Bell, Send, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { SystemNotification, School } from '../../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  schools: School[];
  onSendNotification: (notif: SystemNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  schools,
  onSendNotification,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetSchoolId, setTargetSchoolId] = useState('ALL');
  const [channel, setChannel] = useState<'WhatsApp' | 'Portal' | 'Email'>('WhatsApp');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'announcement',
      targetSchoolId: targetSchoolId === 'ALL' ? undefined : targetSchoolId,
      read: false,
      channelSent: channel,
    };

    onSendNotification(newNotif);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setTitle('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Pusat Broadcasting Pengumuman & WhatsApp</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Target Sekolah Penerima
              </label>
              <select
                value={targetSchoolId}
                onChange={(e) => setTargetSchoolId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 font-bold"
              >
                <option value="ALL">Semua Sekolah & Orang Tua Siswa</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Kanal Pengiriman Pesan
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    channel === 'WhatsApp'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  WhatsApp Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('Portal')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    channel === 'Portal'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Notifikasi Portal
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('Email')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    channel === 'Email'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Email Blast
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Judul Pengumuman</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Jadwal Latihan Gabungan & Uji Coba Panahan"
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Isi Pesan / Pengumuman</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan detail waktu, lokasi, dan instruksi perlengkapan..."
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5"
              />
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Broadcast berhasil dikirimkan ke {channel}!
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Kirim Pengumuman Broadcast
            </button>
          </form>

          {/* Recent Broadcast Log */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riwayat Broadcast Terbaru</h4>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">{n.channelSent || 'Portal'}</span>
                    <span>{n.timestamp}</span>
                  </div>
                  <p className="font-bold text-white text-xs">{n.title}</p>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
