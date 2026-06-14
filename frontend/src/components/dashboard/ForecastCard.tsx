import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import type { BalanceForecast } from '../../types';
import Card from '../ui/Card';

interface ForecastCardProps {
  data: BalanceForecast;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ForecastCard({ data }: ForecastCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-accent-blue/15 rounded-xl">
          <PiggyBank className="text-accent-blue" size={18} />
        </div>
        <h3 className="text-sm font-medium text-text-secondary">Previsão Mensal</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <TrendingUp size={16} className="text-accent-emerald" />
            Receita prevista
          </div>
          <span className="text-sm font-medium text-accent-emerald">
            {formatCurrency(data.previsaoReceita)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <TrendingDown size={16} className="text-accent-rose" />
            Despesa prevista
          </div>
          <span className="text-sm font-medium text-accent-rose">
            {formatCurrency(data.previsaoDespesa)}
          </span>
        </div>

        <div className="pt-3 border-t border-border-default flex items-center justify-between">
          <span className="text-sm text-text-secondary">Saldo previsto</span>
          <span
            className={`text-base font-bold ${
              data.previsaoSaldo >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
            }`}
          >
            {formatCurrency(data.previsaoSaldo)}
          </span>
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">{data.mensagem}</p>
    </Card>
  );
}
