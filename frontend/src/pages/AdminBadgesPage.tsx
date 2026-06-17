import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import type { AdminBadge, CreateBadgeRequest } from '../types';
import * as adminService from '../services/admin.service';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { badgeIconByCondition } from '../lib/icons';
import BadgeModal, { CONDITION_OPTIONS } from '../components/admin/BadgeModal';

function conditionLabel(value: string): string {
  return CONDITION_OPTIONS.find((o) => o.value === value)?.label || value;
}

export default function AdminBadgesPage() {
  const { addToast } = useToast();
  const [badges, setBadges] = useState<AdminBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBadge | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminBadge | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getBadges();
      setBadges(data);
    } catch {
      setError('Erro ao carregar badges.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleOpenEdit(badge: AdminBadge) {
    setEditing(badge);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateBadgeRequest) {
    if (editing) {
      const updated = await adminService.updateBadge(editing.id, data);
      setBadges((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
      addToast('success', 'Badge atualizada com sucesso!');
    } else {
      const created = await adminService.createBadge(data);
      setBadges((prev) => [...prev, created]);
      addToast('success', 'Badge criada com sucesso!');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.removeBadge(deleteTarget.id);
      setBadges((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast('success', 'Badge removida com sucesso!');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      addToast('error', typeof msg === 'string' ? msg : 'Erro ao remover badge.');
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

  if (error && badges.length === 0) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Badges</h2>
          <p className="text-text-secondary text-sm mt-1">Gerencie as conquistas do sistema</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={18} />
          Nova Badge
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const BadgeIcon = badgeIconByCondition[badge.condition] ?? Trophy;
          return (
          <div
            key={badge.id}
            className="flex flex-col gap-3 p-4 bg-bg-card border border-border-default rounded-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-amber/15 text-accent-amber shrink-0">
                  <BadgeIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{badge.name}</p>
                  <p className="text-xs text-text-muted truncate">{badge.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(badge)}
                  className="p-2 rounded-lg text-text-muted hover:text-accent-violet hover:bg-bg-card-hover transition-colors cursor-pointer"
                  aria-label="Editar badge"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(badge)}
                  className="p-2 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"
                  aria-label="Remover badge"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-accent-violet bg-accent-violet/10 px-2 py-1 rounded-md">
                {conditionLabel(badge.condition)}
              </span>
              {badge._count && (
                <span className="text-[11px] text-text-muted">
                  {badge._count.userBadges} conquistada{badge._count.userBadges !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          );
        })}
      </div>

      <BadgeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        badge={editing}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remover Badge"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja remover a badge{' '}
            <span className="text-text-primary font-medium">"{deleteTarget?.name}"</span>? Ela será
            removida de todos os usuários que a conquistaram.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} isLoading={deleting} className="flex-1">
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
