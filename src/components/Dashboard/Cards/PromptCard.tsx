import React, { useState } from 'react';
import { Prompt, Folder } from '../../../types';
import { CardImage } from './CardImage';
import { CardContent } from './CardContent';
import { FolderIcon, MoreVertical, Copy } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import toast from 'react-hot-toast';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  folders: Folder[];
  onMove?: () => void;
}

export function PromptCard({ prompt, onClick, folders, onMove }: PromptCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(false);

  const handleMoveToFolder = async (folderId: string | null) => {
    try {
      const { error } = await supabase
        .from('Prompts')
        .update({ folder_id: folderId })
        .eq('id', prompt.id);

      if (error) throw error;

      toast.success('Projeto movido com sucesso!');
      onMove?.();
      setShowFolderSelect(false);
      setShowMenu(false);
    } catch (error: any) {
      toast.error('Erro ao mover projeto');
    }
  };

  const handleDuplicate = async () => {
    try {
      // Create a new prompt object without the id and timestamps
      const promptCopy = {
        Nome: `${prompt.Nome} (Cópia)`,
        Prompt: prompt.Prompt,
        'Quebra de mensagens': prompt['Quebra de mensagens'],
        'Quantidade de blocos': prompt['Quantidade de blocos'],
        'chave api OpenAi': prompt['chave api OpenAi'],
        'Delay entre as mensagens': prompt['Delay entre as mensagens'],
        'Plataforma': prompt['Plataforma'],
        'cliente': prompt['cliente'],
        'thumbnail': prompt['thumbnail'],
        'notes': prompt['notes'],
        'id_instancia_botconversa': prompt['id_instancia_botconversa'],
        'apiKey_instancia_botconversa': prompt['apiKey_instancia_botconversa'],
        'id_despedida': prompt['id_despedida'],
        'instancia_evolution': prompt['instancia_evolution'],
        'Projeto': prompt['Projeto'],
        folder_id: prompt.folder_id
      };

      const { error } = await supabase
        .from('Prompts')
        .insert([promptCopy]);

      if (error) throw error;

      toast.success('Projeto duplicado com sucesso!');
      onMove?.(); // Refresh the list
      setShowMenu(false);
    } catch (error: any) {
      toast.error('Erro ao duplicar projeto');
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening the prompt when clicking the menu
    if ((e.target as HTMLElement).closest('.menu-container')) {
      return;
    }
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 w-full relative group"
    >
      <div className="absolute top-2 right-2 menu-container z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
            setShowFolderSelect(false);
          }}
          className="p-1 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFolderSelect(true);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <FolderIcon className="w-4 h-4" />
              Mover para pasta
            </button>
          </div>
        )}

        {showFolderSelect && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20">
            <div className="max-h-60 overflow-y-auto py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveToFolder(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sem pasta
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToFolder(folder.id);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <CardImage 
        src={prompt.thumbnail} 
        alt={prompt.Nome || 'Prompt'} 
      />
      <CardContent 
        title={prompt.Nome || 'Untitled Prompt'}
        description={prompt.Prompt || 'No description available'}
        project={prompt.Projeto}
      />
    </div>
  );
}