import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../contexts/AppContext';
import {
  X,
  User,
  Banknote,
  CreditCard,
  Smartphone,
  CheckSquare,
  ArrowRight,
  AlertCircle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import Receipt from './Reciept';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { cart, createNewSale, clearCart, user } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check' | 'online'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const change = amountPaid - total;

  // Escape key to dismiss - Heuristic: User Control & Freedom
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !completedSale) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, completedSale, onClose]);

  // Set default cash tender to exact total on open
  useEffect(() => {
    if (open) {
      setAmountPaid(total);
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [open, total]);

  // Auto-tender exact amount for electronic / card payments
  const handleSelectPayment = (method: 'cash' | 'card' | 'check' | 'online') => {
    setPaymentMethod(method);
    setErrorMessage('');
    if (method !== 'cash') {
      setAmountPaid(total);
    }
  };

  const handleReceiptClose = () => {
    setCompletedSale(null);
    setCustomerName('');
    setAmountPaid(0);
    setErrorMessage('');
    onClose();
  };

  if (!open) return null;

  if (completedSale) {
    return <Receipt sale={completedSale} onClose={handleReceiptClose} />;
  }

  const handleConfirm = async () => {
    if (paymentMethod === 'cash' && amountPaid < total) {
      const shortage = total - amountPaid;
      setErrorMessage(
        `Payment is short by ₱${shortage.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}. Total due is ₱${total.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}.`
      );
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const saleItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0,
        total: item.quantity * item.price,
      }));

      const sale = await createNewSale(
        saleItems,
        paymentMethod,
        amountPaid || total,
        0, // discount
        user?.name || 'Cashier Jay',
        customerName ? customerName.trim() : 'Walk-in Customer',
        tax,
        total,
        Math.max(0, change)
      );

      if (sale) {
        clearCart();
        setCompletedSale(sale);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 sm:p-6 animate-fade-in text-slate-800 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden relative my-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] flex items-center justify-center text-white shadow-md shadow-orange-900/20">
              <CheckSquare size={19} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900">
                Tender Payment
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                Review total, select tender type, and print receipt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 animate-fade-in text-xs leading-relaxed">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Amount Due Display Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total Amount Due
              </p>
              <div className="text-3xl font-black tracking-tight text-white mt-0.5">
                ₱
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3 py-1 rounded-full">
                {cart.length} line{cart.length !== 1 ? 's' : ''} in cart
              </span>
            </div>
          </div>

          {/* Customer Reference */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User size={13} className="text-[#c2410c]" />
                <span>Customer Reference</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomerName('Walk-in Customer')}
                className="text-[10px] font-bold text-[#c2410c] hover:underline cursor-pointer"
              >
                Set Walk-in
              </button>
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Walk-in Customer, Engr. Santos, Hardware Depot"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Payment Tender Method</label>
            <div className="grid grid-cols-4 gap-2">
              <PaymentOption
                active={paymentMethod === 'cash'}
                onClick={() => handleSelectPayment('cash')}
                icon={<Banknote size={17} />}
                label="Cash"
                accent="emerald"
              />
              <PaymentOption
                active={paymentMethod === 'online'}
                onClick={() => handleSelectPayment('online')}
                icon={<Smartphone size={17} />}
                label="GCash/Maya"
                accent="purple"
              />
              <PaymentOption
                active={paymentMethod === 'card'}
                onClick={() => handleSelectPayment('card')}
                icon={<CreditCard size={17} />}
                label="Card"
                accent="blue"
              />
              <PaymentOption
                active={paymentMethod === 'check'}
                onClick={() => handleSelectPayment('check')}
                icon={<FileCheck size={17} />}
                label="Bank Check"
                accent="amber"
              />
            </div>
          </div>

          {/* Tendered Amount & Change Calculation */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Tender Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Tendered (₱)</label>
                {paymentMethod === 'cash' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAmountPaid(total);
                      setErrorMessage('');
                    }}
                    className="text-[10px] font-black uppercase text-[#c2410c] hover:underline cursor-pointer"
                  >
                    Exact
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-black text-slate-400 text-sm">₱</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountPaid || ''}
                  onChange={(e) => {
                    setAmountPaid(Number(e.target.value));
                    setErrorMessage('');
                  }}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-sm font-black text-slate-900 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Quick Cash Presets */}
              {paymentMethod === 'cash' && (
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                  {[
                    { label: 'Exact', val: Math.ceil(total) },
                    { label: '₱500', val: 500 },
                    { label: '₱1,000', val: 1000 },
                    { label: '+₱100', val: (amountPaid || 0) + 100 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAmountPaid(p.val);
                        setErrorMessage('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] border border-slate-200 text-[10px] font-bold text-slate-700 transition-all shrink-0 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Change Due Card */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {change >= 0 ? 'Change to Return' : 'Payment Status'}
              </label>
              <div
                className={`w-full py-2.5 px-3.5 rounded-xl border flex flex-col justify-center transition-all ${
                  change >= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {change === 0 ? 'Exact Amount' : change > 0 ? 'Change Due' : 'Shortage'}
                  </span>
                  <span className="font-mono font-black text-base">
                    ₱
                    {Math.abs(change || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <span className="text-[10px] font-bold mt-0.5 opacity-80">
                  {change === 0
                    ? 'Exact tender (no change)'
                    : change > 0
                    ? 'Return to customer'
                    : `Collect ₱${Math.abs(change).toFixed(2)} more`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || (paymentMethod === 'cash' && amountPaid < total)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                paymentMethod === 'cash' && amountPaid < total
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] text-white shadow-lg shadow-orange-900/20 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Complete & Print</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

function PaymentOption({
  active,
  onClick,
  icon,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent: 'emerald' | 'purple' | 'blue' | 'amber';
}) {
  const accents = {
    emerald: 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20',
    purple: 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20',
    blue: 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20',
    amber: 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border transition-all cursor-pointer ${
        active
          ? `${accents[accent]} shadow-2xs font-bold`
          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );
}