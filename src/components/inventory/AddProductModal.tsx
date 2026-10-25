<<<<<<< HEAD
import { useState, useEffect } from 'react';
import {
  X,
  PackagePlus,
  Tag,
  Layers,
  Barcode,
  RefreshCw,
  Boxes,
  Image as ImageIcon,
  Plus,
  Sparkles,
} from 'lucide-react';
=======
// src/components/inventory/AddProductModal.tsx

import { useState, useEffect } from 'react';
import { X, PackagePlus, ArrowRight, Image as ImageIcon } from 'lucide-react';
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
import { useApp } from '../../contexts/AppContext';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

<<<<<<< HEAD
const CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Electrical',
  'Plumbing',
  'Construction',
  'Fasteners',
  'Painting',
];

const PRESET_IMAGES: Record<string, string> = {
  'Power Tools': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80',
  'Hand Tools': 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&auto=format&fit=crop&q=80',
  'Electrical': 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500&auto=format&fit=crop&q=80',
  'Plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&auto=format&fit=crop&q=80',
  'Construction': 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=80',
  'Fasteners': 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=80',
  'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
};

export default function AddProductModal({ open, onClose }: AddProductModalProps) {
  const { addNewProduct } = useApp();

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    image: '',
  });
=======
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
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a

  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSKU = (cat?: string) => {
    const prefixes: Record<string, string> = {
      'Power Tools': 'PWR',
      'Hand Tools': 'HTL',
      'Electrical': 'ELE',
      'Plumbing': 'PLB',
      'Construction': 'CON',
      'Fasteners': 'FST',
      'Painting': 'PNT',
    };
    const prefix = prefixes[cat || form.category] || 'GEN';
    const random = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now().toString().slice(-3);
    return `${prefix}-${random}${timestamp}`;
  };

  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      category: '',
      price: '',
      quantity: '',
      image: '',
    });
    setImageError(false);
  };

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

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'category') {
      const generated = generateSKU(value);
      setForm(prev => ({
        ...prev,
        category: value,
        sku: generated,
        image: prev.image ? prev.image : (PRESET_IMAGES[value] || ''),
      }));
      setImageError(false);
    } else if (name === 'image') {
      setImageError(false);
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegenerateSKU = (e: React.MouseEvent) => {
    e.preventDefault();
    setForm(prev => ({ ...prev, sku: generateSKU(prev.category) }));
  };

  const handleApplyPreset = (url: string) => {
    setForm(prev => ({ ...prev, image: url }));
    setImageError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.quantity) return;

<<<<<<< HEAD
    setIsSubmitting(true);
    try {
      const priceNum = Number(form.price) || 0;
      const quantityNum = Number(form.quantity) || 0;
=======
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
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a

      const newProduct = {
        name: form.name.trim(),
        sku: form.sku.trim() || generateSKU(form.category),
        category: form.category || 'General',
        price: priceNum,
        costPrice: Math.round(priceNum * 0.7),
        cost_price: Math.round(priceNum * 0.7),
        quantity: quantityNum,
        reorderLevel: 5,
        reorder_level: 5,
        supplier: 'Direct Stock',
        image: form.image.trim(),
        description: '',
      };

      await addNewProduct(newProduct as any);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<<<<<<< HEAD
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Area - Compact */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] flex items-center justify-center text-white shadow-md shadow-orange-900/20 flex-shrink-0">
              <PackagePlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Add New Product</h2>
              <p className="text-[11px] font-semibold text-slate-400">
                Register SKU specification and stock inventory details
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
                  placeholder="e.g. Industrial SDS Rotary Hammer 800W"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs"
                  required
                  autoFocus
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

                {/* SKU Code */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Barcode size={12} className="text-[#c2410c]" />
                      <span>SKU <span className="text-rose-500">*</span></span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateSKU}
                      title="Regenerate SKU"
                      className="text-[10px] text-slate-400 hover:text-[#c2410c] flex items-center gap-0.5"
                    >
                      <RefreshCw size={10} />
                      <span>New</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Auto SKU..."
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#c2410c] focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                    required
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

                {/* Quick Presets */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-0.5">
                    <Sparkles size={9} className="text-amber-500" /> Presets:
                  </span>
                  {CATEGORIES.slice(0, 3).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleApplyPreset(PRESET_IMAGES[cat])}
                      className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 hover:bg-orange-50 hover:text-[#c2410c] text-slate-600 rounded-md transition-colors border border-slate-200/60 cursor-pointer"
                    >
                      {cat.split(' ')[0]}
                    </button>
                  ))}
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, image: '' }));
                        setImageError(false);
                      }}
                      className="text-[9px] font-bold px-1.5 py-0.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="h-28 w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center relative">
                {form.image && !imageError ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={22} />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">
                      No Image Set
                    </span>
                  </div>
                )}
              </div>
=======
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
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
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

<<<<<<< HEAD
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
              <Plus size={14} />
              <span>{isSubmitting ? 'Adding...' : 'Add Product'}</span>
=======
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
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}