import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import CheckoutModal from './CheckoutModal';

export default function CartPanel() {
  const { cart, removeFromCart, updateCartQty } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  return (
    <div className="bg-[#1a202c] rounded-2xl shadow-2xl h-full flex flex-col min-h-0 overflow-hidden text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c2410c] rounded-lg flex items-center justify-center shadow-lg">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Current Order</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{cart.length} Items Selected</p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Cart is Empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-4 group animate-fade-in"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">{item.productName}</h3>
                <p className="text-xs font-black text-[#c2410c] mt-0.5">₱{item.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                  <button 
                    onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="p-6 bg-white/5 border-t border-white/5 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-white font-black">₱{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Sales Tax (12%)</span>
            <span className="text-white font-black">₱{tax.toLocaleString()}</span>
          </div>
          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="font-black text-sm uppercase tracking-tighter">Total Amount</span>
            <span className="text-2xl font-black text-white tracking-tighter">
              ₱{total.toLocaleString()}
            </span>
          </div>
        </div>

        <button 
          onClick={() => cart.length > 0 && setIsCheckoutOpen(true)}
          disabled={cart.length === 0}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${
            cart.length === 0 
            ? 'bg-slate-800 text-slate-600' 
            : 'bg-[#c2410c] text-white shadow-xl shadow-orange-900/40 hover:bg-[#9a3412] active:scale-[0.98]'
          }`}
        >
          <CreditCard size={18} />
          Complete Transaction
        </button>
      </div>

      <CheckoutModal 
        open={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
}