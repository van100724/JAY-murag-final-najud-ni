import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  BarChart3,
  Truck,
  Bell,
  LogOut,
  RefreshCcw,
  CalendarClock,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.jpg';
import ConfirmDialog from '../ui/ConfirmDialog';

const allLinks = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Inventory', path: '/inventory', icon: Boxes, roles: ['admin'] },
  { label: 'POS Terminal', path: '/pos', icon: ShoppingCart, roles: ['cashier'] },
  { label: 'Sales History', path: '/sales', icon: CalendarClock, roles: ['admin', 'cashier'] },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] },
  { label: 'Suppliers', path: '/suppliers', icon: Truck, roles: ['admin'] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout, showToast } = useApp();
  const navigate = useNavigate();
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Filter links based on user role
  const links = allLinks.filter(link => link.roles.includes(user?.role || ''));

  const handleSyncConfirm = () => {
    localStorage.clear();
    showToast('Terminal cache cleared. Redirecting to login...', 'info');
    window.location.href = '/login';
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-[#1a202c] flex flex-col h-screen sticky top-0 z-20">
      {/* Brand Logo Area */}
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-4 mb-1 group cursor-pointer">
          <div className="relative">
            <div className="relative w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-slate-700 shadow-lg transform group-hover:rotate-6 transition-transform">
              <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
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
                `flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
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
      <div className="p-4 border-t border-white/5 bg-[#1a1a2e]/30 space-y-2">
        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-[#c2410c] flex items-center justify-center font-black">
              <UserCheck size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white truncate text-xs">{user.name}</p>
              <p className="text-[10px] text-slate-400 capitalize font-medium">{user.role} Account</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowSyncConfirm(true)}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold group"
          title="Reset local cache to fresh demo/database state"
        >
          <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset Terminal Cache</span>
        </button>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold group"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>

      {/* Confirmation Dialogs - Heuristics 3 & 5 */}
      <ConfirmDialog
        open={showSyncConfirm}
        title="Reset Local Terminal Cache?"
        message="This will clear your local offline browser storage and reload default system state. Are you sure you want to continue?"
        confirmText="Reset Cache"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleSyncConfirm}
        onCancel={() => setShowSyncConfirm(false)}
      />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign Out of Session?"
        message="Are you sure you want to end your current session and return to the login screen?"
        confirmText="Sign Out"
        cancelText="Stay Logged In"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}