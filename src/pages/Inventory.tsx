import { useState } from 'react';
import InventoryTable from '../components/inventory/InventoryTable';
import AddProductModal from '../components/inventory/AddProductModal';
import EditProductModal from '../components/inventory/EditProductModal';
import { useApp } from '../contexts/AppContext';
import {
  AlertTriangle,
  DollarSign,
  Boxes,
  PackagePlus,
  TrendingUp,
} from 'lucide-react';
import type { Product } from '../data/inventory';

export default function Inventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, getLowStock } = useApp();

  const inventoryValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0);
  const lowStockCount = getLowStock().length;
  const inStockCount = products.filter(p => Number(p.quantity) > (p.reorderLevel || 10)).length;

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
        {/* Page Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Inventory Management
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#c2410c] border border-orange-200/60">
                {products.length} Active SKUs
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Real-time stock control, SKU tracking, and inventory valuation across warehouse terminals.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white shadow-xl shadow-orange-900/25 active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
          >
            <PackagePlus size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Low Stock Alert */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:border-rose-200 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform flex-shrink-0">
              <AlertTriangle size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Stock Attention
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                {lowStockCount}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    lowStockCount > 0
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {lowStockCount > 0
                    ? `${lowStockCount} items need restock`
                    : 'All stock levels optimal'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Inventory Value */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <DollarSign size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Inventory Asset Value
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight truncate">
                ₱{inventoryValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TrendingUp size={11} /> Total Retail Valuation
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Stock Items */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5 hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0">
              <Boxes size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Warehouse Catalog
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                {products.length} <span className="text-sm font-bold text-slate-400">SKUs</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  {inStockCount} SKUs in optimal stock
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Inventory Table with Stock Sort */}
        <InventoryTable onEdit={handleEdit} />
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
}