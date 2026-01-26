import { FiltroDespesa, TipoDespesa, LABEL_EMPRESA, LABEL_TIPO_DESPESA, LABEL_SUBCATEGORIA_IMOVEL, LABEL_STATUS, LABEL_FORMA_PAGAMENTO, BANCOS_FIXOS, SUBCATEGORIAS_IMOVEL } from '../types/Despesa';

interface FiltrosDespesasProps {
  filtros: FiltroDespesa;
  opcoes?: { bancos: string[]; tiposDespesa: string[] };
  onChange: (filtros: FiltroDespesa) => void;
  onClear: () => void;
}

export default function FiltrosDespesas({ filtros, onChange, onClear }: FiltrosDespesasProps) {
  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const updateFilter = (key: keyof FiltroDespesa, value: any) => {
    const newFiltros = { ...filtros };
    if (value === null || value === '' || value === undefined) {
      delete newFiltros[key];
    } else {
      newFiltros[key] = value;
    }
    onChange(newFiltros);
  };

  const handlePeriodoChange = (periodo: 'mensal' | 'anual') => {
    const newFiltros = { ...filtros };
    
    if (periodo === 'mensal') {
      // Se switching para mensal, garante que tem mês selecionado
      if (!newFiltros.mes) {
        newFiltros.mes = new Date().getMonth() + 1;
      }
    } else {
      // Se switching para anual, remove o mês
      delete newFiltros.mes;
    }
    
    onChange(newFiltros);
  };

  const periodoAtual = filtros.mes ? 'mensal' : 'anual';

  return (
    <div className="filtros-despesas">
      <h3>Filtros</h3>
      
      <div className="periodo-selector">
        <label>Período:</label>
        <button 
          className={`btn btn-period ${periodoAtual === 'mensal' ? 'active' : ''}`}
          onClick={() => handlePeriodoChange('mensal')}
        >
          Mensal
        </button>
        <button 
          className={`btn btn-period ${periodoAtual === 'anual' ? 'active' : ''}`}
          onClick={() => handlePeriodoChange('anual')}
        >
          Anual
        </button>
      </div>

      <div className="filtros-grid">
        {periodoAtual === 'mensal' && (
          <div className="filtro-item">
            <label htmlFor="filtro-mes">Mês</label>
            <select
              id="filtro-mes"
              aria-label="Selecionar mês"
              value={filtros.mes || ''}
              onChange={(e) => updateFilter('mes', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Todos</option>
              {meses.map((mes) => (
                <option key={mes.value} value={mes.value}>{mes.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filtro-item">
          <label htmlFor="filtro-ano">{periodoAtual === 'mensal' ? 'Ano' : 'Ano (Anual)'}</label>
          <select
            id="filtro-ano"
            aria-label="Selecionar ano"
            value={filtros.ano || ''}
            onChange={(e) => updateFilter('ano', e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Todos</option>
            {anos.map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        <div className="filtro-item">
          <label htmlFor="filtro-empresa">Classificação</label>
          <select
            id="filtro-empresa"
            aria-label="Selecionar classificação"
            value={filtros.empresa || ''}
            onChange={(e) => updateFilter('empresa', e.target.value || null)}
          >
            <option value="">Todas</option>
            {Object.entries(LABEL_EMPRESA).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="filtro-item">
          <label htmlFor="filtro-tipo">Tipo de Despesa</label>
          <select
            id="filtro-tipo"
            aria-label="Selecionar tipo de despesa"
            value={filtros.tipoDespesa || ''}
            onChange={(e) => {
              updateFilter('tipoDespesa', e.target.value || null);
              // Reset subcategoria when changing type
              updateFilter('subcategoria', undefined);
            }}
          >
            <option value="">Todos</option>
            {Object.values(TipoDespesa).map((tipo) => (
              <option key={tipo} value={tipo}>{LABEL_TIPO_DESPESA[tipo]}</option>
            ))}
          </select>
        </div>

        {filtros.tipoDespesa === TipoDespesa.IMOVEIS && (
          <div className="filtro-item">
            <label htmlFor="filtro-subcategoria">Subcategoria de Imóvel</label>
            <select
              id="filtro-subcategoria"
              aria-label="Selecionar subcategoria"
              value={filtros.subcategoria || ''}
              onChange={(e) => updateFilter('subcategoria', e.target.value || null)}
            >
              <option value="">Todas</option>
              {SUBCATEGORIAS_IMOVEL.map((sub) => (
                <option key={sub} value={sub}>{LABEL_SUBCATEGORIA_IMOVEL[sub]}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filtro-item">
          <label htmlFor="filtro-banco">Banco</label>
          <select
            id="filtro-banco"
            aria-label="Selecionar banco"
            value={filtros.banco || ''}
            onChange={(e) => updateFilter('banco', e.target.value || null)}
          >
            <option value="">Todos</option>
            {BANCOS_FIXOS.map((banco) => (
              <option key={banco} value={banco}>{banco}</option>
            ))}
          </select>
        </div>

        <div className="filtro-item">
          <label htmlFor="filtro-forma-pagamento">Forma de Pagamento</label>
          <select
            id="filtro-forma-pagamento"
            aria-label="Selecionar forma de pagamento"
            value={filtros.formaPagamento || ''}
            onChange={(e) => updateFilter('formaPagamento', e.target.value || null)}
          >
            <option value="">Todas</option>
            {Object.entries(LABEL_FORMA_PAGAMENTO).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="filtro-item">
          <label htmlFor="filtro-status">Status</label>
          <select
            id="filtro-status"
            aria-label="Selecionar status"
            value={filtros.statusPagamento || ''}
            onChange={(e) => updateFilter('statusPagamento', e.target.value || null)}
          >
            <option value="">Todos</option>
            {Object.entries(LABEL_STATUS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={onClear} className="btn btn-secondary">
        Limpar Filtros
      </button>
    </div>
  );
}
