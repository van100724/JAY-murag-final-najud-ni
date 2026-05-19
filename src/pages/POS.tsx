import { useState } from 'react';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import { useApp } from '../contexts/AppContext';
import { Search } from 'lucide-react';

export default function POS() {
  const { getProductCategories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...getProductCategories()];

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] w-full overflow-hidden animate-fade-in text-slate-800">
      {/* Left side: Product Selection - 65% width */}
      <div className="w-[65%] flex flex-col min-w-0 h-full space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full bg-slate-50 pl-11 pr-4 py-3 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm"
            />
          </div>

          <div className="flex gap-2 items-center overflow-x-auto pb-1 custom-scrollbar max-w-[50%]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#c2410c] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
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