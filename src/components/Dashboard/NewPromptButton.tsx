import React from 'react';
import { Plus } from 'lucide-react';

interface NewPromptButtonProps {
  onClick: () => void;
}

export function NewPromptButton({ onClick }: NewPromptButtonProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center h-[200px]"
    >
      <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
      <p className="text-base font-medium text-gray-600 dark:text-gray-400">Adicionar novo Projeto</p>
    </div>
  );
}
