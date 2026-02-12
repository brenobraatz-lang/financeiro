import axios from 'axios';
import { Despesa, FiltroDespesa, RelatorioMensal, EntradaCaixa, CaixaMensal } from '../types/Despesa';
import { caixaServiceSupabase } from './caixaServiceSupabase';

// Normalize VITE_API_URL: ensure it always points to the API root including '/api'
let API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;
if (!API_URL) {
  // In production, default to same origin + /api (works when backend is served from same domain)
  API_URL = `${window.location.origin}/api`;
} else {
  API_URL = API_URL.replace(/\/+$/, '');
  if (!API_URL.endsWith('/api')) {
    API_URL = API_URL + '/api';
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para log de erros (ajuda no debug quando frontend mostra erro genérico)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Erro na requisição API:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const despesaService = {
  // Criar despesa
  create: async (despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Despesa> => {
    try {
      console.log('📤 Enviando despesa ao backend:', despesa);
      const response = await api.post<Despesa>('/despesas', despesa);
      console.log('✅ Despesa criada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Falha ao criar despesa:', error);
      throw error;
    }
  },

  // Listar despesas (com filtros)
  list: async (filtros?: FiltroDespesa): Promise<Despesa[]> => {
    // Remove valores undefined/null/vazio dos filtros para não enviar como query params vazios
    const filtrosLimpos = filtros ? Object.entries(filtros).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as FiltroDespesa) : {};
    
    const response = await api.get<Despesa[]>('/despesas', { params: filtrosLimpos });
    return response.data;
  },

  // Obter despesa por ID
  getById: async (id: number): Promise<Despesa> => {
    const response = await api.get<Despesa>(`/despesas/${id}`);
    return response.data;
  },

  // Atualizar despesa
  update: async (id: number, despesa: Partial<Despesa>): Promise<Despesa> => {
    const response = await api.put<Despesa>(`/despesas/${id}`, despesa);
    return response.data;
  },

  // Excluir despesa
  delete: async (id: number): Promise<void> => {
    await api.delete(`/despesas/${id}`);
  },

  // Gerar relatório mensal
  relatorioMensal: async (mes: number, ano: number): Promise<RelatorioMensal> => {
    const response = await api.get<RelatorioMensal>('/despesas/relatorio-mensal', {
      params: { mes, ano }
    });
    return response.data;
  },

  // Obter opções para filtros
  getOpcoesFiltros: async (): Promise<{ bancos: string[]; tiposDespesa: string[] }> => {
    const response = await api.get<{ bancos: string[]; tiposDespesa: string[] }>(
      '/despesas/opcoes-filtros'
    );
    return response.data;
  }
};

// Usar Supabase para caixa (sem dependência de backend Express)
export const caixaService = caixaServiceSupabase;
