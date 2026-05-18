import { useApp } from '../../contexts/AppContext';
import { AlertCircle } from 'lucide-react';

export default function LowStockWidget() {
  const { getLowStock } = useApp();
  const lowStockProducts = getLowStock();



  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle size={22} className="text-[#9a3412]" />
        <h2 className="text-lg font-bold text-slate-800">
          Low Stock Alerts
        </h2>
      </div>

      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        {lowStockProducts.length || 8} items require immediate procurement attention.
      </p>

      <div className="space-y-4">
        {lowStockProducts.slice(0, 3).map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-all bg-slate-50/50"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
              <img src={product.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&h=100&fit=crop'} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] text-slate-800 truncate uppercase">{product.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">SKU: {product.sku}</p>
              <p className={`text-[11px] font-black mt-1 ${product.quantity === 0 ? 'text-red-500' : 'text-[#9a3412]'}`}>
                Stock: {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} Units Left`}
              </p>
            </div>
            <button className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
              product.quantity === 0 ? 'bg-red-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}>
              {product.quantity === 0 ? 'Urgent' : 'Order'}
            </button>
          </div>
        ))}
        {lowStockProducts.length === 0 && (
          <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Levels Optimal</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-slate-500 text-[10px] font-bold uppercase hover:bg-slate-50 transition-all tracking-wider">
        Generate Full Procurement Report
      </button>
    </div>
  );
}