"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface EmpresaContextType {
  empresaId: string | null;
  setEmpresaId: (id: string) => void;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  // Por enquanto, usamos um ID mockado
  // Quando tiver autenticação, virá do login
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Quando tiver autenticação, buscar o empresaId do usuário logado
    // Por enquanto, usar um ID mockado para desenvolvimento
    const mockEmpresaId = localStorage.getItem("empresaId") || "empresa-mock-001";
    setEmpresaId(mockEmpresaId);
    localStorage.setItem("empresaId", mockEmpresaId);
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresaId, setEmpresaId }}>
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

