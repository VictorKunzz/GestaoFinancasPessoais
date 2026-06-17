import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CashflowPoint } from '../../types';
import { formatCurrency } from '../../lib/format';
import Card from '../ui/Card';

interface CashflowChartProps {
  meses: CashflowPoint[];
}

function formatCompact(value: number): string {
  return value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
}

export default function CashflowChart({ meses }: CashflowChartProps) {
  const temDados = meses.some((m) => m.receitas > 0 || m.despesas > 0 || m.investimentos > 0);

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-secondary mb-4">Fluxo de Caixa (últimos meses)</h3>

      {!temDados ? (
        <p className="text-text-muted text-sm text-center py-8">
          Sem dados suficientes para exibir o fluxo de caixa.
        </p>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={meses} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCompact}
                width={48}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: '#1a1a3e',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="investimentos" name="Investimentos" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
