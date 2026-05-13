import { useState, useEffect } from 'react';
import { X, Pencil, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import type { Product } from '../../data/inventory';

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
        costPrice: (product.costPrice || 0).toString(),
        quantity: product.quantity.toString(),
        reorderLevel: product.reorderLevel.toString(),
        supplier: product.supplier || '',
        image: product.image || '',
        description: product.description || '',
      });
    }
  }, [product]);

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
      name: form.name,
      sku: form.sku,
      category: form.category,
      price: Number(form.price),
      costPrice: Number(form.costPrice),
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel),
      supplier: form.supplier,
      image: form.image,
      description: form.description,
    };

    await updateExistingProduct(product.id, updates);
    onClose();
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center z-50 p-5 overflow-y-auto animate-fade-in text-slate-800">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <Pencil size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Edit Asset: {product.sku}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Modify Specifications and Image Assets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/30 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Code (Reference Only)</label>
              <input 
                type="text" 
                name="sku" 
                value={form.sku} 
                readOnly 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-[#c2410c] outline-none cursor-not-allowed" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/30 outline-none" required>
                <option value="">Select Category</option>
                <option>Power Tools</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Construction</option>
                <option>Fasteners</option>
                <option>Painting</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retail Price (₱)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Level</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified Supplier</label>
              <select name="supplier" value={form.supplier} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/30 outline-none" required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL (Unsplash or Local)</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/30 outline-none" />
              </div>
              {form.image && (
                <div className="w-11 h-11 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold resize-none outline-none" />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel Changes</button>
            <button type="submit" className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#c2410c] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all">
              Update Asset <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
