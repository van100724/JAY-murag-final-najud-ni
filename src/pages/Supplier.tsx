import { useState } from 'react';
import SupplierTable from '../components/suppliers/SupplierTable';
import SupplierForm from '../components/suppliers/SupplierForm';
import { UserPlus } from 'lucide-react';

export default function Suppliers() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-10 text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Supplier Directory
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Manage your procurement network and verified hardware vendors.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#c2410c] text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-[#9a3412] transition-all active:scale-[0.98]"
          >
            <UserPlus size={16} />
            Add New Supplier
          </button>
        </div>

        <SupplierTable />
      </div>

      <SupplierForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}