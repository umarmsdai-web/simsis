import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  label?: string;
}

export const FAB: React.FC<FABProps> = ({ onClick, label = '+ Transaksi' }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 sm:right-auto sm:ml-[300px] z-30 flex items-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white px-4 py-3.5 rounded-2xl shadow-xl shadow-blue-700/30 font-semibold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
      aria-label={label}
    >
      <Plus className="w-5 h-5 stroke-[2.5]" />
      <span>{label}</span>
    </button>
  );
};
