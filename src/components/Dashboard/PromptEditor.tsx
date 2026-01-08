import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Prompt, CustomField, HotmartConfig } from '../../types';
import { ArrowLeft, Upload, Save, Settings2, X, MessageSquare, Plus, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { BubbleChat } from 'flowise-embed-react';
import { HotmartModal } from '../Modals/HotmartModal';
import { v4 as uuidv4 } from 'uuid';

interface PromptEditorProps {
  promptId?: number;
  channel?: string | null;
  onBack: () => void;
}

const fieldLabels: Record<string, string> = {
  'id_follow': 'ID Remover do Follow-up',
  'id_grupo': 'ID do Grupo',
  'Quebra de mensagens': 'Dividir Mensagens',
  'Quantidade de blocos': 'Número de Blocos',
  'chave api OpenAi': 'Chave API OpenAI',
  'Delay entre as mensagens': 'Intervalo entre Mensagens',
  'Plataforma': 'Plataforma',
  'cliente': 'Cliente',
  'id_instancia_botconversa': 'ID da Instância (Bot Conversa)',
  'apiKey_instancia_botconversa': 'API Key (Bot Conversa)',
  'id_despedida': 'ID do Fluxo Despedida',
  'instancia_evolution': 'Instância Evolution',
  'chave_api': 'Chave API Evolution',
  'chatflow id': 'ID do Chatflow Flowise',
  'url flowise': 'URL Flowise',
  'url evolution': 'URL Evolution',
  'apikey flowise': 'API Key Flowise',
  'instace_id evolution': 'ID da Instância Evolution',
  'token evolution': 'Token Evolution',
  'Projeto': 'Projeto',
  'lara_grupo': 'Lara Grupo',
  'prompt_config': 'Prompt Config',
  'channel': 'Canal'
};

export function PromptEditor({ promptId, channel, onBack }: PromptEditorProps) {
  const [prompt, setPrompt] = useState<Partial<Prompt>>({});
  const [loading, setLoading] = useState(!!promptId);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [showHotmartModal, setShowHotmartModal] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [existingFieldIds, setExistingFieldIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'prompt' | 'relatorio' | 'analise'>('prompt');

  const loadPrompt = useCallback(async () => {
    if (!promptId) return;
    
    try {
      // Load prompt data
      const { data: promptData, error: promptError } = await supabase
        .from('Prompts')
        .select('*')
        .eq('id', promptId)
        .single();

      if (promptError) throw promptError;
      setPrompt(promptData);
      if (promptData.thumbnail) {
        setPreviewUrl(promptData.thumbnail);
      }

      // Load custom fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('prompt_id', promptId);

      if (fieldsError) throw fieldsError;
      setCustomFields(fieldsData || []);
      // Store existing field IDs
      setExistingFieldIds(new Set(fieldsData?.map(field => field.id) || []));
    } catch (error: any) {
      toast.error('Error loading prompt');
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  useEffect(() => {
    if (channel && !promptId) {
      setPrompt(prev => ({ ...prev, channel }));
    }
  }, [channel, promptId]);

  useEffect(() => {
    if (prompt.thumbnail) {
      setPreviewUrl(prompt.thumbnail);
    }
  }, [prompt.thumbnail]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrompt(prev => ({ ...prev, [name as keyof Prompt]: value }));
  }, []);

  const handleToggle = useCallback((name: keyof Prompt) => {
    setPrompt(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('imagens')
        .getPublicUrl(filePath);

      if (data) {
        const imageUrl = data.publicUrl;
        setPrompt(prev => ({ ...prev, thumbnail: imageUrl }));
        setPreviewUrl(imageUrl);
        toast.success('Imagem carregada com sucesso!');
      }
    } catch (error: any) {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: uuidv4(),
      prompt_id: promptId!,
      label: '',
      value: ''
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const removeCustomField = async (id: string) => {
    try {
      if (!promptId) return;

      // First send delete event to webhook
      const webhookResponse = await fetch('https://n8n.minhalara.com.br/webhook/f9fe88ca-0daf-402d-9b42-7b4b8f299ff0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: promptId,
          field_id: id,
          action: 'delete',
          timestamp: new Date().toISOString()
        })
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to send delete event to webhook');
      }

      // Then delete from database
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCustomFields(prev => prev.filter(field => field.id !== id));
      toast.success('Campo removido com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao remover campo');
      console.error('Error:', error);
    }
  };

  const updateCustomField = (id: string, key: 'label' | 'value', value: string) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, [key]: value } : field
    ));
  };

  const saveCustomField = async (field: CustomField) => {
    try {
      if (!promptId) return;

      const isNew = !existingFieldIds.has(field.id);

      // Save to Supabase
      const { error } = await supabase
        .from('custom_fields')
        .upsert([{ ...field, prompt_id: promptId }]);

      if (error) throw error;

      // Send to webhook with appropriate action
      const webhookResponse = await fetch('https://n8n.minhalara.com.br/webhook/f9fe88ca-0daf-402d-9b42-7b4b8f299ff0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: promptId,
          field_id: field.id,
          label: field.label,
          value: field.value,
          action: isNew ? 'create' : 'update',
          timestamp: new Date().toISOString()
        })
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to send data to webhook');
      }

      // Update existingFieldIds if this was a new field
      if (isNew) {
        setExistingFieldIds(prev => new Set([...prev, field.id]));
      }

      toast.success('Campo salvo com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar campo');
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Ensure hotmart_config is saved properly (it's part of prompt state already)
      
      // First save the prompt
      let promptResult;
      if (promptId) {
        promptResult = await supabase
          .from('Prompts')
          .update(prompt)
          .eq('id', promptId);
      } else {
        promptResult = await supabase
          .from('Prompts')
          .insert([prompt])
          .select();
      }

      if (promptResult.error) throw promptResult.error;

      const currentPromptId = promptId || promptResult.data?.[0]?.id;

      // Then handle custom fields
      for (const field of customFields) {
        if (field.id.startsWith('new-')) {
          // Insert new field
          const { error } = await supabase
            .from('custom_fields')
            .insert([{ ...field, prompt_id: currentPromptId }]);
          if (error) throw error;
        } else {
          // Update existing field
          const { error } = await supabase
            .from('custom_fields')
            .upsert([{ ...field, prompt_id: currentPromptId }]);
          if (error) throw error;
        }
      }

      toast.success(promptId ? 'Prompt atualizado com sucesso!' : 'Prompt criado com sucesso!');
      onBack();
    } catch (error: any) {
      toast.error(promptId ? 'Erro ao atualizar Prompt' : 'Erro ao criar Prompt');
    }
  };

  const defaultFields = useMemo(() => ({
    Nome: '',
    Prompt: '',
    'Quebra de mensagens': false,
    'Quantidade de blocos': null,
    'chave api OpenAi': '',
    'Delay entre as mensagens': null,
    'Plataforma': '',
    'cliente': '',
    'thumbnail': '',
    'notes': '',
    'id_instancia_botconversa': '',
    'apiKey_instancia_botconversa': '',
    'id_despedida': '',
    'instancia_evolution': '',
    'Projeto': '',
    'chave_api': '',
    'chatflow id': '',
    'url flowise': '',
    'url evolution': '',
    'apikey flowise': '',
    'instace_id evolution': '',
    'token evolution': '',
    'id_follow': '',
    'id_grupo': '',
    'prompt_relatorio': '',
    'prompt_analise': '',
    'link_planilha': '',
    'lara_grupo': '',
    'prompt_config': false,
    'channel': '',
    ...prompt
  }), [prompt]);

  const configurationFields = useMemo(() => ({
    'Configuração': [
      'Quebra de mensagens',
      'Quantidade de blocos',
      'chave api OpenAi',
      'Delay entre as mensagens',
      'chave_api',
      'chatflow id',
      'url flowise',
      'apikey flowise'
    ],
    'Configurações da Plataforma': [
      'Plataforma',
      'cliente',
      'id_instancia_botconversa',
      'apiKey_instancia_botconversa',
      'id_despedida',
      'instancia_evolution',
      'url evolution',
      'instace_id evolution',
      'token evolution',
      'id_follow',
      'id_grupo',
      'Projeto',
      'lara_grupo',
      'prompt_config',
      'channel'
    ]
  }), []);

  const renderPromptTextarea = () => {
    let name: keyof Prompt;
    let value: string | null | undefined;

    switch (activeTab) {
      case 'relatorio':
        name = 'prompt_relatorio';
        value = defaultFields.prompt_relatorio;
        break;
      case 'analise':
        name = 'prompt_analise';
        value = defaultFields.prompt_analise;
        break;
      default:
        name = 'Prompt';
        value = defaultFields.Prompt;
    }

    return (
      <div className="relative">
        <textarea
          name={name}
          value={value || ''}
          onChange={handleChange}
          rows={24}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder={`Digite o ${name.replace('_', ' de ')} aqui...`}
          style={{ minHeight: '600px' }}
        />
        <div className="absolute bottom-3 right-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded-md border dark:border-gray-600">
          {value?.length || 0} caracteres
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {promptId ? 'Editar Prompt' : 'Criar novo Prompt'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {showAIHelper ? 'Esconder IA' : 'Ajuda da IA'}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              Configurações
            </button>
            <button
              onClick={() => setShowHotmartModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Eventos Checkout
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {promptId ? 'Salvar alterações' : 'Criar Projeto'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Left Column - Thumbnail (smaller) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thumbnail</h3>
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer w-full justify-center text-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Thumbnail'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Main Fields */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="space-y-6">
                {/* Nome Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="Nome"
                    value={defaultFields.Nome || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Digite o nome aqui..."
                  />
                </div>

                {/* Link Planilha Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link da Planilha
                  </label>
                  <input
                    type="text"
                    name="link_planilha"
                    value={defaultFields.link_planilha || ''}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Cole o link da planilha aqui..."
                  />
                </div>

                {/* Prompt Tabs */}
                <div>
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('prompt')}
                        className={`${
                          activeTab === 'prompt'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Prompt Principal
                      </button>
                      <button
                        onClick={() => setActiveTab('relatorio')}
                        className={`${
                          activeTab === 'relatorio'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Prompt de Relatório
                      </button>
                      <button
                        onClick={() => setActiveTab('analise')}
                        className={`${
                          activeTab === 'analise'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Prompt de Análise
                      </button>
                    </nav>
                  </div>
                  {renderPromptTextarea()}
                </div>

                {/* Custom Fields */}
                <div className="space-y-4 border-t pt-6 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chunks</h3>
                    <button
                      onClick={addCustomField}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Campo
                    </button>
                  </div>
                  {customFields.map((field) => (
                    <div key={field.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                            placeholder="Nome do campo"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <div className="relative">
                            <textarea
                              value={field.value}
                              onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                              placeholder="Digite o valor aqui..."
                              rows={6}
                              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <div className="absolute bottom-3 right-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded-md border dark:border-gray-600">
                              {field.value.length} caracteres
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomField(field.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveCustomField(field)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          Salvar Campo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configurações</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] text-gray-900 dark:text-white">
              <div className="space-y-8">
                {Object.entries(configurationFields).map(([groupName, fields]) => (
                  <div key={groupName}>
                    <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{groupName}</h4>
                    <div className="space-y-4">
                      {fields.map(key => {
                        const value = defaultFields[key as keyof typeof defaultFields];
                        const label = fieldLabels[key] || key;

                        if (typeof value === 'boolean') {
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-700 dark:text-gray-300">{label}</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={value}
                                  onChange={() => handleToggle(key as keyof Prompt)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          );
                        }

                        return (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {label}
                            </label>
                            <input
                              type={typeof value === 'number' ? 'number' : 'text'}
                              name={key}
                              value={value || ''}
                              onChange={handleChange}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder={`Digite ${label.toLowerCase()} aqui...`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotmart Modal */}
      <HotmartModal
        isOpen={showHotmartModal}
        onClose={() => setShowHotmartModal(false)}
        config={prompt.hotmart_config || {}}
        onChange={(config) => setPrompt(prev => ({ ...prev, hotmart_config: config }))}
      />

      {/* AI Helper */}
      {showAIHelper && (
        <div className="fixed bottom-4 right-4 z-50">
          <BubbleChat
            chatflowid="55308fec-c6c2-4b64-b793-d1e73f35ec3f"
            apiHost="https://flowise.profinho-automacao.com"
            theme={{
              button: {
                backgroundColor: '#3B81F6',
                size: 48,
                iconColor: 'white',
              },
              chatWindow: {
                showTitle: true,
                showAgentMessages: true,
                title: 'Fala comigo!',
                titleAvatarSrc: 'https://vvofozvpckjkrzcikvnb.supabase.co/storage/v1/object/public/imagens//backgroundStep.png.png',
                welcomeMessage: 'Fala comigo!',
                backgroundColor: '#ffffff',
                height: 500,
                width: 400,
                fontSize: 16,
                botMessage: {
                  backgroundColor: '#f7f8ff',
                  textColor: '#303235',
                  showAvatar: true,
                  avatarSrc: 'https://vvofozvpckjkrzcikvnb.supabase.co/storage/v1/object/public/imagens//bot.png'
                },
                userMessage: {
                  backgroundColor: '#3B81F6',
                  textColor: '#ffffff',
                  showAvatar: true,
                  avatarSrc: 'https://vvofozvpckjkrzcikvnb.supabase.co/storage/v1/object/public/imagens//user.png'
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
