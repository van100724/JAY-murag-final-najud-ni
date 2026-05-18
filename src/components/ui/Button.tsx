import { type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}: ButtonProps) {
  const styles = {
    primary:
      'bg-orange-500 hover:bg-orange-600 text-white',
    secondary:
      'bg-[#232342] hover:bg-white/10 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-3 rounded-xl font-semibold transition-all ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}