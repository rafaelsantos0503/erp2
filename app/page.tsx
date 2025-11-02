"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthRouteGuard } from "@/components/auth-route-guard";
import { useAuth } from "@/lib/auth-context";
import { Rocket, ShoppingBag } from "lucide-react";
import Link from "next/link";

const modules = [
  {
    id: "corrida",
    name: "Corrida",
    description: "Gestão completa de eventos de corrida esportiva",
    icon: Rocket,
    color: "bg-orange-500",
    href: "/corrida",
    features: ["Eventos", "Atletas", "Inscrições", "Resultados"],
    modulo: 2,
  },
  {
    id: "oficina",
    name: "Oficina",
    description: "Gestão completa para oficinas mecânicas",
    icon: ShoppingBag,
    color: "bg-blue-500",
    href: "/oficina",
    features: ["Ordem de Serviço", "Peças", "Clientes", "Financeiro"],
    modulo: 3,
  },
];

function HomeContent() {
  const router = useRouter();
  const { usuario, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    // Se não for superadmin, redireciona direto para o módulo dele
    if (usuario && usuario.modulo !== 1) {
      if (usuario.modulo === 2) {
        router.push("/corrida");
      } else if (usuario.modulo === 3) {
        router.push("/oficina");
      }
    }
  }, [usuario, isAuthenticated, isLoading, router]);

  // Se estiver carregando ou não autenticado, não renderiza nada ainda
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Se não for superadmin, mostra loading enquanto redireciona
  if (usuario && usuario.modulo !== 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Redirecionando...</div>
      </div>
    );
  }

  // Apenas superadmin (módulo 1) vê a tela de escolha de módulos
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            ERP Modular
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o módulo que deseja acessar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="relative overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${module.color} text-white`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{module.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 space-y-2">
                    {module.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link href={module.href} className="block">
                    <Button className="w-full">
                      Acessar Módulo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthRouteGuard>
      <HomeContent />
    </AuthRouteGuard>
  );
}
