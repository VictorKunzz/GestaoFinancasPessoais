import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { InsightCategory } from '../../types';
import Card from '../ui/Card';

interface CategoryPieChartProps {
  categorias: InsightCategory[];
  totalGasto: number;
}

const COLORS = ['#8b5cf6', '#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CategoryPieChart({ categorias, totalGasto }: CategoryPieChartProps) {
  if (categorias.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-text-secondary mb-4">Gastos por Categoria</h3>
        <p className="text-text-muted text-sm text-center py-8">
          Nenhuma despesa registrada neste mês.
        </p>
      </Card>
    );
  }

  const chartData = categorias.map((c) => ({
    name: c.nome,
    value: c.total,
  }));

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-secondary mb-4">Gastos por Categoria</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  background: '#1a1a3e',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-2">
          {categorias.map((cat, i) => (
            <div key={cat.nome} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-text-secondary truncate">{cat.nome}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-text-primary font-medium">{formatCurrency(cat.total)}</span>
                <span className="text-text-muted text-xs w-10 text-right">{cat.percentual}%</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border-default flex justify-between text-sm">
            <span className="text-text-muted">Total</span>
            <span className="text-text-primary font-bold">{formatCurrency(totalGasto)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
