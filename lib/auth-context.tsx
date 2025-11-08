"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fazerLogin, obterUsuarioDoToken, validarToken, type LoginResponse, type Modulo } from "./auth";

interface AuthContextType {
  token: string | null;
  usuario: LoginResponse["usuario"] | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; usuario?: LoginResponse["usuario"] }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN_KEY = "authToken";
const STORAGE_EMPRESA_KEY = "empresaId";
const STORAGE_USER_KEY = "authUser";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

function getStoredUsuario(): LoginResponse["usuario"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse["usuario"];
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [usuario, setUsuario] = useState<LoginResponse["usuario"] | null>(() => getStoredUsuario());
  const [isLoading, setIsLoading] = useState(true);

  // Carrega token e usuário do localStorage ao inicializar
  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = getStoredToken();
      const storedUsuario = getStoredUsuario();
      if (storedToken) {
        // Primeiro tenta obter o usuário diretamente (mais confiável)
        // Se conseguir, significa que o token está válido
        try {
          const usuarioDoToken = await obterUsuarioDoToken(storedToken);

          if (usuarioDoToken) {
            // Conseguiu obter usuário - token está válido e funcionando
            setToken(storedToken);
            setUsuario({
              id: usuarioDoToken.id,
              username: usuarioDoToken.username,
              empresaId: usuarioDoToken.empresaId,
              modulo: usuarioDoToken.modulo,
              nome: usuarioDoToken.nome,
            });
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({
              id: usuarioDoToken.id,
              username: usuarioDoToken.username,
              empresaId: usuarioDoToken.empresaId,
              modulo: usuarioDoToken.modulo,
              nome: usuarioDoToken.nome,
            }));
            setIsLoading(false);
            return; // Sucesso - sai da função
          }
          
          // Se retornou null, significa que o token está inválido/expirado (401)
          // Caso exista um usuário armazenado (fallback), reutiliza para manter sessão em ambientes de desenvolvimento
          if (storedUsuario) {
            console.warn("Não foi possível validar o token (401). Mantendo sessão com dados armazenados localmente.");
            setToken(storedToken);
            setUsuario(storedUsuario);
            setIsLoading(false);
            return;
          }

          console.log("Token inválido/expirado (401), removendo do storage");
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_EMPRESA_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          setToken(null);
          setUsuario(null);
          setIsLoading(false);
          return;
        } catch (error) {
          // Erro de rede ao obter usuário - não remove token, pode ser problema temporário
          // Distingue erro de rede de token inválido
          if (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch'))) {
            console.warn("Erro de rede ao obter usuário, mantendo token:", error);
          setToken(storedToken); // Mantém token mesmo com erro de rede
          if (storedUsuario) {
            setUsuario(storedUsuario);
          }
            setIsLoading(false);
            return;
          }
          
          // Outros erros - tenta validar token como fallback
          console.warn("Erro ao obter usuário, tentando validar token:", error);
        }
        
        // Se chegou aqui, não conseguiu obter usuário mas não foi erro de rede
        // Tenta validar o token para ver se realmente expirou
        try {
          const tokenValido = await validarToken(storedToken);

          if (!tokenValido) {
            // Token realmente inválido/expirado - remove do storage
            console.log("Token inválido ou expirado conforme backend, removendo do storage");
            localStorage.removeItem(STORAGE_TOKEN_KEY);
            localStorage.removeItem(STORAGE_EMPRESA_KEY);
            localStorage.removeItem(STORAGE_USER_KEY);
            setToken(null);
            setUsuario(null);
          } else {
            // Token válido mas não conseguiu obter usuário (situação estranha)
            // Mantém o token por enquanto e tenta novamente depois
            console.warn("Token válido mas não foi possível obter usuário - mantendo token");
            setToken(storedToken);
            if (storedUsuario) {
              setUsuario(storedUsuario);
            }
            
            // Tenta buscar usuário novamente em background
            setTimeout(async () => {
              try {
                const retryUsuario = await obterUsuarioDoToken(storedToken);
                if (retryUsuario) {
                  const usuarioNormalizado = {
                    id: retryUsuario.id,
                    username: retryUsuario.username,
                    empresaId: retryUsuario.empresaId,
                    modulo: retryUsuario.modulo,
                    nome: retryUsuario.nome,
                  };
                  setUsuario(usuarioNormalizado);
                  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuarioNormalizado));
                }
              } catch {
                // Ignora erros em retry
              }
            }, 2000);
          }
        } catch (error) {
          // Erro de rede ao validar token - mantém token salvo
          // O backend validará em cada requisição futura
          console.warn("Erro de rede ao validar token, mantendo token:", error);
          setToken(storedToken);
          if (storedUsuario) {
            setUsuario(storedUsuario);
          }
        }
      } else if (storedUsuario) {
        // Sem token mas com usuário salvo (estado inconsistente) - limpa cache
        localStorage.removeItem(STORAGE_USER_KEY);
      }
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fazerLogin(username, password);
      
      if (!response) {
        return { success: false, error: "Usuário ou senha inválidos" };
      }

      setToken(response.token);
      setUsuario(response.usuario);
      
      // Salva token no localStorage
      localStorage.setItem(STORAGE_TOKEN_KEY, response.token);
      localStorage.setItem(STORAGE_EMPRESA_KEY, response.usuario.empresaId);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.usuario));

      return { success: true, usuario: response.usuario };
    } catch (error) {
      return { success: false, error: "Erro ao fazer login. Tente novamente." };
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_EMPRESA_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  // Considera autenticado se tiver token (mesmo que usuário ainda não carregou)
  // O token é validado pelo backend em cada requisição
  // Isso permite manter sessão mesmo após refresh enquanto token é válido
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

