"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";

interface EmpresaContextType {
  empresaId: string | null;
  setEmpresaId: (id: string) => void;
  empresaNome: string | null;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

// Função auxiliar para buscar empresa do backend usando getEmpresasSelecao
// Busca todas as empresas e encontra a empresa pelo ID (mais eficiente se já tiver outras empresas carregadas)
async function buscarEmpresaPorId(id: string, token: string, modulo?: number): Promise<{ nome: string } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const baseUrlNormalizado = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Endpoint: GET /api/empresas/selecao?modulo={modulo}
    const url = modulo 
      ? `${baseUrlNormalizado}/empresas/selecao?modulo=${modulo}`
      : `${baseUrlNormalizado}/empresas/selecao`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar empresa: ${response.statusText}`);
    }
    
    const empresas = await response.json();
    // Encontra a empresa pelo ID na lista retornada
    const empresa = empresas.find((e: { id: string }) => e.id === id);
    return empresa ? { nome: empresa.nome } : null;
  } catch (error) {
    console.error("Erro ao buscar empresa do backend:", error);
    return null;
  }
}

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { usuario, isAuthenticated, token } = useAuth();
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaNome, setEmpresaNome] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && usuario && token) {
      // Quando autenticado, usa o empresaId do usuário logado
      // Mas se for superadmin, permite trocar de empresa
      const savedEmpresaId = localStorage.getItem("empresaId");
      
      if (usuario.modulo === 1) {
        // Superadmin pode ter empresa selecionada diferente da empresa padrão do usuário
        const empresaSelecionada = savedEmpresaId || usuario.empresaId;
        setEmpresaId(empresaSelecionada);
        
        // Busca o nome da empresa do backend usando getEmpresasSelecao
        // Superadmin pode acessar empresas de qualquer módulo, então busca todas
        buscarEmpresaPorId(empresaSelecionada, token)
          .then(empresa => {
            if (empresa) {
              setEmpresaNome(empresa.nome);
            }
          })
          .catch(error => {
            console.error("Erro ao buscar nome da empresa:", error);
            setEmpresaNome(null);
          });
      } else {
        // Usuários normais sempre usam a empresa do seu usuário
        setEmpresaId(usuario.empresaId);
        localStorage.setItem("empresaId", usuario.empresaId);
        
        // Busca o nome da empresa do backend usando getEmpresasSelecao filtrado pelo módulo do usuário
        buscarEmpresaPorId(usuario.empresaId, token, usuario.modulo)
          .then(empresa => {
            if (empresa) {
              setEmpresaNome(empresa.nome);
            }
          })
          .catch(error => {
            console.error("Erro ao buscar nome da empresa:", error);
            setEmpresaNome(null);
          });
      }
    } else {
      // Se não estiver autenticado, limpa o empresaId
      setEmpresaId(null);
      setEmpresaNome(null);
      localStorage.removeItem("empresaId");
    }
  }, [usuario, isAuthenticated, token]);

  const handleSetEmpresaId = async (id: string) => {
    setEmpresaId(id);
    localStorage.setItem("empresaId", id);
    
    // Busca o nome da empresa do backend usando getEmpresasSelecao
    if (token && usuario) {
      try {
        // Se for superadmin, busca todas. Caso contrário, filtra pelo módulo do usuário
        const modulo = usuario.modulo === 1 ? undefined : usuario.modulo;
        const empresa = await buscarEmpresaPorId(id, token, modulo);
        if (empresa) {
          setEmpresaNome(empresa.nome);
        }
      } catch (error) {
        console.error("Erro ao buscar nome da empresa:", error);
        setEmpresaNome(null);
      }
    }
    
    // Dispara evento customizado para notificar componentes que a empresa mudou
    // Isso garante que todas as páginas recarreguem seus dados
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("empresa-changed", { detail: { empresaId: id } }));
    }
  };

  return (
    <EmpresaContext.Provider value={{ empresaId, setEmpresaId: handleSetEmpresaId, empresaNome }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    throw new Error("useEmpresa deve ser usado dentro de um EmpresaProvider");
  }
  return context;
}

