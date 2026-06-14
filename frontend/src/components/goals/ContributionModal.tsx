import { useState, useEffect } from 'react';
import type { Goal, CreateContributionRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContributionRequest) => Promise<void>;
  goal: Goal | null;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ContributionModal({ isOpen, onClose, onSubmit, goal }: ContributionModalProps) {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAmount('');
    setNote('');
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
        note: note.trim() || undefined,
        date: date || undefined,
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
          label="Observação (opcional)"
          placeholder="Ex: 13º salário"
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
