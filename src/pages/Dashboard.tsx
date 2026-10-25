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
      return saleDate >= today && sale.status === 'completed';
    });
  }, [sales, today]);

  const dailyRevenue = useMemo(() => {
    return todaySales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
  }, [todaySales]);

  const dailyTransactions = todaySales.length;
  const avgTicket = dailyTransactions > 0 ? dailyRevenue / dailyTransactions : 0;

  // Inventory & Restock metrics
  const inventoryValue = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
      0
    );
  }, [products]);

  const lowStockProducts = getLowStock();
  const lowStockCount = lowStockProducts.length;

  // Recent 5 sales sorted by date
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
            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>{dailyTransactions} orders today</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <DollarSign size={24} />
          </div>
        </div>

        {/* KPI 2: Today's Orders / Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-orange-200 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Daily Transactions
            </p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {dailyTransactions}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              Avg: ₱{avgTicket.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / ticket
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#c2410c] border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Receipt size={24} />
          </div>
        </div>

        {/* KPI 3: Total Asset Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Inventory Assets
            </p>
            <p className="text-2xl font-black text-slate-900 tracking-tight truncate max-w-[150px]">
              ₱{inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] font-semibold text-blue-600">
              {products.length} registered SKUs
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <Boxes size={24} />
          </div>
        </div>

        {/* KPI 4: Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-amber-200 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Restock Needed
            </p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {lowStockCount}
            </p>
            <p
              className={`text-[11px] font-semibold ${
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



      {/* 4. Analytics & Details Grid */}
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
                  Latest customer checkout records
                </p>
              </div>
              <button
                onClick={() => navigate('/sales')}
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#c2410c] hover:text-[#9a3412] hover:underline cursor-pointer"
              >
                <span>View Full Ledger</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Items Purchased</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-orange-50/25 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-[#c2410c]">
                        {sale.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px] truncate font-semibold text-slate-700 text-xs">
                          {sale.items.map((i: any) => i.productName).join(', ')}
                        </div>
                        {sale.items.length > 1 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            ({sale.items.length} items)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-xs text-slate-600">
                        {sale.customerName || 'Walk-in Customer'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
                          {sale.paymentMethod === 'cash' ? (
                            <Banknote size={11} className="text-emerald-600" />
                          ) : sale.paymentMethod === 'card' ? (
                            <CreditCard size={11} className="text-blue-600" />
                          ) : (
                            <Smartphone size={11} className="text-purple-600" />
                          )}
                          {sale.paymentMethod || 'cash'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-sm text-slate-900">
                        ₱{Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sale.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sale.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sale.status === 'completed'
                                ? 'bg-emerald-500'
                                : sale.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No transactions recorded yet today.
                      </td>
                    </tr>
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
                  <span className="font-bold text-emerald-600">{topSupplier?.averageDeliveryTime || 2} Days Avg</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/suppliers')}
                className="w-full py-2.5 bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Manage Supplier Network</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}