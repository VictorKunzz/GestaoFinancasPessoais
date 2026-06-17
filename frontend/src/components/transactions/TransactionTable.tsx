import { ArrowUpRight, ArrowDownRight, LineChart, Target, Pencil, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Transaction, TransactionType } from '../../types';
import { formatCurrency } from '../../lib/format';
import Card from '../ui/Card';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

// Visual por tipo de transacao: receita (entra), despesa (sai), investimento (sai do disponivel)
const TYPE_VISUAL: Record<TransactionType, { Icon: LucideIcon; color: string; bg: string; sign: string }> = {
  INCOME: { Icon: ArrowUpRight, color: 'text-accent-emerald', bg: 'bg-accent-emerald/15', sign: '+' },
  EXPENSE: { Icon: ArrowDownRight, color: 'text-accent-rose', bg: 'bg-accent-rose/15', sign: '-' },
  INVESTMENT: { Icon: LineChart, color: 'text-accent-blue', bg: 'bg-accent-blue/15', sign: '-' },
};

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
              const v = TYPE_VISUAL[t.type] ?? TYPE_VISUAL.EXPENSE;
              const amount = Number(t.amount);

              return (
                <tr key={t.id} className="hover:bg-bg-card-hover/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className={`inline-flex p-1.5 rounded-lg ${v.bg}`}>
                      <v.Icon className={v.color} size={14} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    <div className="flex items-center gap-2">
                      <span>{t.description}</span>
                      {t.goal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-violet/15 text-accent-violet">
                          <Target size={11} />
                          {t.goal.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {t.category?.name || 'Sem categoria'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(t.date)}</td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${v.color}`}>
                    {v.sign} {formatCurrency(amount)}
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
          const v = TYPE_VISUAL[t.type] ?? TYPE_VISUAL.EXPENSE;
          const amount = Number(t.amount);

          return (
            <Card key={t.id} padding="sm" hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${v.bg}`}>
                    <v.Icon className={v.color} size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary truncate">{t.description}</p>
                    <p className="text-xs text-text-muted">
                      {t.category?.name || 'Sem categoria'} · {formatDate(t.date)}
                    </p>
                    {t.goal && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-violet/15 text-accent-violet">
                        <Target size={11} />
                        {t.goal.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className={`text-sm font-medium ${v.color}`}>
                    {v.sign} {formatCurrency(amount)}
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
