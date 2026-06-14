import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (server-side)
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Categorias carregam uma vez
  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  // Debounce da busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Refetch quando filtros/página mudam
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await transactionService.getAll({
          search: debouncedSearch || undefined,
          type: typeFilter || undefined,
          categoryId: categoryFilter || undefined,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        // Se a página ficou vazia após exclusão, volta uma página
        if (res.data.length === 0 && res.total > 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setTransactions(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        if (!cancelled) setError('Erro ao carregar transações.');
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFirstLoad(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, typeFilter, categoryFilter, page, refreshKey]);

  function reload() {
    setRefreshKey((k) => k + 1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleTypeChange(value: TransactionType | '') {
    setTypeFilter(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

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
      await transactionService.update(editingTransaction.id, data);
      addToast('success', 'Transação atualizada com sucesso!');
      reload();
    } else {
      await transactionService.create(data);
      addToast('success', 'Transação criada com sucesso!');
      setPage(1);
      reload();

      try {
        const badgeResult = await badgeService.check('FIRST_TRANSACTION');
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
      setDeleteTarget(null);
      addToast('success', 'Transação removida com sucesso!');
      reload();
    } catch {
      addToast('error', 'Erro ao remover transação.');
    } finally {
      setDeleting(false);
    }
  }

  if (firstLoad && loading) {
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
            {total} transação{total !== 1 ? 'ões' : ''} encontrada{total !== 1 ? 's' : ''}
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
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTarget}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

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
