/**
 * Serviço de API para Clientes
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";
import type { PageRequest, PageResponse } from "./types";

export interface ClienteAPI {
  id: number | string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  veiculos?: Array<{
    id: number | string;
    marca: string;
    modelo: string;
    placa: string;
    ano: string;
    cor: string;
  }> | null;
}

export const clienteService = {
  getAll: async (api: ApiClient, pageRequest?: PageRequest): Promise<PageResponse<ClienteAPI>> => {
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
    
    const endpoint = `/oficina/clientes?${params.toString()}`;
    return api.get(endpoint);
  },

  getById: async (api: ApiClient, id: number): Promise<ClienteAPI> => {
    return api.get(`/oficina/clientes/${id}`);
  },

  create: async (api: ApiClient, data: Omit<ClienteAPI, "id">): Promise<ClienteAPI> => {
    return api.post("/oficina/clientes", data);
  },

  update: async (api: ApiClient, id: number | string, data: Partial<ClienteAPI>): Promise<ClienteAPI> => {
    return api.put(`/oficina/clientes/${id}`, data);
  },

  delete: async (api: ApiClient, id: number): Promise<void> => {
    return api.delete(`/oficina/clientes/${id}`);
  },
};

