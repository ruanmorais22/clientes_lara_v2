import React, { useState, useEffect } from 'react';
import { X, Save, Upload, ImageIcon, ShoppingCart } from 'lucide-react';
import { Project, HotmartConfig } from '../../types';
import { HotmartModal } from '../Dashboard/Modals/HotmartModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  project: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, project }) => {
  const [activeTab, setActiveTab] = useState('prompt');
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [notes, setNotes] = useState('');
  const [prompt_analise, setPromptAnalise] = useState('');
  const [prompt_relatorio, setPromptRelatorio] = useState('');
  const [config, setConfig] = useState<any>({});
  const [hotmartConfig, setHotmartConfig] = useState<HotmartConfig | undefined>(undefined);
  const [showHotmartModal, setShowHotmartModal] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setPrompt(project.prompt || '');
      setThumbnail(project.thumbnail || '');
      setNotes(project.notes || '');
      setPromptAnalise(project.prompt_analise || '');
      setPromptRelatorio(project.prompt_relatorio || '');
      setHotmartConfig(project.hotmart_config);
      setConfig({
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
      });
    } else {
      setName('');
      setPrompt('');
      setThumbnail('');
      setNotes('');
      setPromptAnalise('');
      setPromptRelatorio('');
      setConfig({});
      setHotmartConfig(undefined);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...project,
      name,
      prompt,
      thumbnail,
      notes,
      prompt_analise,
      prompt_relatorio,
      hotmart_config: hotmartConfig,
      ...config,
    } as Project);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      alert("A imagem deve ter no máximo 800KB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setThumbnail(reader.result as string);
    reader.readAsDataURL(file);
  };
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setConfig(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-[#0F1E36] border-0 md:border md:border-white/10 w-full h-full md:h-[90vh] md:w-[95%] md:max-w-4xl md:rounded-2xl shadow-2xl flex flex-col">
        <div className="px-4 py-4 md:px-8 md:py-6 border-b border-white/10 flex justify-between items-center bg-[#0F1E36] md:rounded-t-2xl shrink-0">
          <div className="flex-1 pr-4">
            <span className="text-[10px] md:text-xs text-[#D4AF37] font-bold uppercase tracking-widest block mb-1">Editor de Projeto</span>
            <h3 className="text-lg md:text-2xl font-poppins font-bold text-white truncate">
              {project ? 'Editar Prompt' : 'Novo Prompt'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHotmartModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-colors mr-2"
              title="Configurar Hotmart"
            >
              <ShoppingCart size={20} />
              <span className="hidden md:inline text-sm font-medium">Hotmart</span>
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#051024]/50">
        <form onSubmit={handleSubmit}>
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Projeto</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-slate-700"
                  placeholder="Nome do projeto..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Imagem de Capa</label>
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-lg bg-[#051024] border border-white/10 overflow-hidden flex-shrink-0">
                    {thumbnail ? (
                      <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer flex items-center justify-center w-full px-4 py-3 bg-[#051024] border border-white/10 border-dashed rounded-lg text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all group">
                      <Upload size={18} className="mr-2" />
                      <span className="text-sm font-medium">Escolher imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-white/10 mb-4">
              <nav className="flex space-x-4">
                <button type="button" onClick={() => setActiveTab('prompt')} className={`py-2 px-4 font-bold ${activeTab === 'prompt' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400'}`}>Prompt</button>
                <button type="button" onClick={() => setActiveTab('analise')} className={`py-2 px-4 font-bold ${activeTab === 'analise' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400'}`}>Análise</button>
                <button type="button" onClick={() => setActiveTab('relatorio')} className={`py-2 px-4 font-bold ${activeTab === 'relatorio' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400'}`}>Relatório</button>
                <button type="button" onClick={() => setActiveTab('config')} className={`py-2 px-4 font-bold ${activeTab === 'config' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400'}`}>Configurações</button>
                <button type="button" onClick={() => setActiveTab('notes')} className={`py-2 px-4 font-bold ${activeTab === 'notes' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-400'}`}>Notas</button>
              </nav>
            </div>

            {activeTab === 'prompt' && (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-xl p-4 md:p-6 font-mono text-sm leading-relaxed text-slate-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none resize-none shadow-inner h-96"
                placeholder="Digite seu prompt aqui..."
              ></textarea>
            )}
             {activeTab === 'analise' && (
              <textarea
                value={prompt_analise}
                onChange={(e) => setPromptAnalise(e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-xl p-4 md:p-6 font-mono text-sm leading-relaxed text-slate-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none resize-none shadow-inner h-96"
                placeholder="Digite seu prompt de análise aqui..."
              ></textarea>
            )}
            {activeTab === 'relatorio' && (
              <textarea
                value={prompt_relatorio}
                onChange={(e) => setPromptRelatorio(e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-xl p-4 md:p-6 font-mono text-sm leading-relaxed text-slate-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none resize-none shadow-inner h-96"
                placeholder="Digite seu prompt de relatório aqui..."
              ></textarea>
            )}
            {activeTab === 'config' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(config).map(key => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{key}</label>
                    <input
                      type={typeof config[key] === 'boolean' ? 'checkbox' : 'text'}
                      name={key}
                      checked={typeof config[key] === 'boolean' ? config[key] : undefined}
                      value={typeof config[key] !== 'boolean' ? config[key] || '' : undefined}
                      onChange={handleConfigChange}
                      className="w-full bg-[#051024] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'notes' && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#051024] border border-white/10 rounded-xl p-4 md:p-6 font-mono text-sm leading-relaxed text-slate-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none resize-none shadow-inner h-96"
                placeholder="Digite suas notas aqui..."
              ></textarea>
            )}
          </div>
          <div className="px-4 py-4 md:px-8 md:py-6 bg-[#0F1E36] border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:rounded-b-2xl shrink-0">
            <span className="text-xs text-slate-500 font-mono hidden md:block">
              {project ? `ID: ${project.id}` : 'Rascunho não salvo'}
            </span>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 md:flex-none px-6 py-3 text-slate-400 font-medium hover:text-white transition-colors text-center"
              >
                Cancelar
              </button>
              <button type="submit" className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wide text-sm transition-all bg-gradient-to-b from-green-600 to-green-700 border-b-4 border-green-900 hover:brightness-110 active:border-b-0 active:translate-y-1 active:mt-1">
                <span className="flex items-center gap-2">
                  <Save size={18} /> <span className="md:hidden">Salvar</span> <span className="hidden md:inline">Salvar Alterações</span>
                </span>
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
      
      <HotmartModal
        isOpen={showHotmartModal}
        onClose={() => setShowHotmartModal(false)}
        config={hotmartConfig || {}}
        onChange={setHotmartConfig}
      />
    </div>
  );
};
