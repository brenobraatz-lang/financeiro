import { useState } from 'react';
import { supabase } from '../services/supabase';
import { pageStyles } from '../styles/pageLayout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('backup');
  const [exporting, setExporting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStorageInfo = async () => {
    try {
      const { count: despesasCount } = await supabase
        .from('despesas')
        .select('*', { count: 'exact', head: true });

      const { count: caixaCount } = await supabase
        .from('entradas_caixa')
        .select('*', { count: 'exact', head: true });

      const despesasSize = (despesasCount || 0) * 500;
      const caixaSize = (caixaCount || 0) * 400;
      const overheadSize = 50 * 1024 * 1024;
      const totalUsed = despesasSize + caixaSize + overheadSize;
      const estimatedLimit = 500 * 1024 * 1024;
      const percentageUsed = (totalUsed / estimatedLimit) * 100;

      setStorageInfo({
        totalUsed,
        estimatedLimit,
        percentageUsed,
        despesasCount,
        caixaCount,
        status: percentageUsed > 80 ? 'critical' : percentageUsed > 60 ? 'warning' : 'safe'
      });
    } catch (error) {
      alert('Erro ao carregar info de espaço');
    }
  };

  const deleteAllDespesas = async () => {
    if (!window.confirm('ATENÇÃO!\n\nVocê está prestes a deletar TODAS as despesas.\n\nEsta ação é IRREVERSÍVEL!\n\nTem certeza?')) {
      return;
    }
    
    try {
      setDeleting(true);
      const { count } = await supabase
        .from('despesas')
        .select('*', { count: 'exact', head: true });
      
      const totalCount = count || 0;
      if (totalCount === 0) {
        alert('Nenhuma despesa para deletar');
        return;
      }

      // Deletar em lotes
      const batchSize = 1000;
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        const { data: despesas } = await supabase
          .from('despesas')
          .select('id')
          .range(offset, offset + batchSize - 1);
        
        if (despesas && despesas.length > 0) {
          const ids = despesas.map(d => d.id);
          await supabase.from('despesas').delete().in('id', ids);
        }
      }
      
      alert(`${count} despesas deletadas com sucesso!`);
      await loadStorageInfo();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar despesas');
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllEntradas = async () => {
    if (!window.confirm('ATENÇÃO!\n\nVocê está prestes a deletar TODAS as entradas de caixa.\n\nEsta ação é IRREVERSÍVEL!\n\nTem certeza?')) {
      return;
    }
    
    try {
      setDeleting(true);
      const { count } = await supabase
        .from('entradas_caixa')
        .select('*', { count: 'exact', head: true });
      
      const totalCount = count || 0;
      if (totalCount === 0) {
        alert('Nenhuma entrada para deletar');
        return;
      }

      // Deletar em lotes
      const batchSize = 1000;
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        const { data: entradas } = await supabase
          .from('entradas_caixa')
          .select('id')
          .range(offset, offset + batchSize - 1);
        
        if (entradas && entradas.length > 0) {
          const ids = entradas.map(e => e.id);
          await supabase.from('entradas_caixa').delete().in('id', ids);
        }
      }
      
      alert(`${count} entradas deletadas com sucesso!`);
      await loadStorageInfo();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar entradas');
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllData = async () => {
    if (!window.confirm('PERIGO!\n\nVocê está prestes a deletar TODOS os dados (despesas + entradas).\n\nEsta ação é IRREVERSÍVEL e não pode ser desfeita!\n\nTem ABSOLUTA certeza?')) {
      return;
    }
    
    try {
      setDeleting(true);
      
      // Deletar despesas
      const { count: despesasCount } = await supabase
        .from('despesas')
        .select('*', { count: 'exact', head: true });
      
      const batchSize = 1000;
      for (let offset = 0; offset < (despesasCount || 0); offset += batchSize) {
        const { data: despesas } = await supabase
          .from('despesas')
          .select('id')
          .range(offset, offset + batchSize - 1);
        
        if (despesas && despesas.length > 0) {
          const ids = despesas.map(d => d.id);
          await supabase.from('despesas').delete().in('id', ids);
        }
      }
      
      // Deletar entradas
      const { count: entradasCount } = await supabase
        .from('entradas_caixa')
        .select('*', { count: 'exact', head: true });
      
      for (let offset = 0; offset < (entradasCount || 0); offset += batchSize) {
        const { data: entradas } = await supabase
          .from('entradas_caixa')
          .select('id')
          .range(offset, offset + batchSize - 1);
        
        if (entradas && entradas.length > 0) {
          const ids = entradas.map(e => e.id);
          await supabase.from('entradas_caixa').delete().in('id', ids);
        }
      }
      
      alert(`Todos os dados deletados! (${despesasCount} despesas + ${entradasCount} entradas)`);
      await loadStorageInfo();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar dados');
    } finally {
      setDeleting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      const { data: despesas } = await supabase.from('despesas').select('*');
      const { data: entradas } = await supabase.from('entradas_caixa').select('*');

      if (!despesas && !entradas) {
        alert('Nenhum dado para exportar');
        return;
      }

      // Import dinamicamente
      const XLSX = await import('xlsx');

      // Colunas para remover
      const colunasRemover = ['user_id', 'created_at', 'updated_at'];

      // Filtrar colunas
      const filtrarDados = (dados: any[]) => {
        return dados.map(row => {
          const novaLinha: any = {};
          Object.keys(row).forEach(key => {
            if (!colunasRemover.includes(key)) {
              novaLinha[key] = row[key];
            }
          });
          return novaLinha;
        });
      };

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Adicionar sheet de despesas
      if (despesas && despesas.length > 0) {
        const despesasFiltradas = filtrarDados(despesas);
        const ws_despesas = XLSX.utils.json_to_sheet(despesasFiltradas);
        const colWidths = Object.keys(despesasFiltradas[0]).map(() => ({ wch: 15 }));
        ws_despesas['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws_despesas, 'Despesas');
      }

      // Adicionar sheet de entradas
      if (entradas && entradas.length > 0) {
        const entradasFiltradas = filtrarDados(entradas);
        const ws_entradas = XLSX.utils.json_to_sheet(entradasFiltradas);
        const colWidths = Object.keys(entradasFiltradas[0]).map(() => ({ wch: 15 }));
        ws_entradas['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws_entradas, 'Entradas');
      }

      // Salvar arquivo
      XLSX.writeFile(wb, `backup_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    try {
      setExporting(true);
      const { data: despesas } = await supabase.from('despesas').select('*');

      if (!despesas || despesas.length === 0) {
        alert('Nenhuma despesa para exportar');
        return;
      }

      const csv = [
        Object.keys(despesas[0]).join(','),
        ...despesas.map((d: any) => Object.values(d).map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `despesas_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = async () => {
    try {
      setExporting(true);
      const { data: despesas } = await supabase.from('despesas').select('*');
      const { data: entradas } = await supabase.from('entradas_caixa').select('*');

      if (!despesas && !entradas) {
        alert('Nenhum dado para exportar');
        return;
      }

      const backup = {
        exportedAt: new Date().toISOString(),
        despesas: despesas || [],
        entradas: entradas || [],
        summary: {
          despesasTotal: despesas?.length || 0,
          entradasTotal: entradas?.length || 0,
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('JSON exportado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <div style={pageStyles.wrapper}>
          <h1 style={pageStyles.title}>Configurações</h1>
        </div>
      </div>

      <div style={pageStyles.wrapper}>
        <div style={pageStyles.tab}>
          <button 
            onClick={() => setActiveTab('backup')}
            style={{ 
              ...pageStyles.tabButton,
              ...(activeTab === 'backup' ? pageStyles.tabButtonActive : {})
            }}
          >
              📥 Backup
          </button>
          <button 
            onClick={() => setActiveTab('storage')}
            style={{ 
              ...pageStyles.tabButton,
              ...(activeTab === 'storage' ? pageStyles.tabButtonActive : {})
            }}
          >
              💾 Storage
          </button>
        </div>

      {activeTab === 'backup' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0.5rem' }}>Backup de Dados</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Faça backup de seus dados em 3 formatos diferentes.</p>
          
          <div style={pageStyles.infoBox}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Informações Importantes</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
              <li><strong>Backup automático:</strong> Nenhum backup é automático. Você deve fazer manualmente.</li>
              <li><strong>Retenção de dados:</strong> Os dados são armazenados indefinidamente até você deletar.</li>
              <li><strong>Tempo de deleção:</strong> A exclusão é imediata e <strong>IRREVERSÍVEL</strong>.</li>
              <li><strong>Limite de armazenamento:</strong> 500 MB no plano Free do Supabase.</li>
              <li><strong>Backup recomendado:</strong> Faça backup mensal e guarde em local seguro.</li>
            </ul>
          </div>
          
          <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
            <button 
              onClick={exportToExcel}
              disabled={exporting}
              style={{ 
                padding: '12px 20px', 
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {exporting ? 'Exportando...' : 'Excel'}
            </button>
            <button 
              onClick={exportToCSV}
              disabled={exporting}
              style={{ 
                padding: '12px 20px', 
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {exporting ? 'Exportando...' : 'CSV'}
            </button>
            <button 
              onClick={exportToJSON}
              disabled={exporting}
              style={{ 
                padding: '12px 20px', 
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {exporting ? 'Exportando...' : 'JSON'}
            </button>
          </div>
          <div style={{ 
            background: '#e8f5e9',
            padding: '15px',
            borderRadius: '6px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>💡 Dicas</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Faça backup mensal de seus dados</li>
              <li>Guarde cópias em locais seguros (Drive, OneDrive)</li>
            </ul>
          </div>

          <div style={pageStyles.dangerBox}>
            <h4 style={{ margin: '0 0 10px 0', color: '#c62828' }}>Deletar Dados</h4>
            <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '14px' }}>
              Use com cuidado! A deleção é <strong>imediata e irreversível</strong>. Faça backup antes de deletar.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <button 
                onClick={deleteAllDespesas}
                disabled={deleting}
                style={{ 
                  padding: '12px 20px', 
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {deleting ? 'Deletando...' : 'Deletar Despesas'}
              </button>
              <button 
                onClick={deleteAllEntradas}
                disabled={deleting}
                style={{ 
                  padding: '12px 20px', 
                  background: '#ff6f00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {deleting ? 'Deletando...' : 'Deletar Entradas'}
              </button>
              <button 
                onClick={deleteAllData}
                disabled={deleting}
                style={{ 
                  padding: '12px 20px', 
                  background: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {deleting ? 'Deletando...' : 'Deletar Tudo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0.5rem' }}>💾 Espaço Disponível</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Limite do Supabase Free: <strong>500 MB</strong>
          </p>

          {!storageInfo ? (
            <button 
              onClick={loadStorageInfo}
              style={{ 
                padding: '12px 24px', 
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              📊 Carregar Espaço Atual
            </button>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                background: storageInfo.status === 'critical' ? '#ffebee' : storageInfo.status === 'warning' ? '#fff3e0' : '#e8f5e9',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                borderLeft: `4px solid ${storageInfo.status === 'critical' ? '#c62828' : storageInfo.status === 'warning' ? '#FF9800' : '#4CAF50'}`
              }}>
                <h3 style={{ margin: '0 0 15px 0' }}>📈 Uso Atual</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {storageInfo.percentageUsed.toFixed(1)}% de 500 MB
                  </p>
                  <div style={{ 
                    width: '100%', 
                    height: '20px', 
                    background: '#ddd', 
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: `${storageInfo.percentageUsed}%`,
                      height: '100%',
                      background: storageInfo.status === 'critical' ? '#f44336' : storageInfo.status === 'warning' ? '#FF9800' : '#4CAF50',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Usado:</strong> {(storageInfo.totalUsed / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    <strong>Disponível:</strong> {((storageInfo.estimatedLimit - storageInfo.totalUsed) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <p style={{ margin: '10px 0', fontSize: '14px', color: '#555' }}>
                  <strong>Despesas:</strong> {storageInfo.despesasCount} registros
                </p>
                <p style={{ margin: '10px 0', fontSize: '14px', color: '#555' }}>
                  <strong>Entradas:</strong> {storageInfo.caixaCount} registros
                </p>

                {storageInfo.status === 'critical' && (
                  <p style={{ margin: '15px 0', padding: '10px', background: '#ffcdd2', borderRadius: '6px', color: '#b71c1c', fontWeight: 'bold' }}>
                    ⚠️ CRÍTICO: Espaço insuficiente! Faça upgrade ou delete dados antigos.
                  </p>
                )}
                {storageInfo.status === 'warning' && (
                  <p style={{ margin: '15px 0', padding: '10px', background: '#ffe0b2', borderRadius: '6px', color: '#e65100', fontWeight: 'bold' }}>
                    ⚠️ AVISO: Espaço em {storageInfo.percentageUsed.toFixed(0)}%. Considere fazer upgrade.
                  </p>
                )}
                {storageInfo.status === 'safe' && (
                  <p style={{ margin: '15px 0', padding: '10px', background: '#c8e6c9', borderRadius: '6px', color: '#1b5e20', fontWeight: 'bold' }}>
                    ✅ OK: Espaço disponível. Nenhuma ação necessária.
                  </p>
                )}
              </div>

              <button 
                onClick={loadStorageInfo}
                style={{ 
                  padding: '10px 20px', 
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔄 Atualizar
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
