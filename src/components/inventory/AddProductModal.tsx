// src/components/inventory/AddProductModal.tsx

import { useState, useEffect } from 'react';
import { X, PackagePlus, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

const initialForm = {
  name: '',
  sku: '',
  category: '',
  price: '',
  costPrice: '',
  quantity: '',
  reorderLevel: '5',
  supplier: '',
  image: '',
  description: '',
};

export default function AddProductModal({ open, onClose }: AddProductModalProps) {
  const { addNewProduct, suppliers } = useApp();
  const [form, setForm] = useState(initialForm);

  // Escape key to cancel/close dialog - Heuristic 3
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [open]);

  const generateSKU = (category: string) => {
    const prefixes: Record<string, string> = {
      'Power Tools': 'PWR',
      'Electrical': 'ELE',
      'Plumbing': 'PLB',
      'Construction': 'CON',
      'Fasteners': 'FST',
      'Painting': 'PNT',
      'Hand Tools': 'HTL'
    };
    const prefix = prefixes[category] || 'GEN';
    const random = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now().toString().slice(-3);
    return `${prefix}-${random}${timestamp}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category' && value) {
      setForm(prev => ({
        ...prev,
        category: value,
        sku: generateSKU(value)
      }));
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      price: Math.max(0, Number(form.price)),
      costPrice: Math.max(0, Number(form.costPrice || 0)),
      quantity: Math.max(0, Number(form.quantity)),
      reorderLevel: Math.max(1, Number(form.reorderLevel || 5)),
      supplier: form.supplier,
      image: form.image.trim(),
      description: form.description.trim(),
    };

    await addNewProduct(newProduct as any);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in text-slate-800 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        {/* Header Area */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <PackagePlus size={24} />
            </div>
            <div>
              <h2 id="add-product-title" className="text-xl font-black tracking-tight text-slate-900">Add Product to Inventory</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Register new catalog item and stock threshold</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-5">
            {/* Item Name */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="e.g. Cordless Impact Drill" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-[#c2410c]/30 outline-none" 
                required 
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-[#c2410c]/30 outline-none" 
                required
              >
                <option value="">Select Category</option>
                <option>Power Tools</option>
                <option>Hand Tools</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Construction</option>
                <option>Fasteners</option>
                <option>Painting</option>
              </select>
            </div>

            {/* SKU Code */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Code</label>
                <span className="text-[9px] text-slate-400 font-medium">Auto-generated</span>
              </div>
              <input 
                type="text" 
                name="sku" 
                value={form.sku} 
                readOnly
                placeholder="Select category to generate SKU..." 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-black text-[#c2410c] outline-none cursor-not-allowed" 
                required 
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier</label>
              <select 
                name="supplier" 
                value={form.supplier} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-[#c2410c]/30 outline-none" 
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Retail Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retail Selling Price (₱)</label>
              <input 
                type="number" 
                name="price" 
                min="0" 
                step="any"
                placeholder="0.00"
                value={form.price} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#c2410c]/30 outline-none" 
                required 
              />
            </div>

            {/* Cost Price - Previously missing input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost / Purchase Price (₱)</label>
              <input 
                type="number" 
                name="costPrice" 
                min="0" 
                step="any"
                placeholder="0.00"
                value={form.costPrice} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 focus:bg-white focus:border-[#c2410c]/30 outline-none" 
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock Level (Units)</label>
              <input 
                type="number" 
                name="quantity" 
                min="0" 
                placeholder="0"
                value={form.quantity} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600 focus:bg-white focus:border-[#c2410c]/30 outline-none" 
                required 
              />
            </div>

            {/* Reorder Level - Previously missing input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reorder Alert Level (Units)</label>
              <input 
                type="number" 
                name="reorderLevel" 
                min="1" 
                placeholder="5"
                value={form.reorderLevel} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-600 focus:bg-white focus:border-[#c2410c]/30 outline-none" 
                required 
              />
            </div>
          </div>

          {/* Image URL & Thumbnail Preview */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Image URL (Optional)</label>
            <div className="flex gap-3">
              <input 
                type="url" 
                name="image" 
                value={form.image} 
                onChange={handleChange} 
                placeholder="https://images.unsplash.com/photo-..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-[#c2410c]/30 outline-none flex-1" 
              />
              <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                {form.image ? (
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                ) : (
                  <ImageIcon size={18} className="text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description (Optional)</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={2} 
              placeholder="Key specifications, warranty, or packaging details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium resize-none focus:bg-white focus:border-[#c2410c]/30 outline-none" 
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#c2410c] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] active:scale-[0.98] transition-all"
            >
              Add to Catalog <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}