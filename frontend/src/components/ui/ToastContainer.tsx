import { useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, Trophy } from 'lucide-react';
import { ToastContext, type Toast, type ToastType } from '../../contexts/ToastContext';

const typeConfig: Record<ToastType, {
  icon: typeof CheckCircle;
  gradient: string;
  border: string;
  iconColor: string;
}> = {
  success: {
    icon: CheckCircle,
    gradient: 'from-accent-emerald/20 to-transparent',
    border: 'border-accent-emerald/25',
    iconColor: 'text-accent-emerald',
  },
  error: {
    icon: AlertCircle,
    gradient: 'from-accent-rose/20 to-transparent',
    border: 'border-accent-rose/25',
    iconColor: 'text-accent-rose',
  },
  info: {
    icon: Info,
    gradient: 'from-accent-blue/20 to-transparent',
    border: 'border-accent-blue/25',
    iconColor: 'text-accent-blue',
  },
  badge: {
    icon: Trophy,
    gradient: 'from-accent-amber/20 to-transparent',
    border: 'border-accent-amber/25',
    iconColor: 'text-accent-amber',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-center gap-3 w-full max-w-sm px-4 py-3.5 rounded-xl
        bg-bg-secondary/90 backdrop-blur-xl
        border ${config.border}
        shadow-2xl shadow-black/30
        animate-slide-in-toast
      `}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.gradient} pointer-events-none`} />
      <Icon size={18} className={`${config.iconColor} flex-shrink-0 relative z-10`} />
      <p className="text-sm text-text-primary flex-1 relative z-10">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 rounded-md text-text-muted hover:text-text-primary transition-colors relative z-10 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
