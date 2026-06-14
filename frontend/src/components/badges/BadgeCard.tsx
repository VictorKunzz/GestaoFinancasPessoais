import { Lock, Zap, Target, Trophy, TrendingUp, PiggyBank } from 'lucide-react';
import type { Badge } from '../../types';

interface BadgeCardProps {
  badge: Badge;
}

const conditionIcons: Record<string, typeof Zap> = {
  FIRST_TRANSACTION: Zap,
  FIRST_GOAL: Target,
  GOAL_REACHED: Trophy,
  POSITIVE_MONTH: TrendingUp,
  SPENT_LESS: PiggyBank,
};

const conditionGradients: Record<string, string> = {
  FIRST_TRANSACTION: 'from-accent-violet to-accent-blue',
  FIRST_GOAL: 'from-accent-amber to-accent-rose',
  GOAL_REACHED: 'from-accent-emerald to-accent-blue',
  POSITIVE_MONTH: 'from-accent-blue to-accent-violet',
  SPENT_LESS: 'from-accent-emerald to-accent-amber',
};

const conditionGlow: Record<string, string> = {
  FIRST_TRANSACTION: 'shadow-accent-violet/30',
  FIRST_GOAL: 'shadow-accent-amber/30',
  GOAL_REACHED: 'shadow-accent-emerald/30',
  POSITIVE_MONTH: 'shadow-accent-blue/30',
  SPENT_LESS: 'shadow-accent-emerald/30',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const Icon = conditionIcons[badge.condition] || Trophy;
  const gradient = conditionGradients[badge.condition] || 'from-accent-violet to-accent-blue';
  const glow = conditionGlow[badge.condition] || 'shadow-accent-violet/30';

  if (!badge.earned) {
    return (
      <div className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-border-default bg-bg-card/40 opacity-60 transition-all duration-300 hover:opacity-80">
        {/* Locked icon */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-2xl bg-bg-input border border-border-default flex items-center justify-center">
            <Icon size={32} className="text-text-muted/40" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-bg-secondary border border-border-default flex items-center justify-center">
            <Lock size={12} className="text-text-muted" />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-text-muted mb-1.5">{badge.name}</h3>
        <p className="text-xs text-text-muted/70 leading-relaxed">{badge.description}</p>
      </div>
    );
  }

  return (
    <div className={`group relative flex flex-col items-center text-center p-8 rounded-2xl border border-border-hover bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:${glow}`}>
      {/* Glow background */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300`} />

      {/* Earned icon */}
      <div className="relative mb-5">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} p-[1px]`}>
          <div className="w-full h-full rounded-2xl bg-bg-card flex items-center justify-center">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} opacity-15 absolute`} />
            <Icon size={32} className="text-text-primary relative z-10" />
          </div>
        </div>
        {/* Sparkle indicator */}
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center animate-pulse-soft`}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
            <path d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-text-primary mb-1.5 relative z-10">{badge.name}</h3>
      <p className="text-xs text-text-secondary leading-relaxed relative z-10 mb-3">{badge.description}</p>

      {badge.earnedAt && (
        <span className="text-[11px] text-text-muted bg-bg-input/60 px-2.5 py-1 rounded-full relative z-10">
          Conquistada em {formatDate(badge.earnedAt)}
        </span>
      )}
    </div>
  );
}
