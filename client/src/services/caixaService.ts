import { supabase } from './supabase';
import { EntradaCaixa, CaixaMensal } from '../types/Despesa';

export const caixaService = {
  // Map client -> DB column names for entradas_caixa
  _toDb(obj: any) {
    const map: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      user_id: 'user_id'
    };
    const out: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (map[key]) out[map[key]] = val;
      else if (key.includes('_')) out[key] = val;
      else out[key.toLowerCase()] = val;
    }
    return out;
  },

  // Map DB -> client field names
  _toClient(obj: any) {
    const map: Record<string, string> = {
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      user_id: 'userId'
    };
    const out: any = {};
    for (const key of Object.keys(obj || {})) {
      const val = obj[key];
      if (map[key]) out[map[key]] = val;
      else if (key.includes('_')) out[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = val;
      else out[key] = val;
    }
    return out;
  },
  // Listar entradas de um período
  async listEntradas(mes: number, ano: number) {
    try {
      const { data, error } = await supabase
        .from('entradas_caixa')
        .select('*')
        .gte('data', `${ano}-${String(mes).padStart(2, '0')}-01`)
        .lt('data', mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`)
        .order('data', { ascending: false });

      if (error) throw error;
      return (data as any[]).map(this._toClient) as EntradaCaixa[];
    } catch (error) {
      console.error('Erro ao listar entradas de caixa:', error);
      throw error;
    }
  },

  // Criar nova entrada
  async createEntrada(entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      // Extrair mês e ano da data
      const tipo = (entrada as any).tipo ?? 'ENTRADA';
      const banco = (entrada as any).banco ?? 'Caixa';
      const payload = this._toDb({ ...entrada, tipo, banco, user_id: user.id });

      const { error } = await supabase
        .from('entradas_caixa')
        .insert([payload]);

      if (error) throw error;
      return;
    } catch (error) {
      console.error('Erro ao criar entrada de caixa:', error);
      throw error;
    }
  },

  // Atualizar entrada
  async updateEntrada(id: number, entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>) {
    try {
      // Extrair mês e ano da data
      const tipo = (entrada as any).tipo ?? 'ENTRADA';
      const banco = (entrada as any).banco ?? 'Caixa';
      const payload = this._toDb({ ...entrada, tipo, banco });

      const { error } = await supabase
        .from('entradas_caixa')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (error) {
      console.error('Erro ao atualizar entrada de caixa:', error);
      throw error;
    }
  },

  // Deletar entrada
  async deleteEntrada(id: number) {
    try {
      const { error } = await supabase
        .from('entradas_caixa')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar entrada de caixa:', error);
      throw error;
    }
  },

  // Obter caixa mensal (resumo)
  async getCaixaMensal(mes: number, ano: number): Promise<CaixaMensal> {
    try {
      // Buscar entradas de caixa do período
      const { data: entradasData, error: errEntradas } = await supabase
        .from('entradas_caixa')
        .select('*')
        .gte('data', `${ano}-${String(mes).padStart(2, '0')}-01`)
        .lt('data', mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`);

      if (errEntradas) throw errEntradas;

      const entradas = ((entradasData as any[]) || []).map(this._toClient) as EntradaCaixa[];
      const somaEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);

      // Buscar despesas pagas (saídas) do mesmo período
      const { data: despesasData, error: errDespesas } = await supabase
        .from('despesas')
        .select('valor, statuspagamento')
        .gte('data', `${ano}-${String(mes).padStart(2, '0')}-01`)
        .lt('data', mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`);

      if (errDespesas) throw errDespesas;

      const despesas = (despesasData as any[]) || [];
      const somaSaidas = despesas
        .filter(d => (d.statuspagamento === 'PAGA' || d.statuspagamento === 'PAGA'))
        .reduce((sum, d) => sum + (d.valor || 0), 0);

      const saldo = somaEntradas - somaSaidas;

      return {
        mes,
        ano,
        entradas: somaEntradas,
        saidas: somaSaidas,
        saldo,
        entradasDetalhadas: entradas
      };
    } catch (error) {
      console.error('Erro ao obter caixa mensal:', error);
      throw error;
    }
  }
};
