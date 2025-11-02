/**
 * Serviço de API para Financeiro
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";
import type { PageRequest, PageResponse } from "./types";

export interface ContaBancariaAPI {
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

export interface ContaPagarAPI {
  id: number;
  descricao: string;
  fornecedor: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  dataCriacao?: string; // Data de criação da conta
  pago: boolean;
  recorrencia: "NENHUMA" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  contaBancariaId?: number;
  observacoes?: string;
}

export interface ContaReceberAPI {
  id: number;
  descricao: string;
  cliente: string;
  valor: number;
  dataVencimento: string;
  dataRecebimento?: string;
  dataCriacao?: string; // Data de criação da conta
  recebido: boolean;
  recorrencia: "NENHUMA" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  contaBancariaId?: number;
  observacoes?: string;
  ordemServicoId?: number;
}

export const financeiroService = {
  // Contas Bancárias
  contasBancarias: {
    getAll: async (api: ApiClient): Promise<ContaBancariaAPI[]> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-bancarias?empresaId=${api.empresaId}`;
      return api.get(endpoint);
    },
    create: async (api: ApiClient, data: Omit<ContaBancariaAPI, "id">): Promise<ContaBancariaAPI> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-bancarias?empresaId=${api.empresaId}`;
      return api.post(endpoint, data);
    },
    update: async (api: ApiClient, id: number, data: Partial<ContaBancariaAPI>): Promise<ContaBancariaAPI> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-bancarias/${id}?empresaId=${api.empresaId}`;
      return api.put(endpoint, data);
    },
    delete: async (api: ApiClient, id: number): Promise<void> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-bancarias/${id}?empresaId=${api.empresaId}`;
      return api.delete(endpoint);
    },
  },

  // Contas a Pagar
  contasPagar: {
    getAll: async (api: ApiClient, pageRequest?: PageRequest): Promise<PageResponse<ContaPagarAPI>> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const params = new URLSearchParams();
      params.append("empresaId", api.empresaId);
      
      if (pageRequest) {
        if (pageRequest.page !== undefined) params.append("page", pageRequest.page.toString());
        if (pageRequest.size !== undefined) params.append("size", pageRequest.size.toString());
        if (pageRequest.sort) params.append("sort", pageRequest.sort);
      }
      
      const endpoint = `/oficina/financeiro/contas-pagar?${params.toString()}`;
      return api.get(endpoint);
    },
    create: async (api: ApiClient, data: Omit<ContaPagarAPI, "id">): Promise<ContaPagarAPI> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-pagar?empresaId=${api.empresaId}`;
      return api.post(endpoint, data);
    },
    update: async (api: ApiClient, id: number, data: Partial<ContaPagarAPI>): Promise<ContaPagarAPI> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-pagar/${id}?empresaId=${api.empresaId}`;
      return api.put(endpoint, data);
    },
    delete: async (api: ApiClient, id: number): Promise<void> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-pagar/${id}?empresaId=${api.empresaId}`;
      return api.delete(endpoint);
    },
  },

  // Contas a Receber
  contasReceber: {
    getAll: async (api: ApiClient, pageRequest?: PageRequest): Promise<PageResponse<ContaReceberAPI>> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const params = new URLSearchParams();
      params.append("empresaId", api.empresaId);
      
      if (pageRequest) {
        if (pageRequest.page !== undefined) params.append("page", pageRequest.page.toString());
        if (pageRequest.size !== undefined) params.append("size", pageRequest.size.toString());
        if (pageRequest.sort) params.append("sort", pageRequest.sort);
      }
      
      const endpoint = `/oficina/financeiro/contas-receber?${params.toString()}`;
      return api.get(endpoint);
    },
    create: async (api: ApiClient, data: Omit<ContaReceberAPI, "id">): Promise<ContaReceberAPI> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-receber?empresaId=${api.empresaId}`;
      return api.post(endpoint, data);
    },
    update: async (api: ApiClient, id: number, data: Partial<ContaReceberAPI>): Promise<ContaReceberAPI> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-receber/${id}?empresaId=${api.empresaId}`;
      return api.put(endpoint, data);
    },
    delete: async (api: ApiClient, id: number): Promise<void> => {
      if (!api.empresaId) {
        throw new Error("Empresa ID não encontrado");
      }
      const endpoint = `/oficina/financeiro/contas-receber/${id}?empresaId=${api.empresaId}`;
      return api.delete(endpoint);
    },
  },
};

