// src/components/pos/AddProductModal.tsx

import { useState } from 'react';
import { X, PackagePlus, ArrowRight } from 'lucide-react';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProductModal({
  open,
  onClose,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    barcode: '',
    stock: '',
    price: '',
    supplier: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    console.log('Product Added:', formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in text-slate-800">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header Area */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#c2410c] flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
              <PackagePlus size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Add Inventory Product</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Register New SKU into POS Network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Official Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="e.g. Heavy Duty Claw Hammer"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Asset Classification
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
                required
              >
                <option value="">Select Category</option>
                <option>Power Tools</option>
                <option>Hand Tools</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Construction</option>
                <option>Painting</option>
              </select>
            </div>

            {/* Barcode / SKU */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                SKU / Barcode ID
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="TRK-8829-X"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Initial Stock Unit
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold text-emerald-600"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Retail Price (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₱</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-slate-50 pl-8 pr-4 py-3.5 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-lg font-black text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Verified Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Search Vendors..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-sm font-bold"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancel Operation
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#c2410c] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] active:scale-[0.98] transition-all"
            >
              Register Product
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
