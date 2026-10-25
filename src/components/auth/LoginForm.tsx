import { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Support both old and new formats for convenience
    if ((form.username === 'admin@hardware.com' || form.username === 'admin') && form.password === 'admin123') {
      login(form.username, 'admin');
      navigate('/');
    } else if ((form.username === 'cashier@hardware.com' || form.username === 'cashier') && form.password === 'cashier123') {
      login(form.username, 'cashier');
      navigate('/pos');
    } else {
      setError('Invalid operator credentials. Access denied.');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 animate-fade-in text-center">
          {error}
        </div>
      )}

      {/* Username Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Operator ID
        </label>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c2410c] transition-colors">
            <User size={18} />
          </div>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter ID"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 placeholder:text-slate-300 font-medium"
            required
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Security Pin
        </label>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c2410c] transition-colors">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 outline-none focus:border-[#c2410c]/30 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-700 placeholder:text-slate-300 font-medium"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#c2410c] py-4 rounded-2xl font-black text-white shadow-xl shadow-orange-900/20 hover:bg-[#9a3412] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
      >
        <span className="flex items-center justify-center gap-3">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Login <ArrowRight size={18} />
            </>
          )}
        </span>
      </button>

      {/* Sample Demo Credentials for Cashier & Admin */}
      <div className="pt-5 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Sample Accounts
          </span>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
            Click to Auto-Fill
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setForm({ username: 'admin', password: 'admin123' });
              if (error) setError('');
            }}
            className="p-3.5 bg-slate-50 hover:bg-orange-50/70 border border-slate-200 hover:border-orange-300 rounded-2xl text-left transition-all group cursor-pointer shadow-sm hover:shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-slate-800 group-hover:text-[#c2410c] transition-colors">Admin</span>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-[#c2410c]">All Access</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">admin / admin123</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({ username: 'cashier', password: 'cashier123' });
              if (error) setError('');
            }}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition-all group cursor-pointer shadow-sm hover:shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">Cashier</span>
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">POS Only</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">cashier / cashier123</p>
          </button>
        </div>
      </div>
    </form>
  );
}