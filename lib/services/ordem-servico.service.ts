/**
 * Serviço de API para Ordem de Serviço
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";
import type { PageRequest, PageResponse } from "./types";

export interface OrdemServicoAPI {
  id: number;
  numero: string;
  cliente: string;
  telefone: string;
  email: string;
  marcaVeiculo: string;
  modeloVeiculo: string;
  placa: string;
  ano: string;
  cor: string;
  descricaoProblema: string;
  prioridade: "Baixa" | "Média" | "Alta";
  status: "Orçamento" | "Em Andamento" | "Aguardando Peças" | "Finalizado" | "Cancelado";
  dataEntrada: string;
  dataPrevisao: string;
  mecanico: string;
  observacoes: string;
  valorTotal: number;
  itens: Array<{
    id: number;
    servicoId?: number;
    descricao: string;
    quantidade: string;
    valorUnitario: string;
    valorTotal: string;
    tempoEstimado?: number;
  }>;
}

/**
 * Funções auxiliares para chamadas à API de Ordem de Serviço
 * Estas funções devem receber o objeto api retornado por useApi()
 * 
 * Exemplo de uso:
 * ```typescript
 * const api = useApi();
 * // Com paginação
 * const pagina = await ordemServicoService.getAll(api, { page: 0, size: 10 });
 * const ordens = pagina.content;
 * ```
 */
export const ordemServicoService = {
  getAll: async (api: ApiClient, pageRequest?: PageRequest): Promise<PageResponse<OrdemServicoAPI>> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    
    const params = new URLSearchParams();
    
    // O backend espera empresaId como query parameter
    params.append("empresaId", api.empresaId);
    
    if (pageRequest) {
      if (pageRequest.page !== undefined) params.append("page", pageRequest.page.toString());
      if (pageRequest.size !== undefined) params.append("size", pageRequest.size.toString());
      if (pageRequest.sort) params.append("sort", pageRequest.sort);
    }
    
    // Backend usa "/ordens-servico" (plural)
    const queryString = params.toString();
    const endpoint = `/oficina/ordens-servico?${queryString}`;
    
    return api.get(endpoint);
  },

  getById: async (api: ApiClient, id: number): Promise<OrdemServicoAPI> => {
    return api.get(`/oficina/ordem-servico/${id}`);
  },

  create: async (api: ApiClient, data: Omit<OrdemServicoAPI, "id" | "numero">): Promise<OrdemServicoAPI> => {
    return api.post("/oficina/ordem-servico", data);
  },

  update: async (api: ApiClient, id: number, data: Partial<OrdemServicoAPI>): Promise<OrdemServicoAPI> => {
    return api.put(`/oficina/ordem-servico/${id}`, data);
  },

  updateStatus: async (api: ApiClient, id: number, status: OrdemServicoAPI["status"]): Promise<OrdemServicoAPI> => {
    return api.put(`/oficina/ordem-servico/${id}/status`, { status });
  },

  delete: async (api: ApiClient, id: number): Promise<void> => {
    return api.delete(`/oficina/ordem-servico/${id}`);
  },
};

