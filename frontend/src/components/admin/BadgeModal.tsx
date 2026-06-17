import { useState, useEffect } from 'react';
import type { AdminBadge, BadgeCondition, CreateBadgeRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { badgeIconByCondition } from '../../lib/icons';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBadgeRequest) => Promise<void>;
  badge?: AdminBadge | null;
}

export const CONDITION_OPTIONS: { value: BadgeCondition; label: string }[] = [
  { value: 'FIRST_TRANSACTION', label: 'Primeira transação' },
  { value: 'FIRST_GOAL', label: 'Primeira meta' },
  { value: 'GOAL_REACHED', label: 'Meta atingida' },
  { value: 'POSITIVE_MONTH', label: 'Mês com saldo positivo' },
  { value: 'SPENT_LESS', label: 'Gastou menos que o mês anterior' },
];

export default function BadgeModal({ isOpen, onClose, onSubmit, badge }: BadgeModalProps) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<BadgeCondition>('FIRST_TRANSACTION');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!badge;

  useEffect(() => {
    if (badge) {
      setName(badge.name);
      setDescription(badge.description);
      setCondition(badge.condition);
    } else {
      setName('');
      setDescription('');
      setCondition('FIRST_TRANSACTION');
    }
    setError('');
  }, [badge, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    if (description.trim().length < 2) {
      setError('Informe uma descrição com pelo menos 2 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        condition,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (typeof msg === 'string') {
        setError(msg);
      } else {
        addToast('error', 'Erro ao salvar badge. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const ConditionIcon = badgeIconByCondition[condition];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Badge' : 'Nova Badge'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          placeholder="Ex: Primeiro Passo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Descrição"
          placeholder="Ex: Registrou a primeira transação"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="w-full">
          <label htmlFor="badge-condition" className="block text-sm font-medium text-text-secondary mb-1.5">
            Condição (regra de conquista)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent-amber/15 text-accent-amber shrink-0">
              <ConditionIcon size={20} />
            </div>
            <select
              id="badge-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as BadgeCondition)}
              className="w-full bg-bg-input border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200 cursor-pointer"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">
            O ícone da conquista é definido automaticamente pela condição.
          </p>
        </div>

        {error && <p className="text-sm text-accent-rose">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
