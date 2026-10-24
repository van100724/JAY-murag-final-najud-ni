import { useApp } from '../../contexts/AppContext';
import { AlertCircle, PlusCircle, ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  searchQuery?: string;
  category?: string;
}

export default function ProductGrid({ searchQuery = '', category = 'All' }: ProductGridProps) {
  const { products, addToCart, cart } = useApp();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 animate-fade-in p-6 text-center">
        <AlertCircle size={44} className="mb-3 text-slate-300" />
        <p className="text-base font-bold text-slate-700">No products match your criteria</p>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {searchQuery ? `No results for "${searchQuery}" in ${category === 'All' ? 'all categories' : category}.` : `No items in ${category}.`}
        </p>
        <p className="text-[11px] text-slate-400 font-semibold mt-2">
          Try checking for spelling errors or choosing another category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredProducts.map((product) => {
        const inCartItem = cart.find(item => item.productId === product.id);
        const inCartCount = inCartItem ? inCartItem.quantity : 0;
        const isOutOfStock = product.quantity <= 0;
        const isLowStock = product.quantity > 0 && product.quantity <= product.reorderLevel;

        return (
          <div
            key={product.id}
            onClick={() => !isOutOfStock && addToCart(product)}
            className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer animate-fade-in flex flex-col justify-between ${
              isOutOfStock 
                ? 'border-slate-200 opacity-60 grayscale cursor-not-allowed bg-slate-50' 
                : inCartCount > 0
                ? 'border-[#c2410c]/50 shadow-md ring-2 ring-[#c2410c]/10 hover:-translate-y-0.5'
                : 'border-slate-200 hover:border-[#c2410c]/30 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]'
            }`}
          >
            {/* Product Image Area */}
            <div className="h-44 bg-slate-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <span className="text-5xl transform group-hover:scale-110 transition-transform duration-500">
                  📦
                </span>
              )}

              {/* Hover Indicator Overlay */}
              {!isOutOfStock && (
                <div className="absolute inset-0 bg-[#c2410c]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-[#c2410c] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    <PlusCircle size={16} />
                    <span>Add to Cart</span>
                  </div>
                </div>
              )}
              
              {/* Stock Status Pill - Heuristic 1 */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : isLowStock
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low (${product.quantity})` : 'In Stock'}
                </span>
              </div>

              {/* In-Cart Recognition Badge - Heuristic 6 */}
              {inCartCount > 0 && (
                <div className="absolute top-3 right-3 animate-fade-in">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c2410c] text-white shadow-md flex items-center gap-1">
                    <ShoppingBag size={11} />
                    {inCartCount} in cart
                  </span>
                </div>
              )}
            </div>

            {/* Product Details Area */}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black truncate">
                  {product.category}
                </p>
                <h3 className="font-bold text-slate-800 text-sm leading-snug mt-0.5 group-hover:text-[#c2410c] transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  SKU: {product.sku}
                </p>
              </div>

              <div className="flex items-end justify-between pt-3 mt-3 border-t border-slate-100">
                <div>
                  <p className="text-lg font-black text-slate-900 tracking-tight leading-none">
                    ₱{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    {product.quantity} Available
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-300'
                    : inCartCount > 0
                    ? 'bg-[#c2410c] text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-[#c2410c]/10 group-hover:text-[#c2410c]'
                }`}>
                  <PlusCircle size={18} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}