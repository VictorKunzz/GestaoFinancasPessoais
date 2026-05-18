import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Transaction, TransactionType, Category, CreateTransactionRequest } from '../types';
import * as transactionService from '../services/transaction.service';
import * as categoryService from '../services/category.service';
import * as badgeService from '../services/badge.service';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FilterBar from '../components/transactions/FilterBar';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';

export default function TransactionsPage() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [transData, catData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);
      setTransactions(transData);
      setCategories(catData);
    } catch {
      setError('Erro ao carregar transações.');
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(term));
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter) {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [transactions, search, typeFilter, categoryFilter]);

  function handleOpenCreate() {
    setEditingTransaction(null);
    setModalOpen(true);
  }

  function handleOpenEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateTransactionRequest) {
    if (editingTransaction) {
      const updated = await transactionService.update(editingTransaction.id, data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      addToast('success', 'Transação atualizada com sucesso!');
    } else {
      const created = await transactionService.create(data);
      setTransactions((prev) => [created, ...prev]);
      addToast('success', 'Transação criada com sucesso!');

      try {
        const badgeResult = await badgeService.check('first_transaction');
        if (badgeResult.awarded) {
          addToast('badge', badgeResult.message);
        }
      } catch (err) {
        console.error('Erro ao checar badge', err);
      }
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await transactionService.remove(deleteTarget.id);
      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      addToast('success', 'Transação removida com sucesso!');
    } catch {
      addToast('error', 'Erro ao remover transação.');
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

  if (error && transactions.length === 0) {
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
          <h2 className="text-2xl font-bold text-text-primary">Transações</h2>
          <p className="text-text-secondary text-sm mt-1">
            {filteredTransactions.length} transação{filteredTransactions.length !== 1 ? 'ões' : ''} encontrada{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus size={18} />
          Nova Transação
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {/* Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      {/* Create/Edit Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
        transaction={editingTransaction}
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
            Tem certeza que deseja excluir a transação{' '}
            <span className="text-text-primary font-medium">
              "{deleteTarget?.description}"
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
