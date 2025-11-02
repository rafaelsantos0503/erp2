export interface ContaBancaria {
  id: number;
  banco: string;
  agencia: string;
  conta: string;
  tipo: "CORRENTE" | "POUPANCA" | "SALARIO";
  titular: string;
  tipoPessoa: "PF" | "PJ";
  cpf?: string;
  cnpj?: string;
  ativa: boolean;
}

export type TipoRecorrencia = "NENHUMA" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";

export interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  dataCriacao?: string; // Data de criação da conta
  pago: boolean;
  recorrencia: TipoRecorrencia;
  contaBancariaId?: number;
  observacoes?: string;
  // Campos para recorrência
  recorrenciaId?: number; // ID da recorrência pai (se for gerada automaticamente)
  dataInicioRecorrencia?: string; // Data de início da recorrência
}

export interface ContaReceber {
  id: number;
  descricao: string;
  cliente: string;
  valor: number;
  dataVencimento: string;
  dataRecebimento?: string;
  dataCriacao?: string; // Data de criação da conta
  recebido: boolean;
  recorrencia: TipoRecorrencia;
  contaBancariaId?: number;
  observacoes?: string;
  ordemServicoId?: number; // ID da ordem de serviço que gerou esta conta (se aplicável)
  // Campos para recorrência
  recorrenciaId?: number; // ID da recorrência pai (se for gerada automaticamente)
  dataInicioRecorrencia?: string; // Data de início da recorrência
}

