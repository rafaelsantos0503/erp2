"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Construction } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Análises e métricas de performance</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Construction className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Página em Construção</h2>
              <p className="text-muted-foreground max-w-md">
                Estamos trabalhando para trazer relatórios completos e análises detalhadas. 
                Em breve você terá acesso a todas as métricas e insights do seu negócio.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Em breve disponível</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

