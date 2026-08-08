import React, { useState } from 'react';
import { X, CreditCard, QrCode, Building, CheckCircle2, Copy, Sparkles, Download, ArrowRight } from 'lucide-react';
import { SppPayment, BankAccountConfig } from '../../types';
import { downloadInvoicePdf } from '../../utils/exportUtils';

interface SppPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: SppPayment;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  bankConfig?: BankAccountConfig;
}

export const SppPaymentModal: React.FC<SppPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  onPaymentSuccess,
  bankConfig = {
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7829102938',
    accountHolder: 'PanahanEdu Official',
    qrisNmid: 'ID10293847120 - PanahanEdu Official',
    instructions: 'Harap cantumkan Nama Siswa & Bulan Tagihan saat melakukan transfer.',
  },
}) => {
  const [method, setMethod] = useState<'qris' | 'bank' | 'ewallet'>('qris');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyVa = () => {
    navigator.clipboard.writeText(bankConfig.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const methodName =
        method === 'qris'
          ? 'QRIS Instant Payment'
          : method === 'bank'
          ? `Transfer Bank (${bankConfig.bankName})`
          : 'Gopay / E-Wallet';
      onPaymentSuccess(payment.id, methodName);
    }, 1500);
  };


  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Pembayaran SPP Online</h3>
              <p className="text-[11px] text-slate-300">{payment.studentName} - {payment.month}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isSuccess ? (
            <>
              {/* Payment Summary Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>No. Invoice:</span>
                  <span className="font-mono text-slate-200">{payment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Total Tagihan SPP:</span>
                  <span className="text-lg font-black text-amber-400">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('qris')}
                    className={`p-3 rounded-2xl border text-center text-xs transition-all ${
                      method === 'qris'
                        ? 'bg-emerald-950 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    QRIS Instant
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`p-3 rounded-2xl border text-center text-xs transition-all ${
                      method === 'bank'
                        ? 'bg-emerald-950 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                    Transfer Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('ewallet')}
                    className={`p-3 rounded-2xl border text-center text-xs transition-all ${
                      method === 'ewallet'
                        ? 'bg-emerald-950 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    Gopay/OVO
                  </button>
                </div>
              </div>

              {/* Method Dynamic Display */}
              {method === 'qris' && (
                <div className="bg-white p-4 rounded-2xl text-center text-slate-900 space-y-2 shadow">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Scan Kode QRIS Resmi PanahanEdu
                  </p>
                  <div className="w-40 h-40 mx-auto bg-slate-900 rounded-xl p-2 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                    <QrCode className="w-32 h-32 text-emerald-400" />
                  </div>
                  <p className="text-[10px] font-mono text-slate-600 bg-slate-100 py-1 px-2 rounded-lg inline-block">
                    NMID: {bankConfig.qrisNmid}
                  </p>
                </div>
              )}

              {method === 'bank' && (
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-sky-500/30 space-y-3 text-xs shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">Bank Tujuan Transfer:</span>
                    <span className="text-sky-400 font-bold bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                      {bankConfig.bankName}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nomor Rekening Resmi:</span>
                    <div className="bg-slate-950 p-3 rounded-xl flex items-center justify-between border border-slate-800 font-mono text-sm text-emerald-400 font-bold">
                      <span>{bankConfig.accountNumber}</span>
                      <button
                        type="button"
                        onClick={handleCopyVa}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 rounded-lg flex items-center gap-1 text-[10px] transition-all font-sans font-medium"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? 'Tersalin!' : 'Salin Rekening'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px] border-t border-slate-700/80">
                    <span className="text-slate-400">Atas Nama (A.N.):</span>
                    <span className="font-bold text-slate-100">{bankConfig.accountHolder}</span>
                  </div>

                  {bankConfig.instructions && (
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] text-amber-300/90 leading-tight">
                      📌 <strong>Catatan:</strong> {bankConfig.instructions}
                    </div>
                  )}
                </div>
              )}

              {method === 'ewallet' && (
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs">
                  <p className="text-slate-300">
                    Klik tombol di bawah untuk menyambungkan dengan e-Wallet Gopay, OVO, atau ShopeePay Anda.
                  </p>
                </div>
              )}

              {/* Submit / Simulate Button */}
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Memproses Pembayaran Digital...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Konfirmasi Bayar Rp {payment.amount.toLocaleString('id-ID')}
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Pembayaran SPP Berhasil!</h3>
                <p className="text-xs text-slate-300">
                  Terima kasih, tagihan SPP Panahan bulan {payment.month} telah lunas terverifikasi.
                </p>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => downloadInvoicePdf({ ...payment, status: 'Lunas', paidDate: new Date().toLocaleDateString('id-ID') })}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" /> Unduh Kuitansi PDF Resmi
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Tutup Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
