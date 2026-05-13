interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'default';
}

export default function Badge({
  text,
  variant = 'default',
}: BadgeProps) {
  const styles = {
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-400',
    danger: 'bg-red-500/10 text-red-400',
    default: 'bg-white/10 text-gray-300',
  };

  return (
    <span
      className={`px-3 py-1 rounded-lg text-xs ${styles[variant]}`}
    >
      {text}
    </span>
  );
}