import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SalesChart from '../components/dashboard/SalesChart';
import LowStockWidget from '../components/dashboard/LowStockWidget';
import { useApp } from '../contexts/AppContext';
import {
  Boxes,
  DollarSign,
  Receipt,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Star,
  Banknote,
  CreditCard,
  Smartphone,
  Calendar,
} from 'lucide-react';

export default function Dashboard() {
  const { sales, suppliers, products, getLowStock } = useApp();
  const navigate = useNavigate();

  // Calculate Daily Stats
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todaySales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= today && sale.status !== 'cancelled';
    });
  }, [sales, today]);

  const dailyRevenue = useMemo(() => {
    return todaySales.reduce((acc, sale) => acc + (Number(sale.total) || 0), 0);
  }, [todaySales]);

  const dailyTransactions = todaySales.length;

  const lowStockCount = useMemo(() => {
    return getLowStock().length;
  }, [getLowStock]);

  const totalProducts = products.length;

  // Recent Transactions (Last 5)
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5);
  }, [sales]);

  // Calculate Top Supplier
  const topSupplier = useMemo(() => {
    return [...suppliers].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  }, [suppliers]);

  const nextDeliveryDate = useMemo(() => {
    const d = new Date();
    const deliveryDays = topSupplier?.averageDeliveryTime || 2;
    d.setDate(d.getDate() + deliveryDays);
    return d;
  }, [topSupplier]);

  const deliveryText = `${nextDeliveryDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })}, 09:00 AM`;


  return (
    <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
        {/* 1. Dashboard Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Operations Dashboard
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live System Active
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Real-time revenue monitoring, stock health, and POS transaction ledger.
            </p>
          </div>

          {/* Date Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-slate-600 text-xs font-bold shadow-xs">
              <Calendar size={14} className="text-[#c2410c]" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Top Metric KPI Cards (4-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1: Daily Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Today's Revenue
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                ₱{dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <span>{dailyTransactions} transaction{dailyTransactions !== 1 ? 's' : ''} recorded today</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <DollarSign size={24} />
            </div>
          </div>

          {/* KPI 2: Completed Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Total Orders
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {sales.length}
              </p>
              <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-0.5">
                <span>POS registers active</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Receipt size={24} />
            </div>
          </div>

          {/* KPI 3: Total Products in Catalog */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-orange-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Catalog Items
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {totalProducts}
              </p>
              <p className="text-[11px] font-bold text-[#c2410c] flex items-center gap-1 mt-0.5">
                <span>Across 7 categories</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#c2410c] border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Boxes size={24} />
            </div>
          </div>

          {/* KPI 4: Low Stock Attention */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-amber-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Critical Reorder
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {lowStockCount}
              </p>
              <p
                className={`text-[11px] font-bold flex items-center gap-1 mt-0.5 ${
                  lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {lowStockCount > 0 ? `${lowStockCount} items below threshold` : 'All items optimal'}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ${
                lowStockCount > 0
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
            >
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        {/* 3. Analytics & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Sales Chart & Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Sales Performance Chart Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#c2410c]" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Daily Sales Performance
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time hourly revenue tracking compared with operational target
                  </p>
                </div>

                <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 self-start">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Gross Revenue
                    </p>
                    <p className="text-lg font-black text-[#c2410c]">
                      ₱{dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Completed
                    </p>
                    <p className="text-lg font-black text-slate-800">
                      {dailyTransactions} orders
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-[310px] w-full">
                <SalesChart />
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recent POS Transactions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest sales activity tendered across cashier terminals
                  </p>
                </div>

                <button
                  onClick={() => navigate('/sales')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#c2410c] hover:text-[#9a3412] hover:underline cursor-pointer"
                >
                  <span>View All History</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-3.5">Invoice ID</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Payment Method</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentSales.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No transactions recorded yet today.
                        </td>
                      </tr>
                    ) : (
                      recentSales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                            #{sale.id}
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-slate-700">
                            {sale.customerName || 'Walk-in Customer'}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium capitalize">
                              {sale.paymentMethod === 'cash' ? (
                                <Banknote size={14} className="text-emerald-600" />
                              ) : sale.paymentMethod === 'online' ? (
                                <Smartphone size={14} className="text-blue-600" />
                              ) : (
                                <CreditCard size={14} className="text-purple-600" />
                              )}
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-black text-slate-900">
                            ₱{Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                sale.status === 'cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {sale.status || 'completed'}
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

          {/* Right Column (1 Col): Restock Watchlist & Top Supplier */}
          <div className="space-y-6 flex flex-col">
            {/* Low Stock Alerts Widget */}
            <div className="flex-1">
              <LowStockWidget />
            </div>

            {/* Top Supplier Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c2410c] bg-orange-50 px-2.5 py-1 rounded-md">
                  Verified Vendor Partner
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={13} fill="currentColor" />
                  <span className="text-xs font-black text-slate-800">
                    {topSupplier?.rating ? Number(topSupplier.rating).toFixed(1) : '4.9'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {topSupplier?.name || 'ABC Hardware Supplies'}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {topSupplier?.category || 'Hand Tools, Power Equipment'}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Contact Person:</span>
                    <span className="font-bold text-slate-800">{topSupplier?.contactPerson || 'Jose Rizal'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Next Delivery:</span>
                    <span className="font-black text-[#c2410c]">{deliveryText}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Lead Time:</span>
                    <span className="font-bold text-slate-800">{topSupplier?.averageDeliveryTime ?? 2} days</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/suppliers')}
                  className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-[#c2410c] font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Supplier Network</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}