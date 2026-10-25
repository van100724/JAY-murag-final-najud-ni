import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { Product } from '../data/inventory';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Package,
  ShieldCheck,
  ArrowUpRight,
  Search,
  Trash2,
  Check,
  Sparkles,
  Boxes,
  Loader2,
} from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const {
    getLowStock,
    getInventoryAlerts,
    clearInventoryAlert,
    clearAllInventoryAlerts,
    products,
    updateExistingProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'stock' | 'operational'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [restockedSuccessIds, setRestockedSuccessIds] = useState<Record<string, boolean>>({});

  const lowStockProducts = getLowStock();
  const alerts = getInventoryAlerts();

  // Metric Computations
  const outOfStockCount = useMemo(
    () => lowStockProducts.filter((p) => (Number(p.quantity) || 0) === 0).length,
    [lowStockProducts]
  );

  const lowStockCount = useMemo(
    () => lowStockProducts.filter((p) => (Number(p.quantity) || 0) > 0).length,
    [lowStockProducts]
  );

  const totalAlerts = lowStockProducts.length + alerts.length;

  const catalogHealth = useMemo(() => {
    if (!products.length) return 100;
    const healthyCount = products.length - lowStockProducts.length;
    return Math.max(0, Math.round((healthyCount / products.length) * 100));
  }, [products, lowStockProducts]);

  // Quick 1-tap restock directly from notification card
  const handleQuickRestock = async (product: Product, addQty = 20) => {
    try {
      setRestockingId(product.id);
      const currentQty = Number(product.quantity) || 0;
      await updateExistingProduct(product.id, { quantity: currentQty + addQty });
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
    <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              System Notifications
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#c2410c] border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse" />
              Live Health Monitor
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Real-time stock threshold warnings, inventory reorder triggers, and operational audit logs.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {alerts.length > 0 && (
            <button
              onClick={clearAllInventoryAlerts}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Clear System Logs</span>
            </button>
          )}

          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-900/15 active:scale-95 cursor-pointer"
          >
            <Boxes size={15} />
            <span>Open Inventory</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Critical Stock Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Stock Threshold Alerts
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {lowStockProducts.length}{' '}
              <span className="text-xs font-bold text-slate-400 font-normal">items</span>
            </h3>
            <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
              <span>{outOfStockCount} zero stock</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600">{lowStockCount} below reorder</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#c2410c] group-hover:scale-105 transition-transform flex-shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Card 2: Operational Activity Logs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Operational Logs
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {alerts.length}{' '}
              <span className="text-xs font-bold text-slate-400 font-normal">entries</span>
            </h3>
            <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
              <span>Active operational activity</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0">
            <Bell size={22} />
          </div>
        </div>

        {/* Card 3: Overall Stock Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Catalog Stock Health
            </p>
            <h3 className="text-2xl font-black text-slate-900">{catalogHealth}%</h3>
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <span>
                {Math.max(0, products.length - lowStockProducts.length)} of {products.length} SKUs
                healthy
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* 3. Control & Filter Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Notifications', count: totalAlerts },
            { id: 'stock', label: 'Stock Warnings', count: lowStockProducts.length },
            { id: 'operational', label: 'Operational Logs', count: alerts.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#c2410c] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search Input */}
        <div className="relative md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter warnings or SKU..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#c2410c] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Notification Streams */}
      {totalFilteredCount === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-4 shadow-xs">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">All Systems Operational</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            {searchQuery
              ? `No notifications found matching "${searchQuery}". Try clearing your search.`
              : 'There are currently no critical stock threshold warnings or unresolved operational events. Your hardware inventory is in optimal condition!'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Boxes size={15} />
              <span>Inspect Inventory</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section A: Stock Threshold Alerts */}
          {showStock && filteredLowStock.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#c2410c]" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                    Inventory Stock Deficits ({filteredLowStock.length})
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  1-Tap Instant Restock Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLowStock.map((product) => {
                  const qty = Number(product.quantity) || 0;
                  const reorder = product.reorderLevel || 10;
                  const isOutOfStock = qty === 0;
                  const deficit = Math.max(reorder - qty, 0);
                  const progressPct = Math.min(100, Math.round((qty / Math.max(reorder, 1)) * 100));
                  const isRestocking = restockingId === product.id;
                  const isSuccess = !!restockedSuccessIds[product.id];

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-2xl border p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                        isOutOfStock
                          ? 'border-rose-200/90 hover:border-rose-300'
                          : 'border-orange-200/90 hover:border-orange-300'
                      }`}
                    >
                      <div>
                        {/* Top Meta Header */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isOutOfStock
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                  : 'bg-orange-50 text-[#c2410c] border border-orange-200'
                              }`}
                            >
                              {isOutOfStock ? 'Out of Stock' : 'Low Stock Level'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                              {product.category || 'General'}
                            </span>
                          </div>

                          <span className="font-mono text-[10px] font-extrabold text-slate-400 tracking-wider">
                            SKU: {product.sku}
                          </span>
                        </div>

                        {/* Product Title & Stock Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-slate-900 truncate leading-tight group-hover:text-[#c2410c] transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">
                              ₱{Number(product.price).toLocaleString()} • Unit Stock
                            </p>
                          </div>
                        </div>

                        {/* Progress Meter Bar */}
                        <div className="space-y-1 mb-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={isOutOfStock ? 'text-rose-600' : 'text-slate-600'}>
                              Current: {qty} unit{qty !== 1 ? 's' : ''}
                            </span>
                            <span className="text-slate-400">Reorder Level: {reorder}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOutOfStock
                                  ? 'bg-rose-500 w-1'
                                  : progressPct <= 50
                                  ? 'bg-orange-500'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.max(progressPct, 4)}%` }}
                            />
                          </div>
                          <p className="text-[9px] font-extrabold text-rose-500 text-right uppercase tracking-wider">
                            Deficit: {deficit} unit{deficit !== 1 ? 's' : ''} needed
                          </p>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleQuickRestock(product, 20)}
                          disabled={isRestocking}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isSuccess
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[#c2410c] hover:bg-[#9a3412] text-white shadow-xs active:scale-95'
                          }`}
                        >
                          {isRestocking ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Restocking...</span>
                            </>
                          ) : isSuccess ? (
                            <>
                              <Check size={13} />
                              <span>+20 Units Restocked!</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Quick Restock (+20)</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/inventory?search=${encodeURIComponent(product.sku)}`)
                          }
                          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
                          title="View SKU in Inventory"
                        >
                          <span>Manage</span>
                          <ArrowUpRight size={13} />
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
  );
}
