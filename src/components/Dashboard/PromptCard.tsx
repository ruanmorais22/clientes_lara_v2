import React from 'react';
import { Prompt } from '../../types';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 w-full"
    >
      <img
        src={prompt.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'}
        alt={prompt.Nome || 'Prompt'}
        className="w-full h-32 object-cover"
      />
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">{prompt.Nome || 'Untitled Prompt'}</h3>
        <div className="flex items-center gap-2 mb-2">
          {prompt.Projeto && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs rounded-full">
              {prompt.Projeto}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {prompt.Prompt || 'No description available'}
        </p>
      </div>
    </div>
  );
}
