import { useApp } from '../../contexts/AppContext';
import { AlertCircle } from 'lucide-react';

export default function LowStockWidget() {
  const { getLowStock } = useApp();
  const lowStockProducts = getLowStock();

  const handleGenerateReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert('Pop-up blocked. Please allow pop-ups to generate the procurement report.');
      return;
    }
    
    const lowStockItems = getLowStock();
    
    const rows = lowStockItems.map(p => {
      const recommendQty = Math.max(50, p.reorderLevel * 2);
      const estimatedCost = recommendQty * p.costPrice;
      return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${p.name}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; color: #64748b;">${p.sku}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #334155;">${p.supplier || 'N/A'}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #ef4444; font-weight: bold;">${p.quantity}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${p.reorderLevel}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #2563eb;">${recommendQty}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₱${p.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-family: monospace; color: #0f172a;">₱${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const totalCost = lowStockItems.reduce((sum, p) => sum + (Math.max(50, p.reorderLevel * 2) * p.costPrice), 0);

    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Procurement Recommendation Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; background: #fafafa; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            h1 { margin: 0 0 5px 0; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background-color: #f8fafc; padding: 14px 10px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; border-bottom: 2px solid #e2e8f0; }
            .print-btn { background: #c2410c; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgb(194 65 12 / 0.2); }
            .print-btn:hover { background: #9a3412; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
            .totals-container { margin-top: 32px; display: flex; justify-content: flex-end; border-top: 2px solid #f1f5f9; padding-top: 24px; }
            .totals-box { text-align: right; }
            .totals-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
            .totals-val { margin-top: 6px; font-size: 36px; font-weight: 900; color: #c2410c; letter-spacing: -0.03em; }
            @media print {
              body { background: white; padding: 0; }
              .container { border: none; box-shadow: none; padding: 0; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <button class="print-btn" onclick="window.print()">Print Procurement Order</button>
            <div class="header-flex">
              <div>
                <h1>J&JAY Hardware</h1>
                <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 500;">Procurement & Reorder Recommendation Report</p>
              </div>
              <div style="text-align: right; font-size: 13px; color: #64748b; font-weight: 500;">
                <p style="margin: 0 0 4px 0;">Generated: <strong>${new Date().toLocaleString()}</strong></p>
                <p style="margin: 0;">Restock Actions Required: <strong>${lowStockItems.length} Products</strong></p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Supplier</th>
                  <th style="text-align: center;">Current Stock</th>
                  <th style="text-align: center;">Min. Threshold</th>
                  <th style="text-align: center;">Target Reorder</th>
                  <th style="text-align: right;">Unit Cost</th>
                  <th style="text-align: right;">Est. Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="totals-container">
              <div class="totals-box">
                <div class="totals-label">Estimated Procurement Budget</div>
                <div class="totals-val">₱${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#c2410c] flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Low Stock Alerts
              </h2>
              <p className="text-[11px] text-slate-400">Inventory items needing restock</p>
            </div>
          </div>
          {lowStockProducts.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              {lowStockProducts.length} Alert{lowStockProducts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {lowStockProducts.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/60"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&h=100&fit=crop'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-bold text-xs text-slate-900 truncate">{product.name}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                    product.quantity === 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} left`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span className="font-mono">SKU: {product.sku}</span>
                  <span>•</span>
                  <span>Min: {product.reorderLevel}</span>
                </div>
              </div>
            </div>
          ))}

          {lowStockProducts.length === 0 && (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                ✓
              </div>
              <p className="text-xs font-bold text-slate-700">All Stock Levels Optimal</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No products currently below reorder levels</p>
            </div>
          )}
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <button
          onClick={handleGenerateReport}
          className="w-full mt-5 py-2.5 bg-orange-50 hover:bg-[#c2410c] text-[#c2410c] hover:text-white border border-orange-200/80 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Generate Procurement Report
        </button>
      )}
    </div>
  );
}