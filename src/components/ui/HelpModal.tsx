import { useEffect, useState } from 'react';
import { X, ShoppingCart, Boxes, CalendarClock, Key, BookOpen, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'sales' | 'shortcuts' | 'roles'>('shortcuts');

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fade-in text-slate-800"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#c2410c] flex items-center justify-center border border-orange-100 shadow-sm">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-xl font-black text-slate-900 tracking-tight">
                Help & System Guide
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Quick reference, POS shortcuts & procedures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close help"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-8 pt-4 border-b border-slate-100 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Key size={14} /> Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pos'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingCart size={14} /> POS Operations
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Boxes size={14} /> Inventory & Stock
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sales'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <CalendarClock size={14} /> Orders & Voids
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-[#c2410c] text-[#c2410c]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShieldCheck size={14} /> Roles & Demo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar text-xs leading-relaxed space-y-4">
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Productivity Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className="font-medium text-slate-600">Focus Global Search</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-700 shadow-sm">
                    Ctrl + K
                  </kbd>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className="font-medium text-slate-600">Focus POS Product Search</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-700 shadow-sm">
                    /
                  </kbd>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className="font-medium text-slate-600">Close Any Modal / Dialog</span>
                  <kbd className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-700 shadow-sm">
                    Esc
                  </kbd>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className="font-medium text-slate-600">Quick Cash Tender</span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    1-Click Preset Buttons
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pos' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Point of Sale (POS) Workflow</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1">
                <li><strong className="text-slate-800">Add Items:</strong> Click on any product card in the grid to add 1 unit to the cart. Product cards display an indicator showing how many are already in the cart.</li>
                <li><strong className="text-slate-800">Adjust Quantities:</strong> Use the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">+</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">-</code> buttons in the Current Order panel, or the trash icon to remove.</li>
                <li><strong className="text-slate-800">Clear Cart:</strong> Click "Clear Cart" if the customer cancels or walks away.</li>
                <li><strong className="text-slate-800">Tender Payment:</strong> Click "Complete Transaction". Choose payment method (Cash, Card, Online, Check). For cash, click a quick preset or type amount paid.</li>
                <li><strong className="text-slate-800">Receipt:</strong> A clean printable receipt generates immediately upon completion with print support.</li>
              </ol>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Inventory & Stock Tracking</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
                <li><strong className="text-slate-800">SKU Auto-generation:</strong> When adding a product, selecting a category automatically generates a clean SKU formatted with the standard category code (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">PWR-...</code>).</li>
                <li><strong className="text-slate-800">Reorder Threshold:</strong> Set the reorder level to trigger system warnings when remaining units reach or dip below this amount.</li>
                <li><strong className="text-slate-800">Restock Shortcut:</strong> In System Notifications, click "Restock Now" next to any low-stock alert to navigate directly to the product catalog with the SKU filtered.</li>
              </ul>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Sales History & Voiding Orders</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
                <li><strong className="text-slate-800">Viewing Receipts:</strong> Click the eye icon on any completed transaction in Sales History to inspect or reprint the original receipt.</li>
                <li><strong className="text-slate-800">Voiding a Transaction:</strong> If a cashier made an error or customer returned goods, click the void icon (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">⊘</code>). Confirming the void returns all purchased quantities back into available inventory and cancels the sale.</li>
              </ul>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">User Roles & Quick Demo Accounts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                    <h4 className="font-bold text-slate-800">Administrator</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Access to Dashboard, Inventory, Reports, Suppliers, and Sales Ledger.</p>
                  <p className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    User: <strong>admin</strong><br />
                    Pass: <strong>admin123</strong>
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h4 className="font-bold text-slate-800">Cashier</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Focused access to the high-speed POS Terminal and Sales History.</p>
                  <p className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                    User: <strong>cashier</strong><br />
                    Pass: <strong>cashier123</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">J&JAY Hardware Systems Guide</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
