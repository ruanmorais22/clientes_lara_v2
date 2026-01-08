export interface HotmartOffer {
  key: string;
  name: string;
  flows: {
    approved_purchase?: string;
    abandonment?: string;
    card_declined?: string;
    refund?: string;
  };
}

export interface HotmartProduct {
  id: number;
  name: string;
  offers: HotmartOffer[];
}

export interface HotmartConfig {
  clientId?: string;
  clientSecret?: string;
  products?: HotmartProduct[];
}

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
  hotmart_config?: HotmartConfig;
}

export interface Folder {
  id: string;
  name: string;
  category: string;
  created_at?: string;
}

// Aliases and missing types
export type Prompt = Project;

export interface CustomField {
  id: string;
  prompt_id: number | string; // promptId in Editor is number, but ID in Project is string? 
  // In PromptEditor.tsx: promptId?: number;
  // But Project.id is string.
  // I should check PromptEditor usage. It uses supabase.from('Prompts').eq('id', promptId).
  // If DB id is UUID, promptId should be string. 
  // Wait, migration 20250428 says: prompt_id integer REFERENCES "Prompts"(id)
  // But Prompts id in 20250428 says: id uuid PRIMARY KEY
  // There is a mismatch in migration snippets I saw.
  // I will use string | number for safety or string if UUID.
  label: string;
  value: string;
}
