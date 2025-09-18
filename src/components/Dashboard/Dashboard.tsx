import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { PromptCard } from './Cards/PromptCard';
import { FolderCard } from './Folders/FolderCard';
import { PromptEditor } from './PromptEditor';
import { NewPromptButton } from './Cards/NewPromptButton';
import { Prompt, Folder } from '../../types';
import { LogOut, FolderPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      loadData();
    }
  }, [selectedProject]);

  const loadData = async () => {
    if (!selectedProject) return;

    try {
      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .order('name');

      if (foldersError) throw foldersError;

      // Load prompts for the selected project
      const { data: promptsData, error: promptsError } = await supabase
        .from('Prompts')
        .select('*')
        .eq('channel', selectedProject);

      if (promptsError) throw promptsError;

      setFolders(foldersData || []);
      setPrompts(promptsData || []);
    } catch (error: any) {
      toast.error('Error loading data');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logout successful');
    } catch (error: any) {
      toast.error('Error during logout');
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from('folders')
        .insert([{ name: newFolderName }]);

      if (error) throw error;
      
      setShowNewFolderInput(false);
      setNewFolderName('');
      toast.success('Pasta criada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error('Erro ao criar pasta');
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-200">Selecione um Projeto</h1>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
          <button
            onClick={() => setSelectedProject('instagram')}
            className="w-64 h-64 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white p-4 rounded-lg text-2xl font-bold hover:scale-105 transition-transform flex flex-col items-center justify-center shadow-lg space-y-4"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram Logo" className="w-24 h-24" />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => setSelectedProject('whatsapp')}
            className="w-64 h-64 bg-gradient-to-br from-green-400 to-teal-500 text-white p-4 rounded-lg text-2xl font-bold hover:scale-105 transition-transform flex flex-col items-center justify-center shadow-lg space-y-4"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp Logo" className="w-24 h-24" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => setSelectedProject('youtube')}
            className="w-64 h-64 bg-red-600 text-white p-4 rounded-lg text-2xl font-bold hover:scale-105 transition-transform flex flex-col items-center justify-center shadow-lg space-y-4"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube Logo" className="w-24 h-24" />
            <span>YouTube</span>
          </button>
          <button
            onClick={() => setSelectedProject('sofia')}
            className="w-64 h-64 bg-[#CADC2B] text-white p-4 rounded-lg text-2xl font-bold hover:scale-105 transition-transform flex flex-col items-center justify-center shadow-lg space-y-4"
          >
            <img src="/sofia-logo.png" alt="Sofia Logo" className="w-24 h-24" />
            <span>Sofia</span>
          </button>
          <button
            onClick={() => setSelectedProject('fabrica_posts')}
            className="w-64 h-64 bg-[#C23EBE] text-white p-4 rounded-lg text-2xl font-bold hover:scale-105 transition-transform flex flex-col items-center justify-center shadow-lg space-y-4"
          >
            <img src="/fabrica_posts.png" alt="Fabrica de Posts Logo" className="w-24 h-24" />
            <span>Fabrica de Posts</span>
          </button>
        </div>
      </div>
    );
  }

  if (selectedPromptId || isCreating) {
    return (
      <PromptEditor
        promptId={selectedPromptId ?? undefined}
        onBack={() => {
          setSelectedPromptId(null);
          setIsCreating(false);
          loadData();
        }}
      />
    );
  }

  // Organize prompts by folder
  const folderMap = new Map<string, Prompt[]>();
  folderMap.set('root', []);

  folders.forEach(folder => {
    folderMap.set(folder.id, []);
  });

  prompts.forEach(prompt => {
    const folderId = prompt.folder_id || 'root';
    const folderPrompts = folderMap.get(folderId) || [];
    folderPrompts.push(prompt);
    folderMap.set(folderId, folderPrompts);
  });

  const renderContent = () => {
    if (currentFolder) {
      const folderPrompts = folderMap.get(currentFolder) || [];
      const folder = folders.find(f => f.id === currentFolder) || { name: 'Sem pasta' };

      return (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setCurrentFolder(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <h2 className="text-2xl font-bold">{folder.name}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <NewPromptButton onClick={() => setIsCreating(true)} />
            {folderPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                folders={folders}
                onClick={() => setSelectedPromptId(prompt.id)}
                onMove={loadData}
              />
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <FolderCard
            key="root"
            folder={{ id: 'root', name: 'Sem pasta', prompts: folderMap.get('root') || [] }}
            onClick={() => setCurrentFolder('root')}
            onUpdate={loadData}
          />
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={{ ...folder, prompts: folderMap.get(folder.id) || [] }}
              onClick={() => setCurrentFolder(folder.id)}
              onUpdate={loadData}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel</h1>
        <div className="flex items-center gap-4">
          {!showNewFolderInput ? (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Nova Pasta
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta"
                className="px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              />
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Trocar Projeto
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
