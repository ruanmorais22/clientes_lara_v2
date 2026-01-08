import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FolderCard } from './Folders/FolderCard';
import { ProjectCard } from './Cards/ProjectCard';
import { Folder, Project } from '../../types';
import { Plus, Folder as FolderIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardProps {
  activeTab: string;
  currentFolder: Folder | null;
  setCurrentFolder: (folder: Folder | null) => void;
  openFolderModal: (folder: Folder | null) => void;
  openProjectModal: (project: Project | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab, currentFolder, setCurrentFolder, openFolderModal, openProjectModal }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentFolder) {
      loadProjects();
    } else {
      loadFolders();
    }
  }, [currentFolder, activeTab]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('category', activeTab);
      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      toast.error('Erro ao carregar pastas.');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!currentFolder) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Prompts')
        .select('*')
        .eq('folder_id', currentFolder.id);
      if (error) throw error;
      const mappedProjects = data?.map(p => ({
        id: p.id,
        name: p.Nome,
        thumbnail: p.thumbnail,
        prompt: p.Prompt,
        folder_id: p.folder_id,
        notes: p.notes,
        'Quebra de mensagens': p['Quebra de mensagens'],
        'Quantidade de blocos': p['Quantidade de blocos'],
        'chave api OpenAi': p['chave api OpenAi'],
        'Delay entre as mensagens': p['Delay entre as mensagens'],
        'Plataforma': p['Plataforma'],
        'cliente': p['cliente'],
        'id_instancia_botconversa': p['id_instancia_botconversa'],
        'apiKey_instancia_botconversa': p['apiKey_instancia_botconversa'],
        'id_despedida': p['id_despedida'],
        'instancia_evolution': p['instancia_evolution'],
        'id_grupo': p['id_grupo'],
        'chave_api': p['chave_api'],
        'chatflow id': p['chatflow id'],
        'url flowise': p['url flowise'],
        'url evolution': p['url evolution'],
        'apikey flowise': p['apikey flowise'],
        'instace_id evolution': p['instace_id evolution'],
        'token evolution': p['token evolution'],
        'id_follow': p['id_follow'],
        'prompt_relatorio': p['prompt_relatorio'],
        'prompt_analise': p['prompt_analise'],
        'lara_grupo': p['lara_grupo'],
        'link_planilha': p['link_planilha'],
        'prompt_config': p['prompt_config'],
        hotmart_config: p['hotmart_config'],
      })) as Project[];
      setProjects(mappedProjects || []);
    } catch (error) {
      toast.error('Erro ao carregar projetos.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pasta?')) return;
    try {
      const { error } = await supabase.from('folders').delete().eq('id', folderId);
      if (error) throw error;
      toast.success('Pasta excluída com sucesso!');
      loadFolders();
    } catch (error) {
      toast.error('Erro ao excluir pasta.');
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      const { error } = await supabase.from('Prompts').delete().eq('id', projectId);
      if (error) throw error;
      toast.success('Projeto excluído com sucesso!');
      loadProjects();
    } catch (error) {
      toast.error('Erro ao excluir projeto.');
    }
  };
  
  const handleMoveProject = async (projectId: string, folderId: string) => {
    try {
      const { error } = await supabase
        .from('Prompts')
        .update({ folder_id: folderId })
        .eq('id', projectId);
      if (error) throw error;
      toast.success('Projeto movido com sucesso!');
      loadProjects();
    } catch (error) {
      toast.error('Erro ao mover projeto.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <FolderIcon size={48} />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
      {!currentFolder ? (
        <>
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-slate-400 font-poppins font-medium text-sm md:text-lg">Pastas da Equipe</h3>
            <button onClick={() => openFolderModal(null)} className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-3 rounded-lg font-bold text-white uppercase tracking-wide text-xs md:text-sm transition-all bg-gradient-to-b from-green-600 to-green-700 border-b-4 border-green-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1">
              <Plus size={16} className="md:w-[18px]" /> <span className="hidden md:inline">Nova Pasta</span> <span className="md:hidden">Criar</span>
            </button>
          </div>
          {folders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 md:h-64 border border-dashed border-slate-800 rounded-2xl bg-[#0F1E36]/30 px-4 text-center">
              <FolderIcon size={48} className="text-slate-700 mb-4 md:w-16 md:h-16" />
              <p className="text-slate-500 font-poppins text-sm md:text-base">Nenhuma pasta criada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {folders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onClick={() => setCurrentFolder(folder)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    openFolderModal(folder);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-slate-400 font-poppins font-medium text-xs md:text-base truncate max-w-[50%]">
              Em: <span className="text-[#D4AF37] font-bold">{currentFolder.name}</span>
            </h3>
            <button onClick={() => openProjectModal(null)} className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-3 rounded-lg font-bold text-white uppercase tracking-wide text-xs md:text-sm transition-all bg-gradient-to-b from-green-600 to-green-700 border-b-4 border-green-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1">
              <Plus size={16} className="md:w-[18px]" /> <span className="hidden md:inline">Novo Projeto</span> <span className="md:hidden">Novo</span>
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 md:h-64 border border-dashed border-slate-800 rounded-2xl bg-[#0F1E36]/30 px-4 text-center">
              <FolderIcon size={48} className="text-slate-700 mb-4 md:w-16 md:h-16" />
              <p className="text-slate-500 font-poppins text-sm md:text-base">Pasta vazia.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  folders={folders}
                  onClick={() => openProjectModal(project)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  onMove={(folderId) => handleMoveProject(project.id, folderId)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
