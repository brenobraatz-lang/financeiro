import { Request, Response } from 'express';
import { database } from '../database/database';
import { Despesa, FiltroDespesa, RelatorioMensal, TipoEmpresa } from '../models/Despesa';
import { io } from '../server';

export class DespesaController {
  // Criar nova despesa
  async create(req: Request, res: Response): Promise<void> {
    try {
      const despesa: Despesa = req.body;
      console.log('📝 Recebido payload create despesa:', JSON.stringify(despesa));

      // Validações
      if (!despesa.valor || despesa.valor <= 0) {
        console.warn('⚠️ Validação falhou: valor inválido');
        res.status(400).json({ error: 'Valor deve ser maior que zero' });
        return;
      }

      if (!despesa.data) {
        console.warn('⚠️ Validação falhou: data não informada');
        res.status(400).json({ error: 'Data de vencimento é obrigatória' });
        return;
      }

      if (!despesa.descricao || despesa.descricao.trim() === '') {
        console.warn('⚠️ Validação falhou: descrição vazia');
        res.status(400).json({ error: 'Descrição é obrigatória' });
        return;
      }

      // Se for IMOVEIS, subcategoria é obrigatória
      if (despesa.tipoDespesa === 'IMOVEIS' && !despesa.subcategoria) {
        console.warn('⚠️ Validação falhou: subcategoria obrigatória para IMOVEIS');
        res.status(400).json({ error: 'Subcategoria é obrigatória para despesas de Imóveis' });
        return;
      }

      const sql = `
        INSERT INTO despesas (valor, data, descricao, tipoDespesa, subcategoria, empresa, statusPagamento, formaPagamento, banco)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      console.log('🔧 Executando INSERT com valores:', [
        despesa.valor,
        despesa.data,
        despesa.descricao,
        despesa.tipoDespesa,
        despesa.subcategoria || null,
        despesa.empresa,
        despesa.statusPagamento,
        despesa.formaPagamento,
        despesa.banco || null
      ]);

      const result = await database.run(sql, [
        despesa.valor,
        despesa.data,
        despesa.descricao,
        despesa.tipoDespesa,
        despesa.subcategoria || null,
        despesa.empresa,
        despesa.statusPagamento,
        despesa.formaPagamento,
        despesa.banco || null
      ]);

      console.log('💾 Inserção realizada, lastID:', result.lastID);

      const novaDespesa = await database.get(
        'SELECT * FROM despesas WHERE id = ?',
        [result.lastID]
      );

      console.log('✅ Despesa criada com sucesso:', novaDespesa);
      
      // 🔔 Emitir evento para todos os clientes conectados
      io.emit('despesa:criada', novaDespesa);
      
      res.status(201).json(novaDespesa);
    } catch (error) {
      console.error('❌ Erro ao criar despesa:', error);
      // Retornar detalhes para facilitar debug no frontend (não muito verboso)
      res.status(500).json({ error: 'Erro ao criar despesa', details: String(error) });
    }
  }

  // Listar todas as despesas (com filtros opcionais)
  async list(req: Request, res: Response): Promise<void> {
    try {
      const filtros: FiltroDespesa = req.query as any;
      let sql = 'SELECT * FROM despesas WHERE 1=1';
      const params: any[] = [];

      console.log('🔍 Filtros recebidos:', filtros);

      // Aplicar filtros de data
      if (filtros.mes) {
        sql += ' AND strftime("%m", data) = ?';
        params.push(String(filtros.mes).padStart(2, '0'));
      }

      if (filtros.ano) {
        sql += ' AND strftime("%Y", data) = ?';
        params.push(String(filtros.ano));
      }

      if (filtros.empresa) {
        sql += ' AND empresa = ?';
        params.push(filtros.empresa);
      }

      if (filtros.tipoDespesa) {
        console.log('📌 Filtro tipoDespesa aplicado:', filtros.tipoDespesa);
        sql += ' AND tipoDespesa = ?';
        params.push(filtros.tipoDespesa);
      }

      if (filtros.banco) {
        sql += ' AND banco = ?';
        params.push(filtros.banco);
      }

      if (filtros.formaPagamento) {
        sql += ' AND formaPagamento = ?';
        params.push(filtros.formaPagamento);
      }

      if (filtros.statusPagamento) {
        sql += ' AND statusPagamento = ?';
        params.push(filtros.statusPagamento);
      }

      sql += ' ORDER BY data DESC, id DESC';

      const despesas = await database.all(sql, params);
      res.json(despesas);
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      res.status(500).json({ error: 'Erro ao listar despesas' });
    }
  }

  // Obter despesa por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const despesa = await database.get('SELECT * FROM despesas WHERE id = ?', [id]);

      if (!despesa) {
        res.status(404).json({ error: 'Despesa não encontrada' });
        return;
      }

      res.json(despesa);
    } catch (error) {
      console.error('Erro ao obter despesa:', error);
      res.status(500).json({ error: 'Erro ao obter despesa' });
    }
  }

  // Atualizar despesa
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const despesa: Despesa = req.body;

      // Verificar se existe
      const existe = await database.get('SELECT id FROM despesas WHERE id = ?', [id]);
      if (!existe) {
        res.status(404).json({ error: 'Despesa não encontrada' });
        return;
      }

      const sql = `
        UPDATE despesas 
        SET valor = ?, data = ?, descricao = ?, tipoDespesa = ?, 
            empresa = ?, statusPagamento = ?, formaPagamento = ?, banco = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await database.run(sql, [
        despesa.valor,
        despesa.data,
        despesa.descricao,
        despesa.tipoDespesa,
        despesa.empresa,
        despesa.statusPagamento,
        despesa.formaPagamento,
        despesa.banco || null,
        id
      ]);

      const despesaAtualizada = await database.get(
        'SELECT * FROM despesas WHERE id = ?',
        [id]
      );

      // 🔔 Emitir evento para todos os clientes conectados
      io.emit('despesa:atualizada', despesaAtualizada);

      res.json(despesaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      res.status(500).json({ error: 'Erro ao atualizar despesa' });
    }
  }

  // Excluir despesa
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existe = await database.get('SELECT id FROM despesas WHERE id = ?', [id]);
      if (!existe) {
        res.status(404).json({ error: 'Despesa não encontrada' });
        return;
      }

      await database.run('DELETE FROM despesas WHERE id = ?', [id]);
      
      // 🔔 Emitir evento para todos os clientes conectados
      io.emit('despesa:deletada', { id: parseInt(id) });
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      res.status(500).json({ error: 'Erro ao excluir despesa' });
    }
  }

  // Gerar relatório mensal
  async relatorioMensal(req: Request, res: Response): Promise<void> {
    try {
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        res.status(400).json({ error: 'Mês e ano são obrigatórios' });
        return;
      }

      const mesStr = String(mes).padStart(2, '0');
      const anoStr = String(ano);

      // Buscar todas as despesas do mês
      const despesas = await database.all(
        `SELECT * FROM despesas 
         WHERE strftime("%m", data) = ? AND strftime("%Y", data) = ?`,
        [mesStr, anoStr]
      );

      // Calcular totais
      const relatorio: RelatorioMensal = {
        mes: Number(mes),
        ano: Number(ano),
        totalGeral: 0,
        totalPessoaFisica: 0,
        totalPessoaJuridica: 0,
        quantidadePessoaFisica: 0,
        quantidadePessoaJuridica: 0,
        quantidadeDinheiro: 0,
        despesasPorTipo: {},
        totalDinheiro: 0
      };

      despesas.forEach((despesa: Despesa) => {
        const valor = despesa.valor;
        relatorio.totalGeral += valor;

        if (despesa.empresa === TipoEmpresa.PESSOA_FISICA) {
          relatorio.totalPessoaFisica += valor;
          relatorio.quantidadePessoaFisica++;
        } else if (despesa.empresa === TipoEmpresa.PESSOA_JURIDICA) {
          relatorio.totalPessoaJuridica += valor;
          relatorio.quantidadePessoaJuridica++;
        }

        // Contar por tipo de despesa
        if (relatorio.despesasPorTipo[despesa.tipoDespesa]) {
          relatorio.despesasPorTipo[despesa.tipoDespesa] += valor;
        } else {
          relatorio.despesasPorTipo[despesa.tipoDespesa] = valor;
        }

        // Calcular total em dinheiro (apenas despesas pagas em dinheiro)
        if (despesa.formaPagamento === 'DINHEIRO' && despesa.statusPagamento === 'PAGA') {
          relatorio.totalDinheiro += valor;
          relatorio.quantidadeDinheiro++;
        }
      });

      res.json(relatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  // Obter opções para filtros (bancos, tipos de despesa)
  async getOpcoesFiltros(req: Request, res: Response): Promise<void> {
    try {
      const tiposDespesa = await database.all(
        'SELECT DISTINCT tipoDespesa FROM despesas WHERE tipoDespesa IS NOT NULL AND tipoDespesa != "" ORDER BY tipoDespesa'
      );

      res.json({
        bancos: [
          'Banco do Brasil – Pessoa Física',
          'Banco do Brasil – Pessoa Jurídica',
          'Nubank – Pessoa Física',
          'Nubank – Pessoa Jurídica'
        ],
        tiposDespesa: tiposDespesa.map((t: any) => t.tipoDespesa)
      });
    } catch (error) {
      console.error('Erro ao obter opções de filtros:', error);
      res.status(500).json({ error: 'Erro ao obter opções de filtros' });
    }
  }
}
