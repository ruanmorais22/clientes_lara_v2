export interface Prompt {
  id: number;
  Nome: string;
  Prompt: string;
  'Quebra de mensagens': boolean;
  'Quantidade de blocos': number | null;
  'chave api OpenAi': string;
  'Delay entre as mensagens': number | null;
  'Plataforma': string;
  'cliente': string;
  'thumbnail': string;
  'notes': string;
  'id_instancia_botconversa': string;
  'apiKey_instancia_botconversa': string;
  'id_despedida': string;
  'instancia_evolution': string;
  'Projeto': string;
  'chave_api': string | null;
  'chatflow id': string | null;
  'url flowise': string | null;
  'url evolution': string | null;
  'apikey flowise': string | null;
  'instace_id evolution': string | null;
  'token evolution': string | null;
  'id_follow': string | null;
  'id_grupo': string | null;
  folder_id?: string;
  created_at?: string;
  updated_at?: string;
  prompt_relatorio?: string;
  prompt_analise?: string;
}

export interface CustomField {
  id: string;
  prompt_id: number;
  label: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  created_at?: string;
  prompts?: Prompt[]; // Adicionando a propriedade prompts
}

export interface ChecklistItem {
  id: string;
  prompt_id: number;
  text: string;
  is_completed: boolean;
  order: number;
  created_at?: string;
  updated_at?: string;
}
