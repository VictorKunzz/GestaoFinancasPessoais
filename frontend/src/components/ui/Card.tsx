import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        bg-bg-card border border-border-default rounded-2xl
        ${paddingStyles[padding]}
        ${hover ? 'transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hover hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
