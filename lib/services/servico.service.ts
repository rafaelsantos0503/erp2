/**
 * Serviço de API para Serviços
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";
import type { PageRequest, PageResponse } from "./types";

export interface ServicoAPI {
  id: number;
  nome: string;
  descricao: string;
  tempoEstimadoHoras: number;
  tipoAplicacao: "GERAL" | "ESPECIFICO";
  marcaId?: number | null;
  modeloId?: number | null;
}

export const servicoService = {
  getAll: async (api: ApiClient, pageRequest?: PageRequest): Promise<PageResponse<ServicoAPI>> => {
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
    
    const endpoint = `/oficina/servicos?${params.toString()}`;
    return api.get(endpoint);
  },

  getById: async (api: ApiClient, id: number): Promise<ServicoAPI> => {
    return api.get(`/oficina/servicos/${id}`);
  },

  create: async (api: ApiClient, data: Omit<ServicoAPI, "id">): Promise<ServicoAPI> => {
    return api.post("/oficina/servicos", data);
  },

  update: async (api: ApiClient, id: number, data: Partial<ServicoAPI>): Promise<ServicoAPI> => {
    return api.put(`/oficina/servicos/${id}`, data);
  },

  delete: async (api: ApiClient, id: number): Promise<void> => {
    return api.delete(`/oficina/servicos/${id}`);
  },
};

