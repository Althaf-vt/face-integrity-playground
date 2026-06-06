import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: XCircle,
    iconColor: 'text-red-400',
    dot: 'bg-red-400',
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  neutral: {
    border: 'border-slate-600/50',
    bg: 'bg-slate-800/50',
    icon: AlertCircle,
    iconColor: 'text-slate-400',
    dot: 'bg-slate-400',
  },
};

export default function StatusCard({
  label,
  value,
  status = 'neutral',
  subtitle,
  live = true,
}) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.neutral;
  const Icon = styles.icon;

  return (
    <div
      className={`rounded-lg border p-4 ${styles.border} ${styles.bg} transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <Icon className={`h-5 w-5 shrink-0 ${styles.iconColor}`} />
      </div>
      {live && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${styles.dot} animate-pulse`} />
          <span className="text-xs text-slate-500">Live</span>
        </div>
      )}
    </div>
  );
}
