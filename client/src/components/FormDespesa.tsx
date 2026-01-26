import { useState } from 'react';
import { 
  Despesa, 
  TipoEmpresa, 
  TipoDespesa,
  SubcategoriaImovel,
  StatusPagamento, 
  FormaPagamento, 
  LABEL_EMPRESA, 
  LABEL_TIPO_DESPESA,
  LABEL_SUBCATEGORIA_IMOVEL,
  LABEL_STATUS, 
  LABEL_FORMA_PAGAMENTO, 
  BANCOS_FIXOS,
  SUBCATEGORIAS_IMOVEL 
} from '../types/Despesa';
import './FormDespesa.css';

interface FormDespesaProps {
  despesa?: Despesa;
  onSubmit: (despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function FormDespesa({ despesa, onSubmit, onCancel }: FormDespesaProps) {
  const [formData, setFormData] = useState({
    valor: despesa?.valor || 0,
    data: despesa?.data || new Date().toISOString().split('T')[0],
    descricao: despesa?.descricao || '',
    tipoDespesa: despesa?.tipoDespesa || TipoDespesa.PESSOAL,
    subcategoria: despesa?.subcategoria || undefined,
    empresa: despesa?.empresa || TipoEmpresa.PESSOA_FISICA,
    statusPagamento: despesa?.statusPagamento || StatusPagamento.NAO_PAGA,
    formaPagamento: despesa?.formaPagamento || FormaPagamento.PIX,
    banco: despesa?.banco || ''
  });

  const [repetir, setRepetir] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const despesaBase = {
      ...formData,
      banco: formData.banco || undefined,
      subcategoria: formData.tipoDespesa === TipoDespesa.IMOVEIS ? formData.subcategoria : undefined
    };

    if (repetir && numeroParcelas > 1) {
      // Calcular intervalo em dias (30 dias por mês)
      const intervaloEmDias = 30;
      const dataBase = new Date(formData.data);

      for (let i = 0; i < numeroParcelas; i++) {
        const novaData = new Date(dataBase);
        novaData.setDate(novaData.getDate() + i * intervaloEmDias);
        const dataFormatada = novaData.toISOString().split('T')[0];

        // Submeter cada parcela com a data ajustada
        onSubmit({
          ...despesaBase,
          data: dataFormatada,
          descricao: `${despesaBase.descricao} (Parcela ${i + 1}/${numeroParcelas})`
        });
      }
    } else {
      onSubmit(despesaBase);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-despesa">
      <h2>{despesa ? 'Editar Despesa' : 'Nova Despesa'}</h2>

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
            aria-label="Valor da despesa"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Data de Vencimento *</label>
        <input
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          aria-label="Data de vencimento"
          required
        />
        {new Date(formData.data) < new Date() && !despesa && (
          <small>⚠️ Atenção: Esta é uma data no passado. Pode ser uma despesa que foi esquecida de cadastrar.</small>
        )}
      </div>

      <div className="form-group">
        <label>Descrição *</label>
        <input
          type="text"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          aria-label="Descrição da despesa"
          required
        />
      </div>

      <div className="form-group">
        <label>Tipo de Despesa *</label>
        <select
          value={formData.tipoDespesa}
          onChange={(e) => setFormData({ 
            ...formData, 
            tipoDespesa: e.target.value as TipoDespesa,
            subcategoria: undefined // Reset subcategoria when changing type
          })}
          aria-label="Tipo de despesa"
          required
        >
          {Object.entries(LABEL_TIPO_DESPESA).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {formData.tipoDespesa === TipoDespesa.IMOVEIS && (
        <div className="form-group">
          <label>Subcategoria de Imóvel *</label>
          <select
            value={formData.subcategoria || ''}
            onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value as SubcategoriaImovel })}
            aria-label="Subcategoria de imóvel"
            required
          >
            <option value="">Selecione uma subcategoria</option>
            {SUBCATEGORIAS_IMOVEL.map((sub) => (
              <option key={sub} value={sub}>{LABEL_SUBCATEGORIA_IMOVEL[sub]}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Classificação *</label>
        <select
          value={formData.empresa}
          onChange={(e) => setFormData({ ...formData, empresa: e.target.value as TipoEmpresa })}
          aria-label="Classificação da despesa"
          required
        >
          {Object.entries(LABEL_EMPRESA).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Status de Pagamento *</label>
        <select
          value={formData.statusPagamento}
          onChange={(e) => setFormData({ ...formData, statusPagamento: e.target.value as StatusPagamento })}
          aria-label="Status de pagamento"
          required
        >
          {Object.entries(LABEL_STATUS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Forma de Pagamento *</label>
        <select
          value={formData.formaPagamento}
          onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value as FormaPagamento })}
          aria-label="Forma de pagamento"
          required
        >
          {Object.entries(LABEL_FORMA_PAGAMENTO).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {formData.formaPagamento !== FormaPagamento.DINHEIRO && (
        <div className="form-group">
          <label>Banco (Opcional)</label>
          <select
            value={formData.banco}
            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
            aria-label="Banco"
          >
            <option value="">Selecione um banco (opcional)</option>
            {BANCOS_FIXOS.map((banco) => (
              <option key={banco} value={banco}>{banco}</option>
            ))}
          </select>
        </div>
      )}

      {!despesa && (
        <>
          <div className="form-group form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={repetir}
                onChange={(e) => setRepetir(e.target.checked)}
              />
              Lançar como múltiplas parcelas?
            </label>
          </div>

          {repetir && (
            <div className="form-group">
              <label>Número de Parcelas *</label>
              <input
                type="number"
                min="2"
                max="360"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(parseInt(e.target.value) || 1)}
                aria-label="Número de parcelas"
                required={repetir}
              />
              <small>Cada parcela será lançada com 30 dias de intervalo</small>
            </div>
          )}
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {despesa ? 'Atualizar' : 'Cadastrar'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
