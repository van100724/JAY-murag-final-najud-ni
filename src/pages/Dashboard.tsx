import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SalesChart from '../components/dashboard/SalesChart';
import LowStockWidget from '../components/dashboard/LowStockWidget';
import { useApp } from '../contexts/AppContext';
import { 
  ShoppingCart, 
  Box, 
  RefreshCcw, 
  Truck,
} from 'lucide-react';

export default function Dashboard() {
  const { sales, suppliers, user, logout } = useApp();
  const navigate = useNavigate();

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
  const topSupplier = [...suppliers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0];
  
  const nextDeliveryDate = new Date();
  nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1);
  const deliveryTime = "09:00 AM";
  const handleSyncWarehouse = () => {
    if (window.confirm('CRITICAL: This will synchronize your terminal with the central warehouse database. All local modifications, custom products, and sales history will be wiped. Proceed with System Sync?')) {
      // Aggressive clear
      localStorage.clear();
      window.location.href = '/login'; // Force redirect to login for fresh state
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800">
      {/* System Banner */}
      <div className="bg-[#9a3412] text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-orange-900/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center animate-spin-slow">
            <RefreshCcw size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">System Inventory Sync Active</h2>
            <p className="text-white/70 text-xs">Last updated 2 minutes ago. All Warehouse A-12 terminals are operational.</p>
          </div>
        </div>
        <button 
          onClick={handleSyncWarehouse}
          className="bg-white text-[#9a3412] px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <RefreshCcw size={14} className="animate-spin-hover" />
          Sync Warehouse
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.role === 'cashier' ? (
          <div 
            onClick={() => navigate('/pos')}
            className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 group cursor-pointer hover:border-[#c2410c]/40 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#c2410c] group-hover:scale-110 transition-transform">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">New POS Sale</h3>
              <p className="text-slate-400 text-sm font-medium">Initiate a customer transaction</p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => navigate('/suppliers')}
            className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 group cursor-pointer hover:border-emerald-500/40 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Truck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Supplier Network</h3>
              <p className="text-slate-400 text-sm font-medium">Manage vendors and logistics</p>
            </div>
          </div>
        )}

        <div 
          onClick={() => navigate('/inventory')}
          className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 group cursor-pointer hover:border-blue-500/40 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Box size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Inventory Control</h3>
            <p className="text-slate-400 text-sm font-medium">Manage stock levels and SKUs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Daily Sales Performance</h2>
                <p className="text-xs text-slate-400">Real-time revenue tracking across terminals</p>
              </div>
              <div className="flex gap-12">
                 <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Revenue</p>
                  <p className="text-2xl font-black text-[#9a3412] tracking-tighter">₱{dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right border-l border-slate-100 pl-12">
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
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Recent Transactions</h2>
              <button className="text-[10px] font-black text-[#9a3412] uppercase tracking-widest hover:underline">
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
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-500">{sale.id}</td>
                      <td className="px-6 py-5">
                        <div className="max-w-[200px] truncate font-medium text-slate-600">
                          {sale.items.map(i => i.productName).join(', ')}
                        </div>
                        {sale.items.length > 1 && (
                          <span className="text-[10px] font-bold text-slate-400"> (x{sale.items.length})</span>
                        )}
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-600">{sale.customerName || 'Walk-in'}</td>
                      <td className="px-6 py-5 font-black text-slate-800">₱{sale.total.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sale.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : sale.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
          <div className="bg-[#1a202c] rounded-xl p-6 shadow-xl border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Top Supplier Status</p>
              <h3 className="text-2xl font-black text-white mb-6">{topSupplier?.name || 'No Supplier Data'}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Next Delivery</p>
                    <p className="text-white font-bold text-sm">
                      {topSupplier ? `Tomorrow, ${deliveryTime}` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[70%] bg-[#c2410c] rounded-full" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic">Shipment is currently in transit to Warehouse A-12</p>
              </div>
            </div>
            <Truck className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            <Truck size={24} className="absolute top-6 right-6 text-[#c2410c]" />
          </div>
        </div>
      </div>
    </div>
  );
}