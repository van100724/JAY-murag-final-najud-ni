import { useState, useRef, useEffect, useMemo } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import { useApp } from '../contexts/AppContext';
import { Search, X, Store, Sparkles, Filter } from 'lucide-react';

export default function POS() {
  const { getProductCategories, products, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => ['All', ...getProductCategories()], [getProductCategories]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Keyboard shortcut: '/' focuses POS product search, 'Escape' clears
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || e.key === 'F2') && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasFilter = searchQuery.trim() !== '' || selectedCategory !== 'All' || stockFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStockFilter('all');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full overflow-hidden animate-fade-in text-slate-800 space-y-4">
      {/* Terminal Cashier Status Bar */}
      <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#c2410c]">
            <Store size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                POS Terminal 01
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Shift
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Operator: <span className="text-slate-700 font-bold">{user?.name || 'Cashier Jay'}</span> • Hardware Catalog
            </p>
          </div>
        </div>

        {/* Quick Keyboard Shortcuts & Catalog Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px] font-bold">
            <Sparkles size={13} className="text-[#c2410c]" />
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs">/</kbd> to search</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
            <span className="text-slate-800 font-black">{products.length}</span> Products Registered
          </div>
        </div>
      </div>

      {/* Main Terminal Workspace: Left 65% Catalog | Right 35% Order Cart */}
      <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left Side: Product Selection Console (65%) */}
        <div className="w-[65%] flex flex-col min-w-0 h-full space-y-3">
          {/* Search and Category Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3">
              {/* Product Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan SKU barcode or type product name... (Press '/' to focus)"
                  className="w-full bg-slate-50 pl-11 pr-10 py-2.5 rounded-xl outline-none border border-slate-200 focus:bg-white focus:border-[#c2410c]/40 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    aria-label="Clear product search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* In-Stock Filter Toggle */}
              <button
                type="button"
                onClick={() => setStockFilter((prev) => (prev === 'all' ? 'in-stock' : 'all'))}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                  stockFilter === 'in-stock'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle in-stock products only"
              >
                <Filter size={13} />
                <span>In Stock Only</span>
              </button>

              {/* Clear All Filters */}
              {hasFilter && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Reset all search filters"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {/* Category Chips Bar with Item Counts */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#c2410c] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat === 'All' ? 'All Hardware' : cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid Area - Internal Smooth Scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 custom-scrollbar">
            <ProductGrid
              searchQuery={searchQuery}
              category={selectedCategory}
              stockFilter={stockFilter}
            />
          </div>
        </div>

        {/* Right Side: Order Cart & Checkout Terminal (35%) */}
        <div className="w-[35%] min-w-[340px] h-full flex flex-col min-h-0">
          <CartPanel />
        </div>
      </div>
    </div>
  );
}