import { useState, useEffect } from 'react';
import { Despesa, FiltroDespesa } from '../types/Despesa';
import { despesasService } from '../services/despesasService';
import { useAuth } from '../contexts/AuthContext';
import FormDespesa from '../components/FormDespesa';
import FiltrosDespesas from '../components/FiltrosDespesas';
import { socketService } from '../services/socket';
import { pageStyles } from '../styles/pageLayout';

export default function DespesasPage() {
  useAuth();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [despesasFiltradas, setDespesasFiltradas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | undefined>();
  const [filtros, setFiltros] = useState<FiltroDespesa>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    loadDespesas();

    // Conectar ao WebSocket para sincronização em tempo real
    socketService.connect();
    
    socketService.onDespesaCreated((newDespesa) => {
      setDespesas(prev => [...prev, newDespesa]);
    });

    socketService.onDespesaUpdated((updatedDespesa) => {
      setDespesas(prev => 
        prev.map(d => d.id === updatedDespesa.id ? updatedDespesa : d)
      );
    });

    socketService.onDespesaDeleted((deletedId) => {
      setDespesas(prev => prev.filter(d => d.id !== deletedId));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [despesas, filtros]);

  const loadDespesas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await despesasService.list();
      setDespesas(data);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar despesas';
      setError(mensagem);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = despesas;

    if (filtros.mes) {
      resultado = resultado.filter(d => {
        const [, mes] = d.data.split('-');
        return parseInt(mes) === filtros.mes;
      });
    }

    if (filtros.ano) {
      resultado = resultado.filter(d => {
        const [ano] = d.data.split('-');
        return parseInt(ano) === filtros.ano;
      });
    }

    if (filtros.empresa) {
      resultado = resultado.filter(d => d.empresa === filtros.empresa);
    }

    if (filtros.tipoDespesa) {
      resultado = resultado.filter(d => d.tipoDespesa === filtros.tipoDespesa);
    }

    if (filtros.banco) {
      resultado = resultado.filter(d => d.banco === filtros.banco);
    }

    if (filtros.formaPagamento) {
      resultado = resultado.filter(d => d.formaPagamento === filtros.formaPagamento);
    }

    if (filtros.statusPagamento) {
      resultado = resultado.filter(d => d.statusPagamento === filtros.statusPagamento);
    }

    setDespesasFiltradas(resultado);
  };

  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const despesasPaginadas = despesasFiltradas.slice(indiceInicio, indiceFim);
  const totalPaginas = Math.ceil(despesasFiltradas.length / itensPorPagina);

  const handleAddDespesa = async (despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingDespesa?.id) {
        await despesasService.update(editingDespesa.id, despesa);
      } else {
        await despesasService.create(despesa);
      }
      setShowForm(false);
      setEditingDespesa(undefined);
      loadDespesas();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao salvar despesa';
      setError(mensagem);
      console.error('Erro:', err);
    }
  };

  const handleDeleteDespesa = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta despesa?')) return;
    try {
      await despesasService.delete(id);
      loadDespesas();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao deletar despesa';
      setError(mensagem);
    }
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <div style={pageStyles.wrapper}>
          <h1 style={pageStyles.title}>Controle de Despesas</h1>
        </div>
      </div>

      <div style={pageStyles.wrapper}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div />
          <button
            onClick={() => {
              setEditingDespesa(undefined);
              setShowForm(true);
            }}
            style={{ ...pageStyles.button, ...pageStyles.buttonPrimary }}
          >
            ➕ Nova Despesa
          </button>
        </div>

        {/* Filtros */}
        <div style={pageStyles.card}>
          <FiltrosDespesas
            filtros={filtros}
            onChange={setFiltros}
            onClear={() => setFiltros({})}
          />
        </div>

        {/* Erro */}
        {error && (
          <div style={pageStyles.dangerBox}>
            {error}
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
                  {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingDespesa(undefined);
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
              <FormDespesa
                despesa={editingDespesa}
                onSubmit={handleAddDespesa}
                onCancel={() => {
                  setShowForm(false);
                  setEditingDespesa(undefined);
                }}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#666'
          }}>
            <p>Carregando despesas...</p>
          </div>
        )}

        {/* Sem dados */}
        {!loading && despesasFiltradas.length === 0 && !error && (
          <div style={{
            background: '#f9f9f9',
            border: '2px dashed #ddd',
            padding: '3rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#999', fontSize: '16px', margin: 0 }}>
              Nenhuma despesa encontrada
            </p>
          </div>
        )}

        {/* Lista de Despesas */}
        {!loading && despesasFiltradas.length > 0 && (
          <div>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderRadius: '4px'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Data</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Descrição</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Valor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Tipo</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold', fontSize: '14px' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesasPaginadas.map((despesa) => (
                  <tr key={despesa.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontSize: '14px' }}>{despesa.data}</td>
                    <td style={{ padding: '1rem', fontSize: '14px' }}>{despesa.descricao}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#e74c3c', fontSize: '14px' }}>
                      R$ {despesa.valor.toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '13px' }}>
                      {despesa.tipoDespesa}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: despesa.statusPagamento === 'PAGA' ? '#d4edda' : (despesa.statusPagamento === 'AGENDADO' ? '#fff3cd' : '#f8d7da'),
                        color: despesa.statusPagamento === 'PAGA' ? '#155724' : (despesa.statusPagamento === 'AGENDADO' ? '#856404' : '#721c24')
                      }}>
                        {despesa.statusPagamento}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingDespesa(despesa);
                          setShowForm(true);
                        }}
                        style={{
                          padding: '0.4rem 0.8rem',
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
                        onClick={() => despesa.id && handleDeleteDespesa(despesa.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
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
                Página {paginaAtual} de {totalPaginas} ({despesasFiltradas.length} total)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



