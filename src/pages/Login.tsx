import LoginForm from '../components/auth/LoginForm';
import logoImg from '../assets/logo.jpg';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center relative overflow-hidden font-sans text-slate-800">
      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-[440px] px-6 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10">
          
          {/* Logo Area */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-slate-100 shadow-md">
                <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                J&JAY
              </h1>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">Secure Operator Entry</h2>
              <div className="h-1 w-12 bg-[#c2410c] rounded-full" />
            </div>
          </div>

          {/* Login Form Component */}
          <div className="relative">
            <LoginForm />
          </div>
        </div>
        
        {/* External Branding */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Licensed Terminal ID: JAY-BAL-012
          </p>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            © 2026 J&JAY Systems
          </p>
        </div>
      </div>
    </div>
  );
}
