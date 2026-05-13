import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = '',
}: CardProps) {
  return (
    <div
      className={`bg-[#232342] border border-white/5 rounded-2xl p-5 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}