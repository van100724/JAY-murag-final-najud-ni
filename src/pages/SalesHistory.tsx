import { useState, useMemo, useEffect, useRef, Fragment, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ReceiptComponent from '../components/pos/Reciept';
import {
  Search,
  Calendar,
  Filter,
  X,
  Eye,
  Ban,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  FileCheck,
  TrendingUp,
  Hash,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  AlertTriangle,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store,
  Copy,
  Check,
  ArrowUpDown,
  FileText,
} from 'lucide-react';

type PaymentFilter = 'all' | 'cash' | 'card' | 'check' | 'online';
type StatusFilter = 'all' | 'completed' | 'cancelled';
type DatePreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom';
type SortField = 'date' | 'total' | 'items';
type SortOrder = 'asc' | 'desc';

export default function SalesHistory() {
  const { sales, products, cancelExistingSale, user } = useApp();
  const [searchParams] = useSearchParams();

  const isAdmin = user?.role === 'admin';
  const currentCashierName = user?.name || 'Cashier User';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [cashierFilter, setCashierFilter] = useState<string>('all');
  const [cashierScope, setCashierScope] = useState<'my' | 'all'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sorting & Pagination State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Expansion State
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [saleToVoid, setSaleToVoid] = useState<any | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Customer Return / Cancellation');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync search input with search query parameter from Topbar
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Keyboard shortcut: Esc to dismiss modals, '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (saleToVoid) setSaleToVoid(null);
        if (selectedSale) setSelectedSale(null);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saleToVoid, selectedSale]);

  // Extract unique cashier names for Admin filter dropdown
  const uniqueCashiers = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => {
      if (s.cashier) set.add(s.cashier);
    });
    return Array.from(set).sort();
  }, [sales]);

  // Quick Date Preset handler
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setDateRange({ start: todayStr, end: todayStr });
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setDateRange({ start: yStr, end: yStr });
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setDateRange({ start: d.toISOString().split('T')[0], end: todayStr });
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setDateRange({ start: d.toISOString().split('T')[0], end: todayStr });
    } else if (preset === 'all') {
      setDateRange({ start: '', end: '' });
    }
    setCurrentPage(1);
  };

  // Filter and search logic
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Cashier role scope: if cashier selected "My Shift Only"
      if (!isAdmin && cashierScope === 'my') {
        const matchesCurrentCashier =
          (sale.cashier || '').toLowerCase() === currentCashierName.toLowerCase();
        if (!matchesCurrentCashier) return false;
      }

      // Admin specific cashier filter
      if (isAdmin && cashierFilter !== 'all') {
        if (sale.cashier !== cashierFilter) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = sale.id.toLowerCase().includes(q);
        const matchesCustomer = (sale.customerName || '').toLowerCase().includes(q);
        const matchesCashier = (sale.cashier || '').toLowerCase().includes(q);
        const matchesProduct = sale.items?.some((item: any) =>
          item.productName.toLowerCase().includes(q)
        );
        if (!matchesId && !matchesCustomer && !matchesCashier && !matchesProduct) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all' && sale.paymentMethod !== paymentFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && sale.status !== statusFilter) return false;

      // Date range filter
      if (dateRange.start) {
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        if (new Date(sale.saleDate) < start) return false;
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (new Date(sale.saleDate) > end) return false;
      }

      return true;
    });
  }, [
    sales,
    isAdmin,
    cashierScope,
    currentCashierName,
    cashierFilter,
    searchQuery,
    paymentFilter,
    statusFilter,
    dateRange,
  ]);

  // Sorted Sales
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
      } else if (sortField === 'total') {
        comparison = Number(b.total) - Number(a.total);
      } else if (sortField === 'items') {
        comparison = (b.items?.length || 0) - (a.items?.length || 0);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }, [filteredSales, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSales.slice(start, start + pageSize);
  }, [sortedSales, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, statusFilter, cashierFilter, cashierScope, dateRange]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const completed = filteredSales.filter((s) => s.status === 'completed');
    const totalRevenue = completed.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalTransactions = completed.length;
    const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const cancelledSales = filteredSales.filter((s) => s.status === 'cancelled');
    const cancelledCount = cancelledSales.length;
    const cancelledAmount = cancelledSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const totalUnits = completed.reduce(
      (sum, s) => sum + s.items.reduce((itemSum: number, i: any) => itemSum + (Number(i.quantity) || 0), 0),
      0
    );

    return {
      totalRevenue,
      totalTransactions,
      avgTicket,
      cancelledCount,
      cancelledAmount,
      totalUnits,
    };
  }, [filteredSales]);

  // Void confirmation handler
  const handleVoidConfirm = async () => {
    if (!saleToVoid) return;
    setCancellingId(saleToVoid.id);
    try {
      await cancelExistingSale(saleToVoid.id, voidReason);
    } finally {
      setCancellingId(null);
      setSaleToVoid(null);
      setVoidReason('Customer Return / Cancellation');
    }
  };

  // Copy Order ID
  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredSales.length === 0) return;
    const headers = [
      'Order ID',
      'Date',
      'Time',
      'Customer',
      'Cashier',
      'Items Count',
      'Payment Method',
      'Total Amount',
      'Status',
    ];
    const rows = filteredSales.map((s) => {
      const d = new Date(s.saleDate);
      return [
        `"${s.id}"`,
        `"${d.toLocaleDateString()}"`,
        `"${d.toLocaleTimeString()}"`,
        `"${(s.customerName || 'Walk-in').replace(/"/g, '""')}"`,
        `"${(s.cashier || 'Unknown').replace(/"/g, '""')}"`,
        s.items.length,
        `"${s.paymentMethod}"`,
        Number(s.total).toFixed(2),
        `"${s.status}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Summary Ledger Report
  const handlePrintLedger = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (!printWindow) return;

    const rowsHtml = filteredSales
      .map((s) => {
        const d = new Date(s.saleDate);
        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 8px 10px; font-weight: bold; font-family: monospace;">${s.id}</td>
            <td style="padding: 8px 10px;">${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td style="padding: 8px 10px;">${s.customerName || 'Walk-in'}</td>
            <td style="padding: 8px 10px;">${s.cashier || 'Cashier'}</td>
            <td style="padding: 8px 10px; text-transform: uppercase;">${s.paymentMethod}</td>
            <td style="padding: 8px 10px; text-align: right; font-weight: bold;">₱${Number(s.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; text-transform: uppercase; font-weight: bold; color: ${s.status === 'completed' ? '#059669' : '#dc2626'};">${s.status}</td>
          </tr>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>J&JAY Hardware - Sales Ledger Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
            h1 { margin: 0; font-size: 20px; font-weight: 800; color: #c2410c; }
            .header { border-bottom: 2px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
            .kpis { display: flex; gap: 16px; margin-bottom: 20px; }
            .kpi { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; flex: 1; }
            .kpi span { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .kpi div { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #f1f5f9; padding: 10px; font-size: 10px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>J&JAY HARDWARE & CONSTRUCTION SUPPLIES</h1>
              <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Official Sales Audit & Transaction Ledger</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <div>Date Generated: ${new Date().toLocaleString()}</div>
              <div>Auditor: ${user?.name || 'Administrator'} (${user?.role || 'admin'})</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi">
              <span>Gross Sales</span>
              <div>₱${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi">
              <span>Transactions</span>
              <div>${metrics.totalTransactions} Orders</div>
            </div>
            <div class="kpi">
              <span>Avg. Ticket</span>
              <div>₱${metrics.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi">
              <span>Voided Count</span>
              <div style="color: #dc2626;">${metrics.cancelledCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Timestamp</th>
                <th>Customer</th>
                <th>Cashier</th>
                <th>Payment</th>
                <th style="text-align: right;">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const paymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote size={13} />;
      case 'card':
        return <CreditCard size={13} />;
      case 'online':
        return <Smartphone size={13} />;
      case 'check':
        return <FileCheck size={13} />;
      default:
        return <CreditCard size={13} />;
    }
  };

  const paymentColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'card':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'online':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'check':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const hasActiveFilters =
    searchQuery ||
    paymentFilter !== 'all' ||
    statusFilter !== 'all' ||
    cashierFilter !== 'all' ||
    cashierScope !== 'all' ||
    datePreset !== 'all' ||
    dateRange.start ||
    dateRange.end;

  const clearAllFilters = () => {
    setSearchQuery('');
    setPaymentFilter('all');
    setStatusFilter('all');
    setCashierFilter('all');
    setCashierScope('all');
    setDatePreset('all');
    setDateRange({ start: '', end: '' });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
        {/* 1. Page Header (Role-Tailored) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {isAdmin ? 'Sales & Revenue Ledger' : 'Terminal Sales Ledger'}
              </h1>
              {isAdmin ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#c2410c] border border-orange-200">
                  <ShieldCheck size={12} />
                  Storewide Audit Ledger
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  <Store size={12} />
                  POS Terminal • {currentCashierName}
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium text-sm">
              {isAdmin
                ? 'Comprehensive storewide transaction audit, cashier performance, and revenue analytics.'
                : 'Review completed register sales, inspect itemized line totals, and reprint official receipts.'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Cashier Shift Scope Toggle */}
            {!isAdmin && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setCashierScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cashierScope === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Store Sales
                </button>
                <button
                  onClick={() => setCashierScope('my')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cashierScope === 'my'
                      ? 'bg-[#c2410c] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  My Shift Only
                </button>
              </div>
            )}

            <button
              onClick={handleExportCSV}
              disabled={filteredSales.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download filtered sales records as CSV"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintLedger}
              disabled={filteredSales.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Print transaction summary report"
            >
              <Printer size={14} />
              <span>Print Ledger</span>
            </button>
          </div>
        </div>

        {/* 2. Responsive KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<TrendingUp size={20} />}
            label={isAdmin ? 'Gross Store Revenue' : 'Tendered Revenue'}
            value={`₱${metrics.totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            subtitle={
              isAdmin
                ? `${metrics.totalTransactions} Completed Orders`
                : `${metrics.totalUnits} Units Sold`
            }
            color="orange"
          />
          <MetricCard
            icon={<Hash size={20} />}
            label="Transactions Processed"
            value={metrics.totalTransactions.toString()}
            subtitle="Successfully Completed"
            color="blue"
          />
          <MetricCard
            icon={<ShoppingBag size={20} />}
            label="Average Ticket (AOV)"
            value={`₱${metrics.avgTicket.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            subtitle="Avg. Order Value"
            color="purple"
          />
          <MetricCard
            icon={<Ban size={20} />}
            label="Voided / Cancelled"
            value={metrics.cancelledCount.toString()}
            subtitle={`₱${metrics.cancelledAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })} Restored to Stock`}
            color="red"
          />
        </div>

        {/* 3. Search and Multi-Filter Control Console */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          {/* Top row: Search and Quick Preset Pills */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by Order ID (ORD-...), Customer, Cashier, or Line Item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#c2410c]/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Date Preset Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar shrink-0">
              {(
                [
                  { id: 'all', label: 'All Dates' },
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleDatePresetChange(preset.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    datePreset === preset.id
                      ? 'bg-[#c2410c] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Filter Selectors & Custom Range */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Custom Date Range */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
              <Calendar size={14} className="text-[#c2410c] shrink-0" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange((prev) => ({ ...prev, start: e.target.value }));
                  setDatePreset('custom');
                }}
                className="bg-transparent outline-none text-xs font-bold text-slate-700 cursor-pointer"
                title="Start date"
              />
              <span className="text-slate-300 font-black text-[10px]">TO</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange((prev) => ({ ...prev, end: e.target.value }));
                  setDatePreset('custom');
                }}
                className="bg-transparent outline-none text-xs font-bold text-slate-700 cursor-pointer"
                title="End date"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter size={13} className="text-slate-400" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
                className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="cash">Cash Only</option>
                <option value="card">Card (Visa/MC)</option>
                <option value="online">Online (GCash/PayMaya)</option>
                <option value="check">Bank Check</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed Only</option>
                <option value="cancelled">Voided / Cancelled</option>
              </select>
            </div>

            {/* Admin Cashier Selector */}
            {isAdmin && uniqueCashiers.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <User size={13} className="text-slate-400" />
                <select
                  value={cashierFilter}
                  onChange={(e) => setCashierFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer"
                >
                  <option value="all">All Cashiers</option>
                  {uniqueCashiers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-all cursor-pointer ml-auto"
                title="Reset all active filters"
              >
                <X size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Transactions Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table Toolbar Header */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#c2410c]" />
                <span className="text-sm font-black text-slate-800">
                  Transaction Records
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {filteredSales.length} {filteredSales.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-bold outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 select-none">
                  <th className="px-6 py-4">Order ID</th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date & Time</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Cashier</th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-slate-700 transition-colors"
                    onClick={() => toggleSort('items')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Items</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">Payment</th>
                  <th
                    className="px-6 py-4 text-right cursor-pointer hover:text-slate-700 transition-colors"
                    onClick={() => toggleSort('total')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Total</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Receipt size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">
                          No transactions found
                        </h4>
                        <p className="text-xs text-slate-400">
                          We couldn't find any transactions matching your active query and filters.
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearAllFilters}
                            className="mt-2 px-4 py-2 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((sale) => {
                    const isExpanded = expandedRow === sale.id;
                    const saleDate = new Date(sale.saleDate);

                    return (
                      <Fragment key={sale.id}>
                        <tr
                          className={`hover:bg-orange-50/20 transition-all cursor-pointer ${
                            isExpanded ? 'bg-orange-50/30' : ''
                          } ${sale.status === 'cancelled' ? 'opacity-60 bg-slate-50/40' : ''}`}
                          onClick={() => setExpandedRow(isExpanded ? null : sale.id)}
                        >
                          {/* Order ID */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp size={15} className="text-[#c2410c]" />
                              ) : (
                                <ChevronDown size={15} className="text-slate-300" />
                              )}
                              <span className="font-mono font-bold text-xs text-slate-800 tracking-tight">
                                {sale.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyOrderId(sale.id, e)}
                                className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors"
                                title="Copy order ID"
                              >
                                {copiedId === sale.id ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 text-xs">
                              {saleDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {saleDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                <User size={12} />
                              </div>
                              <span className="font-bold text-slate-700 text-xs truncate max-w-[140px]">
                                {sale.customerName || 'Walk-in Customer'}
                              </span>
                            </div>
                          </td>

                          {/* Cashier */}
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {sale.cashier || 'Cashier'}
                            </span>
                          </td>

                          {/* Items Count */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Package size={13} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">
                                {sale.items.length}{' '}
                                <span className="text-slate-400 font-normal">
                                  {sale.items.length === 1 ? 'item' : 'items'}
                                </span>
                              </span>
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-2xs ${paymentColor(
                                sale.paymentMethod
                              )}`}
                            >
                              {paymentIcon(sale.paymentMethod)}
                              {sale.paymentMethod}
                            </span>
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-slate-900 text-sm">
                              ₱
                              {Number(sale.total).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                sale.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-600 border border-red-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sale.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              {sale.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div
                              className="flex items-center justify-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedSale(sale)}
                                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#c2410c] hover:text-white hover:border-[#c2410c] transition-all cursor-pointer shadow-2xs"
                                title="View & Print Official Receipt"
                              >
                                <Eye size={14} />
                              </button>

                              {sale.status === 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => setSaleToVoid(sale)}
                                  disabled={cancellingId !== null}
                                  className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                                  title={
                                    isAdmin
                                      ? 'Void Transaction (Admin)'
                                      : 'Void Transaction (Restores inventory)'
                                  }
                                >
                                  {cancellingId === sale.id ? (
                                    <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                  ) : (
                                    <Ban size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Inline Item Accordion (Directly underneath row) */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-slate-200 animate-fade-in">
                            <td colSpan={9} className="px-8 py-5">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                    <Package size={14} className="text-[#c2410c]" />
                                    <span>Itemized Breakdown ({sale.items.length} items)</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSale(sale);
                                    }}
                                    className="text-xs font-bold text-[#c2410c] hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Printer size={12} />
                                    Print Receipt
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {sale.items.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
                                    >
                                      <div className="min-w-0 pr-3">
                                        <p className="font-bold text-xs text-slate-800 truncate">
                                          {item.productName}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                          {item.quantity} × ₱
                                          {Number(
                                            item.unitPrice || item.price || 0
                                          ).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                        </p>
                                      </div>
                                      <span className="font-black text-xs text-slate-900 shrink-0">
                                        ₱
                                        {Number(
                                          item.total ||
                                            item.quantity * (item.unitPrice || item.price || 0)
                                        ).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Order Financial Audit Footer */}
                                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                                  <div className="flex items-center gap-6 text-slate-500">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                        Payment Method
                                      </span>
                                      <span className="font-bold text-slate-800 capitalize">
                                        {sale.paymentMethod}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                        Amount Tendered
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        ₱
                                        {Number(sale.amountPaid || sale.total).toLocaleString(
                                          undefined,
                                          { minimumFractionDigits: 2 }
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                        Change Given
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        ₱
                                        {Number(sale.change || 0).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                    </div>
                                    {sale.notes && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                          Transaction Notes
                                        </span>
                                        <span className="font-semibold text-slate-700 italic">
                                          "{sale.notes}"
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-bold">
                                      Total Net:
                                    </span>
                                    <span className="text-base font-black text-[#c2410c]">
                                      ₱
                                      {Number(sale.total).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Bar */}
          {sortedSales.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
              <div className="text-xs font-semibold text-slate-500">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, sortedSales.length)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * pageSize, sortedSales.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{sortedSales.length}</span>{' '}
                transactions
              </div>

              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#c2410c] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Receipt Modal */}
      {selectedSale && (
        <ReceiptComponent
          sale={{
            id: selectedSale.id,
            customer_name:
              selectedSale.customerName || selectedSale.customer_name || 'Walk-in Customer',
            total: Number(selectedSale.total),
            tax: Number(selectedSale.tax || 0),
            discount: Number(selectedSale.discount || 0),
            payment_method: selectedSale.paymentMethod || selectedSale.payment_method || 'cash',
            amount_paid: Number(
              selectedSale.amountPaid || selectedSale.amount_paid || selectedSale.total
            ),
            change_amount: Number(
              selectedSale.change !== undefined
                ? selectedSale.change
                : selectedSale.change_amount || 0
            ),
            cashier: selectedSale.cashier || currentCashierName,
            notes: selectedSale.notes || '',
            saleDate: selectedSale.saleDate,
            status: selectedSale.status,
            items: selectedSale.items.map((item: any) => ({
              productId: item.productId || item.product_id,
              productName: item.productName || item.product_name,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice || item.price || 0),
              total: Number(
                item.total || item.quantity * (item.unitPrice || item.price || 0)
              ),
            })),
          }}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {/* 7. Void Confirmation Modal */}
      {saleToVoid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-fade-in text-slate-800"
          onClick={() => setSaleToVoid(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xl overflow-hidden my-auto animate-fade-in text-center"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Warning Icon Container */}
            <div className="mx-auto w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-3 border border-red-100 shadow-sm">
              <AlertTriangle size={28} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Void Order & Restore Stock?
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Restores purchased item quantities back to inventory
            </p>

            {/* Brief details card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Order ID</span>
                <span className="font-mono font-bold text-slate-900">{saleToVoid.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Customer</span>
                <span className="font-bold text-slate-950">
                  {saleToVoid.customerName || 'Walk-in'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Cashier</span>
                <span className="font-bold text-slate-800">
                  {saleToVoid.cashier || 'Cashier'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-dashed border-slate-200">
                <span className="text-slate-500 font-black uppercase text-[10px]">
                  Total Reversed Amount
                </span>
                <span className="font-black text-red-600 text-sm">
                  ₱
                  {Number(saleToVoid.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Inventory Stock Restoration Breakdown */}
            <div className="text-left mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Inventory Stock to Restore ({saleToVoid.items?.length || 0} SKU{(saleToVoid.items?.length || 0) === 1 ? '' : 's'})
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  +{saleToVoid.items?.reduce((acc: number, i: any) => acc + (Number(i.quantity) || 0), 0)} Units Returned
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {saleToVoid.items?.map((item: any, idx: number) => {
                  const matchedProduct = products.find(
                    (p) =>
                      String(p.id) === String(item.productId || item.product_id) ||
                      p.name.toLowerCase() === String(item.productName || item.product_name || '').toLowerCase()
                  );
                  const currentStock = matchedProduct ? Number(matchedProduct.quantity) || 0 : 0;
                  const qtyToAdd = Number(item.quantity) || 0;
                  const restoredStock = currentStock + qtyToAdd;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-emerald-50/50 border border-emerald-200/70 rounded-xl px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.productName}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Current Stock: <span className="font-mono font-bold text-slate-700">{currentStock}</span> → Restored:{' '}
                          <span className="font-mono font-black text-emerald-700">{restoredStock}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-mono font-black text-xs shrink-0">
                        +{qtyToAdd}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Void Reason Selector (Logged in Admin Audit Trail) */}
            <div className="text-left mb-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Audit Log Reason
              </label>
              <select
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#c2410c] cursor-pointer"
              >
                <option value="Customer Return / Cancellation">Customer Return / Cancellation</option>
                <option value="Cashier Punched Wrong Item / Qty">Cashier Punched Wrong Item / Qty</option>
                <option value="Payment Method Change / Re-tender">Payment Method Change / Re-tender</option>
                <option value="Defective / Damaged Hardware Unit">Defective / Damaged Hardware Unit</option>
                <option value="Admin Audit Reversal">Admin Audit Reversal</option>
              </select>
            </div>

            {/* Helper message */}
            <p className="text-slate-500 text-[11px] font-medium px-2 leading-relaxed">
              This action will mark the order as cancelled, restore all item quantities back to
              warehouse inventory, and record an entry in the Admin Audit Logs.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setSaleToVoid(null)}
                disabled={cancellingId !== null}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleVoidConfirm}
                disabled={cancellingId !== null}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/10 transition-all py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {cancellingId !== null ? (
                  <div className="w-4 h-4 border-2 border-red-200 border-t-white rounded-full animate-spin" />
                ) : (
                  <Ban size={14} />
                )}
                {cancellingId !== null ? 'Voiding...' : 'Void & Restore Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: 'orange' | 'blue' | 'purple' | 'red';
}) {
  const colors = {
    orange: {
      bg: 'bg-orange-50 text-[#c2410c] border-orange-100',
      accent: 'text-[#c2410c]',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      accent: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'text-purple-600',
    },
    red: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      accent: 'text-red-600',
    },
  };

  const scheme = colors[color];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-[#c2410c]/30 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${scheme.bg} group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-xs font-semibold text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
