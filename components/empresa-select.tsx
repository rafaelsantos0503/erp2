"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useEmpresa } from "@/lib/empresa-context";
import { useAuth } from "@/lib/auth-context";
import type { EmpresaAPI } from "@/lib/services/empresa.service";
import type { Empresa } from "@/lib/empresas";

interface EmpresaSelectProps {
  className?: string;
  moduloFiltro?: 2 | 3; // Filtra empresas apenas deste módulo
}

/**
 * Função auxiliar para buscar empresas do backend sem usar useApi (evita problema com empresaId)
 */
async function buscarEmpresasPorModulo(modulo: 2 | 3, token: string): Promise<EmpresaAPI[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const baseUrlNormalizado = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Endpoint: GET /api/empresas/selecao?modulo={modulo}
    const url = `${baseUrlNormalizado}/empresas/selecao?modulo=${modulo}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar empresas: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar empresas do backend:", error);
    throw error;
  }
}

/**
 * Componente de seleção de empresa
 * Apenas visível para superadministradores (módulo 1)
 * Filtra empresas apenas do módulo atual (Corrida ou Oficina)
 * Busca dinamicamente do backend
 */
export function EmpresaSelect({ className, moduloFiltro }: EmpresaSelectProps) {
  const { empresaId, setEmpresaId, empresaNome } = useEmpresa();
  const { token, usuario } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregarEmpresas() {
      // Só carrega se tiver token e módulo filtro
      if (!token || !moduloFiltro) {
        setIsLoading(false);
        return;
      }

      try {
        // Busca empresas do backend filtradas por módulo
        // Endpoint: GET /api/empresas/selecao?modulo={modulo}
        const empresasAPI = await buscarEmpresasPorModulo(moduloFiltro, token);
        
        // Converte EmpresaAPI para Empresa
        const empresasConvertidas: Empresa[] = empresasAPI.map((e: EmpresaAPI) => ({
          id: e.id,
          nome: e.nome,
          modulo: e.modulo as 2 | 3,
          moduloNome: e.moduloNome || (e.modulo === 2 ? "Corrida" : "Oficina"),
        }));
        
        setEmpresas(empresasConvertidas);

        // Se a empresa atual não está na lista filtrada, seleciona a primeira disponível
        if (empresasConvertidas.length > 0) {
          const empresaAtualNaLista = empresasConvertidas.find(e => e.id === empresaId);
          if (!empresaAtualNaLista && empresasConvertidas[0]) {
            // Seleciona a primeira empresa do módulo se a atual não estiver na lista
            setEmpresaId(empresasConvertidas[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar empresas do backend:", error);
        setEmpresas([]);
      } finally {
        setIsLoading(false);
      }
    }

    carregarEmpresas();
  }, [moduloFiltro, token, empresaId, setEmpresaId]);

  const handleSelectEmpresa = (empresa: Empresa) => {
    setEmpresaId(empresa.id);
    setIsOpen(false);
    
    // Dispara evento customizado para recarregar dados quando trocar de empresa
    // Isso garante que todos os componentes que dependem de empresaId sejam atualizados
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("empresa-changed", { detail: { empresaId: empresa.id } }));
    }
  };

  const empresaAtual = empresas.find((e) => e.id === empresaId);

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      >
        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="max-w-[180px] truncate">
          {empresaAtual?.nome || empresaNome || "Selecione uma empresa"}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg">
            <div className="max-h-80 overflow-y-auto p-2 hide-scrollbar">
              {/* Mostra apenas empresas do módulo atual (já filtradas) */}
              {empresas.length > 0 ? (
                empresas.map((empresa) => (
                  <button
                    key={empresa.id}
                    onClick={() => handleSelectEmpresa(empresa)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      empresaId === empresa.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium">{empresa.nome}</div>
                    {empresaId === empresa.id && (
                      <div className="text-xs opacity-80 mt-0.5">✓ Selecionada</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  Nenhuma empresa disponível para este módulo
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

