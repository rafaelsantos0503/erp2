
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, Trophy } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">Análises e métricas de performance</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inscrições por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Últimos 30 dias</p>
                    <p className="text-2xl font-bold">342</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">+18.5%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos Mais Procurados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Maratona de São Paulo", "Corrida Noturna 5K", "Ultra Trail 42K"].map((evento, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                        <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="font-medium">{evento}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{450 - index * 100} inscritos</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Inscrições</p>
                <p className="text-2xl font-bold">342</p>
                <div className="flex items-center gap-1 text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">+18%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">R$ 24.580</p>
                <div className="flex items-center gap-1 text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">+22%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Realizados</p>
                <p className="text-2xl font-bold">8</p>
                <div className="flex items-center gap-1 text-blue-600 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">+2</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atletas</p>
                <p className="text-2xl font-bold">1.247</p>
                <div className="flex items-center gap-1 text-green-600 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
