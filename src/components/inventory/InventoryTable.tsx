import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Search,
  X,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Package,
  Boxes,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { Product } from '../../data/inventory';

interface InventoryTableProps {
  onEdit: (product: Product) => void;
}

type StockSortOrder = 'none' | 'asc' | 'desc'; // asc = lowest to highest, desc = highest to lowest

export default function InventoryTable({ onEdit }: InventoryTableProps) {
  const { products, deleteExistingProduct } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [stockSort, setStockSort] = useState<StockSortOrder>('none');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync search input with search query parameter from Topbar
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Reset to page 1 whenever search, category, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, stockSort]);

  // Extract all categories dynamically with fallback defaults
  const categories = useMemo(() => {
    const defaultCats = [
      'All Items',
      'Power Tools',
      'Hand Tools',
      'Electrical',
      'Plumbing',
      'Construction',
      'Fasteners',
      'Painting',
    ];
    const existingCats = new Set<string>();
    products.forEach((p) => {
      if (p.category) existingCats.add(p.category);
    });
    defaultCats.forEach((c) => {
      if (c !== 'All Items') existingCats.add(c);
    });
    return ['All Items', ...Array.from(existingCats)];
  }, [products]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Items': products.length };
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term));

      const matchesCategory =
        selectedCategory === 'All Items' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (stockSort === 'asc') {
      // Lowest to Highest
      result = [...result].sort((a, b) => a.quantity - b.quantity);
    } else if (stockSort === 'desc') {
      // Highest to Lowest
      result = [...result].sort((a, b) => b.quantity - a.quantity);
    }

    return result;
  }, [products, searchTerm, selectedCategory, stockSort]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(start, start + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  const handleDelete = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}" (${product.sku})?`)) {
      deleteExistingProduct(product.id);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Items');
    setStockSort('none');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const toggleStockColumnSort = () => {
    if (stockSort === 'none') {
      setStockSort('asc'); // Lowest to highest
    } else if (stockSort === 'asc') {
      setStockSort('desc'); // Highest to lowest
    } else {
      setStockSort('none');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in flex flex-col">
      {/* Table Toolbar & Controls */}
      <div className="p-6 border-b border-slate-100 space-y-5 bg-gradient-to-b from-white to-slate-50/40">
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by SKU, product name, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white pl-11 pr-10 py-2.5 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 text-sm font-medium text-slate-800 placeholder-slate-400 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Stock Sorting Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mr-1">
              <SlidersHorizontal size={13} className="text-[#c2410c]" />
              Stock Sort:
            </span>

            {/* Lowest to Highest Button */}
            <button
              onClick={() => setStockSort(stockSort === 'asc' ? 'none' : 'asc')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                stockSort === 'asc'
                  ? 'bg-amber-500 text-white shadow-amber-500/20 ring-2 ring-amber-400/40 font-black'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
              }`}
              title="Sort lowest stock first (Restock Priority)"
            >
              <ArrowUpNarrowWide size={15} />
              <span>Lowest to Highest</span>
              {stockSort === 'asc' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Highest to Lowest Button */}
            <button
              onClick={() => setStockSort(stockSort === 'desc' ? 'none' : 'desc')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                stockSort === 'desc'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/40 font-black'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
              }`}
              title="Sort highest stock first"
            >
              <ArrowDownNarrowWide size={15} />
              <span>Highest to Lowest</span>
              {stockSort === 'desc' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Clear Sort / Reset Button if sorted */}
            {stockSort !== 'none' && (
              <button
                onClick={() => setStockSort('none')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold transition-all"
                title="Reset stock sorting to default"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c2410c] text-white shadow-md shadow-orange-900/25 ring-2 ring-orange-400/30'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 select-none">
              <th className="px-6 py-4">Item & SKU</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Unit Price</th>
              {/* Clickable Stock Header with Sort Indicator */}
              <th
                onClick={toggleStockColumnSort}
                className="px-6 py-4 cursor-pointer group hover:bg-slate-100/60 transition-colors"
                title="Click to toggle Stock Sorting"
              >
                <div className="flex items-center gap-1.5 text-slate-600 group-hover:text-[#c2410c]">
                  <span>Stock Quantity</span>
                  {stockSort === 'asc' ? (
                    <ArrowUpNarrowWide size={14} className="text-amber-500 font-bold" />
                  ) : stockSort === 'desc' ? (
                    <ArrowDownNarrowWide size={14} className="text-emerald-600 font-bold" />
                  ) : (
                    <ArrowUpDown size={13} className="text-slate-400 group-hover:text-slate-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedProducts.map((product) => {
              const isOutOfStock = product.quantity === 0;
              const isLowStock = product.quantity <= (product.reorderLevel || 10) && !isOutOfStock;

              return (
                <tr
                  key={product.id}
                  className="group hover:bg-orange-50/30 transition-colors duration-150"
                >
                  {/* Product Info & Thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 group-hover:text-[#c2410c] transition-colors leading-tight">
                          {product.name}
                        </p>
                        <p className="text-xs font-mono font-bold text-[#c2410c] mt-0.5">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                      {product.category || 'General'}
                    </span>
                  </td>

                  {/* Unit Price */}
                  <td className="px-6 py-4">
                    <p className="font-black text-sm text-slate-900">
                      ₱{Number(product.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>

                  {/* Stock Quantity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Boxes
                        size={15}
                        className={
                          isOutOfStock
                            ? 'text-rose-500'
                            : isLowStock
                            ? 'text-amber-500'
                            : 'text-emerald-600'
                        }
                      />
                      <span
                        className={`font-black text-sm ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {product.quantity}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Units
                      </span>
                    </div>
                  </td>

                  {/* Stock Status Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isOutOfStock
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isLowStock
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-500'
                            : isLowStock
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      {isOutOfStock
                        ? 'Out of Stock'
                        : isLowStock
                        ? 'Low Stock'
                        : 'In Stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-slate-400 hover:text-[#c2410c] hover:bg-orange-50 rounded-xl transition-all"
                        title="Edit product"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {processedProducts.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-slate-50/40">
            <div className="w-16 h-16 rounded-2xl bg-orange-100/60 text-[#c2410c] flex items-center justify-center mb-3">
              <Package size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No inventory products found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchTerm || selectedCategory !== 'All Items'
                ? 'No items matched your current search filters or category selection.'
                : 'No products are currently registered in the inventory catalog.'}
            </p>
            {(searchTerm || selectedCategory !== 'All Items' || stockSort !== 'none') && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-white border border-slate-200 hover:border-[#c2410c] text-[#c2410c] rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Showing{' '}
          <span className="font-bold text-slate-800">
            {processedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{' '}
          to{' '}
          <span className="font-bold text-slate-800">
            {Math.min(currentPage * itemsPerPage, processedProducts.length)}
          </span>{' '}
          of <span className="font-bold text-slate-800">{processedProducts.length}</span> items
          {stockSort !== 'none' && (
            <span className="ml-2 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[10px]">
              Sorted: {stockSort === 'asc' ? 'Lowest Stock First' : 'Highest Stock First'}
            </span>
          )}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#c2410c] text-white shadow-md shadow-orange-900/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}