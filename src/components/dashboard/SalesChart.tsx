import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../contexts/AppContext';

interface SalesChartProps {
  data?: any[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const { sales } = useApp();

  const chartData = useMemo(() => {
    if (data) return data;

    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= today && sale.status === 'completed';
    });

    const currentHour = new Date().getHours();

    return hours.map(h => {
      const [hourStr] = h.split(':');
      const hour = parseInt(hourStr);
      
      // Get sales for this 2-hour bucket (e.g., 08:00 includes 08:00 and 09:00)
      const bucketSales = todaySales.filter(sale => {
        const saleHour = new Date(sale.saleDate).getHours();
        return saleHour === hour || saleHour === hour + 1;
      });

      const total = bucketSales.reduce((sum, s) => sum + s.total, 0);

      return {
        time: h,
        sales: total,
        projection: total > 0 ? Math.round(total * 1.15) : Math.round(3000 + Math.random() * 2000),
        active: currentHour >= hour && currentHour < hour + 2
      };
    });
  }, [data, sales]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actual = payload.find((p: any) => p.dataKey === 'sales')?.value || 0;
      const projected = payload.find((p: any) => p.dataKey === 'projection')?.value || 0;
      const variance = projected > 0 ? ((actual / projected) * 100).toFixed(0) : '0';
      const isMet = actual >= projected;

      return (
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-xs font-medium space-y-2.5 text-slate-200 min-w-[220px]">
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{label}</p>
          
          <div className="flex justify-between items-center gap-6">
            <span className="flex items-center gap-2 text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ea580c] to-[#c2410c]" />
              Actual Sales
            </span>
            <span className="text-white font-black text-sm">₱{actual.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center gap-6">
            <span className="flex items-center gap-2 text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#fdba74] to-[#fb923c]" />
              Projected Target
            </span>
            <span className="text-white font-black text-sm">₱{projected.toLocaleString()}</span>
          </div>

          <div className="border-t border-slate-800/80 pt-2 flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
            <span className="text-slate-500">Target Met</span>
            <span className={isMet ? 'text-emerald-400' : 'text-orange-400'}>
              {variance}% {isMet ? '✓' : ''}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }} barGap={8}>
          <defs>
            <linearGradient id="actualSalesBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c"/>
              <stop offset="100%" stopColor="#c2410c"/>
            </linearGradient>
            <linearGradient id="projectedSalesBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdba74"/>
              <stop offset="100%" stopColor="#fb923c"/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="6 6" stroke="#f1f5f9" vertical={false} />
          
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700', letterSpacing: '0.05em' }} 
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '700' }}
            tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
            dx={-10}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
          
          {/* Actual Sales Bar */}
          <Bar 
            dataKey="sales" 
            fill="url(#actualSalesBar)"
            radius={[6, 6, 0, 0]} 
            barSize={16} 
          />

          {/* Projected Target Bar */}
          <Bar 
            dataKey="projection" 
            fill="url(#projectedSalesBar)"
            radius={[6, 6, 0, 0]} 
            barSize={16} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}