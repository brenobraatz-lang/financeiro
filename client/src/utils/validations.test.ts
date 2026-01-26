import { describe, it, expect } from 'vitest';
import { validarDespesa, validarEntrada } from '../utils/validations';

describe('Validações', () => {
  describe('validarDespesa', () => {
    it('deve retornar erro se data estiver vazia', () => {
      const despesa = {
        descricao: 'Test',
        valor: 100,
        tipoDespesa: 'ALUGUEL',
        empresa: 'PF',
        banco: 'Caixa',
        formaPagamento: 'DINHEIRO',
        statusPagamento: 'PAGA'
      };
      const erros = validarDespesa(despesa);
      expect(erros.some(e => e.campo === 'data')).toBe(true);
    });

    it('deve retornar erro se descricao estiver vazia', () => {
      const despesa = {
        data: '2024-01-01',
        descricao: '',
        valor: 100,
        tipoDespesa: 'ALUGUEL',
        empresa: 'PF',
        banco: 'Caixa',
        formaPagamento: 'DINHEIRO',
        statusPagamento: 'PAGA'
      };
      const erros = validarDespesa(despesa);
      expect(erros.some(e => e.campo === 'descricao')).toBe(true);
    });

    it('deve retornar erro se valor for inválido', () => {
      const despesa = {
        data: '2024-01-01',
        descricao: 'Test',
        valor: -100,
        tipoDespesa: 'ALUGUEL',
        empresa: 'PF',
        banco: 'Caixa',
        formaPagamento: 'DINHEIRO',
        statusPagamento: 'PAGA'
      };
      const erros = validarDespesa(despesa);
      expect(erros.some(e => e.campo === 'valor')).toBe(true);
    });

    it('deve retornar sem erros para despesa válida', () => {
      const despesa = {
        data: '2024-01-01',
        descricao: 'Test',
        valor: 100,
        tipoDespesa: 'ALUGUEL',
        empresa: 'PF',
        banco: 'Caixa',
        formaPagamento: 'DINHEIRO',
        statusPagamento: 'PAGA'
      };
      const erros = validarDespesa(despesa);
      expect(erros.length).toBe(0);
    });
  });

  describe('validarEntrada', () => {
    it('deve retornar erro se data estiver vazia', () => {
      const entrada = {
        descricao: 'Test',
        valor: 100
      };
      const erros = validarEntrada(entrada);
      expect(erros.some(e => e.campo === 'data')).toBe(true);
    });

    it('deve retornar erro se valor for inválido', () => {
      const entrada = {
        data: '2024-01-01',
        descricao: 'Test',
        valor: 0
      };
      const erros = validarEntrada(entrada);
      expect(erros.some(e => e.campo === 'valor')).toBe(true);
    });

    it('deve retornar sem erros para entrada válida', () => {
      const entrada = {
        data: '2024-01-01',
        descricao: 'Test',
        valor: 100
      };
      const erros = validarEntrada(entrada);
      expect(erros.length).toBe(0);
    });
  });
});
