import { TrendingUp, TrendingDown, Wallet, LineChart } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import Card from '../ui/Card';

interface BalanceSummaryProps {
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  saldo: number;
}

export default function BalanceSummary({
  totalReceitas,
  totalDespesas,
  totalInvestimentos,
  saldo,
}: BalanceSummaryProps) {
  const items = [
    {
      label: 'Receitas',
      value: totalReceitas,
      icon: TrendingUp,
      color: 'text-accent-emerald',
      bg: 'bg-accent-emerald/15',
    },
    {
      label: 'Despesas',
      value: totalDespesas,
      icon: TrendingDown,
      color: 'text-accent-rose',
      bg: 'bg-accent-rose/15',
    },
    {
      label: 'Investido',
      value: totalInvestimentos,
      icon: LineChart,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/15',
    },
    {
      label: 'Saldo',
      value: saldo,
      icon: Wallet,
      color: saldo >= 0 ? 'text-accent-violet' : 'text-accent-rose',
      bg: saldo >= 0 ? 'bg-accent-violet/15' : 'bg-accent-rose/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} hover padding="sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${item.bg}`}>
              <item.icon className={item.color} size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{item.label}</p>
              <p className={`text-lg font-bold truncate ${item.color}`}>
                {formatCurrency(item.value)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
