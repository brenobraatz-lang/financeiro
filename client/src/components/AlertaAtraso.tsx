import { useEffect, useState } from 'react';
import '../styles/AlertaAtraso.css';

interface AlertaAtrasoProps {
  quantidade: number;
  valor: number;
  onClose?: () => void;
  autoDismiss?: number;
}

export default function AlertaAtraso({ quantidade, valor, onClose, autoDismiss = 5000 }: AlertaAtrasoProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, autoDismiss);

    return () => clearTimeout(timer);
  }, [autoDismiss, onClose]);

  if (!isVisible) return null;

  return (
    <div className="alerta-atraso">
      <div className="alerta-conteudo">
        <span className="alerta-icon">⚠️</span>
        <div className="alerta-texto">
          <strong>Despesas em Atraso!</strong>
          <p>{quantidade} despesa{quantidade !== 1 ? 's' : ''} não paga{quantidade !== 1 ? 's' : ''} vencida{quantidade !== 1 ? 's' : ''} • Total: <strong>R$ {(valor / 100).toFixed(2).replace('.', ',')}</strong></p>
        </div>
        <button onClick={() => setIsVisible(false)} className="alerta-close">✕</button>
      </div>
    </div>
  );
}
