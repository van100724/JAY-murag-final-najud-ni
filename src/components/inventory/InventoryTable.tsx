import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import type { Product } from '../../data/inventory';

interface InventoryTableProps {
  onEdit: (product: any) => void;
}

export default function InventoryTable({ onEdit }: InventoryTableProps) {
  const { products, deleteExistingProduct, getProductCategories } = useApp();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Sync search input with search query parameter from Topbar
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Dynamic categories matching catalog (Heuristic 4: Consistency & Standards)
  const categories = ['All Items', ...getProductCategories()];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Items' || product.category === selectedCategory;
    
    let matchesStatus = true;
    if (statusFilter === 'low-stock') {
      matchesStatus = product.quantity > 0 && product.quantity <= product.reorderLevel;
    } else if (statusFilter === 'out-of-stock') {
      matchesStatus = product.quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteExistingProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'All Items' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Items');
    setStatusFilter('all');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Table Controls */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#c2410c] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search SKU or Item Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 pl-11 pr-9 py-2.5 rounded-xl outline-none border border-slate-200 focus:bg-white focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1 shrink-0"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Stock Status Tabs - Heuristic 7 */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Filter Status:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStatusFilter('low-stock')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'low-stock'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            Low Stock Only
          </button>
          <button
            onClick={() => setStatusFilter('out-of-stock')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'out-of-stock'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            Out of Stock Only
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-8 py-4">SKU</th>
              <th className="px-8 py-4">Item Name</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4">Stock</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filteredProducts.map((product) => {
              const isLowStock = product.quantity <= product.reorderLevel;
              const isOutOfStock = product.quantity === 0;

              return (
                <tr
                  key={product.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-5 text-sm font-bold text-slate-400">
                    {product.sku}
                  </td>

                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      ₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} • Reorder alert at {product.reorderLevel} units
                    </p>
                  </td>

                  <td className="px-8 py-5">
                    <span className="text-xs text-slate-600 font-medium px-2.5 py-1 rounded-md bg-slate-100">
                      {product.category}
                    </span>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-sm ${
                        isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {product.quantity} Units
                      </p>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isOutOfStock 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : isLowStock 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-xl text-slate-400 hover:text-[#c2410c] hover:bg-orange-50 transition-all"
                        title="Edit product specifications"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete product"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Empty state with recovery button - Heuristic 9 */}
        {filteredProducts.length === 0 && (
          <div className="py-16 px-6 text-center bg-slate-50/50 flex flex-col items-center justify-center">
            <AlertTriangle size={36} className="text-slate-300 mb-3" />
            <p className="text-slate-700 font-bold text-sm">No products found matching your current filters.</p>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              {searchTerm ? `No products match "${searchTerm}".` : 'No products match the selected category and status filters.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-[#c2410c] hover:border-orange-200 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <X size={14} /> Clear Search & Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clean Table Summary Footer - Heuristic 8 */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p className="font-medium">
          Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
          <strong className="text-slate-800">{products.length}</strong> products
          {hasActiveFilters && <span className="text-orange-600 ml-1 font-semibold">(Filtered)</span>}
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          All catalog records synced
        </span>
      </div>

      {/* Delete Confirmation Dialog - Heuristic 3 & 5 */}
      <ConfirmDialog
        open={productToDelete !== null}
        title="Delete Product from Catalog?"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" (${productToDelete?.sku})? This product will no longer be available in the POS terminal.`}
        detail={productToDelete ? `Current Stock: ${productToDelete.quantity} units • Price: ₱${productToDelete.price.toFixed(2)}` : undefined}
        confirmText="Delete Product"
        cancelText="Keep Product"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}