// src/components/suppliers/SupplierForm.tsx

import { useState } from 'react';
import { X, Truck, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
}

export default function SupplierForm({ open, onClose }: SupplierFormProps) {
  const { addNewSupplier } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Quezon City',
    state: 'Metro Manila',
    zipCode: '',
    country: 'Philippines',
    paymentTerms: 'Net30' as 'COD' | 'Net30' | 'Net60' | 'Net90',
    status: 'active' as 'active' | 'inactive' | 'blocked',
    category: '',
    rating: 3,
    averageDeliveryTime: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' || name === 'averageDeliveryTime' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewSupplier(formData as any);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: 'Quezon City',
      state: 'Metro Manila',
      zipCode: '',
      country: 'Philippines',
      paymentTerms: 'Net30',
      status: 'active',
      category: '',
      rating: 3,
      averageDeliveryTime: 1,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[35px] border border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)] flex flex-col max-h-[90vh] overflow-hidden translate-y-16">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 bg-[#fafafa] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c2410c] text-white shadow-lg shadow-orange-900/20">
              <Truck size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                Add Supplier
              </h2>

              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Register new partner into system
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-all hover:text-slate-700"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-8 py-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-12 gap-x-6 gap-y-4">
            {/* Row 1 */}
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Supplier Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Titan Industrial"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all focus:border-[#c2410c]/40 focus:bg-white"
              >
                <option value="">Select Category</option>
                <option>Power Tools & Hardware</option>
                <option>Electrical Supplies</option>
                <option>Plumbing & Sanitary</option>
                <option>Construction Materials</option>
                <option>Paints & Coatings</option>
                <option>Fasteners & Adhesives</option>
              </select>
            </div>

            {/* Row 2 */}
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+63 912 345 6789"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>

            {/* Row 3 */}
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vendor@company.com"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Terms</label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all focus:border-[#c2410c]/40 focus:bg-white"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Net30">Net 30 Days</option>
                <option value="Net60">Net 60 Days</option>
                <option value="Net90">Net 90 Days</option>
              </select>
            </div>

            {/* Row 4 */}
            <div className="col-span-6">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Office Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={1}
                placeholder="Building name, Street..."
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold outline-none transition-all resize-none placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-3">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-3">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>

            {/* Row 5 */}
            <div className="col-span-4">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Zip Code"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-4">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Delivery (Days)</label>
              <input
                type="number"
                name="averageDeliveryTime"
                value={formData.averageDeliveryTime}
                onChange={handleChange}
                min="1"
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:border-[#c2410c]/40 focus:bg-white"
              />
            </div>
            <div className="col-span-4">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold outline-none transition-all focus:border-[#c2410c]/40 focus:bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#c2410c] px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-[#9a3412] hover:-translate-y-0.5"
            >
              Add Supplier
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
