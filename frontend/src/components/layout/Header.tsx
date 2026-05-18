import { Menu, Wallet } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-4 bg-bg-primary/80 backdrop-blur-lg border-b border-border-default sm:px-6 lg:px-8">
      {/* Botão menu mobile */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors lg:hidden cursor-pointer"
      >
        <Menu size={22} />
      </button>

      {/* Logo mobile (visível apenas quando sidebar está oculta) */}
      <div className="flex items-center gap-2 lg:hidden">
        <Wallet className="text-accent-violet" size={20} />
        <span className="text-sm font-bold text-text-primary">FinTrack</span>
      </div>

      {/* Título da página (desktop) */}
      {title && (
        <h2 className="hidden lg:block text-xl font-semibold text-text-primary">{title}</h2>
      )}
    </header>
  );
}
