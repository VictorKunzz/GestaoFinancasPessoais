import { ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../types';
import Card from '../ui/Card';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function TransactionTable({ transactions, onEdit, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <p className="text-text-muted text-sm text-center py-12">
          Nenhuma transação encontrada.
        </p>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <Card padding="sm" className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                Tipo
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                Descrição
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                Categoria
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                Data
              </th>
              <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                Valor
              </th>
              <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {transactions.map((t) => {
              const isIncome = t.type === 'INCOME';
              const amount = Number(t.amount);

              return (
                <tr key={t.id} className="hover:bg-bg-card-hover/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className={`inline-flex p-1.5 rounded-lg ${isIncome ? 'bg-accent-emerald/15' : 'bg-accent-rose/15'}`}>
                      {isIncome ? (
                        <ArrowUpRight className="text-accent-emerald" size={14} />
                      ) : (
                        <ArrowDownRight className="text-accent-rose" size={14} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">{t.description}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {t.category?.name || 'Sem categoria'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(t.date)}</td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${isIncome ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {transactions.map((t) => {
          const isIncome = t.type === 'INCOME';
          const amount = Number(t.amount);

          return (
            <Card key={t.id} padding="sm" hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${isIncome ? 'bg-accent-emerald/15' : 'bg-accent-rose/15'}`}>
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
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`text-sm font-medium ${isIncome ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(amount)}
                  </span>
                  <button
                    onClick={() => onEdit(t)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
