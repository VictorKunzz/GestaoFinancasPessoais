import { useState, useEffect } from 'react';
import type { Category, CreateCategoryRequest } from '../../types';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CATEGORY_ICONS } from '../../lib/icons';

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

        <div className="w-full">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Ícone (opcional)
          </label>
          <div className="grid grid-cols-6 gap-2">
            {CATEGORY_ICONS.map(({ slug, Icon }) => {
              const selected = icon === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setIcon(selected ? '' : slug)}
                  aria-label={slug}
                  aria-pressed={selected}
                  className={`flex items-center justify-center aspect-square rounded-lg border transition-colors cursor-pointer ${
                    selected
                      ? 'border-accent-violet bg-accent-violet/15 text-accent-violet'
                      : 'border-border-default bg-bg-input text-text-muted hover:text-text-primary hover:border-border-hover'
                  }`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
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
