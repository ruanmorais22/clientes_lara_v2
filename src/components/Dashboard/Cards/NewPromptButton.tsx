import React from 'react';
import { Plus } from 'lucide-react';

interface NewPromptButtonProps {
  onClick: () => void;
}

export function NewPromptButton({ onClick }: NewPromptButtonProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-[200px]"
    >
      <Plus className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-base font-medium text-gray-600">Adicionar novo Projeto</p>
    </div>
  );
}