import { useState, useEffect } from 'react';
import type { Budget, Category } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { categoryId: string; monthlyLimit: number }) => Promise<void>;
  budget?: Budget | null;
  categories: Category[];
  existingCategoryIds: string[];
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  budget,
  categories,
  existingCategoryIds,
}: BudgetModalProps) {
  const { addToast } = useToast();
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!budget;

  // Na criação, só categorias ainda sem orçamento
  const availableCategories = categories.filter((c) => !existingCategoryIds.includes(c.id));

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.categoryId);
      setLimit(String(budget.monthlyLimit));
    } else {
      setCategoryId(availableCategories[0]?.id ?? '');
      setLimit('');
    }
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    const valor = Number(limit);
    if (!Number.isFinite(valor) || valor <= 0) {
      setError('Informe um limite maior que zero.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ categoryId, monthlyLimit: valor });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (typeof msg === 'string') {
        setError(msg);
      } else {
        addToast('error', 'Erro ao salvar orçamento. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Categoria</label>
            <p className="bg-bg-input border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary">
              {budget?.category.name}
            </p>
          </div>
        ) : (
          <div className="w-full">
            <label htmlFor="budget-category" className="block text-sm font-medium text-text-secondary mb-1.5">
              Categoria
            </label>
            {availableCategories.length === 0 ? (
              <p className="text-sm text-text-muted">
                Todas as categorias já possuem orçamento.
              </p>
            ) : (
              <select
                id="budget-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200 cursor-pointer"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <Input
          label="Limite mensal (R$)"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 800,00"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />

        {error && <p className="text-sm text-accent-rose">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
            disabled={!isEditing && availableCategories.length === 0}
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
