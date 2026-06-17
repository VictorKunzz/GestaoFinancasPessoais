import { useState, useEffect } from 'react';
import type { Transaction, TransactionType, Category, Goal, CreateTransactionRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionRequest) => Promise<void>;
  categories: Category[];
  goals?: Goal[];
  transaction?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  goals = [],
  transaction,
}: TransactionModalProps) {
  const { addToast } = useToast();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!transaction;

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description);
      setAmount(String(Number(transaction.amount)));
      setDate(transaction.date.split('T')[0]);
      setCategoryId(transaction.categoryId);
      setGoalId(transaction.goalId ?? '');
    } else {
      setType('EXPENSE');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategoryId('');
      setGoalId('');
    }
    setError('');
  }, [transaction, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Informe a descrição.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    if (!date) {
      setError('Informe a data.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        type,
        description: description.trim(),
        amount: numAmount,
        date,
        categoryId: categoryId || undefined,
        goalId: type === 'EXPENSE' ? goalId || null : null,
      });
      onClose();
    } catch {
      addToast('error', 'Erro ao salvar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : 'Nova Transação'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              type === 'EXPENSE'
                ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30'
                : 'bg-bg-input text-text-secondary border border-border-default hover:border-border-hover'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              type === 'INCOME'
                ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
                : 'bg-bg-input text-text-secondary border border-border-default hover:border-border-hover'
            }`}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => setType('INVESTMENT')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              type === 'INVESTMENT'
                ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                : 'bg-bg-input text-text-secondary border border-border-default hover:border-border-hover'
            }`}
          >
            Investimento
          </button>
        </div>

        <Input
          label="Descrição"
          placeholder="Ex: Almoço no restaurante"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Categoria */}
        <div className="w-full">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200 cursor-pointer"
          >
            <option value="">Classificação automática</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Meta (apenas para despesas — vincula a despesa como aporte) */}
        {type === 'EXPENSE' && goals.length > 0 && (
          <div className="w-full">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Meta (opcional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200 cursor-pointer"
            >
              <option value="">Nenhuma (despesa comum)</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted mt-1">
              Vincular a uma meta registra esta despesa como aporte (conta como economia).
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-accent-rose">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
