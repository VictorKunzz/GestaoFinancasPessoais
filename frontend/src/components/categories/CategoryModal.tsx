import { useState, useEffect } from 'react';
import type { Category, CreateCategoryRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  category?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSubmit, category }: CategoryModalProps) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || '');
    } else {
      setName('');
      setIcon('');
    }
    setError('');
  }, [category, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Informe um nome com pelo menos 2 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon: icon.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (typeof msg === 'string') {
        setError(msg);
      } else {
        addToast('error', 'Erro ao salvar categoria. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da categoria"
          placeholder="Ex: Pets, Investimentos..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Ícone (emoji, opcional)"
          placeholder="Ex: 🐶"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={4}
        />

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
