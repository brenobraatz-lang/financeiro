import { supabase } from './supabase';
import ExcelJS from 'exceljs';

interface DespesaExport {
  id: number;
  valor: number;
  data: string;
  descricao: string;
  tipoDespesa: string;
  subcategoria?: string;
  empresa: string;
  statusPagamento: string;
  formaPagamento: string;
  banco?: string;
  usuário?: string;
  createdAt: string;
}

interface CaixaExport {
  id: number;
  valor: number;
  data: string;
  descricao: string;
  tipo: string;
  banco: string;
  usuario?: string;
  createdAt: string;
}

export const backupService = {
  // Exportar dados em Excel
  async exportToExcel(despesas: DespesaExport[], caixa: CaixaExport[]) {
    const workbook = new ExcelJS.Workbook();

    // Planilha de Despesas
    const despesasSheet = workbook.addWorksheet('Despesas');
    despesasSheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Data', key: 'data', width: 12 },
      { header: 'Descrição', key: 'descricao', width: 25 },
      { header: 'Valor', key: 'valor', width: 12 },
      { header: 'Tipo', key: 'tipoDespesa', width: 15 },
      { header: 'Subcategoria', key: 'subcategoria', width: 15 },
      { header: 'Empresa', key: 'empresa', width: 15 },
      { header: 'Status Pagamento', key: 'statusPagamento', width: 15 },
      { header: 'Forma Pagamento', key: 'formaPagamento', width: 15 },
      { header: 'Banco', key: 'banco', width: 15 },
      { header: 'Criado em', key: 'createdAt', width: 15 },
    ];

    despesasSheet.addRows(despesas);
    despesasSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    (despesasSheet.getRow(1).fill as any) = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Planilha de Caixa
    const caixaSheet = workbook.addWorksheet('Caixa');
    caixaSheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Data', key: 'data', width: 12 },
      { header: 'Descrição', key: 'descricao', width: 25 },
      { header: 'Valor', key: 'valor', width: 12 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Banco', key: 'banco', width: 15 },
      { header: 'Criado em', key: 'createdAt', width: 15 },
    ];

    caixaSheet.addRows(caixa);
    caixaSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    (caixaSheet.getRow(1).fill as any) = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };

    // Gerar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    // Download
    const timestamp = new Date().toISOString().slice(0, 7).replace('-', '_');
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_financeiro_${timestamp}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Exportar como CSV
  async exportToCsv(despesas: DespesaExport[], caixa: CaixaExport[]) {
    const timestamp = new Date().toISOString().slice(0, 7).replace('-', '_');

    // CSV de Despesas
    const despesasHeaders = ['ID', 'Data', 'Descrição', 'Valor', 'Tipo', 'Subcategoria', 'Empresa', 'Status', 'Forma Pagamento', 'Banco', 'Criado em'];
    const despesasRows = despesas.map(d => [
      d.id,
      d.data,
      d.descricao,
      d.valor,
      d.tipoDespesa,
      d.subcategoria || '',
      d.empresa,
      d.statusPagamento,
      d.formaPagamento,
      d.banco || '',
      d.createdAt,
    ]);

    const despesasCsv = [
      despesasHeaders.join(','),
      ...despesasRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // CSV de Caixa
    const caixaHeaders = ['ID', 'Data', 'Descrição', 'Valor', 'Tipo', 'Banco', 'Criado em'];
    const caixaRows = caixa.map(c => [
      c.id,
      c.data,
      c.descricao,
      c.valor,
      c.tipo,
      c.banco,
      c.createdAt,
    ]);

    const caixaCsv = [
      caixaHeaders.join(','),
      ...caixaRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download Despesas
    backupService.downloadFile(despesasCsv, `backup_despesas_${timestamp}.csv`, 'text/csv');

    // Download Caixa
    backupService.downloadFile(caixaCsv, `backup_caixa_${timestamp}.csv`, 'text/csv');
  },

  // Exportar como JSON
  async exportToJson(despesas: DespesaExport[], caixa: CaixaExport[]) {
    const timestamp = new Date().toISOString().slice(0, 7).replace('-', '_');
    const backup = {
      dataBkp: new Date().toISOString(),
      despesas,
      caixa,
    };

    const json = JSON.stringify(backup, null, 2);
    backupService.downloadFile(json, `backup_financeiro_${timestamp}.json`, 'application/json');
  },

  // Função auxiliar para download
  downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Buscar dados para backup (com conversão de snake_case para camelCase)
  async fetchBackupData() {
    try {
      const [despesasResult, caixaResult] = await Promise.all([
        supabase.from('despesas').select('*'),
        supabase.from('entradas_caixa').select('*'),
      ]);

      if (despesasResult.error) throw despesasResult.error;
      if (caixaResult.error) throw caixaResult.error;

      // Map despesas from DB snake_case to camelCase
      const despesas = (despesasResult.data || []).map((d: any) => ({
        id: d.id,
        valor: d.valor,
        data: d.data,
        descricao: d.descricao,
        tipoDespesa: d.tipodespesa || d.tipo_despesa,
        subcategoria: d.subcategoria,
        empresa: d.empresa,
        statusPagamento: d.statuspagamento || d.status_pagamento,
        formaPagamento: d.formapagamento || d.forma_pagamento,
        banco: d.banco,
        createdAt: d.created_at || d.createdAt,
      })) as DespesaExport[];

      // Map caixa from DB snake_case to camelCase
      const caixa = (caixaResult.data || []).map((c: any) => ({
        id: c.id,
        valor: c.valor,
        data: c.data,
        descricao: c.descricao,
        tipo: c.tipo,
        banco: c.banco,
        createdAt: c.created_at || c.createdAt,
      })) as CaixaExport[];

      return { despesas, caixa };
    } catch (error) {
      console.error('Erro ao buscar dados para backup:', error);
      throw error;
    }
  },

  // Deletar dados antigos (manter apenas últimos meses)
  async deleteOldData(monthsToKeep: number = 12) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const [despesasResult, caixaResult] = await Promise.all([
        supabase
          .from('despesas')
          .delete()
          .lt('data', cutoffDateStr),
        supabase
          .from('entradas_caixa')
          .delete()
          .lt('data', cutoffDateStr),
      ]);

      if (despesasResult.error) throw despesasResult.error;
      if (caixaResult.error) throw caixaResult.error;

      return {
        deletedDespesas: despesasResult.count || 0,
        deletedCaixa: caixaResult.count || 0,
      };
    } catch (error) {
      console.error('Erro ao deletar dados antigos:', error);
      throw error;
    }
  },
};
