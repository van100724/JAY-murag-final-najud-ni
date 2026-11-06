import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  RefreshCw,
  CheckCircle2,
  User,
  Calendar,
  CreditCard,
  Ban,
  X,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

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
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt-${sale.id}</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              background-color: #ffffff;
              padding: 16px;
              color: #1e293b;
            }
            .receipt-container {
              max-width: 380px;
              margin: 0 auto;
              padding: 16px;
              border: 1px dashed #cbd5e1;
              background: #fff;
            }
            .no-print {
              display: none !important;
            }
            @media print {
              body {
                padding: 0;
              }
              .receipt-container {
                border: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateBarcode = (text: string) => {
    return (
      <div className="flex flex-col items-center my-3">
        <div className="flex items-end justify-center h-9 w-48 gap-[2px]">
          {Array.from({ length: 30 }).map((_, i) => {
            const charCode = text.charCodeAt(i % text.length);
            const isGap = (charCode + i) % 5 === 0;
            const isWide = (charCode + i) % 3 === 0;
            return (
              <div
                key={i}
                className={`h-full ${
                  isGap ? 'bg-transparent' : 'bg-slate-900'
                } ${isWide ? 'w-[3px]' : 'w-[1px]'}`}
              />
            );
          })}
        </div>
        <span className="text-[10px] tracking-[4px] mt-1 text-slate-500 font-mono font-bold uppercase">
          {text}
        </span>
      </div>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash Tender';
      case 'card':
        return 'Credit/Debit Card';
      case 'online':
        return 'GCash / PayMaya';
      case 'check':
        return 'Bank Check';
      default:
        return method;
    }
  };

  const subtotal = sale.total - sale.tax + sale.discount;
  const isCancelled = sale.status === 'cancelled';

  const modalContent = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-fade-in text-slate-800"
      onClick={onClose}
    >
      {/* Receipt Modal Card - Perfectly Centered */}
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/30 shrink-0">
          <div className="flex items-center gap-2">
            <ReceiptIcon size={18} className="text-[#c2410c]" />
            <span id="receipt-modal-title" className="text-xs font-black uppercase tracking-wider text-slate-800">
              Customer Thermal Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            aria-label="Close receipt"
          >
            <X size={15} />
          </button>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div
          id="print-receipt-root"
          className="p-6 bg-white overflow-y-auto flex-1 custom-scrollbar relative text-slate-800"
        >
          {/* Stamped Void Watermark if Cancelled */}
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
              <div className="text-red-500/15 text-[54px] font-black uppercase tracking-[0.2em] -rotate-12 border-8 border-dashed border-red-500/20 px-6 py-2 rounded-3xl">
                VOIDED
              </div>
            </div>
          )}

          {/* Store Brand Header */}
          <div className="text-center pb-5 border-b border-dashed border-slate-300 z-10 relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center mb-2.5 bg-white">
              <img
                src={logoImg}
                alt="J&JAY Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              J&JAY
            </h1>
            <p
              className={`text-xs ${
                isCancelled ? 'text-red-600 font-extrabold' : 'text-[#c2410c] font-black'
              } uppercase tracking-wider mt-1`}
            >
              {isCancelled ? 'VOIDED TRANSACTION RECEIPT' : 'Hardware & Construction Supplies'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              National Highway Poblacion 1, Balingasag, Misamis Oriental
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Contact: 0966 704 3203 • BIR Reg. POS Terminal
            </p>
          </div>

          {/* Transaction Success / Voided Banner */}
          <div className="z-10 relative no-print my-3">
            {isCancelled ? (
              <div className="flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 px-3 rounded-xl border border-red-200 font-bold text-xs">
                <Ban size={15} />
                <span>Transaction Cancelled & Stock Restored</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2 px-3 rounded-xl border border-emerald-200 font-bold text-xs">
                <CheckCircle2 size={15} />
                <span>Payment Tendered Successfully</span>
              </div>
            )}
          </div>

          {/* Transaction Meta Details */}
          <div className="py-3.5 space-y-2 text-xs text-slate-600 border-b border-dashed border-slate-300 z-10 relative">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Receipt No:
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs">{sale.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Date & Time:
              </span>
              <span className="font-semibold text-slate-900 flex items-center gap-1 text-[11px]">
                <Calendar size={12} className="text-slate-400" />
                {sale.saleDate
                  ? new Date(sale.saleDate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Register Operator:
              </span>
              <span className="font-semibold text-slate-900 text-xs">
                {sale.cashier || 'Cashier'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Customer Name:
              </span>
              <span
                className={`font-bold ${
                  isCancelled ? 'text-red-600' : 'text-slate-900'
                } flex items-center gap-1 text-xs`}
              >
                <User size={12} className="text-slate-400" />
                {sale.customer_name || 'Walk-in Customer'}
              </span>
            </div>
          </div>

          {/* Purchased Line Items */}
          <div className="py-4 border-b border-dashed border-slate-300 z-10 relative">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
              <span>Item Description</span>
              <span>Total</span>
            </div>
            <div className="space-y-2.5">
              {sale.items.map((item, index) => {
                const unitPrice = item.unitPrice || (item as any).price || 0;
                return (
                  <div key={index} className="flex justify-between items-start text-xs">
                    <div className="space-y-0.5 max-w-[70%]">
                      <p
                        className={`font-bold text-slate-900 line-clamp-2 leading-tight ${
                          isCancelled ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.quantity} × ₱
                        {Number(unitPrice).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold text-slate-900 mt-0.5 ${
                        isCancelled ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      ₱
                      {Number(item.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="py-3.5 space-y-1.5 border-b border-dashed border-slate-300 text-xs z-10 relative">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Net)</span>
              <span className="font-mono font-medium">
                ₱
                {Number(subtotal).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>12% VAT</span>
              <span className="font-mono font-medium">
                ₱
                {Number(sale.tax).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Discount</span>
                <span className="font-mono">
                  -₱
                  {Number(sale.discount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2">
              <span className="text-xs uppercase tracking-wider">Total Due</span>
              <span
                className={`text-xl font-black tracking-tight ${
                  isCancelled ? 'text-red-600 line-through' : 'text-[#c2410c]'
                }`}
              >
                ₱
                {Number(sale.total).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Payment Tender Details */}
          <div className="py-3.5 space-y-1.5 text-xs border-b border-dashed border-slate-300 z-10 relative">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <CreditCard size={12} className="text-slate-400" />
                <span>Payment Tender</span>
              </span>
              <span className="font-bold text-slate-900">
                {getPaymentMethodLabel(sale.payment_method)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Amount Tendered</span>
              <span className="font-mono font-bold text-slate-900">
                ₱
                {Number(sale.amount_paid).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 pt-0.5">
              <span>Change Returned</span>
              <span className="font-mono font-bold text-emerald-600">
                ₱
                {Number(sale.change_amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="z-10 relative">{generateBarcode(sale.id)}</div>

          {/* Store Footer */}
          <div className="text-center pt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider z-10 relative">
            {isCancelled
              ? '*** TRANSACTION CANCELLED ***'
              : 'Thank you for shopping with J&JAY Hardware!'}
          </div>
          <p className="text-center text-[9px] text-slate-400 mt-1">
            Please retain receipt for return & warranty validation.
          </p>
        </div>

        {/* Action Buttons Footer (Not printed) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 no-print z-20 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-all py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] cursor-pointer shadow-md"
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] text-white shadow-lg shadow-orange-900/20 transition-all py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>New Order</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}