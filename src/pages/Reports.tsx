import { useState, useMemo } from 'react';
import SalesChart from '../components/dashboard/SalesChart';
import { useApp } from '../contexts/AppContext';
import { Calendar, Download, Printer, TrendingUp, Users, CreditCard, PieChart, ArrowUpRight } from 'lucide-react';

export default function Reports() {
  const { getSalesReportData, getTopSellingProducts, sales } = useApp();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  const report = useMemo(() => {
    return getSalesReportData(dateRange.start, dateRange.end);
  }, [getSalesReportData, dateRange]);

  const topProducts = useMemo(() => {
    return getTopSellingProducts(dateRange.start, dateRange.end, 10);
  }, [getTopSellingProducts, dateRange]);

  const chartData = useMemo(() => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get completed sales in the active date range
    const periodSales = sales.filter(sale => {
      const d = new Date(sale.saleDate);
      return d >= start && d <= end && sale.status === 'completed';
    });

    if (diffDays <= 1) {
      // Single day: Show hourly view
      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      const currentHour = new Date().getHours();
      return hours.map(h => {
        const [hourStr] = h.split(':');
        const hour = parseInt(hourStr);
        const bucketSales = periodSales.filter(sale => {
          const saleHour = new Date(sale.saleDate).getHours();
          return saleHour === hour || saleHour === hour + 1;
        });
        const total = bucketSales.reduce((sum, s) => sum + s.total, 0);
        return {
          time: h,
          sales: total,
          active: currentHour >= hour && currentHour < hour + 2
        };
      });
    }

    // Multi-day: Show daily view
    const days: { time: string; dateStr: string; sales: number; active: boolean }[] = [];
    const temp = new Date(start);
    while (temp <= end) {
      const label = temp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        time: label,
        dateStr: temp.toDateString(),
        sales: 0,
        active: false
      });
      temp.setDate(temp.getDate() + 1);
    }

    periodSales.forEach(sale => {
      const saleDayStr = new Date(sale.saleDate).toDateString();
      const dayObj = days.find(d => d.dateStr === saleDayStr);
      if (dayObj) {
        dayObj.sales += sale.total;
      }
    });

    return days.map(d => ({
      time: d.time,
      sales: d.sales,
      active: false
    }));
  }, [sales, dateRange]);

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => {
      const updatedDate = new Date(value);
      // Adjust time to prevent time shift errors
      if (field === 'start') {
        updatedDate.setHours(0, 0, 0, 0);
      } else {
        updatedDate.setHours(23, 59, 59, 999);
      }
      return {
        ...prev,
        [field]: updatedDate,
      };
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Sales Performance Report</h1>
          <p className="text-slate-500 mt-1 font-medium">Detailed analysis of revenue streams and growth patterns.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <Calendar size={14} className="text-[#c2410c]" />
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="bg-transparent outline-none text-[10px] font-black text-slate-600 uppercase"
              />
            </div>
            <span className="text-slate-300 font-black text-[10px]">TO</span>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <Calendar size={14} className="text-[#c2410c]" />
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="bg-transparent outline-none text-[10px] font-black text-slate-600 uppercase"
              />
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-3 bg-[#c2410c] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all">
            <Download size={16} />
            Export PDF
          </button>
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Net Sales" 
          value={`₱${report.totalSales.toLocaleString()}`} 
          trend="+12.5%"
          icon={<TrendingUp size={20} />} 
          color="orange"
        />
        <ReportCard 
          title="Transactions" 
          value={report.totalTransactions.toString()} 
          trend="+8.2%"
          icon={<CreditCard size={20} />} 
          color="blue"
        />
        <ReportCard 
          title="Avg. Order Value" 
          value={`₱${report.averageTransaction.toFixed(2)}`} 
          trend="+3.1%"
          icon={<Users size={20} />} 
          color="purple"
        />
        <ReportCard 
          title="Gross Margin" 
          value="24.8%" 
          trend="+1.2%"
          icon={<PieChart size={20} />} 
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Revenue vs Projection</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Comparison of actual sales against monthly targets.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ea580c] rounded-full" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Projected</span>
              </div>
            </div>
          </div>
          <div className="h-[420px]">
            <SalesChart data={chartData} />
          </div>
        </div>

        {/* Sidebar Metrics */}
        <div className="space-y-8">
          {/* Top Categories */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-8">Top Performing Category</h2>
            <div className="relative flex flex-col items-center justify-center py-6">
               <div className="w-32 h-32 rounded-full border-8 border-slate-50 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-8 border-[#c2410c] border-t-transparent -rotate-45" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">42%</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Power Tools</p>
                  </div>
               </div>
               <div className="mt-8 w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Hand Tools</span>
                    <span className="text-xs font-black text-slate-900">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Plumbing</span>
                    <span className="text-xs font-black text-slate-900">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Others</span>
                    <span className="text-xs font-black text-slate-900">15%</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Top Products</h2>
            <div className="space-y-5">
              {topProducts.slice(0, 5).map((item, index) => (
                <div key={item.productId} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-[#c2410c] group-hover:text-white transition-all">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-800 truncate max-w-[120px]">{item.productName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.quantity} units</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-900 text-sm">₱{item.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, trend, icon, color }: any) {
  const colors: any = {
    orange: 'text-[#c2410c] bg-orange-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#c2410c]/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${colors[color]}`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={10} />
          {trend}
        </div>
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
    </div>
  );
}