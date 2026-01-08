import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from "./services/supabase";
import { LoginForm } from "./components/Auth/LoginForm";
import { SignUpForm } from "./components/Auth/SignUpForm";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { FolderModal } from "./components/Modals/FolderModal";
import { ProjectModal } from "./components/Modals/ProjectModal";
import { Folder, Project } from "./types";

function App() {
  const [session, setSession] = useState<any>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('automatize');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveFolder = async (name: string) => {
    try {
      if (editingFolder) {
        const { error } = await supabase
          .from('folders')
          .update({ name })
          .eq('id', editingFolder.id);
        if (error) throw error;
        toast.success('Pasta atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('folders')
          .insert([{ name, category: activeTab }]);
        if (error) throw error;
        toast.success('Pasta criada com sucesso!');
      }
      setIsFolderModalOpen(false);
      setEditingFolder(null);
    } catch (error) {
      toast.error('Erro ao salvar pasta.');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pasta?')) return;
    try {
      const { error } = await supabase.from('folders').delete().eq('id', folderId);
      if (error) throw error;
      toast.success('Pasta excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir pasta.');
    }
  };

  const handleSaveProject = async (project: Project) => {
    try {
      const projectData = {
        'Nome': project.name,
        'Prompt': project.prompt,
        'thumbnail': project.thumbnail,
        'notes': project.notes,
        'prompt_analise': project.prompt_analise,
        'prompt_relatorio': project.prompt_relatorio,
        'Quebra de mensagens': project['Quebra de mensagens'],
        'Quantidade de blocos': project['Quantidade de blocos'],
        'chave api OpenAi': project['chave api OpenAi'],
        'Delay entre as mensagens': project['Delay entre as mensagens'],
        'Plataforma': project['Plataforma'],
        'cliente': project['cliente'],
        'id_instancia_botconversa': project['id_instancia_botconversa'],
        'apiKey_instancia_botconversa': project['apiKey_instancia_botconversa'],
        'id_despedida': project['id_despedida'],
        'instancia_evolution': project['instancia_evolution'],
        'id_grupo': project['id_grupo'],
        'chave_api': project['chave_api'],
        'chatflow id': project['chatflow id'],
        'url flowise': project['url flowise'],
        'url evolution': project['url evolution'],
        'apikey flowise': project['apikey flowise'],
        'instace_id evolution': project['instace_id evolution'],
        'token evolution': project['token evolution'],
        'id_follow': project['id_follow'],
        'lara_grupo': project['lara_grupo'],
        'link_planilha': project['link_planilha'],
        'prompt_config': project['prompt_config'],
        'hotmart_config': project.hotmart_config,
      };

      if (editingProject) {
        const { error } = await supabase
          .from('Prompts')
          .update(projectData)
          .eq('id', editingProject.id);
        if (error) throw error;
        toast.success('Projeto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('Prompts')
          .insert([{ ...projectData, folder_id: currentFolder?.id }]);
        if (error) throw error;
        toast.success('Projeto criado com sucesso!');
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao salvar projeto.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      const { error } = await supabase.from('Prompts').delete().eq('id', projectId);
      if (error) throw error;
      toast.success('Projeto excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir projeto.');
    }
  };


  if (!session) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-nexus-bg">
        {showSignUp ? (
          <SignUpForm onShowLogin={() => setShowSignUp(false)} />
        ) : (
          <LoginForm onShowSignUp={() => setShowSignUp(true)} />
        )}
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-nexus-bg text-nexus-text font-roboto">
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Roboto:wght@300;400;500&display=swap');
        .font-poppins { fontFamily: 'Poppins', sans-serif; }
        .font-roboto { fontFamily: 'Roboto', sans-serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #051024; }
        ::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #D4AF37; }
      `}</style>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentFolder={setCurrentFolder}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <Dashboard
          activeTab={activeTab}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          openFolderModal={(folder) => {
            setEditingFolder(folder);
            setIsFolderModalOpen(true);
          }}
          openProjectModal={(project) => {
            setEditingProject(project);
            setIsProjectModalOpen(true);
          }}
        />
      </main>
      {isFolderModalOpen && (
        <FolderModal
          isOpen={isFolderModalOpen}
          onClose={() => {
            setIsFolderModalOpen(false);
            setEditingFolder(null);
          }}
          onSave={handleSaveFolder}
          folder={editingFolder}
        />
      )}
      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          project={editingProject}
        />
      )}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
