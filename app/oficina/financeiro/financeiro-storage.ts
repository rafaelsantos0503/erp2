import type { ContaBancaria, ContaPagar, ContaReceber } from "./types";

const STORAGE_KEY_CONTAS_BANCARIAS = "oficina_contas_bancarias";
const STORAGE_KEY_CONTAS_PAGAR = "oficina_contas_pagar";
const STORAGE_KEY_CONTAS_RECEBER = "oficina_contas_receber";

// Contas Bancárias
const contasBancariasIniciais: ContaBancaria[] = [
  {
    id: 1,
    banco: "Banco do Brasil",
    agencia: "1234-5",
    conta: "12345-6",
    tipo: "CORRENTE",
    titular: "Oficina Mecânica Central",
    tipoPessoa: "PJ",
    cnpj: "12.345.678/0001-90",
    ativa: true,
  },
];

export function getContasBancarias(): ContaBancaria[] {
  if (typeof window === "undefined") return contasBancariasIniciais;
  
  const stored = localStorage.getItem(STORAGE_KEY_CONTAS_BANCARIAS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return contasBancariasIniciais;
    }
  }
  
  localStorage.setItem(STORAGE_KEY_CONTAS_BANCARIAS, JSON.stringify(contasBancariasIniciais));
  return contasBancariasIniciais;
}

export function saveContasBancarias(contas: ContaBancaria[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CONTAS_BANCARIAS, JSON.stringify(contas));
  window.dispatchEvent(new CustomEvent("contas-bancarias-updated"));
}

// Contas a Pagar
export function getContasPagar(): ContaPagar[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY_CONTAS_PAGAR);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  return [];
}

export function saveContasPagar(contas: ContaPagar[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CONTAS_PAGAR, JSON.stringify(contas));
  window.dispatchEvent(new CustomEvent("contas-pagar-updated"));
}

// Contas a Receber
export function getContasReceber(): ContaReceber[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(STORAGE_KEY_CONTAS_RECEBER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  return [];
}

export function saveContasReceber(contas: ContaReceber[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CONTAS_RECEBER, JSON.stringify(contas));
  window.dispatchEvent(new CustomEvent("contas-receber-updated"));
}

