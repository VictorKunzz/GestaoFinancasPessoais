import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Tag,
  PiggyBank,
  Trophy,
  Users,
  Award,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/categories', label: 'Categorias', icon: Tag },
  { to: '/budgets', label: 'Orçamentos', icon: PiggyBank },
  { to: '/badges', label: 'Conquistas', icon: Trophy },
];

const adminNavItems = [
  { to: '/admin/users', label: 'Usuários', icon: Users },
  { to: '/admin/badges', label: 'Badges', icon: Award },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-bg-secondary border-r border-border-default
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border-default">
          <div className="p-2 bg-accent-violet/20 rounded-xl">
            <Wallet className="text-accent-violet" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              FinTrack
            </h1>
            <p className="text-xs text-text-muted">Finanças Pessoais</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-violet/15 text-accent-violet-light border border-accent-violet/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <div className="pt-4 mt-3 border-t border-border-default space-y-1">
              <p className="px-4 pb-1 text-[11px] font-semibold text-text-muted uppercase tracking-wide">
                Administração
              </p>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-violet/15 text-accent-violet-light border border-accent-violet/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Usuário + Logout */}
        <div className="px-3 py-4 border-t border-border-default">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-accent-rose hover:bg-accent-rose/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
