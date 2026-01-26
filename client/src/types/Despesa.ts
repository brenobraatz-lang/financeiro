export enum TipoEmpresa {
  PESSOA_FISICA = 'PESSOA_FISICA',
  PESSOA_JURIDICA = 'PESSOA_JURIDICA',
  DINHEIRO = 'DINHEIRO'
}

export enum TipoDespesa {
  PESSOAL = 'PESSOAL',
  ESCRITORIO = 'ESCRITORIO',
  IMOVEIS = 'IMOVEIS'
}

export enum SubcategoriaImovel {
  CONDOMINIO_JASMIM = 'CONDOMINIO_JASMIM',
  RUA_ITAPIRA = 'RUA_ITAPIRA',
  GRANVILLE = 'GRANVILLE',
  TERRENOS = 'TERRENOS'
}

export enum StatusPagamento {
  PAGA = 'PAGA',
  AGENDADO = 'AGENDADO',
  NAO_PAGA = 'NAO_PAGA'
}

export enum FormaPagamento {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  CARTAO = 'CARTAO',
  DINHEIRO = 'DINHEIRO'
}

export const BANCOS_FIXOS = [
  'Banco do Brasil – Pessoa Física',
  'Banco do Brasil – Pessoa Jurídica',
  'Nubank – Pessoa Física',
  'Nubank – Pessoa Jurídica'
] as const;

export interface Despesa {
  id?: number;
  valor: number;
  data: string; // Data de vencimento
  descricao: string;
  tipoDespesa: TipoDespesa;
  subcategoria?: SubcategoriaImovel; // Apenas para IMOVEIS
  empresa: TipoEmpresa;
  statusPagamento: StatusPagamento;
  formaPagamento: FormaPagamento;
  banco?: string; // Opcional
  createdAt?: string;
  updatedAt?: string;
}

export interface FiltroDespesa {
  mes?: number;
  ano?: number;
  empresa?: TipoEmpresa;
  tipoDespesa?: TipoDespesa;
  subcategoria?: SubcategoriaImovel;
  banco?: string;
  formaPagamento?: FormaPagamento;
  statusPagamento?: StatusPagamento;
}

export interface RelatorioMensal {
  mes: number;
  ano: number;
  totalGeral: number;
  totalPessoaFisica: number;
  totalPessoaJuridica: number;
  totalDinheiro: number; // Despesas pagas em dinheiro
  quantidadePessoaFisica: number;
  quantidadePessoaJuridica: number;
  quantidadeDinheiro: number;
  despesasPorTipo: { [tipo: string]: number };
}

export interface EntradaCaixa {
  id?: number;
  valor: number;
  data: string;
  descricao: string;
  mes: number;
  ano: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaixaMensal {
  mes: number;
  ano: number;
  entradas: number;
  saidas: number;
  saldo: number;
  entradasDetalhadas: EntradaCaixa[];
}

export const LABEL_EMPRESA: Record<TipoEmpresa, string> = {
  [TipoEmpresa.PESSOA_FISICA]: 'Pessoa Física',
  [TipoEmpresa.PESSOA_JURIDICA]: 'Pessoa Jurídica',
  [TipoEmpresa.DINHEIRO]: 'Dinheiro'
};

export const LABEL_TIPO_DESPESA: Record<TipoDespesa, string> = {
  [TipoDespesa.PESSOAL]: 'Pessoal',
  [TipoDespesa.ESCRITORIO]: 'Escritório',
  [TipoDespesa.IMOVEIS]: 'Imóveis'
};

export const LABEL_SUBCATEGORIA_IMOVEL: Record<SubcategoriaImovel, string> = {
  [SubcategoriaImovel.CONDOMINIO_JASMIM]: 'Condomínio Jasmim',
  [SubcategoriaImovel.RUA_ITAPIRA]: 'Rua Itapira',
  [SubcategoriaImovel.GRANVILLE]: 'Granville',
  [SubcategoriaImovel.TERRENOS]: 'Terrenos'
};

export const SUBCATEGORIAS_IMOVEL = Object.values(SubcategoriaImovel);

export const LABEL_STATUS: Record<StatusPagamento, string> = {
  [StatusPagamento.PAGA]: 'Paga',
  [StatusPagamento.AGENDADO]: 'Agendado',
  [StatusPagamento.NAO_PAGA]: 'Não Paga'
};

export const LABEL_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  [FormaPagamento.PIX]: 'Pix',
  [FormaPagamento.BOLETO]: 'Boleto',
  [FormaPagamento.CARTAO]: 'Cartão',
  [FormaPagamento.DINHEIRO]: 'Dinheiro'
};
