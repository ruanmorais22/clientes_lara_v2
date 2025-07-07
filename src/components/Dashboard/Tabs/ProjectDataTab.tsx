import React from 'react';

interface ProjectDataTabProps {
  notes: string | null | undefined;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ProjectDataTab({ notes, handleChange }: ProjectDataTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dados do Projeto</h3>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Anotações
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes || ''}
          onChange={handleChange}
          rows={15}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y font-mono text-sm leading-relaxed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Digite Dados sobre o Projeto aqui..."
        />
      </div>
    </div>
  );
}
