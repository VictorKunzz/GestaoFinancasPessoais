import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import type { Category, CreateCategoryRequest } from '../types';
import * as categoryService from '../services/category.service';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EntityIcon from '../lib/icons';
import CategoryModal from '../components/categories/CategoryModal';

export default function CategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleOpenEdit(category: Category) {
    setEditing(category);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateCategoryRequest) {
    if (editing) {
      const updated = await categoryService.update(editing.id, data);
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      addToast('success', 'Categoria atualizada com sucesso!');
    } else {
      const created = await categoryService.create(data);
      setCategories((prev) => [...prev, created]);
      addToast('success', 'Categoria criada com sucesso!');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryService.remove(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast('success', 'Categoria removida com sucesso!');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      addToast('error', typeof msg === 'string' ? msg : 'Erro ao remover categoria.');
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

  if (error && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-accent-rose text-lg font-medium mb-2">Ops!</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const minhas = categories.filter((c) => !c.isDefault);
  const padrao = categories.filter((c) => c.isDefault);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Categorias</h2>
          <p className="text-text-secondary text-sm mt-1">
            Personalize suas categorias de transação
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={18} />
          Nova Categoria
        </Button>
      </div>

      {/* Minhas categorias */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Minhas categorias
        </h3>
        {minhas.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border-default rounded-2xl">
            <p className="text-text-muted text-sm mb-4">
              Você ainda não criou categorias personalizadas.
            </p>
            <Button onClick={handleOpenCreate} variant="secondary">
              <Plus size={18} />
              Criar primeira categoria
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {minhas.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 p-4 bg-bg-card border border-border-default rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-violet/15 text-accent-violet shrink-0">
                    <EntityIcon value={category.icon} fallback={Tag} />
                  </div>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="p-2 rounded-lg text-text-muted hover:text-accent-violet hover:bg-bg-card-hover transition-colors cursor-pointer"
                    aria-label="Editar categoria"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(category)}
                    className="p-2 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"
                    aria-label="Remover categoria"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categorias padrão */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Padrão do sistema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {padrao.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 p-4 bg-bg-secondary border border-border-default rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-card text-text-muted shrink-0">
                  <EntityIcon value={category.icon} fallback={Tag} />
                </div>
                <span className="text-sm font-medium text-text-secondary truncate">
                  {category.name}
                </span>
              </div>
              <span className="text-xs text-text-muted px-2 py-1 rounded-md bg-bg-card shrink-0">
                Padrão
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Create/Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        category={editing}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja excluir a categoria{' '}
            <span className="text-text-primary font-medium">"{deleteTarget?.name}"</span>?
            Categorias em uso por transações não podem ser removidas.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleting}
              className="flex-1"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
