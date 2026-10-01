import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  const toastStyles = {
    success: 'bg-success-50 border-success-100 text-success-700',
    error: 'bg-error-50 border-error-100 text-error-700',
    info: 'bg-brand-50 border-brand-200 text-brand-800',
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-success-600" />,
    error: <XCircle size={18} className="text-error-600" />,
    info: <Info size={18} className="text-brand-600" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 border rounded-md shadow-sm px-4 py-3 animate-[slideIn_0.2s_ease-out] ${toastStyles[toast.type]}`}
        >
          <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button onClick={() => dismissToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
