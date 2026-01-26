import { supabase } from './supabase';

interface StorageInfo {
  totalUsed: number;
  estimatedLimit: number;
  percentageUsed: number;
  status: 'safe' | 'warning' | 'critical';
}

interface DataArchive {
  type: 'despesa' | 'entrada';
  data: any[];
  archivedAt: string;
}

export const storageService = {
  /**
   * Estima o uso de espaço no Supabase
   * Nota: Supabase free tier = 500MB
   */
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      // Contar registros para estimativa
      const { count: despesasCount } = await supabase
        .from('despesas')
        .select('*', { count: 'exact', head: true });

      const { count: caixaCount } = await supabase
        .from('entradas_caixa')
        .select('*', { count: 'exact', head: true });

      // Estimativa: ~500 bytes por despesa, ~400 bytes por entrada
      const despesasSize = (despesasCount || 0) * 500;
      const caixaSize = (caixaCount || 0) * 400;
      
      // Sistema de arquivos e índices ~50MB
      const overheadSize = 50 * 1024 * 1024;
      
      const totalUsed = despesasSize + caixaSize + overheadSize;
      const estimatedLimit = 500 * 1024 * 1024; // 500MB free tier
      const percentageUsed = (totalUsed / estimatedLimit) * 100;

      let status: 'safe' | 'warning' | 'critical' = 'safe';
      if (percentageUsed > 80) status = 'critical';
      else if (percentageUsed > 60) status = 'warning';

      return {
        totalUsed,
        estimatedLimit,
        percentageUsed,
        status
      };
    } catch (error) {
      console.error('Erro ao calcular espaço:', error);
      throw error;
    }
  },

  /**
   * Sugere itens para arquivamento (dados antigos)
   */
  async getSuggestedArchiveData(): Promise<{
    despesasAntigas: any[];
    entradasAntigas: any[];
  }> {
    try {
      const tresAnosAtras = new Date();
      tresAnosAtras.setFullYear(tresAnosAtras.getFullYear() - 3);
      const dataLimite = tresAnosAtras.toISOString().split('T')[0];

      // Despesas com mais de 3 anos
      const { data: despesasAntigas } = await supabase
        .from('despesas')
        .select('*')
        .lt('data', dataLimite)
        .order('data', { ascending: true });

      // Entradas com mais de 3 anos
      const { data: entradasAntigas } = await supabase
        .from('entradas_caixa')
        .select('*')
        .lt('data', dataLimite)
        .order('data', { ascending: true });

      return {
        despesasAntigas: despesasAntigas || [],
        entradasAntigas: entradasAntigas || []
      };
    } catch (error) {
      console.error('Erro ao buscar dados antigos:', error);
      throw error;
    }
  },

  /**
   * Arquiva dados antigos (para arquivo local)
   */
  async archiveOldData(beforeDate: string): Promise<DataArchive[]> {
    try {
      const archives: DataArchive[] = [];

      // Buscar despesas antigas
      const { data: despesas } = await supabase
        .from('despesas')
        .select('*')
        .lt('data', beforeDate);

      if (despesas && despesas.length > 0) {
        archives.push({
          type: 'despesa',
          data: despesas,
          archivedAt: new Date().toISOString()
        });
      }

      // Buscar entradas antigas
      const { data: entradas } = await supabase
        .from('entradas_caixa')
        .select('*')
        .lt('data', beforeDate);

      if (entradas && entradas.length > 0) {
        archives.push({
          type: 'entrada',
          data: entradas,
          archivedAt: new Date().toISOString()
        });
      }

      return archives;
    } catch (error) {
      console.error('Erro ao arquivar dados:', error);
      throw error;
    }
  },

  /**
   * Deleta dados antigos (CUIDADO - é irreversível)
   */
  async deleteOldData(beforeDate: string): Promise<{ deleted: number }> {
    if (!confirm('⚠️ ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja deletar todos os dados antes de ' + beforeDate + '?')) {
      return { deleted: 0 };
    }

    try {
      let totalDeleted = 0;

      // Deletar despesas antigas
      const { count: despesasDeleted } = await supabase
        .from('despesas')
        .delete()
        .lt('data', beforeDate);

      totalDeleted += despesasDeleted || 0;

      // Deletar entradas antigas
      const { count: entradasDeleted } = await supabase
        .from('entradas_caixa')
        .delete()
        .lt('data', beforeDate);

      totalDeleted += entradasDeleted || 0;

      return { deleted: totalDeleted };
    } catch (error) {
      console.error('Erro ao deletar dados:', error);
      throw error;
    }
  },

  /**
   * Exporta arquivo JSON comprimido para arquivamento local
   */
  async exportArchiveAsJson(archives: DataArchive[]): Promise<string> {
    const json = JSON.stringify(archives, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arquivo-dados-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return a.download;
  },

  /**
   * Formata bytes para formato legível
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
};
