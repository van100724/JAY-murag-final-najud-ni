import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, RotateCcw, ArrowRight } from 'lucide-react';
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

  // Keyboard shortcut: F4 opens checkout if cart has items
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4' && cart.length > 0 && !isCheckoutOpen) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, isCheckoutOpen]);

  return (
    <div className="bg-[#1e293b] rounded-3xl shadow-xl h-full flex flex-col min-h-0 overflow-hidden text-white border border-slate-700/60">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ea580c] to-[#c2410c] rounded-2xl flex items-center justify-center shadow-md shadow-orange-900/30 text-white">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Active Order
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {cart.length} {cart.length === 1 ? 'Line Item' : 'Line Items'} • {totalUnits}{' '}
              {totalUnits === 1 ? 'Unit' : 'Units'}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="text-[10px] font-bold text-slate-400 hover:text-red-400 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            title="Clear all items from current order"
          >
            <RotateCcw size={12} /> Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-2.5 custom-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <div className="w-16 h-16 bg-slate-800/80 rounded-3xl flex items-center justify-center mb-3 text-slate-600 border border-slate-700/50">
              <ShoppingBag size={28} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Order Register is Empty
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-[200px]">
              Tap any product on the left catalog to start building the order.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 group hover:border-slate-600/80 transition-all animate-fade-in"
            >
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-xs font-bold truncate text-white leading-tight">
                  {item.productName}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ₱
                  {Number(item.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}{' '}
                  each •{' '}
                  <span className="font-bold text-[#ea580c]">
                    ₱
                    {(item.price * item.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </div>

              {/* Quantity Stepper & Delete */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-1 rounded-xl border border-slate-700/70">
                  <button
                    type="button"
                    onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label={`Decrease ${item.productName} quantity`}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-black w-6 text-center text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label={`Increase ${item.productName} quantity`}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label={`Remove ${item.productName} from order`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary & Checkout Footer */}
      <div className="p-5 bg-slate-900/90 border-t border-slate-700/60 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Subtotal (Net)</span>
            <span className="text-white font-mono font-bold">
              ₱
              {subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Sales Tax (12% VAT)</span>
            <span className="text-white font-mono font-bold">
              ₱
              {tax.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="pt-2.5 border-t border-slate-700/60 flex justify-between items-center">
            <div>
              <span className="font-black text-xs uppercase tracking-wider text-slate-300 block">
                Total Due
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {totalUnits} total unit{totalUnits !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              ₱
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Primary Tender Button */}
        <button
          onClick={() => cart.length > 0 && setIsCheckoutOpen(true)}
          disabled={cart.length === 0}
          className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
            cart.length === 0
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] text-white shadow-xl shadow-orange-900/30 active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard size={17} />
            <span>Tender & Charge Order</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs">
              ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <ArrowRight size={15} />
          </div>
        </button>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Current Order?"
        message="Are you sure you want to remove all items from this order cart? This action will reset the active register."
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