import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
        active: currentHour >= hour && currentHour < hour + 2
      };
    });
  }, [data, sales]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={50}>
          <defs>
            <linearGradient id="colorSalesActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity={0.95}/>
              <stop offset="100%" stopColor="#9a3412" stopOpacity={0.95}/>
            </linearGradient>
            <linearGradient id="colorSalesInactive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.95}/>
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.95}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
            formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Sales']}
          />
          <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => {
              const isMultiDay = !chartData.some(e => e.active);
              const isHighlighted = entry.active || (isMultiDay && entry.sales > 0);
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isHighlighted ? 'url(#colorSalesActive)' : 'url(#colorSalesInactive)'} 
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}