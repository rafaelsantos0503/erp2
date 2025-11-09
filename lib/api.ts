import { useEmpresa } from "./empresa-context";
import { useAuth } from "./auth-context";
import { useMemo, useCallback } from "react";

/**
 * Hook para fazer chamadas à API
 * Automaticamente adiciona o empresaId e token de autenticação em todas as requisições
 * Integrado com backend Java Spring Boot
 */
export function useApi() {
  const { empresaId } = useEmpresa();
  const { token, logout } = useAuth();

  // Usa variável de ambiente para local ou produção
  // Local: http://localhost:8080/api
  // Produção: será configurado via NEXT_PUBLIC_API_URL
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api", []);
  
  // Validação da URL base em desenvolvimento
  if (process.env.NODE_ENV === 'development' && !baseUrl.startsWith('http')) {
    console.warn(`⚠️ Base URL parece estar incorreta: ${baseUrl}. Deve começar com http:// ou https://`);
  }

  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!empresaId) {
      throw new Error("Empresa ID não encontrado");
    }

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    // Construção da URL completa
    // Garante que baseUrl não termina com / e endpoint começa com /
    const baseUrlNormalizado = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const endpointNormalizado = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const urlCompleta = `${baseUrlNormalizado}${endpointNormalizado}`;
    
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${options.method || 'GET'} ${urlCompleta}`, {
        empresaId,
        hasToken: !!token,
        baseUrl,
        endpoint,
        urlCompleta,
      });
    }

    // Adiciona empresaId aos headers (melhor prática que query params)
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Empresa-Id": empresaId, // Header customizado para empresaId
      ...options.headers,
    };

    return fetch(urlCompleta, {
      ...options,
      headers,
    });
  }, [empresaId, token, baseUrl]);

  // Tratamento comum de erros HTTP
  const handleResponseError = useCallback(async (response: Response, operation: string) => {
    // Se token expirou ou é inválido (401), faz logout automático
    if (response.status === 401) {
      console.log("Token expirado ou inválido - fazendo logout automático");
      logout();
      // Redireciona para login após um pequeno delay para garantir que o logout processou
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }, 100);
      throw new Error("Sessão expirada. Por favor, faça login novamente.");
    }
    
    // Tenta obter mensagem de erro do corpo da resposta
    // Obtém status de forma segura
    const statusCode = typeof response.status === 'number' ? response.status : 0;
    let errorMessage = (typeof response.statusText === 'string' && response.statusText) 
      ? response.statusText 
      : `Erro HTTP ${statusCode}`;
    let errorBody = "";
    
    try {
      // Tenta ler o corpo da resposta
      // Nota: Se o response já foi usado, pode dar erro
      errorBody = await response.text();
      
      if (errorBody && errorBody.trim()) {
        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
        } catch {
          // Se não for JSON, usa o texto como está (limitado a 200 caracteres)
          if (errorBody.length < 200) {
            errorMessage = errorBody;
          } else {
            errorMessage = errorBody.substring(0, 200) + "...";
          }
        }
      }
    } catch (parseError) {
      // Se não conseguir ler o corpo (pode já ter sido consumido), ignora silenciosamente
      // Não faz log para evitar loops de erro
      errorBody = "";
    }
    
    // Log detalhado do erro em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      try {
        // Coleta informações de forma segura
        const errorDetails: Record<string, any> = {
          status: statusCode,
          statusText: typeof response.statusText === 'string' ? response.statusText : "(sem statusText)",
          url: typeof response.url === 'string' ? response.url : "(URL não disponível)",
          errorMessage,
        };
        
        if (errorBody && typeof errorBody === 'string') {
          errorDetails.errorBody = errorBody.length > 500 ? errorBody.substring(0, 500) + "..." : errorBody;
        } else {
          errorDetails.errorBody = "(sem corpo)";
        }
        
        console.error(`[API Error] ${operation}`, errorDetails);
        
        // Se for 404, dá dicas sobre possíveis problemas
        if (statusCode === 404) {
          console.error("❌ Erro 404 - Verifique:");
          console.error("1. O backend está rodando em http://localhost:8080?");
          console.error("2. A URL do endpoint está correta?");
          console.error("3. O endpoint existe no backend?");
          console.error(`URL tentada: ${errorDetails.url}`);
          console.error(`Base URL configurada: ${baseUrl}`);
        }
      } catch (logError) {
        // Se der erro ao fazer log, apenas mostra mensagem básica
        console.error(`[API Error] ${operation}: ${errorMessage} (${statusCode})`);
        if (process.env.NODE_ENV === 'development') {
          console.error("Erro ao fazer log detalhado:", logError);
        }
      }
    }
    
    throw new Error(`Erro ao ${operation}: ${errorMessage} (${statusCode})`);
  }, [logout]);

  // CRUD helpers
  const get = useCallback(async (endpoint: string) => {
    const response = await fetchWithAuth(endpoint);
    if (!response.ok) {
      await handleResponseError(response, "buscar dados");
    }
    return response.json();
  }, [fetchWithAuth, handleResponseError]);

  const post = useCallback(async (endpoint: string, data: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleResponseError(response, "criar dados");
    }
    return response.json();
  }, [fetchWithAuth, handleResponseError]);

  const put = useCallback(async (endpoint: string, data: any) => {
    const response = await fetchWithAuth(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleResponseError(response, "atualizar dados");
    }
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  }, [fetchWithAuth, handleResponseError]);

  const del = useCallback(async (endpoint: string) => {
    const response = await fetchWithAuth(endpoint, {
      method: "DELETE",
    });
    if (!response.ok) {
      await handleResponseError(response, "deletar dados");
    }
    // Para DELETE, pode não ter corpo na resposta
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  }, [fetchWithAuth, handleResponseError]);

  // Usa useMemo para estabilizar o objeto retornado e evitar re-execuções de useEffects
  return useMemo(() => ({
    empresaId,
    baseUrl,
    fetchWithAuth,
    get,
    post,
    put,
    delete: del,
  }), [empresaId, baseUrl, fetchWithAuth, get, post, put, del]); // Todas as dependências já memoizadas
}

// Tipo para o retorno do useApi (para uso nos serviços)
export type ApiClient = ReturnType<typeof useApi>;

// ============================================
// DADOS MOCKADOS - COMENTADOS PARA INTEGRAÇÃO COM BACKEND
// ============================================
/**
 * Funções mockadas para desenvolvimento
 * COMENTADO - Usar serviços em lib/services/ para integração com backend
 */
/*
export const mockData = {
  ordensServico: {
    getAll: async () => [
      { id: 1, numero: "OS-001", cliente: "João Silva", veiculo: "Civic 2020", status: "Em Andamento", data: "01/03/2025", valor: 450.00, prioridade: "Alta" },
      { id: 2, numero: "OS-002", cliente: "Maria Santos", veiculo: "Corolla 2019", status: "Aguardando Peças", data: "28/02/2025", valor: 320.00, prioridade: "Média" },
      { id: 3, numero: "OS-003", cliente: "Pedro Oliveira", veiculo: "Onix 2021", status: "Finalizado", data: "27/02/2025", valor: 180.00, prioridade: "Baixa" },
    ],
  },
};
*/

