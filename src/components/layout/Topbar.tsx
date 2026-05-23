import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function Topbar() {
  const navigate = useNavigate();
  const { getLowStock, getInventoryAlerts } = useApp();
  
  const totalNotifications = getLowStock().length + getInventoryAlerts().length;

  return (
    <header className="h-20 border-b border-white/5 bg-[#f8fafc] px-6 flex items-center justify-between text-slate-800">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-black tracking-tighter text-[#92400e]">
          J&JAY
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-12">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#92400e] transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search SKU, Serial, or Order..."
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-12 pr-4 outline-none focus:bg-white focus:border-[#92400e]/30 focus:ring-4 focus:ring-[#92400e]/5 transition-all text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative text-slate-400 hover:text-[#92400e] transition-colors cursor-pointer"
        >
          <Bell size={22} />
          {totalNotifications > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#f8fafc]" />
          )}
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}