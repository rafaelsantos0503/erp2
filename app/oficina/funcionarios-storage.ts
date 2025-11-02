import type { Funcionario } from "./types";

const STORAGE_KEY = "oficina_funcionarios";

const funcionariosIniciais: Funcionario[] = [
  { id: 1, nome: "Carlos Santos", telefone: "(11) 95555-5555", email: "carlos@oficina.com", tipo: "Mecanico", tipoContratacao: "CLT", valorDespesa: 3500, cpf: "123.456.789-00", dataAdmissao: "01/01/2023", endereco: { cep: "01310-100", logradouro: "Av. Paulista", numero: "1000", complemento: "Apto 101", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP" } },
  { id: 2, nome: "Roberto Lima", telefone: "(11) 94444-4444", email: "roberto@oficina.com", tipo: "Mecanico", tipoContratacao: "CLT", valorDespesa: 3200, cpf: "234.567.890-11", dataAdmissao: "15/03/2023", endereco: { cep: "02010-000", logradouro: "Rua Augusta", numero: "500", bairro: "Consolação", cidade: "São Paulo", estado: "SP" } },
  { id: 3, nome: "José Ferreira", telefone: "(11) 93333-3333", email: "jose@oficina.com", tipo: "Mecanico", tipoContratacao: "PJ", valorDespesa: 2800, cpf: "345.678.901-22", dataAdmissao: "01/06/2023" },
  { id: 4, nome: "Ana Silva", telefone: "(11) 92222-2222", email: "ana@oficina.com", tipo: "Recepcionista", tipoContratacao: "CLT", valorDespesa: 2200, cpf: "456.789.012-33", dataAdmissao: "01/02/2024" },
  { id: 5, nome: "Maria Costa", telefone: "(11) 91111-1111", email: "maria@oficina.com", tipo: "Recepcionista", tipoContratacao: "CLT", valorDespesa: 2200, cpf: "567.890.123-44", dataAdmissao: "01/04/2024" },
  { id: 6, nome: "João Pereira", telefone: "(11) 90000-0000", email: "joao@oficina.com", tipo: "Gerente", tipoContratacao: "CLT", valorDespesa: 5000, cpf: "678.901.234-55", dataAdmissao: "01/01/2022" },
];

export function getFuncionarios(): Funcionario[] {
  if (typeof window === "undefined") return funcionariosIniciais;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return funcionariosIniciais;
    }
  }
  
  // Inicializar com dados padrão na primeira vez
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionariosIniciais));
  return funcionariosIniciais;
}

export function saveFuncionarios(funcionarios: Funcionario[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
  
  // Disparar evento customizado para outras páginas atualizarem
  window.dispatchEvent(new CustomEvent("funcionarios-updated"));
}

export function calcularTotalColaboradores(): number {
  const funcionarios = getFuncionarios();
  return funcionarios.reduce((total, func) => total + (func.valorDespesa || 0), 0);
}

