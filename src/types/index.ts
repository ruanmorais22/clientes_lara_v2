export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  prompt?: string;
  folder_id: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  'Quebra de mensagens'?: boolean;
  'Quantidade de blocos'?: number;
  'chave api OpenAi'?: string;
  'Delay entre as mensagens'?: number;
  'Plataforma'?: string;
  'cliente'?: string;
  'id_instancia_botconversa'?: string;
  'apiKey_instancia_botconversa'?: string;
  'id_despedida'?: string;
  'instancia_evolution'?: string;
  'id_grupo'?: string;
  'chave_api'?: string;
  'chatflow id'?: string;
  'url flowise'?: string;
  'url evolution'?: string;
  'apikey flowise'?: string;
  'instace_id evolution'?: string;
  'token evolution'?: string;
  'id_follow'?: string;
  'prompt_relatorio'?: string;
  'prompt_analise'?: string;
  'lara_grupo'?: string;
  'link_planilha'?: string;
  'prompt_config'?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  category: string;
  created_at?: string;
}
