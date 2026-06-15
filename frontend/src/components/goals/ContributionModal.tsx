import { useState, useEffect } from 'react';
import type { Goal } from '../../types';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../lib/format';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export interface ContributionData {
  amount: number;
  description: string;
  date: string;
}

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContributionData) => Promise<void>;
  goal: Goal | null;
}

export default function ContributionModal({ isOpen, onClose, onSubmit, goal }: ContributionModalProps) {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  }, [goal, isOpen]);

  if (!goal) return null;

  const saved = Number(goal.savedAmount);
  const target = Number(goal.targetAmount);
  const restante = Math.max(0, target - saved);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor de aporte maior que zero.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        amount: numAmount,
        description: description.trim() || `Aporte: ${goal!.name}`,
        date,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (typeof msg === 'string') {
        setError(msg);
      } else {
        addToast('error', 'Erro ao registrar aporte. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Aporte — ${goal.name}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Economizado: {formatCurrency(saved)}</span>
          <span>Falta: {formatCurrency(restante)}</span>
        </div>

        <p className="text-xs text-text-muted bg-bg-input border border-border-default rounded-lg px-3 py-2">
          O aporte e registrado como uma despesa vinculada a esta meta e nao entra na contagem de gastos.
        </p>

        <Input
          label="Valor do aporte (R$)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />

        <Input
          label="Descrição (opcional)"
          placeholder={`Aporte: ${goal.name}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {error && <p className="text-sm text-accent-rose">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Registrar aporte
          </Button>
        </div>
      </form>
    </Modal>
  );
}
