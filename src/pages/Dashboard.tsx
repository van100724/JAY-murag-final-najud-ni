import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SalesChart from '../components/dashboard/SalesChart';
import LowStockWidget from '../components/dashboard/LowStockWidget';
import { useApp } from '../contexts/AppContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  ShoppingCart,
  Box,
  RefreshCcw,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export default function Dashboard() {
  const { sales, suppliers, user, seedDemoDatabase, showToast } = useApp();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  // Calculate Daily Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    return saleDate >= today && sale.status === 'completed';
  });

  const dailyRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const dailyTransactions = todaySales.length;

  // Calculate Top Supplier
  const topSupplier = [...suppliers].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  const nextDeliveryDate = new Date();
  const deliveryDays = topSupplier?.averageDeliveryTime || 1;
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + deliveryDays);
  const deliveryTime = "09:00 AM";

  const isTomorrow = deliveryDays === 1;
  const deliveryText = isTomorrow
    ? `Tomorrow, ${deliveryTime}`
    : `${nextDeliveryDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}, ${deliveryTime}`;

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleConfirmSeed = async () => {
    setShowSeedConfirm(false);
    setIsSeeding(true);
    try {
      const isOnline = await seedDemoDatabase();
      showToast(
        isOnline
          ? 'Live database seeded with high-fidelity catalog, suppliers, and sales history.'
          : 'Terminal storage seeded with demo catalog and sales records.',
        'success'
      );
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showToast('Seeding failed: ' + (err?.message || 'Unknown error'), 'error');
      setIsSeeding(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800">
        {/* System Banner */}
        <div className="bg-[#9a3412] text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-orange-900/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">Central Inventory Ledger Active</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                Database synced in real time. POS registers and stock counts operational.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSeedConfirm(true)}
              disabled={isSeeding}
              aria-label="Seed sample demonstration data"
              className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} className={isSeeding ? 'animate-spin' : ''} />
              {isSeeding ? 'Seeding Demo...' : 'Seed Demo Data'}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              aria-label="Reset local terminal cache"
              className="bg-white/95 text-[#9a3412] hover:bg-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              Reset Cache
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user?.role === 'cashier' ? (
            <div
              onClick={() => navigate('/pos')}
              className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group cursor-pointer hover:border-[#c2410c]/40 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#c2410c] group-hover:scale-110 transition-transform flex-shrink-0">
                <ShoppingCart size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">New POS Sale</h3>
                <p className="text-slate-400 text-sm font-medium">Initiate barcode scanning and checkout</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate('/suppliers')}
              className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group cursor-pointer hover:border-emerald-500/40 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0">
                <Truck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Supplier Network</h3>
                <p className="text-slate-400 text-sm font-medium">Manage verified vendors and purchase orders</p>
              </div>
            </div>
          )}

          <div
            onClick={() => navigate('/inventory')}
            className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 group cursor-pointer hover:border-blue-500/40 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0">
              <Box size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Inventory Control</h3>
              <p className="text-slate-400 text-sm font-medium">Manage SKU catalogue and price adjustments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Performance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Daily Sales Performance</h2>
                  <p className="text-xs text-slate-400">Real-time revenue tracking across active terminals</p>
                </div>
                <div className="flex gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Revenue</p>
                    <p className="text-2xl font-black text-[#9a3412] tracking-tighter">
                      ₱{dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right border-l border-slate-100 pl-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transactions</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter">{dailyTransactions}</p>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                <SalesChart />
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Transactions</h2>
                <button
                  onClick={() => navigate('/sales')}
                  className="text-[10px] font-black text-[#9a3412] uppercase tracking-widest hover:underline"
                >
                  View All History
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          <p className="font-bold text-sm text-slate-500">No transactions recorded today</p>
                          <p className="text-xs text-slate-400 mt-1">New completed checkouts will appear here automatically.</p>
                          {user?.role === 'cashier' && (
                            <button
                              onClick={() => navigate('/pos')}
                              className="mt-3 px-4 py-2 bg-orange-50 text-[#c2410c] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-orange-100 transition-all"
                            >
                              Open POS Terminal
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      sales.slice(0, 5).map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 font-bold text-slate-600 text-xs">{sale.id}</td>
                          <td className="px-6 py-5">
                            <div className="max-w-[200px] truncate font-medium text-slate-700 text-xs">
                              {sale.items.map(i => i.productName).join(', ')}
                            </div>
                            {sale.items.length > 1 && (
                              <span className="text-[10px] font-bold text-slate-400"> ({sale.items.length} items)</span>
                            )}
                          </td>
                          <td className="px-6 py-5 font-medium text-slate-600 text-xs">{sale.customerName || 'Walk-in'}</td>
                          <td className="px-6 py-5 font-black text-slate-800 text-right text-xs">
                            ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              sale.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : sale.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="flex-1">
              <LowStockWidget />
            </div>

            {/* Top Supplier Status */}
            <div className="bg-[#1a202c] rounded-2xl p-6 shadow-xl border border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Supplier Status</p>
                <h3 className="text-2xl font-black text-white mb-6">{topSupplier?.name || 'No Supplier Data'}</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Dispatch</p>
                      <p className="text-white font-bold text-sm">
                        {topSupplier ? deliveryText : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-[#c2410c] rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Standard lead time: {topSupplier?.averageDeliveryTime ?? 1} business day(s)</p>
                </div>
              </div>
              <Truck className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
              <Truck size={24} className="absolute top-6 right-6 text-[#c2410c]" />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Reset Terminal Cache?"
        message="This will clear your local cached session data and reset terminal state. You will be redirected to the login screen. No database records will be lost."
        confirmText="Yes, Reset Terminal"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmDialog
        open={showSeedConfirm}
        title="Seed Demonstration Data?"
        message="This will populate your catalog with 120 hardware products, verified suppliers, and 30-day realistic sales ledger entries. Perfect for system walkthroughs and presentations."
        confirmText="Yes, Seed Data"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={handleConfirmSeed}
        onCancel={() => setShowSeedConfirm(false)}
      />
    </>
  );
}