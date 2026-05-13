import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({
  open,
  children,
  onClose,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#232342] rounded-3xl border border-white/10 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}