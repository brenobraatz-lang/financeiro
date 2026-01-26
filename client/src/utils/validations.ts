export interface ValidationError {
  campo: string;
  mensagem: string;
}

export const validarDespesa = (despesa: any): ValidationError[] => {
  const erros: ValidationError[] = [];

  if (!despesa.data) {
    erros.push({ campo: 'data', mensagem: 'Data é obrigatória' });
  }

  if (!despesa.descricao || despesa.descricao.trim().length === 0) {
    erros.push({ campo: 'descricao', mensagem: 'Descrição é obrigatória' });
  }

  if (!despesa.valor || despesa.valor <= 0) {
    erros.push({ campo: 'valor', mensagem: 'Valor deve ser maior que 0' });
  }

  if (!despesa.tipoDespesa) {
    erros.push({ campo: 'tipoDespesa', mensagem: 'Tipo de despesa é obrigatório' });
  }

  if (!despesa.empresa) {
    erros.push({ campo: 'empresa', mensagem: 'Tipo de empresa é obrigatório' });
  }

  if (!despesa.banco) {
    erros.push({ campo: 'banco', mensagem: 'Banco é obrigatório' });
  }

  if (!despesa.formaPagamento) {
    erros.push({ campo: 'formaPagamento', mensagem: 'Forma de pagamento é obrigatória' });
  }

  if (!despesa.statusPagamento) {
    erros.push({ campo: 'statusPagamento', mensagem: 'Status de pagamento é obrigatório' });
  }

  return erros;
};

export const validarEntrada = (entrada: any): ValidationError[] => {
  const erros: ValidationError[] = [];

  if (!entrada.data) {
    erros.push({ campo: 'data', mensagem: 'Data é obrigatória' });
  }

  if (!entrada.descricao || entrada.descricao.trim().length === 0) {
    erros.push({ campo: 'descricao', mensagem: 'Descrição é obrigatória' });
  }

  if (!entrada.valor || entrada.valor <= 0) {
    erros.push({ campo: 'valor', mensagem: 'Valor deve ser maior que 0' });
  }

  return erros;
};
