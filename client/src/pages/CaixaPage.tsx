import { useState, useEffect } from 'react';
import { EntradaCaixa, CaixaMensal } from '../types/Despesa';
import { caixaService, despesaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FormEntradaCaixa from '../components/FormEntradaCaixa';
import FormDespesa from '../components/FormDespesa';
import { socketService } from '../services/socket';
import { pageStyles } from '../styles/pageLayout';

export default function CaixaPage() {
  useAuth();
  const hoje = new Date();
  const [periodo, setPeriodo] = useState<'Mensal' | 'Anual'>('Mensal');
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [entradas, setEntradas] = useState<EntradaCaixa[]>([]);
  void entradas;
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [caixa, setCaixa] = useState<CaixaMensal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntrada, setEditingEntrada] = useState<EntradaCaixa | undefined>();
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<any | undefined>();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const anos = Array.from({ length: 5 }, (_, i) => ano - i);

  useEffect(() => {
    loadDados();

    // Conectar ao WebSocket para sincronização em tempo real
    socketService.connect();
    
    socketService.onEntradaCreated((newEntrada) => {
      setEntradas(prev => [...prev, newEntrada]);
    });

    socketService.onEntradaUpdated((updatedEntrada) => {
      setEntradas(prev => 
        prev.map(e => e.id === updatedEntrada.id ? updatedEntrada : e)
      );
    });

    socketService.onEntradaDeleted((deletedId) => {
      setEntradas(prev => prev.filter(e => e.id !== deletedId));
    });

    return () => {
      socketService.disconnect();
    };
  }, [periodo, mes, ano]);

  const loadDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const mesLeitura = periodo === 'Mensal' ? mes : 1;
      const [entradasData, caixaData] = await Promise.all([
        caixaService.listEntradas(mesLeitura, ano),
        caixaService.getCaixaMensal(mesLeitura, ano)
      ]);
      // Buscar despesas pagas em dinheiro para mostrar como saídas nas movimentações
      // Buscar despesas via o mesmo serviço usado na página de Despesas (Supabase)
      let despesasDinheiro: any[] = [];
      try {
        const todas = await despesasService.list();
        // Filtrar por mês/ano e por DINHEIRO + PAGA
        despesasDinheiro = todas.filter(d => {
          const [anoD, mesD] = d.data.split('-');
          return parseInt(mesD) === mesLeitura && parseInt(anoD) === ano && d.formaPagamento === 'DINHEIRO' && d.statusPagamento === 'PAGA';
        });
      } catch (e) {
        console.warn('Não foi possível buscar despesas via despesasService:', e);
        despesasDinheiro = [];
      }
      
      // Se anual, filtrar por ano
      let entradasFiltradas = entradasData;
      let caixaAcumulado = caixaData;
      
      if (periodo === 'Anual') {
        entradasFiltradas = entradasData.filter(e => {
          const [anoE] = e.data.split('-');
          return parseInt(anoE) === ano;
        });
        // Calcular saldo anual
        const entradaAnual = entradasFiltradas.reduce((sum, e) => sum + e.valor, 0);
        caixaAcumulado = {
          ...caixaData,
          entradas: entradaAnual,
          saldo: entradaAnual - caixaData.saidas
        };
      }
      
      setEntradas(entradasFiltradas);
      // Construir lista de movimentações mesclando entradas (+) e despesas em dinheiro (-)
      const movimentacoesLista: any[] = [];
      entradasFiltradas.forEach(e => movimentacoesLista.push({
        id: `e-${e.id}`,
        data: e.data,
        descricao: e.descricao,
        valor: e.valor,
        tipo: 'entrada'
      }));

      despesasDinheiro.forEach(d => movimentacoesLista.push({
        id: `d-${d.id}`,
        data: d.data,
        descricao: d.descricao,
        valor: -Math.abs(d.valor),
        tipo: 'saida',
        orig: d
      }));

      // Ordenar por data desc, depois id desc
      movimentacoesLista.sort((a, b) => {
        if (a.data === b.data) return (b.id > a.id ? 1 : -1);
        return a.data < b.data ? 1 : -1;
      });

      setMovimentacoes(movimentacoesLista);
      // Atualizar caixa: calcular saídas a partir das despesas em dinheiro carregadas
      const totalSaidasLocal = despesasDinheiro.reduce((s: number, d: any) => s + (Number(d.valor) || 0), 0);
      caixaAcumulado = {
        ...(caixaAcumulado || { mes: mesLeitura, ano, entradas: 0, saidas: 0, saldo: 0, entradasDetalhadas: [] }),
        saidas: Math.abs(totalSaidasLocal),
        saldo: (caixaAcumulado?.entradas || 0) - Math.abs(totalSaidasLocal)
      } as CaixaMensal;

      setCaixa(caixaAcumulado);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(mensagem);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const entradasPaginadas = movimentacoes.slice(indiceInicio, indiceFim);
  const totalPaginas = Math.max(1, Math.ceil(movimentacoes.length / itensPorPagina));

  const handleAddEntrada = async (entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>) => {
    try {
      if (editingEntrada?.id) {
        // Editar
        await caixaService.updateEntrada(editingEntrada.id, entrada);
      } else {
        // Criar
        await caixaService.createEntrada(entrada);
      }
      setShowForm(false);
      setEditingEntrada(undefined);
      loadDados();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao salvar entrada';
      setError(mensagem);
    }
  };

  const handleDeleteEntrada = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta entrada?')) return;
    try {
      await caixaService.deleteEntrada(id);
      loadDados();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao deletar entrada';
      setError(mensagem);
    }
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <div style={pageStyles.wrapper}>
          <h1 style={pageStyles.title}>Gerenciamento de Caixa</h1>
        </div>
      </div>

      <div style={pageStyles.wrapper}>
        {/* Filtros */}
        <div style={{ ...pageStyles.card, display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Período</label>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value as 'Mensal' | 'Anual')}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="Mensal">Mensal</option>
              <option value="Anual">Anual</option>
            </select>
          </div>

          {periodo === 'Mensal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Mês</label>
              <select 
                value={mes} 
                onChange={(e) => setMes(parseInt(e.target.value))}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                {meses.map((nome, index) => (
                  <option key={index + 1} value={index + 1}>{nome}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Ano</label>
            <select 
              value={ano} 
              onChange={(e) => setAno(parseInt(e.target.value))}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              {anos.map((anoOption) => (
                <option key={anoOption} value={anoOption}>{anoOption}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              setEditingEntrada(undefined);
              setShowForm(true);
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ➕ Nova Entrada
          </button>

          <button 
            onClick={loadDados}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#ccc' : '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Carregando...' : 'Carregar'}
          </button>
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            color: '#c00',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            ❌ {error}
          </div>
        )}


        {/* Modal do Formulário */}
        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                  {editingEntrada ? 'Editar Entrada' : 'Nova Entrada de Caixa'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntrada(undefined);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#999'
                  }}
                >
                  ✕
                </button>
              </div>
              <FormEntradaCaixa 
                entrada={editingEntrada}
                onSubmit={handleAddEntrada}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEntrada(undefined);
                }}
              />
            </div>
          </div>
        )}
        {showDespesaForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '800px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                  {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                </h2>
                <button
                  onClick={() => { setShowDespesaForm(false); setEditingDespesa(undefined); }}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0, color: '#999' }}
                >
                  ✕
                </button>
              </div>
              <FormDespesa
                despesa={editingDespesa}
                onSubmit={async (dados) => {
                  try {
                    if (editingDespesa && editingDespesa.id) {
                      await despesaService.update(editingDespesa.id, dados);
                    } else {
                      await despesaService.create(dados as any);
                    }
                    setShowDespesaForm(false);
                    setEditingDespesa(undefined);
                    loadDados();
                  } catch (err) {
                    console.error('Erro ao salvar despesa:', err);
                    setError('Erro ao salvar despesa');
                  }
                }}
                onCancel={() => { setShowDespesaForm(false); setEditingDespesa(undefined); }}
              />
            </div>
          </div>
        )}
        {/* Loading */}
        {loading && !showForm && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#666'
          }}>
            <p>Carregando dados...</p>
          </div>
        )}

        {/* Resumo */}
        {!loading && caixa && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '24px', fontWeight: 'bold' }}>
              {periodo === 'Mensal' ? `${meses[mes - 1]} de ${ano}` : `${ano}`}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#d4edda',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Entradas</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#155724',
                  margin: '0'
                }}>
                  R$ {caixa.entradas.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div style={{
                background: '#f8d7da',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Saídas</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#721c24',
                  margin: '0'
                }}>
                  R$ {caixa.saidas.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div style={{
                background: caixa.saldo >= 0 ? '#d4edda' : '#f8d7da',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Saldo</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: caixa.saldo >= 0 ? '#155724' : '#721c24',
                  margin: '0'
                }}>
                  R$ {caixa.saldo.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Entradas */}
        {!loading && movimentacoes.length === 0 && !error && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bfdbfe',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#666' }}>
              Nenhuma movimentação registrada neste período.
            </p>
          </div>
        )}

        {!loading && movimentacoes.length > 0 && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '1rem' }}>
              Movimentações ({movimentacoes.length})
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Data</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Descrição</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Valor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {entradasPaginadas.map((mov) => (
                  <tr 
                    key={mov.id} 
                    style={{ borderBottom: '1px solid #eee' }}
                  >
                    <td style={{ padding: '1rem' }}>{mov.data}</td>
                    <td style={{ padding: '1rem' }}>{mov.descricao}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: mov.tipo === 'entrada' ? 'green' : '#721c24' }}>
                      {mov.tipo === 'entrada' ? '+' : '-'}R$ {Math.abs(mov.valor).toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {mov.tipo === 'entrada' ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingEntrada({ id: Number(String(mov.id).replace('e-','')), valor: mov.valor, data: mov.data, descricao: mov.descricao } as any);
                              setShowForm(true);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              marginRight: '0.5rem',
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              const idNum = Number(String(mov.id).replace('e-',''));
                              idNum && handleDeleteEntrada(idNum);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Deletar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              // abrir modal de edição de despesa
                              try {
                                setEditingDespesa(mov.orig);
                                setShowDespesaForm(true);
                              } catch (err) {
                                console.error('Erro ao abrir edição de despesa:', err);
                              }
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              marginRight: '0.5rem',
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (!mov.orig || !mov.orig.id) return;
                              if (!confirm('Tem certeza que deseja deletar esta despesa?')) return;
                              try {
                                await despesaService.delete(mov.orig.id);
                                loadDados();
                              } catch (err) {
                                console.error('Erro ao deletar despesa:', err);
                                setError('Erro ao deletar despesa');
                              }
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Deletar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginação */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f9f9f9',
              borderRadius: '4px'
            }}>
              <button
                onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: paginaAtual === 1 ? '#ccc' : '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                <button
                  key={pagina}
                  onClick={() => setPaginaAtual(pagina)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: pagina === paginaAtual ? '#4a90e2' : '#ddd',
                    color: pagina === paginaAtual ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: pagina === paginaAtual ? 'bold' : 'normal'
                  }}
                >
                  {pagina}
                </button>
              ))}

              <button
                onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas}
                style={{
                  padding: '0.5rem 1rem',
                  background: paginaAtual === totalPaginas ? '#ccc' : '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer'
                }}
              >
                Próximo →
              </button>

              <span style={{
                marginLeft: '1rem',
                color: '#666',
                fontSize: '14px'
              }}>
                Página {paginaAtual} de {totalPaginas} ({movimentacoes.length} total)
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '2rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '1rem',
          borderRadius: '6px'
        }}>
          <p style={{ color: '#333', margin: '0' }}>
            Dados carregados do Supabase! Seus registros estão sincronizados.
          </p>
        </div>
      </div>
    </div>
  );
}
