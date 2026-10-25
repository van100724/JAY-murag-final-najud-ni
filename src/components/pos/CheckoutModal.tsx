import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, Banknote, CreditCard, Smartphone, CheckSquare, ArrowRight } from 'lucide-react';
import Receipt from './Reciept';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({
  open,
  onClose,
}: CheckoutModalProps) {
  const { cart, createNewSale, clearCart, user } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check' | 'online'>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Usability Heuristic: User Control & Freedom (Esc closes modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !completedSale) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, completedSale]);

  const handleReceiptClose = () => {
    setCompletedSale(null);
    setCustomerName('');
    setAmountPaid(0);
    onClose();
  };

  if (!open) return null;

  if (completedSale) {
    return (
      <Receipt 
        sale={completedSale} 
        onClose={handleReceiptClose} 
      />
    );
  }

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const change = amountPaid - total;

  const handleConfirm = async () => {
    if (amountPaid < total && paymentMethod === 'cash') {
      alert('Insufficient payment amount');
      return;
    }

    const saleItems = cart.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.price,
      discount: 0,
      total: item.quantity * item.price
    }));

    const sale = await createNewSale(
      saleItems,
      paymentMethod,
      amountPaid || total,
      0, // discount
      user?.name || 'Unknown Cashier',
      customerName ? `${customerName}` : 'Walk-in',
      tax,
      total,
      Math.max(0, change)
    );

    if (sale) {
      clearCart();
      setCompletedSale(sale);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in text-slate-800"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] flex items-center justify-center text-white shadow-md shadow-orange-900/20">
              <CheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Confirm Order</h2>
              <p className="text-[11px] font-semibold text-slate-400">Finalize transaction and tender payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - Zero Scroll */}
        <div className="p-6 space-y-4">
          {/* Amount Due Display Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount Due</p>
              <div className="text-3xl font-black tracking-tight text-white mt-0.5">
                ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-1 rounded-full">
                {cart.length} item{cart.length > 1 ? 's' : ''} in cart
              </span>
            </div>
          </div>

          {/* Customer Reference */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <User size={12} className="text-[#c2410c]" />
              <span>Customer Name</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value.replace(/[0-9]/g, ''))}
              onKeyDown={(e) => {
                if (/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                }
              }}
              placeholder="Walk-in Customer (Default)"
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              <PaymentOption 
                active={paymentMethod === 'cash'} 
                onClick={() => {
                  setPaymentMethod('cash');
                  if (amountPaid === 0) setAmountPaid(total);
                }} 
                icon={<Banknote size={16} />} 
                label="Cash" 
              />
              <PaymentOption 
                active={paymentMethod === 'online'} 
                onClick={() => {
                  setPaymentMethod('online');
                  setAmountPaid(total);
                }} 
                icon={<Smartphone size={16} />} 
                label="GCash/Maya" 
              />
              <PaymentOption 
                active={paymentMethod === 'card'} 
                onClick={() => {
                  setPaymentMethod('card');
                  setAmountPaid(total);
                }} 
                icon={<CreditCard size={16} />} 
                label="Card" 
              />
              <PaymentOption 
                active={paymentMethod === 'check'} 
                onClick={() => {
                  setPaymentMethod('check');
                  setAmountPaid(total);
                }} 
                icon={<CheckSquare size={16} />} 
                label="Check" 
              />
            </div>
          </div>

          {/* Tendered Amount & Change Calculation */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Tendered Amount (₱)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-black text-slate-400 text-xs">₱</span>
                <input
                  type="number"
                  step="any"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-sm font-black text-slate-900 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Change Due</label>
              <div className={`w-full py-2 px-3.5 rounded-xl border flex items-center justify-between ${
                change >= 0
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50/70 border-rose-200 text-rose-600'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {change >= 0 ? 'Change' : 'Short'}
                </span>
                <span className="font-mono font-black text-sm">
                  ₱{Math.abs(change || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Cash Presets (Heuristic: Flexibility & Efficiency of Use) */}
          {paymentMethod === 'cash' && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => setAmountPaid(Math.ceil(total))}
                className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Exact (₱{Math.ceil(total)})
              </button>
              {[100, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountPaid(val >= total ? val : Math.ceil(total / val) * val)}
                  className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  ₱{val >= total ? val : Math.ceil(total / val) * val}
                </button>
              ))}
            </div>
          )}

          {/* Action Footer - Always visible, zero scrolling */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleConfirm}
              disabled={amountPaid < total && paymentMethod === 'cash'}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                amountPaid < total && paymentMethod === 'cash' 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] text-white shadow-md shadow-orange-900/20 active:scale-[0.98]'
              }`}
            >
              <span>Complete Sale</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border transition-all cursor-pointer ${
        active 
          ? 'bg-orange-50/80 border-[#c2410c] text-[#c2410c] ring-2 ring-orange-500/20 shadow-2xs' 
          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}