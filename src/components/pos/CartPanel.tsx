import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, RotateCcw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import CheckoutModal from './CheckoutModal';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function CartPanel() {
  const { cart, removeFromCart, updateCartQty, clearCart } = useApp();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const totalUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-[#1a202c] rounded-2xl shadow-2xl h-full flex flex-col min-h-0 overflow-hidden text-white">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c2410c] rounded-xl flex items-center justify-center shadow-lg text-white">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Current Order</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {cart.length} {cart.length === 1 ? 'Line Item' : 'Line Items'} • {totalUnits} {totalUnits === 1 ? 'Unit' : 'Units'}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="text-[10px] font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider"
            title="Clear all items from current order"
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
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
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group animate-fade-in hover:border-white/10 transition-all"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold truncate text-white leading-tight">{item.productName}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} each •{' '}
                  <span className="font-bold text-[#c2410c]">
                    ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                  <button 
                    type="button"
                    onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                    className="text-slate-400 hover:text-white transition-colors p-0.5"
                    aria-label={`Decrease ${item.productName} quantity`}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-xs font-black w-5 text-center text-white">{item.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                    className="text-slate-400 hover:text-white transition-colors p-0.5"
                    aria-label={`Increase ${item.productName} quantity`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  aria-label={`Remove ${item.productName} from order`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="p-6 bg-white/5 border-t border-white/5 space-y-5">
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span className="text-white font-mono font-bold">
              ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Sales Tax (12%)</span>
            <span className="text-white font-mono font-bold">
              ₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between items-center">
            <span className="font-black text-xs uppercase tracking-wider text-slate-300">Total Due</span>
            <span className="text-2xl font-black text-white tracking-tight">
              ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button 
          onClick={() => cart.length > 0 && setIsCheckoutOpen(true)}
          disabled={cart.length === 0}
          className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${
            cart.length === 0 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
            : 'bg-[#c2410c] text-white shadow-xl shadow-orange-900/40 hover:bg-[#9a3412] active:scale-[0.98]'
          }`}
        >
          <CreditCard size={16} />
          Complete Transaction
        </button>
      </div>

      <CheckoutModal 
        open={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />

      {/* Clear Cart Confirmation Dialog - Heuristics 3 & 5 */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Current Order?"
        message="Are you sure you want to remove all items from this order cart? This cannot be undone."
        confirmText="Clear Cart"
        cancelText="Keep Items"
        isDestructive={true}
        onConfirm={() => {
          clearCart();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}