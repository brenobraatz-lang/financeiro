import { supabase } from './supabase';
import { Despesa } from '../types/Despesa';

export const despesasService = {
  // Helper: convert camelCase keys to snake_case for DB
  _toDb(obj: any) {
    const map: Record<string, string> = {
      tipoDespesa: 'tipodespesa',
      statusPagamento: 'statuspagamento',
      formaPagamento: 'formapagamento',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      user_id: 'user_id'
    };
    const out: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (map[key]) {
        out[map[key]] = val;
      } else if (key.includes('_')) {
        out[key] = val;
      } else {
        // default: lowercase whole key (handles columns created without quotes)
        out[key.toLowerCase()] = val;
      }
    }
    return out;
  },

  // Helper: convert snake_case keys from DB to camelCase for the client
  _toClient(obj: any) {
    const map: Record<string, string> = {
      tipodespesa: 'tipoDespesa',
      statuspagamento: 'statusPagamento',
      formapagamento: 'formaPagamento',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      user_id: 'userId'
    };
    const out: any = {};
    for (const key of Object.keys(obj || {})) {
      const val = obj[key];
      if (map[key]) {
        out[map[key]] = val;
      } else if (key.includes('_')) {
        const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        out[camel] = val;
      } else {
        // if key is concatenated lowercase (e.g. 'tipodespesa'), try to map by camel-casing known pattern
        const guessed = key.replace(/([a-z])([A-Z])/g, '$1$2');
        out[guessed] = val;
      }
    }
    return out;
  },

  // Listar todas as despesas do usuário
  async list() {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      return (data as any[]).map(this._toClient) as Despesa[];
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      throw error;
    }
  },

  // Criar nova despesa
  async create(despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Usuário não autenticado');

      const payload = this._toDb({ ...despesa, user_id: user.id });

      const { error } = await supabase
        .from('despesas')
        .insert([payload]);

      if (error) throw error;
      return;
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  },

  // Atualizar despesa existente
  async update(id: number, despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const payload = this._toDb({ ...despesa, updated_at: new Date().toISOString() });

      const { error } = await supabase
        .from('despesas')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  },

  // Deletar despesa
  async delete(id: number) {
    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  },

  // Obter relatório mensal
  async relatorioMensal(mes: number, ano: number) {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .gte('data', `${ano}-${String(mes).padStart(2, '0')}-01`)
        .lt('data', mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`);

      if (error) throw error;

      const despesas = (data as any[]).map(this._toClient) as Despesa[];
      const relatorio = {
        mes,
        ano,
        despesas,
        total: despesas.reduce((sum, d) => sum + d.valor, 0),
        porStatus: {} as any,
        porTipo: {} as any,
      };

      return relatorio;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  },

  // Obter opções para filtros
  async getOpcoesFiltros() {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('banco, tipo_despesa')
        .neq('banco', null);

      if (error) throw error;

      const mapped = (data as any[]).map(this._toClient) as any[];
      const bancos = [...new Set(mapped.map((d: any) => d.banco).filter(Boolean))];
      const tiposDespesa = [...new Set(mapped.map((d: any) => d.tipoDespesa).filter(Boolean))];

      return { bancos, tiposDespesa };
    } catch (error) {
      console.error('Erro ao obter opções de filtros:', error);
      throw error;
    }
  }
};
