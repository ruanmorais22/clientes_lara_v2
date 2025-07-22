import React from 'react';

interface AnaliseTabProps {
  prompt_analise: string | null | undefined;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function AnaliseTab({ prompt_analise, handleChange }: AnaliseTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prompt de Análise</h3>
      <div>
        <textarea
          name="prompt_analise"
          value={prompt_analise || ''}
          onChange={handleChange}
          rows={15}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y font-mono text-sm leading-relaxed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Digite o prompt para gerar análises..."
        />
      </div>
    </div>
  );
}
