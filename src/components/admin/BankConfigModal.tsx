import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { BankAccountConfig } from '../../types';

interface BankConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankConfig: BankAccountConfig;
  onSaveConfig: (newConfig: BankAccountConfig) => void;
}

export const BankConfigModal: React.FC<BankConfigModalProps> = ({
  isOpen,
  onClose,
  bankConfig,
  onSaveConfig,
}) => {
  const [bankName, setBankName] = useState(bankConfig.bankName);
  const [accountNumber, setAccountNumber] = useState(bankConfig.accountNumber);
  const [accountHolder, setAccountHolder] = useState(bankConfig.accountHolder);
  const [qrisNmid, setQrisNmid] = useState(bankConfig.qrisNmid);
  const [instructions, setInstructions] = useState(bankConfig.instructions || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBankName(bankConfig.bankName);
      setAccountNumber(bankConfig.accountNumber);
      setAccountHolder(bankConfig.accountHolder);
      setQrisNmid(bankConfig.qrisNmid);
      setInstructions(bankConfig.instructions || '');
      setSavedSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, bankConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bankName.trim()) {
      setErrorMsg('Nama Bank tidak boleh kosong!');
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMsg('Nomor Rekening tidak boleh kosong!');
      return;
    }
    if (!accountHolder.trim()) {
      setErrorMsg('Nama Pemilik Rekening tidak boleh kosong!');
      return;
    }

    const updated: BankAccountConfig = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      qrisNmid: qrisNmid.trim() || 'ID10293847120 - Panahan Bandung Official',
      instructions: instructions.trim(),
    };

    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefault = () => {
    setBankName('Bank Syariah Indonesia (BSI)');
    setAccountNumber('7829102938');
    setAccountHolder('Panahan Bandung Official');
    setQrisNmid('ID10293847120 - Panahan Bandung Official');
    setInstructions('Harap cantumkan Nama Siswa & Bulan Tagihan saat melakukan transfer.');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pengaturan Rekening & QRIS SPP</h3>
              <p className="text-xs text-slate-400">Atur nomor rekening tujuan transfer yang akan tampil di Portal Orang Tua</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-emerald-400 text-xs font-medium shrink-0">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Rekening & QRIS berhasil diperbarui! Terkoneksi otomatis ke Portal Orang Tua.</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-xs font-medium shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Bank Selection / Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Nama Bank Tujuan
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: Bank Syariah Indonesia (BSI) / BCA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500">BCA, BSI, Mandiri, BRI, CIMB Niaga, dll.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Nomor Rekening / Virtual Account
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 7829102938"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Account Holder Name & QRIS NMID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Atas Nama Pemilik Rekening (A.N.)
              </label>
              <input
                type="text"
                required
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Contoh: Panahan Bandung Official / Yayasan Panahan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Kode / NMID QRIS Digital
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={qrisNmid}
                  onChange={(e) => setQrisNmid(e.target.value)}
                  placeholder="Contoh: ID10293847120 - Panahan Bandung"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Transfer Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Catatan Instruksi Transfer (Opsional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Contoh: Harap sertakan nama siswa & bulan tagihan pada berita transfer."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Live Preview Tampilan di Portal Orang Tua
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Terkoneksi Real-time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Transfer Bank:</p>
                <p className="font-bold text-white text-xs">{bankName || 'Nama Bank'}</p>
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg font-mono text-emerald-400 font-bold border border-slate-800">
                  <span>{accountNumber || '0000 0000 0000'}</span>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[10px] text-slate-400">A.N. <strong className="text-slate-200">{accountHolder || 'Atas Nama'}</strong></p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Scan QRIS Instant:</p>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">QRIS All Payment</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate max-w-[160px]">NMID: {qrisNmid}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-between">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset ke Default BSI
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan & Hubungkan ke Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
