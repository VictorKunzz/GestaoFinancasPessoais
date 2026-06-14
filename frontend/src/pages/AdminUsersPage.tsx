import { useState, useEffect } from 'react';
import { Shield, ShieldOff, Trash2, User as UserIcon } from 'lucide-react';
import type { AdminUser } from '../types';
import * as adminService from '../services/admin.service';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch {
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole(target: AdminUser) {
    const novoRole = target.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setBusyId(target.id);
    try {
      const updated = await adminService.updateUserRole(target.id, novoRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
      addToast('success', `Papel atualizado para ${novoRole === 'ADMIN' ? 'Administrador' : 'Usuário'}.`);
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      addToast('error', typeof msg === 'string' ? msg : 'Erro ao atualizar papel.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.removeUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast('success', 'Usuário removido com sucesso!');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      addToast('error', typeof msg === 'string' ? msg : 'Erro ao remover usuário.');
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

  if (error && users.length === 0) {
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
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Usuários</h2>
        <p className="text-text-secondary text-sm mt-1">
          {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {users.map((u) => {
          const isSelf = u.id === currentUser?.id;
          const isAdmin = u.role === 'ADMIN';
          return (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-bg-card border border-border-default rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-violet/15 text-accent-violet shrink-0">
                  <UserIcon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">{u.name}</span>
                    {isAdmin && (
                      <span className="text-[11px] font-medium text-accent-amber bg-accent-amber/15 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[11px] text-text-muted bg-bg-input px-2 py-0.5 rounded-full">
                        Você
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">{u.email}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {u.transactionsCount} transações · {u.goalsCount} metas · desde {formatDate(u.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleRole(u)}
                  isLoading={busyId === u.id}
                  disabled={isSelf}
                >
                  {isAdmin ? <ShieldOff size={15} /> : <Shield size={15} />}
                  {isAdmin ? 'Rebaixar' : 'Promover'}
                </Button>
                <button
                  onClick={() => setDeleteTarget(u)}
                  disabled={isSelf}
                  className="p-2 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-muted"
                  aria-label="Remover usuário"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remover Usuário"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja remover{' '}
            <span className="text-text-primary font-medium">"{deleteTarget?.name}"</span>? Todas as
            transações, metas e dados deste usuário serão apagados. Esta ação não pode ser desfeita.
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
