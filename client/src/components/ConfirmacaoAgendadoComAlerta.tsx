import { Despesa } from '../types/Despesa';
import '../styles/ConfirmacaoAgendadoComAlerta.css';

interface ConfirmacaoAgendadoComAlertaProps {
  despesa: Despesa;
  despesasEmAtraso?: {
    quantidade: number;
    valor: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmacaoAgendadoComAlerta({
  despesa,
  despesasEmAtraso,
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmacaoAgendadoComAlertaProps) {
  const temAtrasos = despesasEmAtraso && despesasEmAtraso.quantidade > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className={`modal-content confirmation-modal ${temAtrasos ? 'com-alerta' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seção de Alerta (aparece apenas se houver atrasos) */}
        {temAtrasos && (
          <div className="alerta-section">
            <div className="alerta-header">
              <span className="alerta-icon">⚠️</span>
              <div className="alerta-info">
                <strong>Atenção: Despesas em Atraso!</strong>
                <p>
                  {despesasEmAtraso.quantidade} despesa{despesasEmAtraso.quantidade !== 1 ? 's' : ''} não paga{despesasEmAtraso.quantidade !== 1 ? 's' : ''} vencida{despesasEmAtraso.quantidade !== 1 ? 's' : ''} • Total: <strong>{formatCurrency(despesasEmAtraso.valor)}</strong>
                </p>
              </div>
              <button className="alerta-close" onClick={() => {}} title="Fechar aviso">✕</button>
            </div>
          </div>
        )}

        {/* Seção de Confirmação AGENDADO */}
        <div className="confirmacao-section">
          <h2>Confirmar Mudança de Status</h2>

          <div className="confirmation-message">
            <p>A despesa abaixo chegou à data de vencimento:</p>

            <div className="despesa-info">
              <div className="info-row">
                <strong>Descrição:</strong>
                <span>{despesa.descricao}</span>
              </div>
              <div className="info-row">
                <strong>Valor:</strong>
                <span>{formatCurrency(despesa.valor)}</span>
              </div>
              <div className="info-row">
                <strong>Vencimento:</strong>
                <span>{new Date(despesa.data).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="info-row">
                <strong>Status Atual:</strong>
                <span className="status-badge">{despesa.statusPagamento}</span>
              </div>
            </div>

            <p className="confirmation-text">
              ✓ Deseja marcar como <strong>PAGA</strong>?
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="confirmation-actions">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Não, Depois
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-success"
            disabled={isLoading}
          >
            {isLoading ? 'Atualizando...' : 'Sim, Marcar como Paga'}
          </button>
        </div>
      </div>
    </div>
  );
}
