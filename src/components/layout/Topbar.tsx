import { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, Package, CalendarClock, ArrowRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import HelpModal from '../ui/HelpModal';

export default function Topbar() {
  const navigate = useNavigate();
  const { getLowStock, getInventoryAlerts, products, sales, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const totalNotifications = getLowStock().length + getInventoryAlerts().length;

  // Keyboard shortcut: Ctrl+K or '/' to focus global search, Esc to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowResults(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowResults(true);
      } else if (e.key === 'Escape') {
        setShowResults(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products and sales based on searchQuery
  const filteredProducts = searchQuery.trim().length >= 2 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5) 
    : [];

  const filteredSales = searchQuery.trim().length >= 2 
    ? sales.filter(s => 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) 
    : [];

  const hasResults = filteredProducts.length > 0 || filteredSales.length > 0;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (sku: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/inventory?search=${encodeURIComponent(sku)}`);
  };

  const handleSaleClick = (id: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/sales?search=${encodeURIComponent(id)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setShowResults(false);
    // If it looks like an order, go to sales, otherwise inventory
    if (searchQuery.toLowerCase().startsWith('ord-') || sales.some(s => s.id.toLowerCase().includes(searchQuery.toLowerCase()))) {
      navigate(`/sales?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-20 border-b border-white/5 bg-[#f8fafc] px-6 flex items-center justify-between text-slate-800 relative z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-black tracking-tighter text-[#92400e]">
          J&JAY
        </h1>
      </div>

      {/* Global Search Bar */}
      <div ref={dropdownRef} className="flex-1 max-w-2xl mx-12 relative">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#92400e] transition-colors">
            <Search size={18} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search SKU, Serial, or Order... (Press '/' or Ctrl+K)"
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-12 pr-20 outline-none focus:bg-white focus:border-[#92400e]/30 focus:ring-4 focus:ring-[#92400e]/5 transition-all text-sm text-slate-700"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-400 font-bold shadow-sm">
                Ctrl+K
              </kbd>
            )}
          </div>
        </form>

        {/* Autocomplete Dropdown */}
        {showResults && searchQuery.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)] overflow-hidden z-50 animate-fade-in text-slate-800 flex flex-col max-h-[420px]">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Quick Matches</span>
              <span>Press enter to search</span>
            </div>

            <div className="overflow-y-auto p-2 space-y-4 custom-scrollbar">
              {/* Products Section */}
              {filteredProducts.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    <Package size={12} className="text-[#92400e]" />
                    Products
                  </div>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.sku)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-700 group-hover:text-[#92400e] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          SKU: {product.sku} • {product.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          product.quantity === 0 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : product.quantity <= product.reorderLevel 
                              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                              : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {product.quantity} Units
                        </span>
                        <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders Section */}
              {filteredSales.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    <CalendarClock size={12} className="text-blue-600" />
                    Orders / Sales
                  </div>
                  {filteredSales.map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => handleSaleClick(sale.id)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-700 group-hover:text-blue-600 transition-colors">
                          Order #{sale.id}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          Cust: {sale.customerName || 'Walk-in'} • Total: ₱{sale.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          sale.status === 'cancelled' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {sale.status}
                        </span>
                        <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!hasResults && (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-xs font-bold">No exact matches found</p>
                  <p className="text-[10px] mt-0.5">Double check SKU spelling or order ID.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* System Status Indicator - Heuristic 1 */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-700 tracking-wider uppercase" title="System database is online and real-time syncing">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Database Synced</span>
        </div>

        {/* Help & Documentation Button - Heuristic 10 */}
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="p-2 text-slate-400 hover:text-[#92400e] hover:bg-slate-100 rounded-xl transition-all"
          title="Open Help & System Guide"
          aria-label="Help and documentation"
        >
          <HelpCircle size={20} />
        </button>

        {/* Notifications Icon with count - Heuristic 1 & 6 */}
        <button 
          onClick={() => navigate('/notifications')}
<<<<<<< HEAD
          className="relative p-2.5 text-slate-500 hover:text-[#c2410c] hover:bg-orange-50/60 rounded-xl transition-all cursor-pointer group"
          title="System Notifications"
        >
          <Bell size={20} className="group-hover:scale-105 transition-transform" />
          {totalNotifications > 0 && (
            <span className="absolute 1 top-1 right-1 px-1.5 min-w-[18px] h-[18px] bg-[#c2410c] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {totalNotifications > 99 ? '99+' : totalNotifications}
=======
          className="relative p-2 text-slate-400 hover:text-[#92400e] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          title={`${totalNotifications} active notifications`}
          aria-label="View notifications"
        >
          <Bell size={20} />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {totalNotifications}
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
            </span>
          )}
        </button>

        {/* User Identity Info - Heuristic 1 & 6 */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-black text-slate-800 leading-tight">
              {user?.name || (user?.role === 'admin' ? 'Administrator' : 'Cashier')}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#92400e]">
              {user?.role || 'Guest'}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shadow-sm shrink-0">
            <img 
              src={user?.role === 'cashier' ? "https://api.dicebear.com/7.x/avataaars/svg?seed=CashierJay" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
              alt={user?.name || 'User Avatar'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </header>
  );
}