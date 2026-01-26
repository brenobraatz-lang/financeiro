import { Despesa } from '../types/Despesa';
import '../styles/ConfirmacaoMudancaStatus.css';

interface ConfirmacaoMudancaStatusProps {
  despesa: Despesa;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmacaoMudancaStatus({
  despesa,
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmacaoMudancaStatusProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
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
              <span>R$ {(despesa.valor / 100).toFixed(2).replace('.', ',')}</span>
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
