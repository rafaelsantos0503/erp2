/**
 * Serviço de API para Configurações
 * Integração com backend Java Spring Boot
 */

import type { ApiClient } from "../api";

export interface ConfiguracaoAPI {
  id: string; // ObjectId do MongoDB
  nomeEmpresa?: string;
  cnpjEmpresa?: string;
  cepEmpresa?: string;
  logradouroEmpresa?: string;
  numeroEmpresa?: string;
  complementoEmpresa?: string;
  bairroEmpresa?: string;
  cidadeEmpresa?: string;
  estadoEmpresa?: string;
  mediaAtendimentosMensais?: number;
  margemLucroPorAtendimento?: number;
}

export interface ValorOperacionalAPI {
  id: string; // ObjectId do MongoDB
  descricao: string;
  valor: number;
}

export interface MarcaAPI {
  id: string; // ObjectId do MongoDB
  nome: string;
}

export interface ModeloAPI {
  id: string; // ObjectId do MongoDB
  marcaId: string; // ObjectId do MongoDB
  nome: string;
}

export const configuracoesService = {
  // Configurações gerais (Dados da Empresa)
  getConfiguracao: async (api: ApiClient): Promise<ConfiguracaoAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/configuracoes/empresa?empresaId=${api.empresaId}`;
    return api.get(endpoint);
  },

  updateConfiguracao: async (api: ApiClient, data: Partial<ConfiguracaoAPI>): Promise<ConfiguracaoAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    // O backend usa POST para criar/atualizar (upsert)
    const endpoint = `/oficina/configuracoes/empresa?empresaId=${api.empresaId}`;
    return api.post(endpoint, data);
  },

  // Valores Operacionais
  getValoresOperacionais: async (api: ApiClient): Promise<ValorOperacionalAPI[]> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/configuracoes/valores-operacionais?empresaId=${api.empresaId}`;
    return api.get(endpoint);
  },

  createValorOperacional: async (api: ApiClient, data: Omit<ValorOperacionalAPI, "id">): Promise<ValorOperacionalAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/configuracoes/valores-operacionais?empresaId=${api.empresaId}`;
    return api.post(endpoint, data);
  },

  updateValorOperacional: async (api: ApiClient, id: string, data: Partial<ValorOperacionalAPI>): Promise<ValorOperacionalAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    // O backend não requer empresaId no update, apenas no body
    const endpoint = `/oficina/configuracoes/valores-operacionais/${id}`;
    return api.put(endpoint, data);
  },

  deleteValorOperacional: async (api: ApiClient, id: string): Promise<void> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    // O backend não requer empresaId no delete
    const endpoint = `/oficina/configuracoes/valores-operacionais/${id}`;
    return api.delete(endpoint);
  },

  // Marcas
  // NOTA: O backend só tem GET para marcas. CREATE/UPDATE/DELETE devem estar em outro controller ou não implementados ainda
  getMarcas: async (api: ApiClient): Promise<MarcaAPI[]> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/configuracoes/marcas?empresaId=${api.empresaId}`;
    return api.get(endpoint);
  },

  // NOTA: Estas operações podem não estar implementadas no backend ainda
  // Verificar se existe um controller separado para marcas/modelos
  createMarca: async (api: ApiClient, data: Omit<MarcaAPI, "id">): Promise<MarcaAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    // Tentar usar o mesmo endpoint ou verificar se existe um controller de veículos
    const endpoint = `/oficina/veiculos/marcas?empresaId=${api.empresaId}`;
    return api.post(endpoint, data);
  },

  updateMarca: async (api: ApiClient, id: string, data: Partial<MarcaAPI>): Promise<MarcaAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/veiculos/marcas/${id}?empresaId=${api.empresaId}`;
    return api.put(endpoint, data);
  },

  deleteMarca: async (api: ApiClient, id: string): Promise<void> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/veiculos/marcas/${id}?empresaId=${api.empresaId}`;
    return api.delete(endpoint);
  },

  // Modelos
  getModelos: async (api: ApiClient, marcaId?: string): Promise<ModeloAPI[]> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    if (!marcaId) {
      return [];
    }
    const params = new URLSearchParams({
      empresaId: api.empresaId,
      marcaId,
    });
    const endpoint = `/oficina/modelos/by-marca?${params.toString()}`;
    return api.get(endpoint);
  },

  // NOTA: Estas operações podem não estar implementadas no backend ainda
  createModelo: async (api: ApiClient, data: Omit<ModeloAPI, "id">): Promise<ModeloAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/veiculos/modelos?empresaId=${api.empresaId}`;
    return api.post(endpoint, data);
  },

  updateModelo: async (api: ApiClient, id: string, data: Partial<ModeloAPI>): Promise<ModeloAPI> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/veiculos/modelos/${id}?empresaId=${api.empresaId}`;
    return api.put(endpoint, data);
  },

  deleteModelo: async (api: ApiClient, id: string): Promise<void> => {
    if (!api.empresaId) {
      throw new Error("Empresa ID não encontrado");
    }
    const endpoint = `/oficina/veiculos/modelos/${id}?empresaId=${api.empresaId}`;
    return api.delete(endpoint);
  },
};

