import { Printer, RefreshCw, CheckCircle2, User, Calendar, CreditCard, Receipt as ReceiptIcon } from 'lucide-react';

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
      @media print {
        body {
          background: white;
          color: black;
        }
        body > * {
          display: none !important;
        }
        #print-receipt-root {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 0;
          margin: 0;
          background: white;
        }
        .no-print {
          display: none !important;
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fade-in text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col my-8 overflow-hidden animate-scale-in">
        
        {/* Receipt wrapper (Printed area) */}
        <div id="print-receipt-root" className="p-8 bg-white overflow-y-auto max-h-[75vh] custom-scrollbar">
          {/* Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-200">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
              <ReceiptIcon className="text-[#c2410c]" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">J&JAY</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">POS & Inventory System</p>
            <p className="text-[10px] text-slate-400 mt-1">123 Hardware Lane, Metro Manila, PH</p>
            <p className="text-[10px] text-slate-400">Tel: +63 2 8555 9999</p>
          </div>

          {/* Success Status Indicator (Not printed if styled as no-print) */}
          <div className="no-print mt-4 mb-2 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2.5 px-4 rounded-xl border border-emerald-100 font-bold text-xs">
            <CheckCircle2 size={16} />
            Transaction Saved & Synced
          </div>

          {/* Transaction Metadata */}
          <div className="py-4 space-y-2.5 text-xs text-slate-600 border-b border-dashed border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Receipt No.</span>
              <span className="font-mono font-bold text-slate-900">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date & Time</span>
              <span className="font-medium text-slate-900 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                {new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Cashier</span>
              <span className="font-medium text-slate-900">{sale.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Customer Ref</span>
              <span className="font-bold text-[#c2410c] flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                {sale.customer_name || 'Walk-in Customer'}
              </span>
            </div>
          </div>

          {/* Items Section */}
          <div className="py-5 border-b border-dashed border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Purchased Items</h3>
            <div className="space-y-3.5">
              {sale.items.map((item, index) => {
                const unitPrice = item.unitPrice || (item as any).price || 0;
                return (
                  <div key={index} className="flex justify-between items-start text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <p className="font-bold text-slate-900 line-clamp-2">{item.productName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {item.quantity} x ₱{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 mt-0.5">
                      ₱{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financials Summary */}
          <div className="py-4 space-y-2 border-b border-dashed border-slate-200 text-xs">
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
              <span className="text-lg font-black tracking-tight text-slate-950">
                ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="py-4 space-y-2 text-xs border-b border-dashed border-slate-200">
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
          {generateBarcode(sale.id)}

          {/* Footer message */}
          <div className="text-center pt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Thank you for shopping with J&JAY!
          </div>
        </div>

        {/* Action Buttons (Excluded from Print) */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98]"
          >
            <Printer size={16} />
            Print Receipt
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c2410c] hover:bg-[#9a3412] text-white shadow-lg shadow-orange-900/10 transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98]"
          >
            <RefreshCw size={16} />
            New Transaction
          </button>
        </div>

      </div>
    </div>
  );
}