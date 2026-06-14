import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Wallet, AlertTriangle } from 'lucide-react';
import type { Budget, Category } from '../types';
import * as budgetService from '../services/budget.service';
import * as categoryService from '../services/category.service';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import BudgetModal from '../components/budgets/BudgetModal';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function barColor(budget: Budget): string {
  if (budget.exceeded) return 'bg-accent-rose';
  if (budget.percentage >= 80) return 'bg-accent-amber';
  return 'bg-accent-emerald';
}

export default function BudgetsPage() {
  const { addToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [budgetData, catData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
      ]);
      setBudgets(budgetData);
      setCategories(catData);
    } catch {
      setError('Erro ao carregar orçamentos.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleOpenEdit(budget: Budget) {
    setEditing(budget);
    setModalOpen(true);
  }

  async function handleSubmit(data: { categoryId: string; monthlyLimit: number }) {
    if (editing) {
      await budgetService.update(editing.id, { monthlyLimit: data.monthlyLimit });
      addToast('success', 'Orçamento atualizado com sucesso!');
    } else {
      await budgetService.create(data);
      addToast('success', 'Orçamento criado com sucesso!');
    }
    await loadData();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await budgetService.remove(deleteTarget.id);
      setBudgets((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast('success', 'Orçamento removido com sucesso!');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      addToast('error', typeof msg === 'string' ? msg : 'Erro ao remover orçamento.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && budgets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-accent-rose text-lg font-medium mb-2">Ops!</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const existingCategoryIds = budgets.map((b) => b.categoryId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Orçamentos</h2>
          <p className="text-text-secondary text-sm mt-1">
            Defina limites mensais por categoria e acompanhe seus gastos
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={18} />
          Novo Orçamento
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-bg-card border border-border-default rounded-2xl">
          <div className="p-3 bg-accent-violet/15 rounded-xl mb-3">
            <Wallet className="text-accent-violet" size={28} />
          </div>
          <p className="text-text-primary font-medium">Nenhum orçamento definido</p>
          <p className="text-text-secondary text-sm mt-1">
            Crie um orçamento para começar a controlar seus gastos por categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="flex flex-col gap-3 p-4 bg-bg-card border border-border-default rounded-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-violet/15 text-accent-violet shrink-0">
                    {budget.category.icon ? (
                      <span className="text-lg leading-none">{budget.category.icon}</span>
                    ) : (
                      <Wallet size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{budget.category.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatCurrency(budget.spent)} de {formatCurrency(budget.monthlyLimit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(budget)}
                    className="p-2 rounded-lg text-text-muted hover:text-accent-violet hover:bg-bg-card-hover transition-colors cursor-pointer"
                    aria-label="Editar orçamento"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(budget)}
                    className="p-2 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"
                    aria-label="Remover orçamento"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div>
                <div className="h-2 w-full bg-bg-input rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor(budget)}`}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-text-muted">{budget.percentage}% utilizado</span>
                  {budget.exceeded && (
                    <span className="flex items-center gap-1 text-[11px] text-accent-rose font-medium">
                      <AlertTriangle size={12} />
                      Limite excedido
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        budget={editing}
        categories={categories}
        existingCategoryIds={existingCategoryIds}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remover Orçamento"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja remover o orçamento de{' '}
            <span className="text-text-primary font-medium">"{deleteTarget?.category.name}"</span>?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={deleting} className="flex-1">
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
