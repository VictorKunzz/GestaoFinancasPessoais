import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MonthlyComparison } from '../../types';
import { formatCurrency } from '../../lib/format';
import Card from '../ui/Card';

interface ComparisonCardProps {
  data: MonthlyComparison;
}

export default function ComparisonCard({ data }: ComparisonCardProps) {
  const config = {
    alta: { Icon: TrendingUp, color: 'text-accent-rose', bg: 'bg-accent-rose/15' },
    baixa: { Icon: TrendingDown, color: 'text-accent-emerald', bg: 'bg-accent-emerald/15' },
    estavel: { Icon: Minus, color: 'text-text-muted', bg: 'bg-bg-input' },
  }[data.tendencia];

  const { Icon } = config;

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-secondary mb-4">Comparativo de Gastos</h3>
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${config.bg} ${config.color}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-text-primary">{data.mensagem}</p>
          <p className="text-xs text-text-muted mt-1">
            Este mês: {formatCurrency(data.gastoMesAtual)} · Média 3 meses: {formatCurrency(data.mediaAnterior)}
          </p>
        </div>
      </div>
    </Card>
  );
}
