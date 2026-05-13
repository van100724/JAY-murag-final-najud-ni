import { InputHTMLAttributes } from 'react';

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({
  label,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">
          {label}
        </label>
      )}

      <input
        {...props}
        className="w-full bg-[#1a1a2e] border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all text-white"
      />
    </div>
  );
}