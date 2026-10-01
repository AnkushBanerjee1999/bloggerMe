import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 animate-[slideIn_0.2s_ease-out]"
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
          <button onClick={() => dismissToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
