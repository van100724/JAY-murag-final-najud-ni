import { useState, useEffect } from 'react';
import { X, Pencil, Tag, Layers, Barcode, Boxes, Image as ImageIcon, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { Product } from '../../data/inventory';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Electrical',
  'Plumbing',
  'Construction',
  'Fasteners',
  'Painting',
];

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
  const { updateExistingProduct } = useApp();
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    image: '',
  });

  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        image: product.image || '',
      });
      setImageError(false);
    }
  }, [product]);

  // Usability Heuristic: User Control & Freedom (Esc closes modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'image') setImageError(false);
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !form.name.trim() || !form.price || !form.quantity) return;

    setIsSubmitting(true);
    try {
      const priceNum = Number(form.price) || 0;
      const updates = {
        name: form.name.trim(),
        sku: form.sku,
        category: form.category,
        price: priceNum,
        costPrice: Math.round(priceNum * 0.7),
        cost_price: Math.round(priceNum * 0.7),
        quantity: Number(form.quantity) || 0,
        image: form.image.trim(),
      };

      await updateExistingProduct(product.id, updates);
      onClose();
    } catch (err) {
      console.error('Error updating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in text-slate-800"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Area */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] flex items-center justify-center text-white shadow-md shadow-orange-900/20 flex-shrink-0">
              <Pencil size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                Edit Product Asset
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                Update SKU specifications, pricing, and stock quantities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body - 2 Column Zero-Scroll Layout */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Column (7 cols): Identification & Pricing */}
            <div className="md:col-span-7 space-y-3.5">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag size={12} className="text-[#c2410c]" />
                  <span>Product Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Category & SKU Side-by-Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers size={12} className="text-[#c2410c]" />
                    <span>Category <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs cursor-pointer"
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SKU Code (Read-only reference) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Barcode size={12} className="text-[#c2410c]" />
                    <span>SKU (Reference)</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-500 outline-none cursor-not-allowed shadow-2xs"
                  />
                </div>
              </div>

              {/* Price & Quantity Side-by-Side */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 rounded-2xl border border-slate-200/60">
                {/* Retail Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Price (₱) <span className="text-rose-500">*</span></span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">Retail</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-black text-slate-400 text-xs">₱</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-1.5 text-xs font-black text-slate-900 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Boxes size={12} className="text-emerald-600" />
                      <span>Stock <span className="text-rose-500">*</span></span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">Units</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-emerald-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Media Asset & Live Preview */}
            <div className="md:col-span-5 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon size={12} className="text-[#c2410c]" />
                    <span>Product Image</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">Optional</span>
                </label>

                {/* Image URL Input */}
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="Paste image URL..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Live Preview Box */}
              <div className="h-32 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center relative">
                {form.image && !imageError ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={24} />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer - Always visible, zero scrolling */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-900/20 hover:from-[#c2410c] hover:to-[#9a3412] active:scale-[0.98] transition-all rounded-xl disabled:opacity-50 cursor-pointer"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
