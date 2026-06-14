import type { HealthScore } from '../../types';
import Card from '../ui/Card';

interface ScoreCardProps {
  data: HealthScore;
}

const nivelColors: Record<string, string> = {
  Excelente: '#10b981',
  Bom: '#3b82f6',
  Regular: '#f59e0b',
  Crítico: '#f43f5e',
  Neutro: '#64748b',
};

export default function ScoreCard({ data }: ScoreCardProps) {
  const color = nivelColors[data.nivel] || '#8b5cf6';
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (data.score / 100) * circumference;

  return (
    <Card className="flex flex-col items-center text-center">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Score de Saúde Financeira
      </h3>

      <div className="relative w-36 h-36 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text-primary">{data.score}</span>
          <span className="text-xs font-medium" style={{ color }}>
            {data.nivel}
          </span>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{data.mensagem}</p>
    </Card>
  );
}
