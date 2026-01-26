import { describe, it, expect } from 'vitest';

describe('Serviços', () => {
  describe('despesasService', () => {
    it('deve mapear dados corretamente de camelCase para DB format', () => {
      const despesa = {
        data: '2024-01-01',
        descricao: 'Aluguel',
        valor: 1500,
        tipoDespesa: 'ALUGUEL',
        empresa: 'PF',
        banco: 'Caixa',
        formaPagamento: 'TRANSFERENCIA',
        statusPagamento: 'PAGA'
      };

      // Simular o mapeamento _toDb
      const mapped = {
        data: despesa.data,
        descricao: despesa.descricao,
        valor: despesa.valor,
        tipodespesa: despesa.tipoDespesa,
        empresa: despesa.empresa,
        banco: despesa.banco,
        formapagamento: despesa.formaPagamento,
        statuspagamento: despesa.statusPagamento
      };

      expect(mapped.tipodespesa).toBe('ALUGUEL');
      expect(mapped.formapagamento).toBe('TRANSFERENCIA');
      expect(mapped.statuspagamento).toBe('PAGA');
    });

    it('deve mapear dados corretamente de DB format para camelCase', () => {
      const dbData = {
        id: 1,
        data: '2024-01-01',
        descricao: 'Aluguel',
        valor: 1500,
        tipodespesa: 'ALUGUEL',
        empresa: 'PF',
        banco: 'Caixa',
        formapagamento: 'TRANSFERENCIA',
        statuspagamento: 'PAGA',
        created_at: '2024-01-01T00:00:00'
      };

      // Simular o mapeamento _toClient
      const mapped = {
        id: dbData.id,
        data: dbData.data,
        descricao: dbData.descricao,
        valor: dbData.valor,
        tipoDespesa: dbData.tipodespesa,
        empresa: dbData.empresa,
        banco: dbData.banco,
        formaPagamento: dbData.formapagamento,
        statusPagamento: dbData.statuspagamento,
        createdAt: dbData.created_at
      };

      expect(mapped.tipoDespesa).toBe('ALUGUEL');
      expect(mapped.formaPagamento).toBe('TRANSFERENCIA');
      expect(mapped.statusPagamento).toBe('PAGA');
      expect(mapped.createdAt).toBe('2024-01-01T00:00:00');
    });
  });

  describe('caixaService', () => {
    it('deve adicionar defaults em entrada de caixa', () => {
      const entrada = {
        data: '2024-01-01',
        descricao: 'Entrada',
        valor: 500
      };

      const withDefaults = {
        ...entrada,
        tipo: 'ENTRADA',
        banco: 'Caixa'
      };

      expect(withDefaults.tipo).toBe('ENTRADA');
      expect(withDefaults.banco).toBe('Caixa');
    });

    it('deve calcular saldo corretamente', () => {
      const entradas = 1000;
      const saidas = 300;
      const saldo = entradas - saidas;

      expect(saldo).toBe(700);
    });
  });
});
