"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, DollarSign, Users, ClipboardCheck, TrendingUp, AlertCircle } from "lucide-react";

interface OrdemServicoDashboard {
  id: number;
  numero: string;
  cliente: string;
  veiculo: string;
  status: string;
  data: string;
  valor: number;
  prioridade: string;
}

export default function OficinaDashboard() {
  const [ordens, setOrdens] = useState<OrdemServicoDashboard[]>([
    { id: 1, numero: "OS-001", cliente: "João Silva", veiculo: "Civic 2020", status: "Em Andamento", data: "01/03/2025", valor: 450.00, prioridade: "Alta" },
    { id: 2, numero: "OS-002", cliente: "Maria Santos", veiculo: "Corolla 2019", status: "Aguardando Peças", data: "28/02/2025", valor: 320.00, prioridade: "Média" },
    { id: 3, numero: "OS-003", cliente: "Pedro Oliveira", veiculo: "Onix 2021", status: "Finalizado", data: "27/02/2025", valor: 180.00, prioridade: "Baixa" },
    { id: 4, numero: "OS-004", cliente: "Ana Costa", veiculo: "HB20 2022", status: "Em Andamento", data: "01/03/2025", valor: 520.00, prioridade: "Alta" },
    { id: 5, numero: "OS-005", cliente: "Carlos Pereira", veiculo: "Gol 2018", status: "Orçamento", data: "02/03/2025", valor: 0, prioridade: "Baixa" },
  ]);

  const ordensEmAndamento = ordens.filter(os => os.status === "Em Andamento");
  const ordensAguardando = ordens.filter(os => os.status === "Aguardando Peças");
  const ordensFinalizadas = ordens.filter(os => os.status === "Finalizado");
  const totalReceita = ordensFinalizadas.reduce((sum, os) => sum + os.valor, 0);
  const receitaMensal = ordensFinalizadas
    .filter(os => {
      const mesAtual = new Date().getMonth() + 1;
      const mesOS = parseInt(os.data.split('/')[1]);
      return mesOS === mesAtual;
    })
    .reduce((sum, os) => sum + os.valor, 0);
  const ordensUrgentes = ordens.filter(os => os.prioridade === "Alta" && os.status !== "Finalizado");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da oficina mecânica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ordens em Andamento</p>
                <p className="text-2xl font-bold">{ordensEmAndamento.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aguardando Peças</p>
                <p className="text-2xl font-bold">{ordensAguardando.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <p className="text-2xl font-bold">R$ {receitaMensal.toFixed(2)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ordens Urgentes</p>
                <p className="text-2xl font-bold">{ordensUrgentes.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordens.slice(0, 5).map((ordem) => {
                const statusColor = 
                  ordem.status === "Finalizado" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                  ordem.status === "Em Andamento" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                  ordem.status === "Aguardando Peças" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" :
                  "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
                
                const prioridadeColor = 
                  ordem.prioridade === "Alta" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                  ordem.prioridade === "Média" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" :
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";

                return (
                  <div
                    key={ordem.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{ordem.numero}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadeColor}`}>
                            {ordem.prioridade}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{ordem.cliente}</p>
                        <p className="text-xs text-muted-foreground">{ordem.veiculo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {ordem.status}
                          </span>
                          {ordem.valor > 0 && (
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              R$ {ordem.valor.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Total de Ordens</p>
                    <p className="text-xs text-muted-foreground">Este mês</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{ordens.length}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Taxa de Conclusão</p>
                    <p className="text-xs text-muted-foreground">Ordens finalizadas</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {ordens.length > 0 ? ((ordensFinalizadas.length / ordens.length) * 100).toFixed(0) : 0}%
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">Ticket Médio</p>
                    <p className="text-xs text-muted-foreground">Por ordem</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  R$ {ordensFinalizadas.length > 0 ? (totalReceita / ordensFinalizadas.length).toFixed(0) : '0'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Clientes Atendidos</p>
                    <p className="text-xs text-muted-foreground">Este mês</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{new Set(ordens.map(os => os.cliente)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
