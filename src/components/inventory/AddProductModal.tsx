// src/components/inventory/AddProductModal.tsx

import { useState } from 'react';
import { X, PackagePlus, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProductModal({ open, onClose }: AddProductModalProps) {
  const { addNewProduct, suppliers } = useApp();
  const [form, setForm] = useState({
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
  });

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

    await addNewProduct(newProduct as any);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in text-slate-800 max-h-[90vh] flex flex-col">
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <PackagePlus size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Add Inventory Asset</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Register New SKU into Warehouse</p>
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
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Premium Cement" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/30 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Code (Auto-Generated)</label>
              <input 
                type="text" 
                name="sku" 
                value={form.sku} 
                readOnly
                placeholder="Select category to generate..." 
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
            <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/photo-..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#c2410c]/30 outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold resize-none outline-none" />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
            <button type="submit" className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#c2410c] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all">
              Add Product <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}