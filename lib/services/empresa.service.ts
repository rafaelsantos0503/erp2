/**
 * Serviço de API para Empresas
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";

export interface EmpresaAPI {
  id: string;
  nome: string;
  modulo: number; // 2 = Corrida, 3 = Oficina
  moduloNome?: string;
}

export const empresaService = {
  /**
   * Busca empresas disponíveis para seleção
   * Não é paginado - retorna todas as empresas do módulo (ou todas se modulo não informado)
   * @param api - Cliente API
   * @param modulo - Módulo para filtrar (2 = Corrida, 3 = Oficina) - opcional
   */
  getEmpresasSelecao: async (api: ApiClient, modulo?: 2 | 3): Promise<EmpresaAPI[]> => {
    // Endpoint: GET /api/empresas/selecao?modulo={modulo}
    // Retorna todas as empresas do módulo especificado, ou todas se modulo não informado (não paginado)
    const endpoint = modulo ? `/empresas/selecao?modulo=${modulo}` : `/empresas/selecao`;
    return api.get(endpoint);
  },
  
  /**
   * @deprecated Use getEmpresasSelecao ao invés disso
   * Busca todas as empresas de um módulo específico
   */
  getAllByModulo: async (api: ApiClient, modulo: 2 | 3): Promise<EmpresaAPI[]> => {
    // Endpoint: GET /api/empresas?modulo={modulo}
    // Retorna todas as empresas do módulo especificado (não paginado)
    const endpoint = `/empresas?modulo=${modulo}`;
    return api.get(endpoint);
  },

  /**
   * Busca uma empresa específica por ID
   */
  getById: async (api: ApiClient, id: string): Promise<EmpresaAPI> => {
    return api.get(`/empresas/${id}`);
  },
};

