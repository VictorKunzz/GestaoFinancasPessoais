import { Search, Filter } from 'lucide-react';
import type { TransactionType, Category } from '../../types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: TransactionType | '';
  onTypeChange: (value: TransactionType | '') => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
}

export default function FilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por descrição..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg-input border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as TransactionType | '')}
            className="w-full appearance-none bg-bg-input border border-border-default rounded-xl pl-9 pr-8 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200 cursor-pointer"
          >
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full appearance-none bg-bg-input border border-border-default rounded-xl px-4 pr-8 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30 transition-all duration-200 cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
