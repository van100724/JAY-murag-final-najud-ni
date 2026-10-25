// src/components/suppliers/SupplierForm.tsx

import { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Check,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  supplier?: any;
}

const defaultForm = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: 'Quezon City',
  state: 'Metro Manila',
  zipCode: '1100',
  country: 'Philippines',
  paymentTerms: 'Net30' as 'COD' | 'Net30' | 'Net60' | 'Net90',
  status: 'active' as 'active' | 'inactive' | 'blocked',
  category: 'Hardware Supplies',
  rating: 5,
  averageDeliveryTime: 2,
};

export default function SupplierForm({ open, onClose, supplier }: SupplierFormProps) {
  const { addNewSupplier, updateExistingSupplier } = useApp();
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          contactPerson: supplier.contactPerson || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          city: supplier.city || 'Quezon City',
          state: supplier.state || 'Metro Manila',
          zipCode: supplier.zipCode || '1100',
          country: supplier.country || 'Philippines',
          paymentTerms: supplier.paymentTerms || 'Net30',
          status: supplier.status || 'active',
          category: supplier.category || 'Hardware Supplies',
          rating: supplier.rating ?? 5,
          averageDeliveryTime: supplier.averageDeliveryTime ?? 2,
        });
      } else {
        setFormData(defaultForm);
      }
    }
  }, [open, supplier]);

<<<<<<< HEAD
  // Usability Heuristic: User Control & Freedom (Esc closes modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
=======
  // Close on Escape key (Heuristic 3: User control and freedom)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

<<<<<<< HEAD
  // Usability Heuristic / Input Validation: Disallow characters (letters) on phone numbers
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block any alphabetic letters or invalid symbols, allow numbers, +, spaces, dashes, parens, and navigation/shortcut keys
    if (e.key.length === 1 && !/[0-9+\s()-]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  // Usability Heuristic / Input Validation: Disallow numbers in names
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block any digits (0-9)
    if (/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

=======
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let sanitizedValue: any = value;

    if (name === 'phone') {
      // Disallow all characters/letters: only digits and phone characters allowed
      sanitizedValue = value.replace(/[^0-9+\s()-]/g, '');
    } else if (name === 'name' || name === 'contactPerson') {
      // Disallow all numbers in name
      sanitizedValue = value.replace(/[0-9]/g, '');
    } else if (name === 'averageDeliveryTime') {
      sanitizedValue = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!formData.name.trim() || !formData.contactPerson.trim()) return;

    setIsSubmitting(true);
    try {
      if (supplier && supplier.id) {
        await updateExistingSupplier(supplier.id, formData);
      } else {
        await addNewSupplier(formData as any);
      }
      setFormData(defaultForm);
      onClose();
    } finally {
      setIsSubmitting(false);
=======
    const sanitizedData = {
      ...formData,
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      averageDeliveryTime: Math.max(1, Math.floor(Number(formData.averageDeliveryTime) || 1)),
    };

    if (supplier && supplier.id) {
      await updateExistingSupplier(supplier.id, sanitizedData);
    } else {
      await addNewSupplier(sanitizedData as any);
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
    }
  };

  if (!open) return null;

  const isEditing = !!supplier;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in text-slate-800"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-orange-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white flex items-center justify-center shadow-md shadow-orange-900/20 flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {isEditing ? 'Edit Supplier Profile' : 'Register New Supplier'}
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                {isEditing
                  ? 'Update vendor credentials, logistics lead time & commercial terms'
                  : 'Add a verified hardware distributor to your procurement directory'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Company & Terms */}
            <div className="space-y-3">
              {/* Supplier Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 size={12} className="text-[#c2410c]" />
                  <span>Company Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={handleNameKeyDown}
                  placeholder="e.g. Titan Industrial Supplies Corp."
                  required
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Status Selector (3 Compact Buttons) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Partnership Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active', label: 'Active', color: 'emerald' },
                    { id: 'inactive', label: 'Inactive', color: 'slate' },
                    { id: 'blocked', label: 'Blocked', color: 'rose' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status: st.id as any }))}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formData.status === st.id
                          ? st.color === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                            : st.color === 'rose'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20'
                            : 'bg-slate-100 text-slate-700 border-slate-300 ring-2 ring-slate-400/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial Terms (Payment Terms + Lead Time Side-by-Side) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <CreditCard size={12} className="text-[#c2410c]" />
                    <span>Payment Terms</span>
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#c2410c] transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="COD">COD</option>
                    <option value="Net30">Net 30</option>
                    <option value="Net60">Net 60</option>
                    <option value="Net90">Net 90</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={12} className="text-[#c2410c]" />
                    <span>Lead Time (Days)</span>
                  </label>
                  <input
                    type="number"
                    name="averageDeliveryTime"
                    value={formData.averageDeliveryTime}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    required
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#c2410c] transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Location */}
            <div className="space-y-3">
              {/* Contact Person Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <User size={12} className="text-[#c2410c]" />
                  <span>Contact Person <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Juan Dela Cruz"
                  required
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Phone & Email Side-by-Side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Phone size={12} className="text-[#c2410c]" />
                    <span>Phone <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="+63 912 345 6789"
                    required
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Mail size={12} className="text-[#c2410c]" />
                    <span>Email <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vendor@company.com"
                    required
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Street Address & City/State */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <div className="col-span-7 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <MapPin size={12} className="text-[#c2410c]" />
                    <span>Address <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street / Building..."
                    required
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                  />
                </div>

                <div className="col-span-5 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">City / State</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#c2410c] outline-none transition-all shadow-2xs"
                  />
                </div>
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
              Cancel (Esc)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-900/20 hover:from-[#c2410c] hover:to-[#9a3412] active:scale-[0.98] transition-all rounded-xl disabled:opacity-50 cursor-pointer"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
