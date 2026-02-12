import { supabase } from './supabase';
import { EntradaCaixa, CaixaMensal } from '../types/Despesa';

export const caixaServiceSupabase = {
  // Criar entrada de caixa
  createEntrada: async (entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>): Promise<EntradaCaixa> => {
    try {
      // Calcular mês e ano a partir da data
      const dataObj = new Date(entrada.data);
      const mes = dataObj.getMonth() + 1;
      const ano = dataObj.getFullYear();

      const { data, error } = await supabase
        .from('entradas_caixa')
        .insert([{ ...entrada, mes, ano }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Entrada de caixa criada:', data);
      return data as EntradaCaixa;
    } catch (error) {
      console.error('❌ Falha ao criar entrada de caixa:', error);
      throw error;
    }
  },

  // Listar entradas
  listEntradas: async (mes?: number, ano?: number): Promise<EntradaCaixa[]> => {
    try {
      let query = supabase.from('entradas_caixa').select('*');

      if (mes !== undefined && ano !== undefined) {
        query = query.eq('mes', mes).eq('ano', ano);
      }

      const { data, error } = await query.order('data', { ascending: false });

      if (error) throw error;
      return (data as EntradaCaixa[]) || [];
    } catch (error) {
      console.error('❌ Falha ao listar entradas de caixa:', error);
      throw error;
    }
  },

  // Obter caixa mensal (somatório de entradas)
  getCaixaMensal: async (mes: number, ano: number): Promise<CaixaMensal> => {
    try {
      const { data, error } = await supabase
        .from('entradas_caixa')
        .select('valor')
        .eq('mes', mes)
        .eq('ano', ano);

      if (error) throw error;

      const totalEntradas = (data || []).reduce((sum, item) => sum + (item.valor || 0), 0);

      const caixaMensal: CaixaMensal = {
        mes,
        ano,
        totalDespesas: 0, // Se precisar, integre com despesas do Supabase
        totalEntradas,
        saldo: totalEntradas
      };

      return caixaMensal;
    } catch (error) {
      console.error('❌ Falha ao obter caixa mensal:', error);
      throw error;
    }
  },

  // Atualizar entrada
  updateEntrada: async (id: number, entrada: Partial<EntradaCaixa>): Promise<EntradaCaixa> => {
    try {
      // Se data foi alterada, recalcular mês/ano
      const updateData = { ...entrada };
      if (entrada.data) {
        const dataObj = new Date(entrada.data);
        updateData.mes = dataObj.getMonth() + 1;
        updateData.ano = dataObj.getFullYear();
      }

      const { data, error } = await supabase
        .from('entradas_caixa')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Entrada de caixa atualizada:', data);
      return data as EntradaCaixa;
    } catch (error) {
      console.error('❌ Falha ao atualizar entrada de caixa:', error);
      throw error;
    }
  },

  // Excluir entrada
  deleteEntrada: async (id: number): Promise<void> => {
    try {
      const { error } = await supabase.from('entradas_caixa').delete().eq('id', id);

      if (error) throw error;
      console.log('✅ Entrada de caixa excluída:', id);
    } catch (error) {
      console.error('❌ Falha ao excluir entrada de caixa:', error);
      throw error;
    }
  }
};
