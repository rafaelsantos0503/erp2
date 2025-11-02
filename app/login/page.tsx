"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, usuario, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Se já estiver autenticado, redireciona baseado no módulo
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && usuario) {
      if (usuario.modulo === 1) {
        router.push("/");
      } else if (usuario.modulo === 2) {
        router.push("/corrida");
      } else if (usuario.modulo === 3) {
        router.push("/oficina");
      }
    }
  }, [isAuthenticated, usuario, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success && result.usuario) {
      // Redireciona baseado no módulo do usuário
      if (result.usuario.modulo === 1) {
        router.push("/");
      } else if (result.usuario.modulo === 2) {
        router.push("/corrida");
      } else if (result.usuario.modulo === 3) {
        router.push("/oficina");
      }
    } else {
      setError(result.error || "Erro ao fazer login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">ERP System</CardTitle>
          <CardDescription className="text-base">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Digite seu usuário"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Digite sua senha"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 rounded-md bg-muted p-4 text-xs text-muted-foreground">
            <p className="font-semibold mb-2">Usuários para teste:</p>
            <ul className="space-y-1">
              <li>• <strong>superadmin</strong> / senha123 (Módulo 1 - SuperAdmin)</li>
              <li>• <strong>corrida</strong> / senha123 (Módulo 2 - Corrida)</li>
              <li>• <strong>oficina</strong> / senha123 (Módulo 3 - Oficina)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

