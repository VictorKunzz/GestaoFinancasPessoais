import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import type { Badge } from '../types';
import * as badgeService from '../services/badge.service';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import BadgeGrid from '../components/badges/BadgeGrid';

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBadges() {
      try {
        setLoading(true);
        setError(null);
        const data = await badgeService.getAll();
        setBadges(data);
      } catch {
        setError('Erro ao carregar conquistas.');
      } finally {
        setLoading(false);
      }
    }

    loadBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-accent-rose text-lg font-medium mb-2">Ops!</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Conquistas</h2>
        <p className="text-text-secondary text-sm mt-1">
          Desbloqueie medalhas conforme você evolui nas suas finanças.
        </p>
      </div>

      {/* Progress summary */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="p-4 rounded-2xl bg-accent-amber/15">
            <Trophy className="text-accent-amber" size={32} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-lg font-bold text-text-primary">
              {earnedCount} de {totalCount} conquistas
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {earnedCount === 0
                ? 'Comece a usar o app para desbloquear suas primeiras medalhas!'
                : earnedCount === totalCount
                  ? 'Incrível! Você desbloqueou todas as conquistas!'
                  : `Continue assim! Faltam ${totalCount - earnedCount} para completar sua coleção.`}
            </p>
          </div>
          <div className="flex-shrink-0">
            {/* Mini progress ring */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="6"
                />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - (totalCount > 0 ? earnedCount / totalCount : 0))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-accent-amber">
                  {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Badges grid */}
      <BadgeGrid badges={badges} />
    </div>
  );
}
