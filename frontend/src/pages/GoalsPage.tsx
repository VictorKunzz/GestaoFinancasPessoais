import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Goal, CreateGoalRequest } from '../types';
import * as goalService from '../services/goal.service';
import * as badgeService from '../services/badge.service';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';

export default function GoalsPage() {
  const { addToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      setLoading(true);
      setError(null);
      const data = await goalService.getAll();
      setGoals(data);
    } catch {
      setError('Erro ao carregar metas.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingGoal(null);
    setModalOpen(true);
  }

  function handleOpenEdit(goal: Goal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateGoalRequest) {
    if (editingGoal) {
      const updated = await goalService.update(editingGoal.id, data);
      setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      addToast('success', 'Meta atualizada com sucesso!');

      if (Number(updated.savedAmount) >= Number(updated.targetAmount)) {
        try {
          const badgeResult = await badgeService.check('goal_reached');
          if (badgeResult.awarded) addToast('badge', badgeResult.message);
        } catch (err) { console.error('Erro ao checar badge', err); }
      }
    } else {
      const created = await goalService.create(data);
      setGoals((prev) => [created, ...prev]);
      addToast('success', 'Meta criada com sucesso!');

      try {
        const badgeResult = await badgeService.check('first_goal');
        if (badgeResult.awarded) addToast('badge', badgeResult.message);

        if (Number(created.savedAmount) >= Number(created.targetAmount)) {
          const reachedResult = await badgeService.check('goal_reached');
          if (reachedResult.awarded) addToast('badge', reachedResult.message);
        }
      } catch (err) { console.error('Erro ao checar badge', err); }
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await goalService.remove(deleteTarget.id);
      setGoals((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast('success', 'Meta removida com sucesso!');
    } catch {
      addToast('error', 'Erro ao remover meta.');
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

  if (error && goals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-accent-rose text-lg font-medium mb-2">Ops!</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Metas</h2>
          <p className="text-text-secondary text-sm mt-1">
            {goals.length} meta{goals.length !== 1 ? 's' : ''} cadastrada{goals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={18} />
          Nova Meta
        </Button>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm mb-4">Nenhuma meta cadastrada ainda.</p>
          <Button onClick={handleOpenCreate} variant="secondary">
            <Plus size={18} />
            Criar primeira meta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        goal={editingGoal}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja excluir a meta{' '}
            <span className="text-text-primary font-medium">
              "{deleteTarget?.name}"
            </span>
            ? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              className="flex-1"
            >
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
