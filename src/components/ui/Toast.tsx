import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />,
          error: <AlertCircle className="text-red-500 shrink-0" size={18} />,
          warning: <AlertTriangle className="text-amber-500 shrink-0" size={18} />,
          info: <Info className="text-blue-500 shrink-0" size={18} />,
        };

        const bgBorders = {
          success: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
          error: 'bg-white border-red-200 text-slate-800 shadow-red-500/10',
          warning: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
          info: 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-fade-in ${bgBorders[toast.type]}`}
            role="status"
          >
            <div className="flex items-center gap-3 min-w-0">
              {icons[toast.type]}
              <p className="text-xs font-bold leading-snug break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
