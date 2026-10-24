import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Bell, AlertTriangle, Info, CheckCircle2, X, ExternalLink } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Notifications() {
  const { getLowStock, getInventoryAlerts, clearInventoryAlert, clearAllInventoryAlerts } = useApp();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const lowStockProducts = getLowStock();
  const alerts = getInventoryAlerts();

  const handleClearAlert = (alertId: string) => {
    clearInventoryAlert(alertId);
  };

  const handleRestock = (sku: string) => {
    navigate(`/inventory?search=${encodeURIComponent(sku)}`);
  };

  const confirmClearAll = () => {
    clearAllInventoryAlerts();
    setShowClearConfirm(false);
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-10 text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              System Notifications
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Stay updated with critical inventory shifts and operational alerts.
            </p>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#c2410c] hover:border-[#c2410c]/30 transition-all bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm active:scale-95"
            >
              Mark All As Read
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alerts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <h2 className="text-lg font-bold text-slate-900">Stock Threshold Alerts</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {lowStockProducts.length} items critical
              </span>
            </div>

            <div className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-orange-200 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold leading-tight group-hover:text-[#c2410c] transition-colors">{product.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                            Critical: <span className="text-red-600">{product.quantity}</span> units remaining
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Reorder Threshold: {product.reorderLevel} units
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRestock(product.sku)}
                        title="Open product in Inventory to adjust stock"
                        aria-label={`Restock ${product.name}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#c2410c] hover:text-white transition-all shadow-sm"
                      >
                        Restock Now <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-500 mb-3 opacity-50" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory Levels Optimal</p>
                </div>
              )}
            </div>
          </div>

          {/* System Alerts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-blue-500" />
                <h2 className="text-lg font-bold text-slate-900">Operational Logs</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {alerts.length} active logs
              </span>
            </div>

            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-blue-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                          <Info size={20} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold leading-tight">{alert.message}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                            {new Date(alert.createdAt).toLocaleDateString()} at {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClearAlert(alert.id)}
                        title="Dismiss alert"
                        aria-label="Dismiss alert"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-12 flex flex-col items-center justify-center">
                  <Bell size={32} className="text-slate-300 mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Operational Alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Notifications?"
        message="This will dismiss all current operational log entries. Stock threshold alerts will remain visible as long as inventory is low."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}
