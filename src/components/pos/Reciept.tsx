import { useEffect } from 'react';
import { Printer, RefreshCw, CheckCircle2, User, Calendar, CreditCard, Ban } from 'lucide-react';

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
  // Usability Heuristic: User Control & Freedom (Esc closes receipt)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=500,height=850');
    if (!printWindow) {
      alert('Please allow popups to print your receipt');
      return;
    }

    const receiptHtml = document.getElementById('print-receipt-root')?.innerHTML || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt-${sale.id}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Outfit', 'sans-serif'],
                  }
                }
              }
            }
          </script>
          <style>
            body {
              font-family: 'Outfit', sans-serif !important;
              background-color: #f8fafc !important;
              padding: 24px !important;
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-receipt-root {
              background-color: #ffffff !important;
              border-radius: 35px !important;
              border: 1px solid #e2e8f0 !important;
              box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
              padding: 32px !important;
              max-width: 440px !important;
              margin: 0 auto !important;
            }
            .no-print {
              display: none !important;
            }
            /* Force exact background color printing in browsers */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @media print {
              body {
                background-color: #ffffff !important;
                padding: 0 !important;
              }
              #print-receipt-root {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                max-width: 100% !important;
              }
            }
          </style>
        </head>
        <body class="bg-slate-50 min-h-screen flex items-center justify-center">
          <div id="print-receipt-root">
            ${receiptHtml}
          </div>
          <script>
            window.onload = function() {
              // Wait slightly for Tailwind and Fonts to finish loading and rendering
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                className={`h-full ${isGap ? 'bg-transparent' : 'bg-slate-900'} ${isWide ? 'w-[3px]' : 'w-[1px]'
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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in text-slate-800">

        {/* Receipt wrapper (Printed area) */}
        <div id="print-receipt-root" className="p-6 bg-white overflow-y-auto flex-1 custom-scrollbar relative">

          {/* Watermark stamp for voided receipts */}
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
              <div className="text-red-500/10 text-[64px] font-black uppercase tracking-[0.2em] -rotate-12 border-8 border-dashed border-red-500/10 px-6 py-2 rounded-3xl">
                VOIDED
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-200 z-10 relative flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center mb-3 bg-white">
              <img src="/J&JAY.jpg" alt="J&JAY Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">J&JAY</h1>
            <p className={`text-xs ${isCancelled ? 'text-red-600 font-extrabold' : 'text-slate-500 font-bold'} uppercase tracking-wider mt-1.5`}>
              {isCancelled ? 'VOIDED TRANSACTION RECEIPT' : 'POS & Inventory System'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              National Highway Poblacion 1, Balingasag, Philippines</p>
            <p className="text-[10px] text-slate-400">Tel:
              0966 704 3203</p>
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
            className={`flex-1 flex items-center justify-center gap-2 text-white shadow-lg transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98] ${isCancelled || sale.saleDate
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