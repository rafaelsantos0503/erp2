/**
 * Serviço de API para Dashboard
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";

export interface DashboardStats {
  ordensEmAndamento: number;
  ordensAguardandoPecas: number;
  receitaMensal: number;
  ordensUrgentes: number;
  totalOrdens: number;
  taxaConclusao: number;
  ticketMedio: number;
  clientesAtendidos: number;
}

export interface DashboardOrdem {
  id: number;
  numero: string;
  cliente: string;
  veiculo: string;
  status: string;
  data: string;
  valor: number;
  prioridade: string;
}

export interface DashboardResponse {
  estatisticas: DashboardStats;
  ordensRecentes: DashboardOrdem[];
}

export const dashboardService = {
  getDashboard: async (api: ApiClient): Promise<DashboardResponse> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    
    const endpoint = `/oficina/dashboard?empresaId=${api.empresaId}`;
    return api.get(endpoint);
  },
};

