import { useState, useMemo } from 'react';
import SupplierTable from '../components/suppliers/SupplierTable';
import SupplierForm from '../components/suppliers/SupplierForm';
import { useApp } from '../contexts/AppContext';
import {
  UserPlus,
  Building2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function Suppliers() {
  const { suppliers } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  // Metrics calculations
  const totalSuppliers = suppliers.length;
  const activeSuppliers = useMemo(() => {
    return suppliers.filter(s => s.status === 'active').length;
  }, [suppliers]);

  const avgDeliveryTime = useMemo(() => {
    if (suppliers.length === 0) return 0;
    const sum = suppliers.reduce((acc, s) => acc + (Number(s.averageDeliveryTime) || 2), 0);
    return (sum / suppliers.length).toFixed(1);
  }, [suppliers]);

  return (
    <>
      <div className="space-y-6 animate-fade-in h-full overflow-y-auto pr-2 custom-scrollbar text-slate-800 pb-12">
        {/* 1. Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Supplier Directory
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#c2410c] border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse" />
                {totalSuppliers} Registered Partners
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Manage verified hardware distributors, delivery terms, and procurement channels.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedSupplier(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-900/20 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Add New Supplier</span>
          </button>
        </div>

        {/* 2. Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Registered Vendors */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-orange-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Total Vendors
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {totalSuppliers}
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Procurement network
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#c2410c] border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Building2 size={24} />
            </div>
          </div>

          {/* Card 2: Active Partnerships */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Active Partners
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {activeSuppliers}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600">
                {totalSuppliers > 0 ? `${Math.round((activeSuppliers / totalSuppliers) * 100)}% operational` : '0% operational'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* Card 3: Avg. Delivery Lead Time */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Avg Lead Time
              </p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {avgDeliveryTime} <span className="text-sm font-bold text-slate-400">Days</span>
              </p>
              <p className="text-[11px] font-semibold text-blue-600">
                Standard turnaround
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* 3. Main Suppliers Table Component */}
        <SupplierTable onEdit={handleEdit} />
      </div>

      {/* 4. Modal Dialog */}
      <SupplierForm
        open={isModalOpen}
        onClose={handleClose}
        supplier={selectedSupplier}
      />
    </>
  );
}