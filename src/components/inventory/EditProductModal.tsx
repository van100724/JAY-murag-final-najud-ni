import { useState, useEffect } from 'react';
import { X, Pencil, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { Product } from '../../data/inventory';

const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Electrical',
  'Plumbing',
  'Construction',
  'Fasteners',
  'Painting',
] as const;

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function EditProductModal({ open, onClose, product }: EditProductModalProps) {
  const { updateExistingProduct, suppliers } = useApp();
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    costPrice: '',
    quantity: '',
    reorderLevel: '',
    supplier: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price.toString(),
        costPrice: (product.costPrice ?? 0).toString(),
        quantity: product.quantity.toString(),
        reorderLevel: (product.reorderLevel ?? 10).toString(),
        supplier: product.supplier || '',
        image: product.image || '',
        description: product.description || '',
      });
    }
  }, [product]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const updates = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      price: Math.max(0, Number(form.price) || 0),
      costPrice: Math.max(0, Number(form.costPrice) || 0),
      quantity: Math.max(0, Math.floor(Number(form.quantity) || 0)),
      reorderLevel: Math.max(0, Math.floor(Number(form.reorderLevel) || 10)),
      supplier: form.supplier,
      image: form.image.trim(),
      description: form.description.trim(),
    };

    await updateExistingProduct(product.id, updates);
    onClose();
  };

  if (!open || !product) return null;

  const categories = CATEGORIES;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-5 overflow-y-auto animate-fade-in text-slate-800">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <Pencil size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Edit Product: {product.sku}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Update specifications, pricing, and stock levels</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Close modal"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/40 outline-none" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Code (Read Only)</label>
              <input 
                type="text" 
                name="sku" 
                value={form.sku} 
                readOnly 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-[#c2410c] outline-none cursor-not-allowed" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/40 outline-none" 
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified Supplier</label>
              <select 
                name="supplier" 
                value={form.supplier} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/40 outline-none" 
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Financials & Stock */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retail Selling Price (₱)</label>
              <input 
                type="number" 
                name="price" 
                min="0"
                step="any"
                value={form.price} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#c2410c]/40 outline-none" 
                required 
              />
              <p className="text-[10px] text-slate-400 ml-1">Price charged to customer at POS</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Cost Price (₱)</label>
              <input 
                type="number" 
                name="costPrice" 
                min="0"
                step="any"
                value={form.costPrice} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#c2410c]/40 outline-none" 
                required 
              />
              <p className="text-[10px] text-slate-400 ml-1">Wholesale procurement cost per unit</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock (Units)</label>
              <input 
                type="number" 
                name="quantity" 
                min="0"
                step="1"
                value={form.quantity} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600 focus:border-[#c2410c]/40 outline-none" 
                required 
              />
              <p className="text-[10px] text-slate-400 ml-1">Available inventory on hand</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reorder Level Threshold</label>
              <input 
                type="number" 
                name="reorderLevel" 
                min="0"
                step="1"
                value={form.reorderLevel} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-orange-600 focus:border-[#c2410c]/40 outline-none" 
                required 
              />
              <p className="text-[10px] text-slate-400 ml-1">Triggers low stock alert when inventory reaches this level</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  name="image" 
                  value={form.image} 
                  onChange={handleChange} 
                  placeholder="https://images.unsplash.com/photo-..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/40 outline-none" 
                />
              </div>
              {form.image && (
                <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0 shadow-sm">
                  <img 
                    src={form.image} 
                    alt="Preview" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&h=100&fit=crop'; }}
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={3} 
              placeholder="Detailed product specifications or notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold resize-none outline-none focus:border-[#c2410c]/40" 
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel (Esc)
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#c2410c] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all"
            >
              Save Product <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
