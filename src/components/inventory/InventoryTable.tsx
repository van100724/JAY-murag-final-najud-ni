import { useState } from 'react';
import { Pencil, Trash2, Search, Filter } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface InventoryTableProps {
  onEdit: (product: any) => void;
}

export default function InventoryTable({ onEdit }: InventoryTableProps) {
  const { products, deleteExistingProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  const categories = ['All Items', 'Power Tools', 'Fasteners', 'Plumbing', 'Electrical', 'Painting'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Items' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteExistingProduct(productId);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Table Controls */}
      <div className="p-6 border-b border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#c2410c] text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search SKU, Item Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 pl-11 pr-4 py-2.5 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm w-[320px]"
            />
          </div>
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
                    <p className="font-bold text-slate-700">{product.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Updated 2 days ago</p>
                  </td>

                  <td className="px-8 py-5">
                    <span className="text-sm text-slate-500 font-medium">
                      {product.category}
                    </span>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-sm ${
                        isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-slate-700'
                      }`}>
                        {product.quantity} Units
                      </p>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isOutOfStock 
                        ? 'bg-red-100 text-red-600' 
                        : isLowStock 
                        ? 'bg-orange-100 text-orange-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onEdit(product)}
                        className="text-slate-400 hover:text-[#c2410c] transition-colors p-1"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
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
        
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center bg-slate-50/30">
            <p className="text-slate-400 font-bold">No items found matching your search.</p>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  );
}