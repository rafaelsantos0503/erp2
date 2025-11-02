export interface Veiculo {
  id: number;
  marca: string;
  modelo: string;
}

export interface Marca {
  id: number;
  nome: string;
}

export interface Modelo {
  id: number;
  marcaId: number;
  nome: string;
}

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  telefone: string;
  email?: string;
  tipo: "Mecanico" | "Recepcionista" | "Gerente" | "Outro";
  tipoContratacao: "CLT" | "PJ";
  valorDespesa?: number;
  cpf?: string;
  dataAdmissao?: string;
  endereco?: Endereco;
}

