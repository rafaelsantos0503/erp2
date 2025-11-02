"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AuthRouteGuardProps {
  children: React.ReactNode;
  requiredModulo?: 1 | 2 | 3;
}

/**
 * Componente que protege rotas baseado na autenticação e módulo do usuário
 */
export function AuthRouteGuard({ children, requiredModulo }: AuthRouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated, usuario, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Se a rota requer um módulo específico, espera o usuário carregar
    // Se usuário ainda não carregou mas está autenticado (tem token), aguarda um pouco
    if (requiredModulo && !usuario) {
      // Token existe mas usuário ainda não carregou - aguarda carregar
      // Não redireciona imediatamente para evitar loop
      return;
    }

    // Se a rota requer um módulo específico e o usuário não tem acesso
    if (requiredModulo && usuario && usuario.modulo !== requiredModulo && usuario.modulo !== 1) {
      // SuperAdmin (módulo 1) pode acessar qualquer módulo
      // Outros módulos só podem acessar seu próprio módulo
      router.push("/");
      return;
    }
  }, [isAuthenticated, isLoading, usuario, requiredModulo, router]);

  // Mostra loading enquanto verifica autenticação ou carrega dados do usuário
  if (isLoading || (isAuthenticated && !usuario && requiredModulo)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Se a rota requer módulo específico e usuário não tem acesso
  if (requiredModulo && usuario && usuario.modulo !== requiredModulo && usuario.modulo !== 1) {
    return null;
  }

  return <>{children}</>;
}

