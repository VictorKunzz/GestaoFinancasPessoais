import {
  Utensils,
  ShoppingCart,
  Coffee,
  Car,
  Fuel,
  Home,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Plane,
  Shirt,
  Gift,
  Dumbbell,
  Smartphone,
  Dog,
  Wallet,
  Banknote,
  Briefcase,
  LineChart,
  PiggyBank,
  CreditCard,
  MoreHorizontal,
  Sparkles,
  Flag,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeCondition } from '../types';

// Catalogo curado de icones para o seletor de categorias (o slug e salvo no banco).
export const CATEGORY_ICONS: { slug: string; Icon: LucideIcon }[] = [
  { slug: 'wallet', Icon: Wallet },
  { slug: 'utensils', Icon: Utensils },
  { slug: 'shopping-cart', Icon: ShoppingCart },
  { slug: 'coffee', Icon: Coffee },
  { slug: 'car', Icon: Car },
  { slug: 'fuel', Icon: Fuel },
  { slug: 'home', Icon: Home },
  { slug: 'heart-pulse', Icon: HeartPulse },
  { slug: 'graduation-cap', Icon: GraduationCap },
  { slug: 'gamepad-2', Icon: Gamepad2 },
  { slug: 'plane', Icon: Plane },
  { slug: 'shirt', Icon: Shirt },
  { slug: 'gift', Icon: Gift },
  { slug: 'dumbbell', Icon: Dumbbell },
  { slug: 'smartphone', Icon: Smartphone },
  { slug: 'dog', Icon: Dog },
  { slug: 'banknote', Icon: Banknote },
  { slug: 'briefcase', Icon: Briefcase },
  { slug: 'line-chart', Icon: LineChart },
  { slug: 'piggy-bank', Icon: PiggyBank },
  { slug: 'credit-card', Icon: CreditCard },
  { slug: 'ellipsis', Icon: MoreHorizontal },
];

// Mapa slug -> componente lucide: catalogo de categorias + slugs legados (badges/seed antigo).
const LUCIDE_BY_SLUG: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  flag: Flag,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  'trending-up': TrendingUp,
  tag: Tag,
};
for (const { slug, Icon } of CATEGORY_ICONS) {
  LUCIDE_BY_SLUG[slug] = Icon;
}

// Icone de cada conquista derivado da regra (condition) — mesmo padrao da aba Conquistas.
export const badgeIconByCondition: Record<BadgeCondition, LucideIcon> = {
  FIRST_TRANSACTION: Zap,
  FIRST_GOAL: Target,
  GOAL_REACHED: Trophy,
  POSITIVE_MONTH: TrendingUp,
  SPENT_LESS: PiggyBank,
};

// Detecta se a string e um emoji pictografico (e nao um slug textual).
export function isEmoji(value: string): boolean {
  return /\p{Extended_Pictographic}/u.test(value);
}

interface EntityIconProps {
  value?: string | null;
  fallback: LucideIcon;
  size?: number;
  className?: string;
}

// Renderiza o icone de uma entidade: slug conhecido -> lucide; emoji legado -> texto; senao -> fallback.
export default function EntityIcon({ value, fallback: Fallback, size = 18, className }: EntityIconProps) {
  const trimmed = value?.trim();

  if (trimmed) {
    const Mapped = LUCIDE_BY_SLUG[trimmed.toLowerCase()];
    if (Mapped) return <Mapped size={size} className={className} />;
    if (isEmoji(trimmed)) {
      return <span className="text-lg leading-none">{trimmed}</span>;
    }
  }

  return <Fallback size={size} className={className} />;
}
