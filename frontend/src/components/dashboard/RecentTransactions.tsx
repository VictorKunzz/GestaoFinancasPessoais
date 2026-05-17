import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Transaction } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">Transações Recentes</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
          Ver todas
        </Button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          Nenhuma transação registrada ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, 5).map((t) => {
            const isIncome = t.type === 'INCOME';
            const amount = Number(t.amount);

            return (
              <div
                key={t.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${isIncome ? 'bg-accent-emerald/15' : 'bg-accent-rose/15'
                      }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="text-accent-emerald" size={16} />
                    ) : (
                      <ArrowDownRight className="text-accent-rose" size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary truncate">{t.description}</p>
                    <p className="text-xs text-text-muted">
                      {t.category?.name || 'Sem categoria'} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium flex-shrink-0 ml-3 ${isIncome ? 'text-accent-emerald' : 'text-accent-rose'
                    }`}
                >
                  {isIncome ? '+' : '-'} {formatCurrency(amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
