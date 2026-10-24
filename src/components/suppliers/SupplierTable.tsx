import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Search,
  Building2,
  X,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ConfirmDialog from '../ui/ConfirmDialog';

interface SupplierTableProps {
  onEdit: (supplier: any) => void;
}

export default function SupplierTable({ onEdit }: SupplierTableProps) {
  const { suppliers, deleteExistingSupplier } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteExistingSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
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
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
        {/* Header Area */}
        <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registered Suppliers</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Showing {filteredSuppliers.length} of {suppliers.length} active vendors
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder="Search supplier, contact, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 pl-11 pr-10 py-3 rounded-xl outline-none border border-slate-200 focus:border-[#c2410c]/30 transition-all text-sm w-[320px]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
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
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 size={36} className="text-slate-200" />
                      <p className="font-bold text-slate-600 text-sm">No suppliers found matching "{searchTerm}"</p>
                      <p className="text-xs text-slate-400">Check spelling or clear search filters to view all partners.</p>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
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
                            {supplier.address || 'Address on file'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-700">{supplier.contactPerson}</p>
                        <div className="flex items-center gap-2">
                          {supplier.email && (
                            <a
                              href={`mailto:${supplier.email}`}
                              title={`Email ${supplier.contactPerson} (${supplier.email})`}
                              aria-label={`Email ${supplier.contactPerson}`}
                              className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            >
                              <Mail size={14} />
                            </a>
                          )}
                          {supplier.phone && (
                            <a
                              href={`tel:${supplier.phone}`}
                              title={`Call ${supplier.contactPerson} (${supplier.phone})`}
                              aria-label={`Call ${supplier.contactPerson}`}
                              className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                            >
                              <Phone size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {(supplier.category || 'General Hardware').split(',').map((cat: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tighter">
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
                          title="Edit supplier details"
                          aria-label="Edit supplier details"
                          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setSupplierToDelete({ id: supplier.id, name: supplier.name })}
                          title="Delete supplier"
                          aria-label="Delete supplier"
                          className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={supplierToDelete !== null}
        title="Delete Supplier?"
        message={`Are you sure you want to remove "${supplierToDelete?.name}" from your verified suppliers network? Products linked to this vendor will not be deleted.`}
        confirmText="Yes, Delete Supplier"
        cancelText="Keep Supplier"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setSupplierToDelete(null)}
      />
    </>
  );
}