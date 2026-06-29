/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Receipt, ArrowRight, Printer, Phone } from 'lucide-react';
import { FeeInvoice, Student } from '../types';

interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FeeInvoice;
  student: Student;
  onPaymentSuccess: (invoiceId: string, paymentMethod: string) => void;
}

export default function FeePaymentModal({
  isOpen,
  onClose,
  invoice,
  student,
  onPaymentSuccess
}: FeePaymentModalProps) {
  const [method, setMethod] = useState<'evc' | 'edahab'>('evc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'pin' | 'success'>('details');

  // Mobile money details state
  const [phoneInput, setPhoneInput] = useState('614520120');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectMethod = (selectedMethod: 'evc' | 'edahab') => {
    setMethod(selectedMethod);
    if (selectedMethod === 'evc') {
      setPhoneInput('614520120');
    } else {
      setPhoneInput('624520120');
    }
  };

  const handleInitiatePayment = () => {
    if (!phoneInput.trim()) {
      setPinError('Fadlan geli lambarkaaga mobile-ka!');
      return;
    }
    setPinError(null);
    setStep('pin');
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('Fadlan geli PIN-kaaga si aad u bixiso lacagta!');
      return;
    }
    if (pinInput.length < 4) {
      setPinError('PIN-ka waa inuu ka koobnaadaa ugu yaraan 4 lambar.');
      return;
    }

    setIsProcessing(true);
    setPinError(null);
    
    // Simulate mobile network gateway API integration (Hormuud/Telesom API)
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 1500);
  };

  const handleDone = () => {
    const paymentMethodLabel = method === 'evc' ? 'EVC Plus' : 'eDahab';
    onPaymentSuccess(invoice.id, `${paymentMethodLabel} (${phoneInput})`);
    setStep('details');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 shadow-2xl" id="fee-payment-overlay">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden border border-slate-100 z-10 font-sans shadow-2xl"
          id="fee-payment-content"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Receipt className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Adeega Lacag-bixinta (EVC Plus / eDahab)</h3>
            </div>
            <button
               onClick={onClose}
               className="p-1 px-[5px] text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
               id="payment-modal-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'details' && (
            <div className="p-6 space-y-6">
              {/* Invoice Banner */}
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-semibold">ARDAYGA (STUDENT)</span>
                  <span className="font-semibold">ID-GA BIILKA</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                    <p className="text-xs text-slate-500">{student.grade} - {student.section}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-600 px-2 py-1 bg-slate-100 rounded font-bold">
                    {invoice.id}
                  </span>
                </div>

                <div className="h-px bg-slate-200/60 my-2" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-450 uppercase tracking-wide font-medium">Ujeedada Biilka</p>
                    <h5 className="font-bold text-slate-800 text-sm line-clamp-1">{invoice.title}</h5>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-450 uppercase tracking-wide font-medium font-sans">Lacagta (Amount)</p>
                    <span className="font-bold text-lg text-emerald-600">${invoice.amount.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Dooro Nuuca Lacag-bixinta</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('evc')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all cursor-pointer text-center relative ${
                      method === 'evc'
                        ? 'bg-amber-50 text-amber-800 border-amber-400 ring-4 ring-amber-100/55'
                        : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                      EVC
                    </div>
                    <div>
                      <p className="text-xs font-bold">EVC Plus</p>
                      <p className="text-[9px] text-amber-950 font-medium">Hormuud Telecom</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('edahab')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all cursor-pointer text-center relative ${
                      method === 'edahab'
                        ? 'bg-teal-50 text-teal-850 border-teal-500 ring-4 ring-teal-150/55'
                        : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                      eD
                    </div>
                    <div>
                      <p className="text-xs font-bold">eDahab</p>
                      <p className="text-[9px] text-teal-900 font-medium">Somtel Mobile Money</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Number entry */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Lambarka Telefoonka (Mobile Number)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Geli lambarka telefoonka..."
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Tusaale ahaan: EVC Plus: <span className="font-bold font-mono">614520120</span> ama eDahab: <span className="font-bold font-mono">624520120</span></p>
              </div>

              {/* Checkout Warning */}
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                🔒 Nidaamku wuxuu si toos ah (API-secure gateway) ugu xiran yahay Hormuud & Telesom. Bixintu waa mid ammaan ah.
              </p>

              {/* Pay Action Button */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                className="w-full py-3.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                Bilow Bixinta (${invoice.amount.toLocaleString()})
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'pin' && (
            <div className="p-6 space-y-6">
              {/* Custom USSD/API Prompt notification style */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[11px] text-indigo-400 font-extrabold uppercase tracking-widest">Awoodsiinta Gateway-ka</p>
                  <h4 className="font-bold text-sm text-slate-100">Fadlan geli PIN-kaaga si loo ogolaado lacagta</h4>
                  <p className="text-xs text-slate-400">Lambarka: <span className="font-bold text-white font-mono">{phoneInput}</span> ({method === 'evc' ? 'EVC Plus' : 'eDahab'})</p>
                </div>

                <form onSubmit={handleConfirmPin} className="w-full space-y-4">
                  <div className="space-y-1">
                    <input
                      type="password"
                      maxLength={8}
                      placeholder="Geli 4 goor ama ka badan PIN..."
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center tracking-widest text-[#FFF] bg-slate-955 bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-lg font-bold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                      autoFocus
                    />
                    {pinError && (
                      <p className="text-[11px] text-rose-400 text-center font-bold mt-1.5">⚠️ {pinError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="w-full py-2.5 bg-slate-805 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Dib u Noqo
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Goynaya...
                        </>
                      ) : (
                        'Xaqiiji & Bixi'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-6 space-y-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Ujrada Sifada Cusub Waa La Bixiyay</h4>
                <p className="text-xs text-slate-450 font-sans font-medium">Simulated Mobile Transaction Complete</p>
              </div>

              {/* Physical Receipt replica */}
              <div className="border border-dashed border-slate-200 bg-slate-50/70 rounded-2xl p-5 text-left font-mono text-xs text-slate-600 space-y-2.5 relative overflow-hidden">
                {/* Visual side notches */}
                <div className="absolute left-0 top-1/2 -ml-2 -mt-2 w-4 h-4 rounded-full bg-white border border-slate-200" />
                <div className="absolute right-0 top-1/2 -mr-2 -mt-2 w-4 h-4 rounded-full bg-white border border-slate-200" />

                <div className="text-center font-bold text-slate-800 text-sm tracking-widest uppercase">IBNU KHUZEYMA ACADEMY</div>
                <div className="text-center text-[9px] text-slate-400 uppercase tracking-widest">RECEIPT FOR FEE SETTLEMENT</div>

                <div className="h-px bg-slate-200 my-1.5" />

                <div className="flex justify-between">
                  <span>Student ID:</span>
                  <span className="font-bold text-slate-808 text-slate-800">{student.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Name:</span>
                  <span className="font-bold text-slate-808 text-slate-800">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fasal / Grade:</span>
                  <span>{student.grade} - {student.section}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Account:</span>
                  <span className="font-bold font-mono">{phoneInput}</span>
                </div>
                <div className="flex justify-between">
                  <span>Adeega (Method):</span>
                  <span className="font-bold uppercase text-indigo-750">{method === 'evc' ? 'EVC Plus' : 'eDahab'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ref ID:</span>
                  <span className="font-semibold text-slate-700">TXN-{Math.floor(Math.random() * 900000 + 100000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payer/Hooyo/Aabe:</span>
                  <span className="truncate max-w-[150px]">{student.parentName}</span>
                </div>

                <div className="h-px bg-slate-200 my-1.5" />

                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>PAYMENT AMOUNT:</span>
                  <span className="text-emerald-600">${invoice.amount.toLocaleString()}.00 USD</span>
                </div>

                <div className="text-center text-[9px] text-slate-400 italic pt-2">
                  Mahadsanid. Biilkaaga dugsiga waa la bixiyey si guul leh.
                </div>
              </div>

              {/* Action columns */}
              <div className="grid grid-cols-2 gap-3 pt-1.5">
                <button
                  type="button"
                  onClick={() => alert(`Spack-receipt printed successfully:\nIBNU KHUZEYMA ACADEMY\nStudent: ${student.name}\nAmount: $${invoice.amount}\nMethod: ${method === 'evc' ? 'EVC Plus' : 'eDahab'}\nDate: ${new Date().toLocaleDateString()}`)}
                  className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className="p-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
                >
                  Dib ugu laabo
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
