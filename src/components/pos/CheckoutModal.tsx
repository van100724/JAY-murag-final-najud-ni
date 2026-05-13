import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, User, Banknote, CreditCard, Smartphone, CheckSquare, ArrowRight } from 'lucide-react';

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

  if (!open) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const change = amountPaid - total;

  const handleConfirm = async () => {
    if (amountPaid < total && paymentMethod === 'cash') {
      alert('Insufficient payment');
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
      amountPaid,
      0, // discount
      user?.name || 'Unknown Cashier', // cashier
      customerName ? `Customer: ${customerName}` : '',
      tax,
      total,
      change
    );

    if (sale) {
      clearCart();
      onClose();
      alert('Transaction Successful!');
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

        {/* Amount Due Display */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex items-center justify-between shadow-inner">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount Due</p>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">
              ₱{total.toLocaleString()}
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
             <CheckSquare size={32} />
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
              Customer Reference
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c2410c] transition-colors" size={18} />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walking Customer (Default)"
                className="w-full bg-slate-50 px-12 py-4 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PaymentOption 
                active={paymentMethod === 'cash'} 
                onClick={() => setPaymentMethod('cash')} 
                icon={<Banknote size={20} />} 
                label="Cash" 
              />
              <PaymentOption 
                active={paymentMethod === 'online'} 
                onClick={() => setPaymentMethod('online')} 
                icon={<Smartphone size={20} />} 
                label="Online" 
              />
              <PaymentOption 
                active={paymentMethod === 'card'} 
                onClick={() => setPaymentMethod('card')} 
                icon={<CreditCard size={20} />} 
                label="Card" 
              />
              <PaymentOption 
                active={paymentMethod === 'check'} 
                onClick={() => setPaymentMethod('check')} 
                icon={<CheckSquare size={20} />} 
                label="Check" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                Tendered Amount
              </label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₱</span>
                 <input
                  type="number"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-50 pl-8 pr-4 py-4 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 transition-all text-xl font-black text-emerald-600"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                Change Return
              </label>
              <div className="w-full bg-emerald-50 px-4 py-4 rounded-xl border border-emerald-100 flex items-center justify-center">
                 <span className={`text-xl font-black ${change >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                    ₱{Math.max(0, change).toLocaleString()}
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all py-4 rounded-xl font-black text-xs uppercase tracking-widest"
          >
            Go Back
          </button>

          <button 
            onClick={handleConfirm}
            disabled={amountPaid < total && paymentMethod === 'cash'}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              amountPaid < total && paymentMethod === 'cash' 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
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