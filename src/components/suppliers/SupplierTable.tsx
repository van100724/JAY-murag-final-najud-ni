import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  Building2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SupplierTableProps {
  onEdit: (supplier: any) => void;
}

export default function SupplierTable({ onEdit }: SupplierTableProps) {
  const { suppliers, deleteExistingSupplier } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteExistingSupplier(supplierId);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (supplier.name && supplier.name.toLowerCase().includes(lower)) ||
      (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(lower)) ||
      (supplier.category && supplier.category.toLowerCase().includes(lower)) ||
      (supplier.email && supplier.email.toLowerCase().includes(lower))
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Header Area */}
      <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Verified Network</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {filteredSuppliers.length} Registered Partners
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Filter suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 pl-11 pr-4 py-3 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 transition-all text-sm w-[280px]"
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-5 border-b border-slate-100">Supplier & Location</th>
              <th className="px-8 py-5 border-b border-slate-100">Primary Contact</th>
              <th className="px-8 py-5 border-b border-slate-100">Product Scope</th>
              <th className="px-8 py-5 border-b border-slate-100">Status</th>
              <th className="px-8 py-5 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-medium">
                  No suppliers found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#c2410c] shadow-sm">
                       <Building2 size={24} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-900 group-hover:text-[#c2410c] transition-colors">
                        {supplier.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        <MapPin size={10} />
                        {supplier.address}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-8 py-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">{supplier.contactPerson}</p>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${supplier.email}`} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <Mail size={14} />
                      </a>
                      <a href={`tel:${supplier.phone}`} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                        <Phone size={14} />
                      </a>
                      <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-[#c2410c] hover:bg-orange-50 transition-all">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </td>

                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1">
                    {(supplier.category || 'General').split(',').map((cat, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-tighter">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-8 py-6">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      supplier.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {supplier.status}
                  </span>
                </td>

                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(supplier)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}