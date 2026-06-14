import type { Badge } from '../../types';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: Badge[];
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);
  const sorted = [...earned, ...locked];

  if (badges.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-sm">Nenhuma conquista disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {sorted.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
