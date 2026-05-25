import { Printer, RefreshCw, CheckCircle2, User, Calendar, CreditCard, Receipt as ReceiptIcon, Ban } from 'lucide-react';

interface ReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptProps {
  sale: {
    id: string;
    customer_name: string;
    total: number;
    tax: number;
    discount: number;
    payment_method: string;
    amount_paid: number;
    change_amount: number;
    cashier: string;
    notes: string;
    items: ReceiptItem[];
    saleDate?: string | Date;
    status?: string;
  };
  onClose: () => void;
}

export default function Receipt({ sale, onClose }: ReceiptProps) {
  const handlePrint = () => {
    // Save current document title
    const originalTitle = document.title;
    document.title = `Receipt-${sale.id}`;

    // Create a print container style
    const style = document.createElement('style');
    style.innerHTML = `
      @page {
        size: portrait;
        margin: 15mm;
      }
      @media print {
        body {
          background: white;
          color: black;
        }
        /* Hide all page content by default */
        body * {
          visibility: hidden !important;
        }
        /* Reveal only the printable receipt and its children */
        #print-receipt-root,
        #print-receipt-root * {
          visibility: visible !important;
        }
        /* Position the printable area at top-left of the page */
        #print-receipt-root {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        /* Ensure no-print elements remain hidden */
        .no-print,
        .no-print * {
          display: none !important;
          visibility: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Trigger standard print dialog
    window.print();

    // Cleanup
    document.head.removeChild(style);
    document.title = originalTitle;
  };

  const generateBarcode = (text: string) => {
    // Generate horizontal lines representing a barcode
    return (
      <div className="flex flex-col items-center my-4">
        <div className="flex items-end justify-center h-10 w-52 gap-[2px]">
          {Array.from({ length: 32 }).map((_, i) => {
            // Pseudo-random barcode pattern based on string index hash
            const charCode = text.charCodeAt(i % text.length);
            const isGap = (charCode + i) % 5 === 0;
            const isWide = (charCode + i) % 3 === 0;
            return (
              <div
                key={i}
                className={`h-full ${isGap ? 'bg-transparent' : 'bg-slate-900'} ${
                  isWide ? 'w-[3px]' : 'w-[1px]'
                }`}
              />
            );
          })}
        </div>
        <span className="text-[10px] tracking-[5px] mt-1 text-slate-500 font-mono font-bold uppercase">{text}</span>
      </div>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Credit/Debit Card';
      case 'online': return 'Online Payment';
      case 'check': return 'Bank Check';
      default: return method;
    }
  };

  const subtotal = sale.total - sale.tax + sale.discount;
  const isCancelled = sale.status === 'cancelled';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white rounded-[35px] border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)] flex flex-col max-h-[90vh] overflow-hidden animate-fade-in text-slate-800">
        
        {/* Receipt wrapper (Printed area) */}
        <div id="print-receipt-root" className="p-8 bg-white overflow-y-auto flex-1 custom-scrollbar relative">
          
          {/* Watermark stamp for voided receipts */}
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
              <div className="text-red-500/10 text-[64px] font-black uppercase tracking-[0.2em] -rotate-12 border-8 border-dashed border-red-500/10 px-6 py-2 rounded-3xl">
                VOIDED
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-200 z-10 relative">
            <div className={`mx-auto w-12 h-12 ${isCancelled ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-[#c2410c]'} rounded-full flex items-center justify-center mb-3`}>
              {isCancelled ? <Ban size={24} /> : <ReceiptIcon size={24} />}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">J&JAY</h1>
            <p className={`text-xs ${isCancelled ? 'text-red-600 font-extrabold' : 'text-slate-500 font-bold'} uppercase tracking-wider mt-1`}>
              {isCancelled ? 'VOIDED TRANSACTION RECEIPT' : 'POS & Inventory System'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">123 Hardware Lane, Metro Manila, PH</p>
            <p className="text-[10px] text-slate-400">Tel: +63 2 8555 9999</p>
          </div>

          {/* Success / Voided Status Indicator (Not printed if styled as no-print) */}
          <div className="z-10 relative">
            {isCancelled ? (
              <div className="no-print mt-4 mb-2 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2.5 px-4 rounded-xl border border-red-100 font-bold text-xs">
                <Ban size={16} />
                Transaction Voided & Stock Restored
              </div>
            ) : (
              <div className="no-print mt-4 mb-2 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2.5 px-4 rounded-xl border border-emerald-100 font-bold text-xs">
                <CheckCircle2 size={16} />
                Transaction Saved & Synced
              </div>
            )}
          </div>

          {/* Transaction Metadata */}
          <div className="py-4 space-y-2.5 text-xs text-slate-600 border-b border-dashed border-slate-200 z-10 relative">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Receipt No.</span>
              <span className="font-mono font-bold text-slate-900">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date & Time</span>
              <span className="font-medium text-slate-900 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                {sale.saleDate ? new Date(sale.saleDate).toLocaleString() : new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Cashier</span>
              <span className="font-medium text-slate-900">{sale.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Customer Ref</span>
              <span className={`font-bold ${isCancelled ? 'text-red-600' : 'text-[#c2410c]'} flex items-center gap-1`}>
                <User size={12} className="text-slate-400" />
                {sale.customer_name || 'Walk-in Customer'}
              </span>
            </div>
          </div>

          {/* Items Section */}
          <div className="py-5 border-b border-dashed border-slate-200 z-10 relative">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Purchased Items</h3>
            <div className="space-y-3.5">
              {sale.items.map((item, index) => {
                const unitPrice = item.unitPrice || (item as any).price || 0;
                return (
                  <div key={index} className="flex justify-between items-start text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <p className={`font-bold text-slate-900 line-clamp-2 ${isCancelled ? 'line-through text-slate-400' : ''}`}>{item.productName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {item.quantity} x ₱{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-slate-900 mt-0.5 ${isCancelled ? 'line-through text-slate-400' : ''}`}>
                      ₱{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financials Summary */}
          <div className="py-4 space-y-2 border-b border-dashed border-slate-200 text-xs z-10 relative">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT (12%)</span>
              <span className="font-mono font-medium">₱{sale.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Discount</span>
                <span className="font-mono">-₱{sale.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2">
              <span className="text-xs uppercase tracking-wider">Total Amount</span>
              <span className={`text-lg font-black tracking-tight ${isCancelled ? 'text-red-600 line-through' : 'text-slate-950'}`}>
                ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="py-4 space-y-2 text-xs border-b border-dashed border-slate-200 z-10 relative">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <CreditCard size={12} className="text-slate-400" />
                Payment Method
              </span>
              <span className="font-bold text-slate-900">{getPaymentMethodLabel(sale.payment_method)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Amount Tendered</span>
              <span className="font-mono font-bold text-slate-900">
                ₱{sale.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Change Return</span>
              <span className="font-mono font-bold text-emerald-600">
                ₱{sale.change_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="z-10 relative">
            {generateBarcode(sale.id)}
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider z-10 relative">
            {isCancelled ? 'VOIDED TRANSACTION' : 'Thank you for shopping with J&JAY!'}
          </div>
        </div>

        {/* Action Buttons (Excluded from Print) */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 no-print z-20">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98]"
          >
            <Printer size={16} />
            Print Receipt
          </button>
          
          <button
            onClick={onClose}
            className={`flex-1 flex items-center justify-center gap-2 text-white shadow-lg transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98] ${
              isCancelled || sale.saleDate
                ? 'bg-slate-500 hover:bg-slate-600 shadow-slate-900/10'
                : 'bg-[#c2410c] hover:bg-[#9a3412] shadow-orange-900/10'
            }`}
          >
            <RefreshCw size={16} className={isCancelled || sale.saleDate ? 'hidden' : ''} />
            {isCancelled || sale.saleDate ? 'Close Receipt' : 'New Transaction'}
          </button>
        </div>

      </div>
    </>
  );
}