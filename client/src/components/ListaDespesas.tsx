import { Despesa, LABEL_EMPRESA, LABEL_TIPO_DESPESA, LABEL_SUBCATEGORIA_IMOVEL, LABEL_STATUS, LABEL_FORMA_PAGAMENTO, StatusPagamento } from '../types/Despesa';

interface ListaDespesasProps {
  despesas: Despesa[];
  onEdit: (despesa: Despesa) => void;
  onDelete: (id: number) => void;
}

export default function ListaDespesas({ despesas, onEdit, onDelete }: ListaDespesasProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getTypeLabel = (despesa: Despesa) => {
    const label = LABEL_TIPO_DESPESA[despesa.tipoDespesa];
    if (despesa.subcategoria) {
      return `${label} - ${LABEL_SUBCATEGORIA_IMOVEL[despesa.subcategoria]}`;
    }
    return label;
  };

  const isVencida = (despesa: Despesa): boolean => {
    if (despesa.statusPagamento !== StatusPagamento.NAO_PAGA) {
      return false;
    }
    const dataVencimento = new Date(despesa.data);
    dataVencimento.setHours(0, 0, 0, 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataVencimento < hoje;
  };

  if (despesas.length === 0) {
    return <div className="empty-state">Nenhuma despesa encontrada</div>;
  }

  return (
    <div className="lista-despesas">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Classificação</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Forma Pagamento</th>
            <th>Banco</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {despesas.map((despesa) => (
            <tr key={despesa.id}>
              <td>{formatDate(despesa.data)}</td>
              <td>{despesa.descricao}</td>
              <td>{getTypeLabel(despesa)}</td>
              <td>{LABEL_EMPRESA[despesa.empresa]}</td>
              <td className="valor">{formatCurrency(despesa.valor)}</td>
              <td>
                <span className={`status ${
                  despesa.statusPagamento === 'PAGA' ? 'paga' :
                  despesa.statusPagamento === 'AGENDADO' ? 'agendado' :
                  'nao-paga'
                }`}>
                  {LABEL_STATUS[despesa.statusPagamento]}
                  {isVencida(despesa) && <span className="aviso-vencida" title="Despesa vencida">⚠️</span>}
                </span>
              </td>
              <td>{LABEL_FORMA_PAGAMENTO[despesa.formaPagamento]}</td>
              <td>{despesa.banco || '-'}</td>
              <td>
                <button onClick={() => onEdit(despesa)} className="btn btn-sm btn-edit">
                  Editar
                </button>
                <button onClick={() => onDelete(despesa.id!)} className="btn btn-sm btn-delete">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



