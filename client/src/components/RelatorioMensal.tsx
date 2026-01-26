import { RelatorioMensal as RelatorioType } from '../types/Despesa';

interface RelatorioMensalProps {
  relatorio: RelatorioType;
  tipoFiltro?: 'todos' | 'pf' | 'pj' | 'dinheiro';
  periodo?: 'mensal' | 'anual';
}

export default function RelatorioMensal({ relatorio, tipoFiltro = 'todos', periodo = 'mensal' }: RelatorioMensalProps) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="relatorio-mensal">
      <h2>{periodo === 'anual' ? 'Relatório Anual' : 'Relatório Mensal'} - {periodo === 'anual' ? relatorio.ano : `${meses[relatorio.mes - 1]}/${relatorio.ano}`}</h2>

      <div className="relatorio-resumo">
        <div className="resumo-item resumo-card total-geral">
          <h3>Total Geral</h3>
          <p className="valor-grande">{formatCurrency(relatorio.totalGeral)}</p>
        </div>

        {(tipoFiltro === 'todos' || tipoFiltro === 'pf') && (
          <div className="resumo-item resumo-card pessoa-fisica">
            <h3>Pessoa Física</h3>
            <p className="valor-grande">{formatCurrency(relatorio.totalPessoaFisica)}</p>
            <p className="quantidade">{relatorio.quantidadePessoaFisica} despesas</p>
          </div>
        )}

        {(tipoFiltro === 'todos' || tipoFiltro === 'pj') && (
          <div className="resumo-item resumo-card pessoa-juridica">
            <h3>Pessoa Jurídica</h3>
            <p className="valor-grande">{formatCurrency(relatorio.totalPessoaJuridica)}</p>
            <p className="quantidade">{relatorio.quantidadePessoaJuridica} despesas</p>
          </div>
        )}

        {(tipoFiltro === 'todos' || tipoFiltro === 'dinheiro') && (
          <div className="resumo-item resumo-card dinheiro">
            <h3>Dinheiro</h3>
            <p className="valor-grande">{formatCurrency(relatorio.totalDinheiro)}</p>
            <p className="quantidade">{relatorio.quantidadeDinheiro} despesas</p>
          </div>
        )}
      </div>

      {Object.keys(relatorio.despesasPorTipo).length > 0 && (
        <div className="despesas-por-tipo">
          <h3>Despesas por Tipo</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(relatorio.despesasPorTipo)
                .sort(([, a], [, b]) => b - a)
                .map(([tipo, valor]) => (
                  <tr key={tipo}>
                    <td>{tipo}</td>
                    <td className="valor">{formatCurrency(valor)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
