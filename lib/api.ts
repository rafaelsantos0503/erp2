import { useEmpresa } from "./empresa-context";

/**
 * Hook para fazer chamadas à API
 * Automaticamente adiciona o empresaId em todas as requisições
 * 
 * TODO: Quando tiver backend em Java, substituir pelos endpoints reais
 */
export function useApi() {
  const { empresaId } = useEmpresa();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    if (!empresaId) {
      throw new Error("Empresa ID não encontrado");
    }

    // Adiciona empresaId aos headers ou query params
    const url = new URL(endpoint, baseUrl);
    url.searchParams.append("empresaId", empresaId);

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      // TODO: Adicionar token de autenticação quando implementar
      // "Authorization": `Bearer ${token}`
    };

    return fetch(url.toString(), {
      ...options,
      headers,
    });
  };

  // CRUD helpers
  const get = async (endpoint: string) => {
    const response = await fetchWithAuth(endpoint);
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.statusText}`);
    }
    return response.json();
  };

  const post = async (endpoint: string, data: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Erro ao criar dados: ${response.statusText}`);
    }
    return response.json();
  };

  const put = async (endpoint: string, data: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Erro ao atualizar dados: ${response.statusText}`);
    }
    return response.json();
  };

  const del = async (endpoint: string) => {
    const response = await fetchWithAuth(endpoint, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Erro ao deletar dados: ${response.statusText}`);
    }
    return response.json();
  };

  return {
    empresaId,
    baseUrl,
    fetchWithAuth,
    get,
    post,
    put,
    delete: del,
  };
}

/**
 * Funções mockadas para desenvolvimento
 * TODO: Remover quando tiver backend real
 */
export const mockData = {
  ordensServico: {
    getAll: async () => [
      { id: 1, numero: "OS-001", cliente: "João Silva", veiculo: "Civic 2020", status: "Em Andamento", data: "01/03/2025", valor: 450.00, prioridade: "Alta" },
      { id: 2, numero: "OS-002", cliente: "Maria Santos", veiculo: "Corolla 2019", status: "Aguardando Peças", data: "28/02/2025", valor: 320.00, prioridade: "Média" },
      { id: 3, numero: "OS-003", cliente: "Pedro Oliveira", veiculo: "Onix 2021", status: "Finalizado", data: "27/02/2025", valor: 180.00, prioridade: "Baixa" },
    ],
  },
};

