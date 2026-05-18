import { useState, useEffect } from 'react';
import type { Goal, CreateGoalRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalRequest) => Promise<void>;
  goal?: Goal | null;
}

export default function GoalModal({ isOpen, onClose, onSubmit, goal }: GoalModalProps) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(Number(goal.targetAmount)));
      setSavedAmount(String(Number(goal.savedAmount)));
      setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
    } else {
      setName('');
      setTargetAmount('');
      setSavedAmount('');
      setDeadline('');
    }
    setError('');
  }, [goal, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Informe o nome da meta.');
      return;
    }

    const numTarget = parseFloat(targetAmount);
    if (!targetAmount || isNaN(numTarget) || numTarget <= 0) {
      setError('Informe um valor objetivo válido maior que zero.');
      return;
    }

    const numSaved = savedAmount ? parseFloat(savedAmount) : 0;
    if (isNaN(numSaved) || numSaved < 0) {
      setError('Informe um valor economizado válido.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        targetAmount: numTarget,
        savedAmount: numSaved,
        deadline: deadline || undefined,
      });
      onClose();
    } catch {
      addToast('error', 'Erro ao salvar meta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Meta' : 'Nova Meta'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da meta"
          placeholder="Ex: Viagem de férias"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Valor objetivo (R$)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
        />

        <Input
          label="Valor já economizado (R$)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          value={savedAmount}
          onChange={(e) => setSavedAmount(e.target.value)}
        />

        <Input
          label="Prazo (opcional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

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
