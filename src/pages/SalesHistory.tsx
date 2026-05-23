import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
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
  Clock,
  User,
  Package,
} from 'lucide-react';

type PaymentFilter = 'all' | 'cash' | 'card' | 'check' | 'online';
type StatusFilter = 'all' | 'completed' | 'cancelled';

export default function SalesHistory() {
  const { sales, cancelExistingSale } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter and search logic
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = sale.id.toLowerCase().includes(q);
        const matchesCustomer = (sale.customerName || '').toLowerCase().includes(q);
        const matchesCashier = (sale.cashier || '').toLowerCase().includes(q);
        const matchesProduct = sale.items.some((item: any) =>
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
  }, [sales, searchQuery, paymentFilter, statusFilter, dateRange]);

  // Metrics
  const metrics = useMemo(() => {
    const completed = filteredSales.filter((s) => s.status === 'completed');
    const totalRevenue = completed.reduce((sum, s) => sum + s.total, 0);
    const totalTransactions = completed.length;
    const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const cancelledCount = filteredSales.filter((s) => s.status === 'cancelled').length;
    return { totalRevenue, totalTransactions, avgTicket, cancelledCount };
  }, [filteredSales]);

  const handleCancelSale = async (saleId: string) => {
    if (
      window.confirm(
        'Are you sure you want to void this transaction? Product stock will be restored automatically.'
      )
    ) {
      setCancellingId(saleId);
      await cancelExistingSale(saleId);
      setCancellingId(null);
    }
  };

  const paymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote size={14} />;
      case 'card':
        return <CreditCard size={14} />;
      case 'online':
        return <Smartphone size={14} />;
      case 'check':
        return <FileCheck size={14} />;
      default:
        return <CreditCard size={14} />;
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

  const hasActiveFilters = searchQuery || paymentFilter !== 'all' || statusFilter !== 'all' || dateRange.start || dateRange.end;

  const clearAllFilters = () => {
    setSearchQuery('');
    setPaymentFilter('all');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-10">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Sales History</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Complete transaction ledger with search, filtering, and void capabilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Clock size={14} className="text-[#c2410c]" />
          Showing {filteredSales.length} of {sales.length} transactions
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Total Revenue"
          value={`₱${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="orange"
        />
        <MetricCard
          icon={<Hash size={18} />}
          label="Transactions"
          value={metrics.totalTransactions.toString()}
          color="blue"
        />
        <MetricCard
          icon={<ShoppingBag size={18} />}
          label="Avg. Ticket"
          value={`₱${metrics.avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="purple"
        />
        <MetricCard
          icon={<Ban size={18} />}
          label="Voided"
          value={metrics.cancelledCount.toString()}
          color="red"
        />
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Cashier, or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c]/40 transition-all"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
            <Calendar size={14} className="text-[#c2410c] shrink-0" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
              className="bg-transparent outline-none text-[11px] font-bold text-slate-600 w-[110px]"
            />
            <span className="text-[10px] text-slate-300 font-black">TO</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
              className="bg-transparent outline-none text-[11px] font-bold text-slate-600 w-[110px]"
            />
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="check">Check</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all shrink-0"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Cashier</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt size={40} className="text-slate-200" />
                      <p className="text-sm font-bold text-slate-400">No transactions found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isExpanded = expandedRow === sale.id;
                  const isCancelling = cancellingId === sale.id;
                  const saleDate = new Date(sale.saleDate);

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                        sale.status === 'cancelled' ? 'opacity-60' : ''
                      }`}
                      onClick={() => setExpandedRow(isExpanded ? null : sale.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp size={14} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={14} className="text-slate-300" />
                          )}
                          <span className="font-black text-slate-600 text-xs">{sale.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-xs">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                            <User size={12} className="text-slate-500" />
                          </div>
                          <span className="font-bold text-slate-700 text-xs">
                            {sale.customerName || 'Walk-in'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {sale.cashier || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Package size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">
                            {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${paymentColor(
                            sale.paymentMethod
                          )}`}
                        >
                          {paymentIcon(sale.paymentMethod)}
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-slate-900 text-sm">
                          ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sale.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : sale.status === 'cancelled'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#c2410c] hover:text-white hover:border-[#c2410c] transition-all"
                            title="View Receipt"
                          >
                            <Eye size={14} />
                          </button>
                          {sale.status === 'completed' && (
                            <button
                              onClick={() => handleCancelSale(sale.id)}
                              disabled={isCancelling}
                              className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Void Transaction"
                            >
                              {isCancelling ? (
                                <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                              ) : (
                                <Ban size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Expanded Row Details (inline items) */}
        {expandedRow && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 animate-fade-in">
            {(() => {
              const sale = filteredSales.find((s) => s.id === expandedRow);
              if (!sale) return null;
              return (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Line Items — {sale.id}
                  </p>
                  <div className="grid gap-2">
                    {sale.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#c2410c] font-black text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.quantity} × ₱{(item.unitPrice || item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <p className="font-black text-sm text-slate-900">
                          ₱{(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Receipt Header */}
            <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] text-white p-8 rounded-t-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#c2410c]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c2410c] flex items-center justify-center">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">Transaction Receipt</h3>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                        J&JAY Hardware — Balingasag
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-white/40 font-bold uppercase text-[9px] tracking-widest">Order ID</p>
                    <p className="font-black">{selectedSale.id}</p>
                  </div>
                  <div>
                    <p className="text-white/40 font-bold uppercase text-[9px] tracking-widest">Date</p>
                    <p className="font-bold">
                      {new Date(selectedSale.saleDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 font-bold uppercase text-[9px] tracking-widest">Cashier</p>
                    <p className="font-bold">{selectedSale.cashier || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 font-bold uppercase text-[9px] tracking-widest">Customer</p>
                    <p className="font-bold">{selectedSale.customerName || 'Walk-in'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="p-6 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Purchased</p>
              <div className="space-y-2">
                {selectedSale.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-xs text-slate-800">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {item.quantity} × ₱{(item.unitPrice || item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="font-black text-sm text-slate-900">
                      ₱{(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mx-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold">Subtotal</span>
                <span className="font-bold text-slate-700">
                  ₱{(selectedSale.subtotal || selectedSale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {selectedSale.discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-red-500 font-bold">Discount</span>
                  <span className="font-bold text-red-500">
                    -₱{selectedSale.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold">Tax (12% VAT)</span>
                <span className="font-bold text-slate-700">
                  ₱{(selectedSale.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-sm font-black text-slate-900">Total</span>
                <span className="text-lg font-black text-[#c2410c]">
                  ₱{selectedSale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold">Amount Paid</span>
                  <span className="font-bold text-slate-700">
                    ₱{(selectedSale.amountPaid || selectedSale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold">Change</span>
                  <span className="font-bold text-emerald-600">
                    ₱{(selectedSale.change || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${paymentColor(
                    selectedSale.paymentMethod
                  )}`}
                >
                  {paymentIcon(selectedSale.paymentMethod)}
                  {selectedSale.paymentMethod}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedSale.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : selectedSale.status === 'cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedSale.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    orange: 'text-[#c2410c] bg-orange-50 border-orange-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#c2410c]/20 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h3 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
    </div>
  );
}
