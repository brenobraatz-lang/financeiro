import { useState } from 'react';
import { EntradaCaixa } from '../types/Despesa';

interface FormEntradaCaixaProps {
  entrada?: EntradaCaixa;
  onSubmit: (entrada: Omit<EntradaCaixa, 'id' | 'createdAt' | 'updatedAt' | 'mes' | 'ano'>) => void;
  onCancel: () => void;
}

export default function FormEntradaCaixa({ entrada, onSubmit, onCancel }: FormEntradaCaixaProps) {
  const [formData, setFormData] = useState({
    valor: entrada?.valor || 0,
    data: entrada?.data || new Date().toISOString().split('T')[0],
    descricao: entrada?.descricao || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-entrada-caixa">
      <h2>{entrada ? 'Editar Entrada' : 'Nova Entrada de Caixa'}</h2>

      <div className="form-group">
        <label>Valor *</label>
        <div className="input-moeda">
          <span>R$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={formData.valor === 0 ? '' : formData.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            onChange={(e) => {
              // Remove tudo que não é número
              const apenasNumeros = e.target.value.replace(/\D/g, '');
              if (apenasNumeros === '') {
                setFormData({ ...formData, valor: 0 });
              } else {
                // Converte para valor real (últimos 2 dígitos são centavos)
                const valor = parseInt(apenasNumeros) / 100;
                setFormData({ ...formData, valor });
              }
            }}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Data *</label>
        <input
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Descrição *</label>
        <input
          type="text"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Ex: Recebimento de cliente, Venda..."
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {entrada ? 'Atualizar' : 'Cadastrar'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

