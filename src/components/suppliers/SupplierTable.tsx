import { useState, useMemo } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Search,
  Building2,
<<<<<<< HEAD
  Clock,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
=======
  X,
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ConfirmDialog from '../ui/ConfirmDialog';

interface SupplierTableProps {
  onEdit: (supplier: any) => void;
}

const ITEMS_PER_PAGE = 8;

export default function SupplierTable({ onEdit }: SupplierTableProps) {
  const { suppliers, deleteExistingSupplier } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = (supplierId: string, supplierName: string) => {
    if (window.confirm(`Are you sure you want to delete "${supplierName}" from the supplier directory?`)) {
      deleteExistingSupplier(supplierId);
=======
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteExistingSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
    }
  };

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      // Search term
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        const matchesSearch =
          (supplier.name && supplier.name.toLowerCase().includes(lower)) ||
          (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(lower)) ||
          (supplier.email && supplier.email.toLowerCase().includes(lower)) ||
          (supplier.city && supplier.city.toLowerCase().includes(lower)) ||
          (supplier.phone && supplier.phone.toLowerCase().includes(lower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (supplier.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [suppliers, searchTerm, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  // Avatar helper
  const getInitials = (name: string) => {
    if (!name) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
<<<<<<< HEAD
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in text-slate-800">
      {/* 1. Header & Controls */}
      <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Verified Hardware Partners
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Showing {filteredSuppliers.length} of {suppliers.length} registered directory listings
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search vendor, contact, phone, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#c2410c] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
=======
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
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
                >
                  <X size={14} />
                </button>
              )}
            </div>
<<<<<<< HEAD

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none focus:border-[#c2410c] transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="blocked">Blocked</option>
            </select>
=======
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
          </div>
        </div>

<<<<<<< HEAD
      {/* 2. Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Supplier / Vendor</th>
              <th className="px-6 py-4">Primary Contact</th>
              <th className="px-6 py-4">Terms & Delivery</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedSuppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#c2410c] flex items-center justify-center mx-auto mb-3">
                    <Building2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No suppliers found</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No vendor matched your search parameters. Try adjusting your search term or status filter.
                  </p>
                  {(searchTerm || selectedStatus !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStatus('ALL');
                      }}
                      className="mt-4 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-[#c2410c] text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-orange-50/25 transition-colors group"
                >
                  {/* Supplier & Location */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 text-[#c2410c] flex items-center justify-center font-black text-xs shadow-xs flex-shrink-0 group-hover:from-orange-100 group-hover:to-orange-50 group-hover:border-orange-200 transition-all">
                        {getInitials(supplier.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#c2410c] transition-colors truncate">
                          {supplier.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                          <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{supplier.address || `${supplier.city || 'Metro Manila'}, Philippines`}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Primary Contact */}
                  <td className="px-6 py-4.5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        {supplier.contactPerson || 'Sales Desk'}
                      </p>
                      <div className="flex items-center gap-2">
                        {supplier.email && (
                          <a
                            href={`mailto:${supplier.email}`}
                            title={`Email ${supplier.email}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200/60 text-[10px] font-semibold transition-all"
                          >
                            <Mail size={10} />
                            <span className="max-w-[140px] truncate">{supplier.email}</span>
                          </a>
                        )}
                        {supplier.phone && (
                          <a
                            href={`tel:${supplier.phone}`}
                            title={`Call ${supplier.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-200/60 text-[10px] font-semibold transition-all"
                          >
                            <Phone size={10} />
                            <span className="max-w-[120px] truncate">{supplier.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Terms & Delivery Speed */}
                  <td className="px-6 py-4.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <CreditCard size={12} className="text-[#c2410c]" />
                        <span>{supplier.paymentTerms || 'Net30'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Clock size={11} />
                        <span>{supplier.averageDeliveryTime || 2} days lead time</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        supplier.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : supplier.status === 'blocked'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          supplier.status === 'active'
                            ? 'bg-emerald-500'
                            : supplier.status === 'blocked'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {supplier.status || 'active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(supplier)}
                        title="Edit Supplier"
                        className="p-2 rounded-xl text-slate-400 hover:text-[#c2410c] hover:bg-orange-50 transition-all cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        title="Delete Supplier"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination & Footer */}
      {totalPages > 1 && (
        <div className="p-4 sm:px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500">
            Page {currentPage} of {totalPages} ({filteredSuppliers.length} suppliers)
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-[#c2410c] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
=======
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
>>>>>>> 6bb8b4ca909d000fe6bb6a013af9a6f12a6b990a
  );
}