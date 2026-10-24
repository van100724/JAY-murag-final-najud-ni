import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, Banknote, CreditCard, Smartphone, CheckSquare, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const change = amountPaid - total;

  // Escape key to dismiss
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
    return (
      <Receipt 
        sale={completedSale} 
        onClose={handleReceiptClose} 
      />
    );
  }

  const handleConfirm = async () => {
    if (paymentMethod === 'cash' && amountPaid < total) {
      const shortage = total - amountPaid;
      setErrorMessage(`Payment is ₱${shortage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} short of the total ₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Please collect the remaining amount.`);
      return;
    }

    setErrorMessage('');
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
      user?.name || 'Unknown Cashier', // cashier
      customerName ? `${customerName}` : 'Walk-in', // cleaner customer name mapping
      tax,
      total,
      change
    );

    if (sale) {
      clearCart();
      setCompletedSale(sale);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-slate-800">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Confirm Order</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Finalize Payment & Sync Records</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Error diagnosis banner - Heuristic 9 */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-fade-in text-xs leading-relaxed">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 font-semibold">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Amount Due Display */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100 flex items-center justify-between shadow-inner">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount Due</p>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
             <CheckSquare size={28} />
          </div>
        </div>

        <div className="space-y-5 relative z-10">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
              Customer Reference
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c2410c] transition-colors" size={18} />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer (Default)"
                className="w-full bg-slate-50 px-12 py-3.5 rounded-xl outline-none border border-slate-200 focus:bg-white focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <PaymentOption 
                active={paymentMethod === 'cash'} 
                onClick={() => handleSelectPayment('cash')} 
                icon={<Banknote size={18} />} 
                label="Cash" 
              />
              <PaymentOption 
                active={paymentMethod === 'online'} 
                onClick={() => handleSelectPayment('online')} 
                icon={<Smartphone size={18} />} 
                label="Online (GCash/Maya)" 
              />
              <PaymentOption 
                active={paymentMethod === 'card'} 
                onClick={() => handleSelectPayment('card')} 
                icon={<CreditCard size={18} />} 
                label="Credit/Debit" 
              />
              <PaymentOption 
                active={paymentMethod === 'check'} 
                onClick={() => handleSelectPayment('check')} 
                icon={<CheckSquare size={18} />} 
                label="Check" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tendered Amount
                </label>
                {paymentMethod === 'cash' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAmountPaid(total);
                      setErrorMessage('');
                    }}
                    className="text-[9px] font-black uppercase text-[#c2410c] hover:underline"
                  >
                    Exact
                  </button>
                )}
              </div>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">₱</span>
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
                  className="w-full bg-slate-50 pl-8 pr-3 py-3.5 rounded-xl outline-none border border-slate-200 focus:bg-white focus:border-[#c2410c]/30 transition-all text-lg font-black text-slate-900"
                />
              </div>

              {/* Quick Cash Presets - Heuristic 7 */}
              {paymentMethod === 'cash' && (
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                  {[
                    { label: 'Exact', val: total },
                    { label: '+₱50', val: (amountPaid || 0) + 50 },
                    { label: '+₱100', val: (amountPaid || 0) + 100 },
                    { label: '+₱500', val: (amountPaid || 0) + 500 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAmountPaid(p.val);
                        setErrorMessage('');
                      }}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] border border-slate-200 text-[9px] font-bold text-slate-600 transition-all shrink-0"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                Change Return
              </label>
              <div className={`w-full px-4 py-3.5 rounded-xl border flex flex-col justify-center ${
                change >= 0 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                 <span className="text-lg font-black leading-none">
                    ₱{Math.max(0, change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
                 <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-80">
                   {change >= 0 ? 'Change due' : `Short by ₱${Math.abs(change).toFixed(2)}`}
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest"
          >
            Go Back
          </button>

          <button 
            onClick={handleConfirm}
            disabled={paymentMethod === 'cash' && amountPaid < total}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              paymentMethod === 'cash' && amountPaid < total
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-[#c2410c] text-white shadow-xl shadow-orange-900/20 hover:bg-[#9a3412] active:scale-[0.98]'
            }`}
          >
            Complete Transaction
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
        active 
          ? 'bg-orange-50 border-[#c2410c] text-[#c2410c] shadow-sm' 
          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
      }`}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}