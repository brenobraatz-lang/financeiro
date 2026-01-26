import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { despesasService } from '../services/despesasService';
import { TipoEmpresa } from '../types/Despesa';
import { pageStyles } from '../styles/pageLayout';

interface DashboardStats {
  totalGeral: number;
  pessoaFisica: { total: number; count: number };
  pessoaJuridica: { total: number; count: number };
  dinheiro: { total: number; count: number };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mesAno, setMesAno] = useState<string>('');
  
  const hoje = new Date();
  const [periodo, setPeriodo] = useState<'Mensal' | 'Anual'>('Mensal');
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState<'Todos' | 'PF' | 'PJ' | 'Dinheiro'>('Todos');

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const anos = Array.from({ length: 5 }, (_, i) => ano - i);

  useEffect(() => {
    const load = async () => {
      try {
        const mesLeitura = periodo === 'Mensal' ? mes : 1;
        const anoLeitura = ano;
        
        setMesAno(periodo === 'Mensal' 
          ? `${meses[mesLeitura - 1]}/${anoLeitura}` 
          : `${anoLeitura}`
        );

        const relatorio = await despesasService.relatorioMensal(mesLeitura, anoLeitura);

        // Filtrar por período anual se necessário
        let despesasFiltradas = relatorio.despesas;
        if (periodo === 'Anual') {
          despesasFiltradas = relatorio.despesas.filter(d => {
            const [anoD] = d.data.split('-');
            return parseInt(anoD) === anoLeitura;
          });
        }

        // Calcular totais por empresa
        const pessoaFisica = despesasFiltradas.filter(d => d.empresa === TipoEmpresa.PESSOA_FISICA);
        const pessoaJuridica = despesasFiltradas.filter(d => d.empresa === TipoEmpresa.PESSOA_JURIDICA);
        const dinheiro = despesasFiltradas.filter(d => d.empresa === TipoEmpresa.DINHEIRO);

        setStats({
          totalGeral: despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
          pessoaFisica: {
            total: pessoaFisica.reduce((sum, d) => sum + d.valor, 0),
            count: pessoaFisica.length
          },
          pessoaJuridica: {
            total: pessoaJuridica.reduce((sum, d) => sum + d.valor, 0),
            count: pessoaJuridica.length
          },
          dinheiro: {
            total: dinheiro.reduce((sum, d) => sum + d.valor, 0),
            count: dinheiro.length
          }
        });
      } catch (e) {
        console.error('Erro ao carregar dashboard:', e);
      }
    };
    load();
  }, [periodo, mes, ano]);

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <h1 style={pageStyles.title}>Dashboard Financeiro</h1>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tipo</label>
            <select 
              value={tipoFiltro} 
              onChange={(e) => setTipoFiltro(e.target.value as 'Todos' | 'PF' | 'PJ' | 'Dinheiro')}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="Todos">Todos</option>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
        </div>

        {/* Relatório */}
        <div style={pageStyles.card}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '24px', fontWeight: 'bold' }}>Relatório {periodo} - {mesAno}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            marginTop: '1rem'
          }}>
            {/* Total Geral */}
            {tipoFiltro === 'Todos' && (
              <div style={{
                background: '#f0f0f0',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#666', margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 'normal' }}>Total Geral</h3>
                <p style={{ color: '#333', margin: '0', fontSize: '48px', fontWeight: 'bold' }}>
                  R$ {stats ? stats.totalGeral.toFixed(2).replace('.', ',') : '0,00'}
                </p>
              </div>
            )}

            {/* Pessoa Física */}
            {(tipoFiltro === 'Todos' || tipoFiltro === 'PF') && (
              <div style={{
                background: '#fef3c7',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#ff9800', margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 'bold' }}>Pessoa Física</h3>
                <p style={{ color: '#ff9800', margin: '0', fontSize: '48px', fontWeight: 'bold' }}>
                  R$ {stats ? stats.pessoaFisica.total.toFixed(2).replace('.', ',') : '0,00'}
                </p>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                  {stats ? stats.pessoaFisica.count : 0} despesas
                </p>
              </div>
            )}

            {/* Pessoa Jurídica */}
            {(tipoFiltro === 'Todos' || tipoFiltro === 'PJ') && (
              <div style={{
                background: '#dbeafe',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#2563eb', margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 'bold' }}>Pessoa Jurídica</h3>
                <p style={{ color: '#2563eb', margin: '0', fontSize: '48px', fontWeight: 'bold' }}>
                  R$ {stats ? stats.pessoaJuridica.total.toFixed(2).replace('.', ',') : '0,00'}
                </p>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                  {stats ? stats.pessoaJuridica.count : 0} despesas
                </p>
              </div>
            )}

            {/* Dinheiro */}
            {(tipoFiltro === 'Todos' || tipoFiltro === 'Dinheiro') && (
              <div style={{
                background: '#dcfce7',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#16a34a', margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 'bold' }}>Dinheiro</h3>
                <p style={{ color: '#16a34a', margin: '0', fontSize: '48px', fontWeight: 'bold' }}>
                  R$ {stats ? stats.dinheiro.total.toFixed(2).replace('.', ',') : '0,00'}
                </p>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                  {stats ? stats.dinheiro.count : 0} despesas
                </p>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#eff6ff',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            textAlign: 'center'
          }}>
            <p style={{ color: '#333', fontSize: '14px', margin: '0' }}>
              Usuário: <strong>{user?.email}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

