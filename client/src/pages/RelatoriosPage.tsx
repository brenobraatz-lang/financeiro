import { useState } from 'react';
import { Despesa } from '../types/Despesa';
import { despesasService } from '../services/despesasService';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { pageStyles } from '../styles/pageLayout';

export default function RelatoriosPage() {
  useAuth();
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerado, setGerado] = useState(false);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const data = await despesasService.list();
      // Filtrar por mês e ano
      const filtradas = data.filter(d => {
        const dataParts = d.data.split('-');
        return parseInt(dataParts[1]) === mes && parseInt(dataParts[0]) === ano;
      });
      setDespesas(filtradas);
      setGerado(true);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const total = despesas.reduce((sum, d) => sum + d.valor, 0);
  const porStatus = despesas.reduce((acc, d) => {
    acc[d.statusPagamento] = (acc[d.statusPagamento] || 0) + d.valor;
    return acc;
  }, {} as Record<string, number>);

  // Dados para gráficos
  const dataPorStatus = [
    { name: 'PAGA', value: porStatus['PAGA'] || 0, fill: '#d4edda' },
    { name: 'AGENDADO', value: porStatus['AGENDADO'] || 0, fill: '#fff3cd' },
    { name: 'NAO_PAGA', value: porStatus['NAO_PAGA'] || 0, fill: '#f8d7da' }
  ].filter(d => d.value > 0);

  const porTipo = despesas.reduce((acc, d) => {
    const tipo = d.tipoDespesa;
    const idx = acc.findIndex(x => x.name === tipo);
    if (idx >= 0) {
      acc[idx].value += d.valor;
    } else {
      acc.push({ name: tipo, value: d.valor });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <div style={pageStyles.wrapper}>
          <h1 style={pageStyles.title}>Relatórios</h1>
        </div>
      </div>

      <div style={pageStyles.wrapper}>
        {/* Filtros */}
        <div style={pageStyles.card}>
          <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Gerar Relatório Mensal</h2>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}>
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
              onClick={gerarRelatorio}
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                background: loading ? '#ccc' : '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {gerado && !loading && (
          <div>
            <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>
              Relatório: {meses[mes - 1]} de {ano}
            </h3>

            {despesas.length === 0 ? (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bfdbfe',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#666' }}>
                  Nenhuma despesa neste período.
                </p>
              </div>
            ) : (
              <>
                {/* Cards de Resumo */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    background: '#f5f5f5',
                    padding: '1.5rem',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '13px' }}>Total</p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#333',
                      margin: '0'
                    }}>
                      R$ {total.toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <div style={{
                    background: '#d4edda',
                    padding: '1.5rem',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '13px' }}>Pago</p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#155724',
                      margin: '0'
                    }}>
                      R$ {(porStatus['PAGA'] || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <div style={{
                    background: '#fff3cd',
                    padding: '1.5rem',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '13px' }}>Agendado</p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#856404',
                      margin: '0'
                    }}>
                      R$ {(porStatus['AGENDADO'] || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <div style={{
                    background: '#f8d7da',
                    padding: '1.5rem',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: '#666', margin: '0 0 0.5rem 0', fontSize: '13px' }}>Não Pago</p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#721c24',
                      margin: '0'
                    }}>
                      R$ {(porStatus['NAO_PAGA'] || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* Gráficos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {/* Gráfico Pizza - Status */}
                  {dataPorStatus.length > 0 && (
                    <div style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ color: '#333', marginTop: 0 }}>Distribuição por Status</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={dataPorStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: R$ ${typeof value === 'number' ? value.toFixed(2) : '0.00'}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dataPorStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `R$ ${(value as number).toFixed(2)}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Gráfico Barras - Por Tipo */}
                  {porTipo.length > 0 && (
                    <div style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ color: '#333', marginTop: 0 }}>Total por Tipo de Despesa</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={porTipo}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: any) => `R$ ${(value as number).toFixed(2)}`} />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Tabela */}
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
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Tipo</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Valor</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.map((despesa) => (
                      <tr 
                        key={despesa.id} 
                        style={{ borderBottom: '1px solid #eee' }}
                      >
                        <td style={{ padding: '1rem' }}>{despesa.data}</td>
                        <td style={{ padding: '1rem' }}>{despesa.descricao}</td>
                        <td style={{ padding: '1rem', fontSize: '13px' }}>
                          {despesa.tipoDespesa}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                          R$ {despesa.valor.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: despesa.statusPagamento === 'PAGA' ? '#d4edda' : '#fff3cd',
                            color: despesa.statusPagamento === 'PAGA' ? '#155724' : '#856404'
                          }}>
                            {despesa.statusPagamento}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
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
            Relatório gerado a partir dos dados do Supabase!
          </p>
        </div>
      </div>
    </div>
  );
}



