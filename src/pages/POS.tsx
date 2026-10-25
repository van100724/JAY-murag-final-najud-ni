import { useState, useRef, useEffect } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import { useApp } from '../contexts/AppContext';
import { Search, X } from 'lucide-react';

export default function POS() {
  const { getProductCategories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const categories = ['All', ...getProductCategories()];

  // Keyboard shortcut: '/' focuses POS product search
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

  const hasFilter = searchQuery.trim() !== '' || selectedCategory !== 'All';

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] w-full overflow-hidden animate-fade-in text-slate-800">
      {/* Left side: Product Selection - 65% width */}
      <div className="w-[65%] flex flex-col min-w-0 h-full space-y-4">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU... (Press '/' to focus)"
                className="w-full bg-slate-50 pl-11 pr-10 py-3 rounded-xl outline-none border border-slate-200 focus:bg-white focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label="Clear product search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {hasFilter && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all shrink-0 flex items-center gap-1"
                title="Reset all filters"
              >
                <X size={14} /> Clear Filter
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 items-center overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#c2410c] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <ProductGrid 
            searchQuery={searchQuery} 
            category={selectedCategory} 
          />
        </div>
      </div>

      {/* Right side: Cart & Checkout - 35% width */}
      <div className="w-[35%] min-w-[340px] h-full flex flex-col min-h-0">
        <CartPanel />
      </div>
    </div>
  );
}