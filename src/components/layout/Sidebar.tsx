import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  BarChart3, 
  Truck, 
  Bell, 
  LogOut,
  RefreshCcw
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const allLinks = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Inventory', path: '/inventory', icon: Boxes, roles: ['admin'] },
  { label: 'POS Terminal', path: '/pos', icon: ShoppingCart, roles: ['cashier'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] },
  { label: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['admin'] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  
  // Filter links based on user role
  const links = allLinks.filter(link => link.roles.includes(user?.role || ''));

  return (
    <aside className="w-72 bg-[#1a202c] flex flex-col h-screen sticky top-0 z-20">
      {/* Brand Logo Area */}
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-4 mb-1 group cursor-pointer">
          <div className="relative">
            <div className="relative w-12 h-12 bg-[#c2410c] rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20 transform group-hover:rotate-6 transition-transform">
              <span className="text-2xl drop-shadow-md">🛠️</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-tight">
              J&JAY
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
              Balingasag
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-[#c2410c] text-white shadow-lg shadow-orange-900/20 font-bold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="relative z-10" />
              <span className="text-sm relative z-10 tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-white/5 bg-[#1a1a2e]/30 space-y-4">
        {user?.role === 'cashier' && (
          <NavLink 
            to="/pos"
            className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl bg-[#c2410c] text-white hover:bg-[#9a3412] transition-all shadow-xl shadow-orange-900/20 group"
          >
            <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-sm font-bold">+</span>
            </div>
            <span className="font-bold text-sm">New Sale</span>
          </NavLink>
        )}

        <button 
          onClick={() => {
            if (window.confirm('CRITICAL: Sync terminal with central warehouse? All local data will be wiped.')) {
              localStorage.clear();
              window.location.href = '/login';
            }
          }}
          className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
        >
          <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-bold text-sm">Sync Warehouse</span>
        </button>

        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}