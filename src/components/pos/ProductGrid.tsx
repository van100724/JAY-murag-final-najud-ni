import { useApp } from '../../contexts/AppContext';
import { AlertCircle, PlusCircle } from 'lucide-react';

interface ProductGridProps {
  searchQuery?: string;
  category?: string;
}

export default function ProductGrid({ searchQuery = '', category = 'All' }: ProductGridProps) {
  const { products, addToCart } = useApp();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 animate-fade-in">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-bold">No products found</p>
        <p className="text-xs uppercase tracking-widest font-bold mt-1">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => product.quantity > 0 && addToCart(product)}
          className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 cursor-pointer animate-fade-in ${
            product.quantity <= 0 
            ? 'opacity-60 grayscale cursor-not-allowed' 
            : 'hover:border-[#c2410c]/30 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]'
          }`}
        >
          {/* Product Image Area */}
          <div className="h-48 bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <span className="text-5xl transform group-hover:scale-110 transition-transform duration-500">
                📦
              </span>
            )}

            {/* Hover Indicator Overlay */}
            <div className="absolute inset-0 bg-[#c2410c]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-[#c2410c] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <PlusCircle size={24} />
              </div>
            </div>
            
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                product.quantity <= 5 && product.quantity > 0 
                  ? 'bg-orange-100 text-orange-600 border border-orange-200'
                  : product.quantity <= 0
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'bg-green-100 text-green-600 border border-green-200'
              }`}>
                {product.quantity <= 0 ? 'Out of Stock' : product.quantity <= 5 ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>

          {/* Product Details Area */}
          <div className="p-5">
            <div className="mb-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                {product.category}
              </p>
              <h3 className="font-bold text-slate-800 text-base leading-tight mt-1 group-hover:text-[#c2410c] transition-colors truncate">
                {product.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">
                SKU: {product.sku}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-slate-900 tracking-tight">
                  ₱{product.price.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                  {product.quantity} Available
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#c2410c]/10 group-hover:text-[#c2410c] transition-colors">
                <PlusCircle size={18} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}