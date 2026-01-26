import { Request, Response } from 'express';
import { database } from '../database/database';
import { EntradaCaixa, CaixaMensal } from '../models/Despesa';
import { io } from '../server';

export class CaixaController {
  // Criar entrada de caixa
  async createEntrada(req: Request, res: Response): Promise<void> {
    try {
      const entrada: EntradaCaixa = req.body;

      // Validações
      if (!entrada.valor || entrada.valor <= 0) {
        res.status(400).json({ error: 'Valor deve ser maior que zero' });
        return;
      }

      if (!entrada.data) {
        res.status(400).json({ error: 'Data é obrigatória' });
        return;
      }

      if (!entrada.descricao || entrada.descricao.trim() === '') {
        res.status(400).json({ error: 'Descrição é obrigatória' });
        return;
      }

      // Extrair mês e ano da data
      const dataObj = new Date(entrada.data);
      const mes = dataObj.getMonth() + 1;
      const ano = dataObj.getFullYear();

      const sql = `
        INSERT INTO entradas_caixa (valor, data, descricao, mes, ano)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await database.run(sql, [
        entrada.valor,
        entrada.data,
        entrada.descricao,
        mes,
        ano
      ]);

      const novaEntrada = await database.get(
        'SELECT * FROM entradas_caixa WHERE id = ?',
        [result.lastID]
      );

      // 🔔 Emitir evento para todos os clientes conectados
      io.emit('entrada:criada', novaEntrada);

      res.status(201).json(novaEntrada);
    } catch (error) {
      console.error('Erro ao criar entrada de caixa:', error);
      res.status(500).json({ error: 'Erro ao criar entrada de caixa' });
    }
  }

  // Listar entradas de caixa
  async listEntradas(req: Request, res: Response): Promise<void> {
    try {
      const { mes, ano } = req.query;

      let sql = 'SELECT * FROM entradas_caixa WHERE 1=1';
      const params: any[] = [];

      if (mes) {
        sql += ' AND mes = ?';
        params.push(Number(mes));
      }

      if (ano) {
        sql += ' AND ano = ?';
        params.push(Number(ano));
      }

      sql += ' ORDER BY data DESC, id DESC';

      const entradas = await database.all(sql, params);
      res.json(entradas);
    } catch (error) {
      console.error('Erro ao listar entradas:', error);
      res.status(500).json({ error: 'Erro ao listar entradas' });
    }
  }

  // Obter caixa mensal completo
  async getCaixaMensal(req: Request, res: Response): Promise<void> {
    try {
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        res.status(400).json({ error: 'Mês e ano são obrigatórios' });
        return;
      }

      const mesNum = Number(mes);
      const anoNum = Number(ano);

      // Buscar entradas do mês
      const entradas = await database.all(
        'SELECT * FROM entradas_caixa WHERE mes = ? AND ano = ? ORDER BY data DESC',
        [mesNum, anoNum]
      );

      // Calcular total de entradas
      const totalEntradas = entradas.reduce((sum: number, e: EntradaCaixa) => sum + e.valor, 0);

      // Buscar despesas pagas em dinheiro do mês
      const despesasDinheiro = await database.all(
        `SELECT * FROM despesas 
         WHERE strftime("%m", data) = ? 
         AND strftime("%Y", data) = ?
         AND formaPagamento = 'DINHEIRO'
         AND statusPagamento = 'PAGA'`,
        [String(mesNum).padStart(2, '0'), String(anoNum)]
      );

      // Calcular total de saídas (apenas dinheiro)
      const totalSaidas = despesasDinheiro.reduce((sum: number, d: any) => sum + d.valor, 0);

      // Calcular saldo
      const saldo = totalEntradas - totalSaidas;

      const caixa: CaixaMensal = {
        mes: mesNum,
        ano: anoNum,
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo: saldo,
        entradasDetalhadas: entradas as EntradaCaixa[]
      };

      res.json(caixa);
    } catch (error) {
      console.error('Erro ao obter caixa mensal:', error);
      res.status(500).json({ error: 'Erro ao obter caixa mensal' });
    }
  }

  // Atualizar entrada
  async updateEntrada(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const entrada: EntradaCaixa = req.body;

      const existe = await database.get('SELECT id FROM entradas_caixa WHERE id = ?', [id]);
      if (!existe) {
        res.status(404).json({ error: 'Entrada não encontrada' });
        return;
      }

      const dataObj = new Date(entrada.data);
      const mes = dataObj.getMonth() + 1;
      const ano = dataObj.getFullYear();

      const sql = `
        UPDATE entradas_caixa 
        SET valor = ?, data = ?, descricao = ?, mes = ?, ano = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await database.run(sql, [
        entrada.valor,
        entrada.data,
        entrada.descricao,
        mes,
        ano,
        id
      ]);

      const entradaAtualizada = await database.get(
        'SELECT * FROM entradas_caixa WHERE id = ?',
        [id]
      );

      // 🔔 Emitir evento para todos os clientes conectados
      io.emit('entrada:atualizada', entradaAtualizada);

      res.json(entradaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar entrada:', error);
      res.status(500).json({ error: 'Erro ao atualizar entrada' });
    }
  }

  // Excluir entrada
  async deleteEntrada(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existe = await database.get('SELECT id FROM entradas_caixa WHERE id = ?', [id]);
      if (!existe) {
        res.status(404).json({ error: 'Entrada não encontrada' });
        return;
      }

      await database.run('DELETE FROM entradas_caixa WHERE id = ?', [id]);
      
      // 🔔 Emitir evento para todos os clientes conectados
      io.emit('entrada:deletada', { id: parseInt(id) });
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      res.status(500).json({ error: 'Erro ao excluir entrada' });
    }
  }
}

