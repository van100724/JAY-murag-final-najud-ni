import { useState, useMemo, useEffect, useRef, Fragment, type ReactNode } from 'react';
import { useApp, type AuditLog } from '../contexts/AppContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  Search,
  Calendar,
  Filter,
  X,
  Ban,
  ShieldCheck,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Boxes,
  ShoppingBag,
  Trash2,
  ClipboardList,
  ArrowRight,
  RotateCcw,
  PlusCircle,
  Pencil,
  LogIn,
  LogOut,
  Truck,
  BellOff,
  Copy,
  Check,
} from 'lucide-react';

type CategoryTab = 'all' | 'voids' | 'sales' | 'inventory' | 'supplier' | 'auth';
type SeverityFilter = 'all' | 'critical' | 'warning' | 'success' | 'info';
type RoleFilter = 'all' | 'admin' | 'cashier';
type DatePreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export default function AuditLogs() {
  const { auditLogs, clearAuditLogs, user } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Table & Pagination States
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
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
  }, []);

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

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Category Tab Filter
      if (categoryTab === 'voids' && log.action !== 'ORDER_VOIDED') return false;
      if (categoryTab === 'sales' && log.category !== 'sales') return false;
      if (categoryTab === 'inventory' && log.category !== 'inventory') return false;
      if (categoryTab === 'supplier' && log.category !== 'supplier') return false;
      if (
        categoryTab === 'auth' &&
        log.category !== 'auth' &&
        log.category !== 'system'
      ) {
        return false;
      }

      // Severity Filter
      if (severityFilter !== 'all' && log.severity !== severityFilter) return false;

      // Role Filter
      if (roleFilter !== 'all' && log.actorRole !== roleFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = log.id.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesActor = (log.actorName || '').toLowerCase().includes(q);
        const matchesEntity =
          (log.entityId || '').toLowerCase().includes(q) ||
          (log.entityName || '').toLowerCase().includes(q);
        const matchesDesc = (log.description || '').toLowerCase().includes(q);
        const matchesStockItem = log.metadata?.stockChanges?.some(
          (sc) =>
            sc.productName.toLowerCase().includes(q) ||
            (sc.sku || '').toLowerCase().includes(q)
        );
        if (
          !matchesId &&
          !matchesAction &&
          !matchesActor &&
          !matchesEntity &&
          !matchesDesc &&
          !matchesStockItem
        ) {
          return false;
        }
      }

      // Date Range Filter
      if (dateRange.start) {
        const start = new Date(dateRange.start);
        start.setHours(0, 0, 0, 0);
        if (new Date(log.timestamp) < start) return false;
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (new Date(log.timestamp) > end) return false;
      }

      return true;
    });
  }, [auditLogs, categoryTab, severityFilter, roleFilter, searchQuery, dateRange]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryTab, severityFilter, roleFilter, searchQuery, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const voidEvents = auditLogs.filter((l) => l.action === 'ORDER_VOIDED');
    const restoredUnits = voidEvents.reduce((sum, l) => {
      const items = l.metadata?.stockChanges || [];
      return sum + items.reduce((s, i) => s + Math.max(0, Number(i.quantityDelta) || 0), 0);
    }, 0);
    const inventoryEvents = auditLogs.filter((l) => l.category === 'inventory').length;
    const uniqueActors = new Set(auditLogs.map((l) => l.actorName)).size;

    return {
      totalEvents: auditLogs.length,
      voidCount: voidEvents.length,
      restoredUnits,
      inventoryEvents,
      uniqueActors,
    };
  }, [auditLogs]);

  // Tab Counts
  const tabCounts = useMemo(() => {
    return {
      all: auditLogs.length,
      voids: auditLogs.filter((l) => l.action === 'ORDER_VOIDED').length,
      sales: auditLogs.filter((l) => l.category === 'sales').length,
      inventory: auditLogs.filter((l) => l.category === 'inventory').length,
      supplier: auditLogs.filter((l) => l.category === 'supplier').length,
      auth: auditLogs.filter((l) => l.category === 'auth' || l.category === 'system').length,
    };
  }, [auditLogs]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryTab !== 'all' ||
    severityFilter !== 'all' ||
    roleFilter !== 'all' ||
    datePreset !== 'all' ||
    dateRange.start !== '' ||
    dateRange.end !== '';

  const resetAllFilters = () => {
    setSearchQuery('');
    setCategoryTab('all');
    setSeverityFilter('all');
    setRoleFilter('all');
    setDatePreset('all');
    setDateRange({ start: '', end: '' });
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      'Audit ID',
      'Date',
      'Time',
      'Action',
      'Category',
      'Severity',
      'Operator',
      'Role',
      'Target Entity',
      'Description',
      'Stock Changes',
    ];
    const rows = filteredLogs.map((log) => {
      const d = new Date(log.timestamp);
      const stockStr = (log.metadata?.stockChanges || [])
        .map(
          (sc) =>
            `${sc.productName} (${sc.quantityDelta > 0 ? '+' : ''}${sc.quantityDelta}: ${sc.previousStock}->${sc.newStock})`
        )
        .join('; ');
      return [
        `"${log.id}"`,
        `"${d.toLocaleDateString()}"`,
        `"${d.toLocaleTimeString()}"`,
        `"${log.action}"`,
        `"${log.category}"`,
        `"${log.severity}"`,
        `"${(log.actorName || '').replace(/"/g, '""')}"`,
        `"${log.actorRole}"`,
        `"${(log.entityName || log.entityId || '').replace(/"/g, '""')}"`,
        `"${(log.description || '').replace(/"/g, '""')}"`,
        `"${stockStr.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jjay_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Audit Report
  const handlePrintAuditReport = () => {
    const printWindow = window.open('', '_blank', 'width=960,height=750');
    if (!printWindow) return;

    const rowsHtml = filteredLogs
      .map((log) => {
        const d = new Date(log.timestamp);
        const stockStr = (log.metadata?.stockChanges || [])
          .map(
            (sc) =>
              `${sc.productName}: ${sc.quantityDelta > 0 ? '+' : ''}${sc.quantityDelta} (${sc.previousStock} → ${sc.newStock})`
          )
          .join('<br/>');
        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 8px 10px; font-family: monospace; font-weight: bold;">${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td style="padding: 8px 10px; font-weight: bold; text-transform: uppercase;">${log.action.replace(/_/g, ' ')}</td>
            <td style="padding: 8px 10px;">${log.actorName} (${log.actorRole})</td>
            <td style="padding: 8px 10px; font-weight: bold;">${log.entityName || log.entityId || '—'}</td>
            <td style="padding: 8px 10px;">${log.description}</td>
            <td style="padding: 8px 10px; font-family: monospace; font-size: 10px;">${stockStr || '—'}</td>
          </tr>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>J&JAY Hardware - Official System Audit Logs</title>
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
              <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Official Admin Security & Inventory Audit Trail</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <div>Date Generated: ${new Date().toLocaleString()}</div>
              <div>Generated By: ${user?.name || 'Admin User'} (${user?.role || 'admin'})</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi">
              <span>Total Audit Events</span>
              <div>${filteredLogs.length}</div>
            </div>
            <div class="kpi">
              <span>Voided Orders</span>
              <div style="color: #dc2626;">${metrics.voidCount} Orders</div>
            </div>
            <div class="kpi">
              <span>Stock Restored (Voids)</span>
              <div style="color: #059669;">+${metrics.restoredUnits} Units</div>
            </div>
            <div class="kpi">
              <span>Inventory Actions</span>
              <div>${metrics.inventoryEvents}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Operator</th>
                <th>Target Entity</th>
                <th>Audit Details</th>
                <th>Stock Movement</th>
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

  // Visual badge helpers per action
  const getActionBadge = (log: AuditLog) => {
    switch (log.action) {
      case 'ORDER_VOIDED':
        return {
          label: 'Order Voided',
          icon: <RotateCcw size={12} />,
          className: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'SALE_COMPLETED':
        return {
          label: 'Sale Completed',
          icon: <ShoppingBag size={12} />,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'STOCK_RESTOCKED':
        return {
          label: 'Stock Restocked',
          icon: <PlusCircle size={12} />,
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'STOCK_ADJUSTED':
        return {
          label: 'Stock Adjusted',
          icon: <Boxes size={12} />,
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'PRODUCT_ADDED':
        return {
          label: 'Product Added',
          icon: <PlusCircle size={12} />,
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'PRODUCT_UPDATED':
        return {
          label: 'Product Edited',
          icon: <Pencil size={12} />,
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'PRODUCT_DELETED':
        return {
          label: 'Product Removed',
          icon: <Trash2 size={12} />,
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'SUPPLIER_ADDED':
      case 'SUPPLIER_UPDATED':
      case 'SUPPLIER_DELETED':
        return {
          label: log.action.replace(/_/g, ' '),
          icon: <Truck size={12} />,
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'USER_LOGIN':
        return {
          label: 'Operator Login',
          icon: <LogIn size={12} />,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'USER_LOGOUT':
        return {
          label: 'Operator Logout',
          icon: <LogOut size={12} />,
          className: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      case 'ALERTS_CLEARED':
        return {
          label: 'Alerts Cleared',
          icon: <BellOff size={12} />,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      default:
        return {
          label: log.action.replace(/_/g, ' '),
          icon: <ClipboardList size={12} />,
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
        {/* 1. Page Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                System Audit Logs
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#c2410c] border border-orange-200">
                <ShieldCheck size={12} />
                Admin Security & Stock Ledger
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm">
              Complete chronological audit trail of voided orders, inventory stock restorations, POS checkouts, and admin changes.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Export filtered audit logs to CSV"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintAuditReport}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Print official audit trail report"
            >
              <Printer size={14} />
              <span>Print Audit Report</span>
            </button>

            {auditLogs.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Clear all audit logs"
              >
                <Trash2 size={14} />
                <span>Clear Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<ClipboardList size={20} />}
            label="Total Audit Events"
            value={metrics.totalEvents.toString()}
            subtitle="Recorded System Actions"
            color="orange"
          />
          <MetricCard
            icon={<Ban size={20} />}
            label="Voided Orders"
            value={metrics.voidCount.toString()}
            subtitle={`+${metrics.restoredUnits} Units Restored to Stock`}
            color="red"
          />
          <MetricCard
            icon={<Boxes size={20} />}
            label="Inventory Changes"
            value={metrics.inventoryEvents.toString()}
            subtitle="Restocks, Edits & New SKUs"
            color="blue"
          />
          <MetricCard
            icon={<User size={20} />}
            label="Active Operators"
            value={metrics.uniqueActors.toString()}
            subtitle="Admins & Cashiers Tracked"
            color="purple"
          />
        </div>

        {/* 3. Filter & Search Control Console */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {(
              [
                { id: 'all', label: 'All Activity', count: tabCounts.all },
                { id: 'voids', label: 'Voided Orders & Restored Stock', count: tabCounts.voids },
                { id: 'sales', label: 'POS Sales & Voids', count: tabCounts.sales },
                { id: 'inventory', label: 'Inventory & Stock', count: tabCounts.inventory },
                { id: 'supplier', label: 'Suppliers', count: tabCounts.supplier },
                { id: 'auth', label: 'Auth & System', count: tabCounts.auth },
              ] as const
            ).map((tab) => {
              const active = categoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-[#c2410c] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Date Presets Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by Order ID (SALE-...), Product Name, SKU, Operator, or Action... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#c2410c]/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters Row */}
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

            {/* Severity Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter size={13} className="text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical (Order Voids)</option>
                <option value="warning">Warning (Deletions / Reductions)</option>
                <option value="success">Success (Sales / Additions)</option>
                <option value="info">Info (Restocks / Updates)</option>
              </select>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <User size={13} className="text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="bg-transparent text-slate-700 font-bold outline-none cursor-pointer"
              >
                <option value="all">All Operator Roles</option>
                <option value="admin">Admin Actions Only</option>
                <option value="cashier">Cashier Actions Only</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-all cursor-pointer ml-auto"
              >
                <X size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Audit Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-[#c2410c]" />
                <span className="text-sm font-black text-slate-800">
                  Chronological Audit Trail
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 select-none">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Event / Action</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Target Entity</th>
                  <th className="px-6 py-4">Audit Description</th>
                  <th className="px-6 py-4 text-center">Stock Impact</th>
                  <th className="px-6 py-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <ClipboardList size={28} />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">
                          No audit logs found
                        </h4>
                        <p className="text-xs text-slate-400">
                          No system events matched your active search or filter criteria.
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={resetAllFilters}
                            className="mt-2 px-4 py-2 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => {
                    const isExpanded = expandedRow === log.id;
                    const d = new Date(log.timestamp);
                    const badge = getActionBadge(log);
                    const stockChanges = log.metadata?.stockChanges || [];
                    const netUnitsDelta = stockChanges.reduce(
                      (sum, sc) => sum + (Number(sc.quantityDelta) || 0),
                      0
                    );

                    return (
                      <Fragment key={log.id}>
                        <tr
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          className={`hover:bg-orange-50/20 transition-all cursor-pointer ${
                            isExpanded ? 'bg-orange-50/30' : ''
                          } ${log.action === 'ORDER_VOIDED' ? 'bg-red-50/20' : ''}`}
                        >
                          {/* Timestamp */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-bold text-slate-800 text-xs">
                              {d.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {d.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </p>
                          </td>

                          {/* Event / Action */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-2xs ${badge.className}`}
                            >
                              {badge.icon}
                              {badge.label}
                            </span>
                          </td>

                          {/* Operator */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px]">
                                {(log.actorName || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-xs leading-tight">
                                  {log.actorName}
                                </p>
                                <span
                                  className={`inline-block text-[9px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded ${
                                    log.actorRole === 'admin'
                                      ? 'text-[#c2410c] bg-orange-50'
                                      : 'text-blue-700 bg-blue-50'
                                  }`}
                                >
                                  {log.actorRole}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Target Entity */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.entityId || log.entityName ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                  {log.entityName || log.entityId}
                                </span>
                                {log.entityId && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyId(log.entityId!, e)}
                                    className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors"
                                    title="Copy ID"
                                  >
                                    {copiedId === log.entityId ? (
                                      <Check size={12} className="text-emerald-600" />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4 max-w-md">
                            <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">
                              {log.description}
                            </p>
                          </td>

                          {/* Stock Impact */}
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            {stockChanges.length > 0 ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black font-mono border ${
                                  netUnitsDelta > 0
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : netUnitsDelta < 0
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {netUnitsDelta > 0 ? `+${netUnitsDelta}` : netUnitsDelta} units (
                                {stockChanges.length} SKU{stockChanges.length === 1 ? '' : 's'})
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-300">—</span>
                            )}
                          </td>

                          {/* Expand Button */}
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 inline-flex items-center justify-center text-slate-500 hover:bg-[#c2410c] hover:text-white hover:border-[#c2410c] transition-all cursor-pointer"
                              title="Inspect full audit metadata"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Audit Inspection Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-b border-slate-200 animate-fade-in">
                            <td colSpan={7} className="px-8 py-5">
                              <div className="space-y-4">
                                {/* Top Metadata Header */}
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      Audit Reference ID:
                                    </span>
                                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                      {log.id}
                                    </span>
                                  </div>

                                  {log.metadata?.orderTotal !== undefined && (
                                    <div className="flex items-center gap-4 text-xs">
                                      {log.metadata?.customerName && (
                                        <div>
                                          <span className="text-slate-400 font-bold">Customer: </span>
                                          <span className="font-black text-slate-800">
                                            {log.metadata.customerName}
                                          </span>
                                        </div>
                                      )}
                                      {log.metadata?.paymentMethod && (
                                        <div>
                                          <span className="text-slate-400 font-bold">Tender: </span>
                                          <span className="font-black text-slate-800 uppercase">
                                            {log.metadata.paymentMethod}
                                          </span>
                                        </div>
                                      )}
                                      {log.metadata?.voidReason && (
                                        <div>
                                          <span className="text-slate-400 font-bold">Void Reason: </span>
                                          <span className="font-black text-red-600">
                                            {log.metadata.voidReason}
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-slate-400 font-bold">
                                          {log.action === 'ORDER_VOIDED'
                                            ? 'Reversed Total: '
                                            : 'Order Total: '}
                                        </span>
                                        <span
                                          className={`font-black text-sm ${
                                            log.action === 'ORDER_VOIDED'
                                              ? 'text-red-600'
                                              : 'text-[#c2410c]'
                                          }`}
                                        >
                                          ₱
                                          {Number(log.metadata.orderTotal).toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 }
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Stock Changes Breakdown */}
                                {stockChanges.length > 0 && (
                                  <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                                      <Package size={14} className="text-[#c2410c]" />
                                      <span>
                                        {log.action === 'ORDER_VOIDED'
                                          ? 'Inventory Stock Restored From Voided Order'
                                          : 'Inventory Stock Movement Breakdown'}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {stockChanges.map((sc, idx) => {
                                        const isPositive = sc.quantityDelta > 0;
                                        return (
                                          <div
                                            key={idx}
                                            className={`p-3.5 rounded-2xl border bg-white shadow-2xs flex items-center justify-between gap-3 ${
                                              isPositive
                                                ? 'border-emerald-200/80'
                                                : 'border-slate-200'
                                            }`}
                                          >
                                            <div className="min-w-0">
                                              <p className="font-bold text-xs text-slate-900 truncate">
                                                {sc.productName}
                                              </p>
                                              {sc.sku && (
                                                <p className="text-[10px] font-mono text-slate-400">
                                                  SKU: {sc.sku}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono">
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                                                  Before: {sc.previousStock}
                                                </span>
                                                <ArrowRight size={11} className="text-slate-400" />
                                                <span
                                                  className={`px-1.5 py-0.5 rounded font-black ${
                                                    isPositive
                                                      ? 'bg-emerald-50 text-emerald-700'
                                                      : 'bg-amber-50 text-amber-700'
                                                  }`}
                                                >
                                                  After: {sc.newStock}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                              <span
                                                className={`inline-block px-2.5 py-1 rounded-xl font-mono text-xs font-black ${
                                                  isPositive
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-800 text-white'
                                                }`}
                                              >
                                                {isPositive
                                                  ? `+${sc.quantityDelta}`
                                                  : sc.quantityDelta}
                                              </span>
                                              <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">
                                                {isPositive ? 'Restored' : 'Deducted'}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Field Changes Breakdown (for product edits) */}
                                {log.metadata?.fieldChanges &&
                                  log.metadata.fieldChanges.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Modified Product Attributes
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {log.metadata.fieldChanges.map((fc, i) => (
                                          <div
                                            key={i}
                                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs flex items-center gap-2"
                                          >
                                            <span className="font-black text-slate-700">
                                              {fc.field}:
                                            </span>
                                            <span className="text-slate-400 line-through">
                                              {String(fc.from)}
                                            </span>
                                            <ArrowRight size={12} className="text-[#c2410c]" />
                                            <span className="font-bold text-emerald-700">
                                              {String(fc.to)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
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
          {filteredLogs.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
              <div className="text-xs font-semibold text-slate-500">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredLogs.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{filteredLogs.length}</span> audit
                logs
              </div>

              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
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
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Audit Log History?"
        message="Are you sure you want to clear all recorded audit logs? This action will permanently remove the current activity history."
        confirmText="Clear Audit Logs"
        cancelText="Keep Logs"
        isDestructive={true}
        onConfirm={() => {
          clearAuditLogs();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
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
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    red: {
      bg: 'bg-red-50 text-red-600 border-red-100',
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

