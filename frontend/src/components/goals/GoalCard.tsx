import { Target, Calendar, Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '../../types';
import Card from '../ui/Card';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const saved = Number(goal.savedAmount);
  const target = Number(goal.targetAmount);
  const percentage = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const isCompleted = percentage >= 100;

  let barColor = 'bg-accent-violet';
  let textColor = 'text-accent-violet';
  if (isCompleted) {
    barColor = 'bg-accent-emerald';
    textColor = 'text-accent-emerald';
  } else if (percentage >= 70) {
    barColor = 'bg-accent-blue';
    textColor = 'text-accent-blue';
  } else if (percentage >= 40) {
    barColor = 'bg-accent-amber';
    textColor = 'text-accent-amber';
  }

  const hasDeadline = !!goal.deadline;
  const isOverdue = hasDeadline && new Date(goal.deadline!) < new Date() && !isCompleted;

  return (
    <Card padding="lg" hover>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isCompleted ? 'bg-accent-emerald/15' : 'bg-accent-violet/15'}`}>
            <Target className={isCompleted ? 'text-accent-emerald' : 'text-accent-violet'} size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">{goal.name}</h3>
            {hasDeadline && (
              <div className={`flex items-center gap-1.5 mt-1 text-xs ${isOverdue ? 'text-accent-rose' : 'text-text-muted'}`}>
                <Calendar size={12} />
                {isOverdue ? 'Vencida em ' : 'Prazo: '}
                {formatDate(goal.deadline!)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-bold ${textColor}`}>
            {percentage.toFixed(0)}%
          </span>
          {isCompleted && (
            <span className="text-xs font-medium text-accent-emerald bg-accent-emerald/15 px-2 py-0.5 rounded-full">
              Concluída!
            </span>
          )}
        </div>
        <div className="w-full h-3 bg-bg-input rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Values */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">Economizado</p>
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(saved)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Objetivo</p>
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(target)}</p>
        </div>
      </div>
    </Card>
  );
}
