import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Store, Building2, ShoppingBag } from "lucide-react";
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
  },
  {
    id: "mercado",
    name: "Mercado",
    description: "Sistema de gestão para mercados e supermercados",
    icon: Store,
    color: "bg-green-500",
    href: "/mercado",
    features: ["Produtos", "Clientes", "Estoque", "Vendas"],
    comingSoon: true,
  },
  {
    id: "oficina",
    name: "Oficina",
    description: "Gestão completa para oficinas mecânicas",
    icon: ShoppingBag,
    color: "bg-blue-500",
    href: "/oficina",
    features: ["Ordem de Serviço", "Peças", "Clientes", "Financeiro"],
    comingSoon: true,
  },
  {
    id: "office",
    name: "Office",
    description: "Gestão de escritórios e trabalhos administrativos",
    icon: Building2,
    color: "bg-purple-500",
    href: "/office",
    features: ["Documentos", "Tarefas", "Calendário", "Projetos"],
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            ERP Modular
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o módulo que deseja acessar ou configure um novo módulo para seu negócio
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="relative overflow-hidden hover:shadow-lg transition-shadow"
              >
                {module.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Em Breve
                    </span>
                  </div>
                )}
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
                  {module.comingSoon ? (
                    <Button variant="outline" disabled className="w-full">
                      Aguarde o lançamento
                    </Button>
                  ) : (
                    <Link href={module.href} className="block">
                      <Button className="w-full">
                        Acessar Módulo
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}