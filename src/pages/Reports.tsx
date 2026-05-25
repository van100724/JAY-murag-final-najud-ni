import { useState, useMemo, useCallback } from 'react';
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
  }, [getSalesReportData, dateRange, sales]);

  const topProducts = useMemo(() => {
    return getTopSellingProducts(dateRange.start, dateRange.end, 10);
  }, [getTopSellingProducts, dateRange, sales]);

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
          projection: total > 0 ? Math.round(total * 1.15) : Math.round(3000 + Math.random() * 2000),
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

    const totalSalesSum = periodSales.reduce((sum, s) => sum + s.total, 0);
    const avgDailySales = diffDays > 0 ? totalSalesSum / diffDays : 10000;
    const baseTarget = Math.max(avgDailySales * 1.1, 7000);

    return days.map(d => {
      const dDate = new Date(d.dateStr);
      const isWeekend = dDate.getDay() === 0 || dDate.getDay() === 6;
      const targetFactor = isWeekend ? 1.25 : 0.95;
      const projectionVal = Math.round(baseTarget * targetFactor);

      return {
        time: d.time,
        sales: d.sales,
        projection: projectionVal,
        active: false
      };
    });
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

  // Build the printable HTML content for the report
  const buildReportHTML = useCallback(() => {
    const startStr = dateRange.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const endStr = dateRange.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const generatedAt = new Date().toLocaleString();

    // Summary cards data
    const summaryCards = [
      { title: 'Net Sales', value: `₱${report.totalSales.toLocaleString()}`, trend: '+12.5%', color: '#c2410c', bgColor: '#fff7ed' },
      { title: 'Transactions', value: report.totalTransactions.toString(), trend: '+8.2%', color: '#2563eb', bgColor: '#eff6ff' },
      { title: 'Avg. Order Value', value: `₱${report.averageTransaction.toFixed(2)}`, trend: '+3.1%', color: '#7c3aed', bgColor: '#f5f3ff' },
      { title: 'Gross Margin', value: '24.8%', trend: '+1.2%', color: '#059669', bgColor: '#ecfdf5' },
    ];

    const summaryCardsHTML = summaryCards.map(card => `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; flex: 1; min-width: 160px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: ${card.bgColor}; display: flex; align-items: center; justify-content: center;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background: ${card.color};"></div>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 2px 8px; border-radius: 999px;">▲ ${card.trend}</span>
        </div>
        <p style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">${card.title}</p>
        <p style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 4px 0 0 0; letter-spacing: -0.025em;">${card.value}</p>
      </div>
    `).join('');

    // Revenue vs Projection table
    const chartTableRows = chartData.map((row, i) => `
      <tr style="border-bottom: 1px solid #f1f5f9; ${i % 2 === 0 ? 'background: #fafbfc;' : 'background: white;'}">
        <td style="padding: 10px 14px; font-weight: 700; color: #334155; font-size: 12px;">${row.time}</td>
        <td style="padding: 10px 14px; font-family: 'Courier New', monospace; font-weight: 700; color: #0f172a; font-size: 12px; text-align: right;">₱${row.sales.toLocaleString()}</td>
        <td style="padding: 10px 14px; font-family: 'Courier New', monospace; font-weight: 600; color: #94a3b8; font-size: 12px; text-align: right;">₱${(row as any).projection?.toLocaleString() || '—'}</td>
        <td style="padding: 10px 14px; text-align: right;">
          <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 999px; ${
            (row as any).projection && row.sales >= (row as any).projection
              ? 'color: #059669; background: #ecfdf5;'
              : 'color: #c2410c; background: #fff7ed;'
          }">${(row as any).projection ? ((row.sales / (row as any).projection) * 100).toFixed(0) + '%' : '—'}</span>
        </td>
      </tr>
    `).join('');

    // Top products table
    const topProductsRows = topProducts.slice(0, 10).map((item, i) => `
      <tr style="border-bottom: 1px solid #f1f5f9; ${i % 2 === 0 ? 'background: #fafbfc;' : 'background: white;'}">
        <td style="padding: 10px 14px; text-align: center;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 8px; background: ${i < 3 ? '#c2410c' : '#f1f5f9'}; color: ${i < 3 ? 'white' : '#64748b'}; font-size: 10px; font-weight: 900;">${i + 1}</span>
        </td>
        <td style="padding: 10px 14px; font-weight: 700; color: #334155; font-size: 12px;">${item.productName}</td>
        <td style="padding: 10px 14px; font-weight: 600; color: #64748b; font-size: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 14px; font-family: 'Courier New', monospace; font-weight: 700; color: #0f172a; font-size: 12px; text-align: right;">₱${item.revenue.toLocaleString()}</td>
      </tr>
    `).join('');

    // Calculate totals for the chart data
    const totalActual = chartData.reduce((sum, r) => sum + r.sales, 0);
    const totalProjection = chartData.reduce((sum, r) => sum + ((r as any).projection || 0), 0);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>J&JAY Sales Report - ${startStr} to ${endStr}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Outfit', sans-serif;
              background: #f8fafc;
              color: #0f172a;
              padding: 32px;
              font-size: 13px;
              line-height: 1.5;
            }
            @media print {
              body {
                background: white;
                padding: 16px;
              }
              .page-break {
                page-break-before: always;
              }
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              background: #f8fafc;
              padding: 10px 14px;
              font-size: 9px;
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              text-align: left;
              border-bottom: 2px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <img src="/J&JAY.jpg" alt="J&JAY Logo" style="width: 56px; height: 56px; border-radius: 14px; object-fit: cover; border: 1px solid #e2e8f0;" />
              <div>
                <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.025em; line-height: 1;">J&JAY</h1>
                <p style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;">POS & Inventory System</p>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 16px; font-weight: 900; color: #0f172a;">Sales Performance Report</p>
              <p style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-top: 2px;">${startStr} — ${endStr}</p>
              <p style="font-size: 9px; font-weight: 500; color: #cbd5e1; margin-top: 4px;">Generated: ${generatedAt}</p>
            </div>
          </div>

          <!-- Summary Cards -->
          <div style="display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;">
            ${summaryCardsHTML}
          </div>

          <!-- Revenue vs Projection Table -->
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 28px;">
            <div style="padding: 20px 20px 12px 20px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a;">Revenue vs Projection</h2>
              <p style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-top: 2px;">Comparison of actual sales against projected targets</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th style="text-align: right;">Actual Sales</th>
                  <th style="text-align: right;">Projected</th>
                  <th style="text-align: right;">Achievement</th>
                </tr>
              </thead>
              <tbody>
                ${chartTableRows}
              </tbody>
              <tfoot>
                <tr style="background: #f8fafc; border-top: 2px solid #e2e8f0;">
                  <td style="padding: 12px 14px; font-weight: 900; font-size: 11px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Total</td>
                  <td style="padding: 12px 14px; font-family: 'Courier New', monospace; font-weight: 900; color: #0f172a; font-size: 13px; text-align: right;">₱${totalActual.toLocaleString()}</td>
                  <td style="padding: 12px 14px; font-family: 'Courier New', monospace; font-weight: 700; color: #94a3b8; font-size: 13px; text-align: right;">₱${totalProjection.toLocaleString()}</td>
                  <td style="padding: 12px 14px; text-align: right;">
                    <span style="font-size: 11px; font-weight: 900; padding: 3px 10px; border-radius: 999px; ${
                      totalActual >= totalProjection
                        ? 'color: #059669; background: #ecfdf5;'
                        : 'color: #c2410c; background: #fff7ed;'
                    }">${totalProjection > 0 ? ((totalActual / totalProjection) * 100).toFixed(1) + '%' : '—'}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Top Products Table -->
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 28px;">
            <div style="padding: 20px 20px 12px 20px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a;">Top Performing Products</h2>
              <p style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-top: 2px;">Best selling items during the selected period</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center; width: 50px;">Rank</th>
                  <th>Product Name</th>
                  <th style="text-align: center;">Units Sold</th>
                  <th style="text-align: right;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${topProductsRows}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em;">
              J&JAY POS & Inventory System • Confidential Business Report
            </p>
            <p style="font-size: 9px; font-weight: 500; color: #cbd5e1; margin-top: 4px;">
              National Highway Poblacion 1, Balingasag, Philippines • Tel: 0966 704 3203
            </p>
          </div>
        </body>
      </html>
    `;
  }, [dateRange, report, topProducts, chartData]);

  const handlePrintReport = useCallback(() => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups to print the report.');
      return;
    }
    printWindow.document.write(buildReportHTML());
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 500);
      }, 600);
    };
  }, [buildReportHTML]);

  const handleExportPDF = useCallback(() => {
    // Uses the browser's "Save as PDF" option in the print dialog
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups to export the report as PDF.');
      return;
    }
    printWindow.document.write(buildReportHTML());
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Don't auto-close so user can choose "Save as PDF" in the print dialog
      }, 600);
    };
  }, [buildReportHTML]);

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
          
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-3 bg-[#c2410c] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button 
            onClick={handlePrintReport}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
          >
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