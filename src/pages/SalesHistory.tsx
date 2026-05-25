import { useState, useMemo, useEffect } from 'react';
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
  Clock,
  User,
  Package,
  AlertTriangle,
} from 'lucide-react';

type PaymentFilter = 'all' | 'cash' | 'card' | 'check' | 'online';
type StatusFilter = 'all' | 'completed' | 'cancelled';

export default function SalesHistory() {
  const { sales, cancelExistingSale } = useApp();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');

  // Sync search input with search query parameter from Topbar
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [saleToVoid, setSaleToVoid] = useState<any | null>(null);

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

  const handleVoidConfirm = async () => {
    if (!saleToVoid) return;
    setCancellingId(saleToVoid.id);
    await cancelExistingSale(saleToVoid.id);
    setCancellingId(null);
    setSaleToVoid(null);
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
    <>
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
                  const saleDate = new Date(sale.saleDate);

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${sale.status === 'cancelled' ? 'opacity-60' : ''
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
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sale.status === 'completed'
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
                              onClick={() => setSaleToVoid(sale)}
                              disabled={cancellingId !== null}
                              className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Void Transaction"
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
    </div>

      {/* Receipt Modal */}
      {selectedSale && (
        <ReceiptComponent
          sale={{
            id: selectedSale.id,
            customer_name: selectedSale.customerName || selectedSale.customer_name || 'Walk-in',
            total: Number(selectedSale.total),
            tax: Number(selectedSale.tax || 0),
            discount: Number(selectedSale.discount || 0),
            payment_method: selectedSale.paymentMethod || selectedSale.payment_method || 'cash',
            amount_paid: Number(selectedSale.amountPaid || selectedSale.amount_paid || selectedSale.total),
            change_amount: Number(selectedSale.change !== undefined ? selectedSale.change : (selectedSale.change_amount || 0)),
            cashier: selectedSale.cashier || 'Unknown',
            notes: selectedSale.notes || '',
            saleDate: selectedSale.saleDate,
            status: selectedSale.status,
            items: selectedSale.items.map((item: any) => ({
              productId: item.productId || item.product_id,
              productName: item.productName || item.product_name,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice || item.price || 0),
              total: Number(item.total || (item.quantity * (item.unitPrice || item.price || 0)))
            }))
          }}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {/* Void Confirmation Modal */}
      {saleToVoid && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSaleToVoid(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white rounded-[35px] p-6 border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)] overflow-hidden animate-fade-in text-center text-slate-800">

            {/* Warning Icon Container */}
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
              <AlertTriangle size={32} className="animate-bounce" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Void Transaction?</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">This action cannot be undone</p>

            {/* Brief details card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-6 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Order ID</span>
                <span className="font-mono font-bold text-slate-900">{saleToVoid.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Customer</span>
                <span className="font-bold text-slate-950">{saleToVoid.customerName || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-400 font-bold uppercase">Items count</span>
                <span className="font-bold text-slate-800">{saleToVoid.items.length} item(s)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-black uppercase text-[10px]">Total Amount</span>
                <span className="font-black text-red-600 text-sm">₱{Number(saleToVoid.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Helper message */}
            <p className="text-slate-500 text-xs font-medium px-2 leading-relaxed">
              Voiding this transaction will restore the stock levels for all purchased products and mark the ledger entry as cancelled.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setSaleToVoid(null)}
                disabled={cancellingId !== null}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                onClick={handleVoidConfirm}
                disabled={cancellingId !== null}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/10 transition-all py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98] disabled:opacity-50"
              >
                {cancellingId !== null ? (
                  <div className="w-4 h-4 border-2 border-red-200 border-t-white rounded-full animate-spin" />
                ) : (
                  <Ban size={14} />
                )}
                {cancellingId !== null ? 'Voiding...' : 'Yes, Void'}
              </button>
            </div>

          </div>
        </>
      )}
    </>
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
