import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Package,
  ArrowUpRight,
  Search,
  Check,
  Sparkles,
  Boxes,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const {
    getLowStock,
    getInventoryAlerts,
    clearInventoryAlert,
    clearAllInventoryAlerts,
    updateExistingProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'stock' | 'operational'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [restockedSuccessIds, setRestockedSuccessIds] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const lowStockProducts = getLowStock();
  const alerts = getInventoryAlerts();

  // Metric Computations
  const outOfStockCount = useMemo(
    () => lowStockProducts.filter((p) => (Number(p.quantity) || 0) === 0).length,
    [lowStockProducts]
  );

  const lowStockCount = useMemo(
    () =>
      lowStockProducts.filter((p) => {
        const qty = Number(p.quantity) || 0;
        const reorder = Number(p.reorderLevel) || 10;
        return qty > 0 && qty <= reorder;
      }).length,
    [lowStockProducts]
  );

  // Quick Restock Action
  const handleQuickRestock = async (product: any, amountToAdd = 10) => {
    setRestockingId(product.id);
    try {
      const currentQty = Number(product.quantity) || 0;
      await updateExistingProduct(product.id, {
        quantity: currentQty + amountToAdd,
      });

      setRestockedSuccessIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setRestockedSuccessIds((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }, 2500);
    } finally {
      setRestockingId(null);
    }
  };

  // Filtered lists
  const filteredLowStock = useMemo(() => {
    if (!searchQuery.trim()) return lowStockProducts;
    const q = searchQuery.toLowerCase();
    return lowStockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [lowStockProducts, searchQuery]);

  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const q = searchQuery.toLowerCase();
    return alerts.filter((a) => (a.message || '').toLowerCase().includes(q));
  }, [alerts, searchQuery]);

  const showStock = activeTab === 'all' || activeTab === 'stock';
  const showAlerts = activeTab === 'all' || activeTab === 'operational';
  const totalFilteredCount =
    (showStock ? filteredLowStock.length : 0) + (showAlerts ? filteredAlerts.length : 0);

  return (
    <>
      <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                System Notifications
              </h1>
              {lowStockProducts.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-200">
                  {lowStockProducts.length} Attention Required
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Real-time audit feeds, stock threshold warnings, and warehouse replenishment alerts.
            </p>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={14} className="text-slate-400" />
              <span>Clear Activity Logs</span>
            </button>
          )}
        </div>

        {/* 2. Top Metric KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Out of Stock */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-rose-200 transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Out of Stock (Zero Units)
              </p>
              <p className="text-2xl font-black text-rose-600 tracking-tight">
                {outOfStockCount}
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                Immediate replenishment needed
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
          </div>

          {/* Card 2: Low Stock Warning */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-amber-200 transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Low Stock Warning
              </p>
              <p className="text-2xl font-black text-amber-600 tracking-tight">
                {lowStockCount}
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                Below safe reorder minimums
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <Boxes size={24} />
            </div>
          </div>

          {/* Card 3: Operational Activity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                System Activity Feeds
              </p>
              <p className="text-2xl font-black text-blue-600 tracking-tight">
                {alerts.length}
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                Audit logs and system milestones
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Bell size={24} />
            </div>
          </div>
        </div>

        {/* 3. Toolbar: Filter Tabs & Search */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Notifications', count: lowStockProducts.length + alerts.length },
              { id: 'stock', label: 'Stock Critical', count: lowStockProducts.length },
              { id: 'operational', label: 'Operational Logs', count: alerts.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeTab === tab.id
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-200/60 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Filter alerts by name, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* 4. Notification Items Feed */}
        <div className="space-y-4">
          {totalFilteredCount === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800">All notifications cleared</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active inventory warnings or operational logs match your current filter settings.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section A: Stock Alerts */}
              {showStock && filteredLowStock.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                        Critical Inventory Attention ({filteredLowStock.length})
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Reorder Threshold Warnings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredLowStock.map((product) => {
                      const qty = Number(product.quantity) || 0;
                      const isZero = qty === 0;
                      const isSuccess = restockedSuccessIds[product.id];
                      const isLoading = restockingId === product.id;

                      return (
                        <div
                          key={product.id}
                          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Product Image / Icon */}
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Package size={20} className="text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    isZero
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {isZero ? 'Out of Stock' : 'Low Stock'}
                                </span>
                                <span className="text-xs font-mono font-bold text-[#c2410c]">
                                  {product.sku}
                                </span>
                              </div>
                              <h3 className="font-bold text-xs text-slate-800 truncate mt-0.5 group-hover:text-[#c2410c] transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                Current: <span className="font-bold text-slate-700">{qty} units</span> • Reorder at: {product.reorderLevel || 10}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Instant Restock +10 Button */}
                            <button
                              onClick={() => handleQuickRestock(product, 10)}
                              disabled={isLoading || isSuccess}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSuccess
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#c2410c] hover:border-orange-200 border border-slate-200'
                              }`}
                              title="Restock 10 units immediately"
                            >
                              {isLoading ? (
                                <Loader2 size={13} className="animate-spin text-[#c2410c]" />
                              ) : isSuccess ? (
                                <>
                                  <Check size={13} />
                                  <span>+10 Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={13} />
                                  <span>+10</span>
                                </>
                              )}
                            </button>

                            {/* Jump to Inventory */}
                            <button
                              onClick={() => navigate(`/inventory?search=${encodeURIComponent(product.sku)}`)}
                              className="p-2 text-slate-400 hover:text-[#c2410c] hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                              title="View and adjust in Inventory"
                            >
                              <ArrowUpRight size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section B: Operational Activity Logs */}
              {showAlerts && filteredAlerts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-blue-600" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                        System Operational Logs ({filteredAlerts.length})
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Audit Logs & Status Records
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex items-start justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                            <Sparkles size={18} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                System Event
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(alert.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}{' '}
                                at{' '}
                                {new Date(alert.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 leading-snug">
                              {alert.message}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => clearInventoryAlert(alert.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex-shrink-0"
                          title="Dismiss this log"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clearing Logs */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Operational Logs?"
        message="This will dismiss all current operational log entries. Stock threshold alerts will remain visible as long as inventory levels are low."
        confirmText="Yes, Clear Logs"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          clearAllInventoryAlerts();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}
