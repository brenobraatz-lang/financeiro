import { EntradaCaixa, CaixaMensal } from '../types/Despesa';
import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || window.location.origin + '/api')
  : '/api';

export const caixaService = {
  // Listar entradas de um período
  async listEntradas(mes: number, ano: number): Promise<EntradaCaixa[]> {
    try {
      console.log('[caixaService] GET', `${API_URL}/caixa/entradas`, { mes, ano });
      const response = await axios.get(`${API_URL}/caixa/entradas`, {
        params: { mes, ano }
      });
      console.log('[caixaService] response', response.status, response.config?.url);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar entradas de caixa:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        url: (error as any)?.config?.url
      });
      throw error;
    }
  },

  // Obter caixa mensal completo
  async getCaixaMensal(mes: number, ano: number): Promise<CaixaMensal> {
    try {
      console.log('[caixaService] GET', `${API_URL}/caixa/mensal`, { mes, ano });
      const response = await axios.get(`${API_URL}/caixa/mensal`, {
        params: { mes, ano }
      });
      console.log('[caixaService] response', response.status, response.config?.url);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter caixa mensal:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        url: (error as any)?.config?.url
      });
      throw error;
    }
  },

  // Criar nova entrada
  async createEntrada(entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>): Promise<EntradaCaixa> {
    try {
      const response = await axios.post(`${API_URL}/caixa/entradas`, entrada);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar entrada de caixa:', error);
      throw error;
    }
  },

  // Atualizar entrada
  async updateEntrada(id: number, entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>): Promise<EntradaCaixa> {
    try {
      const response = await axios.put(`${API_URL}/caixa/entradas/${id}`, entrada);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar entrada de caixa:', error);
      throw error;
    }
  },

  // Deletar entrada
  async deleteEntrada(id: number) {
    try {
      await axios.delete(`${API_URL}/caixa/entradas/${id}`);
    } catch (error) {
      console.error('Erro ao deletar entrada de caixa:', error);
      throw error;
    }
  }
};
