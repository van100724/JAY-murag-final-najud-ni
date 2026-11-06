import { useApp } from '../../contexts/AppContext';
import { AlertCircle, Plus, ShoppingBag, Package } from 'lucide-react';

interface ProductGridProps {
  searchQuery?: string;
  category?: string;
  stockFilter?: 'all' | 'in-stock';
}

export default function ProductGrid({
  searchQuery = '',
  category = 'All',
  stockFilter = 'all',
}: ProductGridProps) {
  const { products, addToCart, cart } = useApp();

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.sku.toLowerCase().includes(q) ||
      (product.category && product.category.toLowerCase().includes(q));

    const matchesCategory = category === 'All' || product.category === category;
    const matchesStock = stockFilter === 'all' || product.quantity > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 animate-fade-in p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#c2410c] mb-3">
          <AlertCircle size={32} />
        </div>
        <p className="text-base font-bold text-slate-800">No products match your criteria</p>
        <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm">
          {searchQuery
            ? `No matching hardware found for "${searchQuery}" in ${
                category === 'All' ? 'the catalog' : category
              }.`
            : `No items available in the "${category}" department.`}
        </p>
        <p className="text-[11px] text-slate-400 font-semibold mt-3">
          Try clearing your search term or selecting another category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
      {filteredProducts.map((product) => {
        const inCartItem = cart.find((item) => item.productId === product.id);
        const inCartCount = inCartItem ? inCartItem.quantity : 0;
        const isOutOfStock = product.quantity <= 0;
        const isLowStock = product.quantity > 0 && product.quantity <= product.reorderLevel;

        return (
          <div
            key={product.id}
            onClick={() => !isOutOfStock && addToCart(product)}
            className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between ${
              isOutOfStock
                ? 'border-slate-200 opacity-60 grayscale cursor-not-allowed bg-slate-50/50'
                : inCartCount > 0
                ? 'border-[#c2410c] shadow-md ring-2 ring-orange-500/10 cursor-pointer hover:-translate-y-0.5'
                : 'border-slate-200 hover:border-[#c2410c]/40 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {/* Product Image Box */}
            <div className="h-40 bg-slate-50/80 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to emoji placeholder if external image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-orange-100/50 flex items-center justify-center text-[#c2410c]">
                  <Package size={26} />
                </div>
              )}

              {/* Stock Status Badge */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs ${
                    isOutOfStock
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : isLowStock
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isOutOfStock
                    ? 'Out of Stock'
                    : isLowStock
                    ? `Low (${product.quantity})`
                    : `Stock: ${product.quantity}`}
                </span>
              </div>

              {/* In-Cart Recognition Badge */}
              {inCartCount > 0 && (
                <div className="absolute top-2.5 right-2.5 animate-fade-in">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c2410c] text-white shadow-sm flex items-center gap-1">
                    <ShoppingBag size={11} />
                    {inCartCount} in cart
                  </span>
                </div>
              )}

              {/* Quick Tap Indicator Overlay on Hover */}
              {!isOutOfStock && (
                <div className="absolute inset-0 bg-[#c2410c]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-[#c2410c] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    <Plus size={15} />
                    <span>Add to Order</span>
                  </div>
                </div>
              )}
            </div>

            {/* Product Card Details */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black truncate">
                  {product.category}
                </p>
                <h3 className="font-bold text-slate-800 text-xs leading-snug mt-0.5 group-hover:text-[#c2410c] transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Price and Add Button */}
              <div className="flex items-end justify-between pt-2.5 mt-2.5 border-t border-slate-100">
                <div>
                  <p className="text-base font-black text-slate-900 tracking-tight leading-none">
                    ₱
                    {Number(product.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                    {product.quantity} Available
                  </p>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-300'
                      : inCartCount > 0
                      ? 'bg-[#c2410c] text-white shadow-xs'
                      : 'bg-orange-50 text-[#c2410c] group-hover:bg-[#c2410c] group-hover:text-white'
                  }`}
                >
                  <Plus size={15} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}