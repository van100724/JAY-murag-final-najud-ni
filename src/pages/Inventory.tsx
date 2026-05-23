import { useState } from 'react';
import InventoryTable from '../components/inventory/InventoryTable';
import AddProductModal from '../components/inventory/AddProductModal';
import EditProductModal from '../components/inventory/EditProductModal';
import { useApp } from '../contexts/AppContext';
import { AlertCircle, DollarSign, Package } from 'lucide-react';
import type { Product } from '../data/inventory';

export default function Inventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, getLowStock } = useApp();

  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStockCount = getLowStock().length;

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800">
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Inventory Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Real-time control over {products.length} active SKUs across your system.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#c2410c] px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add New Product
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock Alerts</p>
              <p className="text-2xl font-black text-slate-800">{lowStockCount}</p>
              <p className={`text-[10px] font-bold mt-0.5 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {lowStockCount > 0 ? `${lowStockCount} items require attention` : 'All levels optimal'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Value</p>
              <p className="text-2xl font-black text-slate-800">₱{inventoryValue.toLocaleString()}</p>
              <p className="text-[10px] text-green-600 font-bold mt-0.5">Total Asset Valuation</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warehouse Status</p>
              <p className="text-2xl font-black text-slate-800">Operational</p>
              <p className="text-[10px] text-blue-600 font-bold mt-0.5">All zones synced</p>
            </div>
          </div>
        </div>

        <InventoryTable onEdit={handleEdit} />
      </div>

      <AddProductModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

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