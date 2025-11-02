/**
 * Serviço de API para Funcionários
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";
import type { PageRequest, PageResponse } from "./types";

export interface FuncionarioAPI {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  tipo: string;
  tipoContratacao: "CLT" | "PJ";
  valorDespesa: number;
  cpf: string;
  dataAdmissao: string;
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export const funcionarioService = {
  getAll: async (api: ApiClient, pageRequest?: PageRequest): Promise<PageResponse<FuncionarioAPI>> => {
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
    
    const endpoint = `/oficina/funcionarios?${params.toString()}`;
    return api.get(endpoint);
  },

  getById: async (api: ApiClient, id: number): Promise<FuncionarioAPI> => {
    return api.get(`/oficina/funcionarios/${id}`);
  },

  create: async (api: ApiClient, data: Omit<FuncionarioAPI, "id">): Promise<FuncionarioAPI> => {
    return api.post("/oficina/funcionarios", data);
  },

  update: async (api: ApiClient, id: number, data: Partial<FuncionarioAPI>): Promise<FuncionarioAPI> => {
    return api.put(`/oficina/funcionarios/${id}`, data);
  },

  delete: async (api: ApiClient, id: number): Promise<void> => {
    return api.delete(`/oficina/funcionarios/${id}`);
  },
};

