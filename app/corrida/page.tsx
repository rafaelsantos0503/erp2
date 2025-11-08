"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, MapPin, Activity } from "lucide-react";
import { StatusEvento } from "./eventos/page";

interface EventoDashboard {
  id: number;
  nome: string;
  data: string;
  local: string;
  distancias: string;
  inscritos: number;
  vagas: number;
  status: StatusEvento;
}

export default function CorridaDashboard() {
  const [eventos, setEventos] = useState<EventoDashboard[]>([
    { id: 1, nome: "Maratona de São Paulo", data: "15/03/2024", local: "Parque Ibirapuera", distancias: "5K, 10K, 21K", inscritos: 450, vagas: 500, status: StatusEvento.ANDAMENTO },
    { id: 2, nome: "Corrida Noturna 5K", data: "22/03/2024", local: "Avenida Paulista", distancias: "5K", inscritos: 120, vagas: 200, status: StatusEvento.ANDAMENTO },
    { id: 3, nome: "Ultra Trail 42K", data: "01/04/2024", local: "Serra da Cantareira", distancias: "42K", inscritos: 85, vagas: 100, status: StatusEvento.ANDAMENTO },
    { id: 4, nome: "Corrida Rústica 10K", data: "10/02/2024", local: "Parque Villa-Lobos", distancias: "10K", inscritos: 250, vagas: 250, status: StatusEvento.FINALIZADO },
  ]);

  const eventosAtivos = eventos.filter(e => e.status === StatusEvento.ANDAMENTO).slice(0, 3);
  const eventosProximos = eventos
    .filter(e => e.status === StatusEvento.ANDAMENTO)
    .sort((a, b) => {
      const dateA = a.data.split('/').reverse().join('-');
      const dateB = b.data.split('/').reverse().join('-');
      return dateA.localeCompare(dateB);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral dos eventos de corrida</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{eventos.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Ativos</p>
                <p className="text-2xl font-bold">{eventos.filter(e => e.status === StatusEvento.ANDAMENTO).length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vagas</p>
                <p className="text-2xl font-bold">{eventos.reduce((sum, e) => sum + e.vagas, 0)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inscritos</p>
                <p className="text-2xl font-bold">{eventos.reduce((sum, e) => sum + e.inscritos, 0)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventosProximos.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{evento.nome}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {evento.data}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {evento.local}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Distâncias: {evento.distancias}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Inscrições</p>
                    <p className="font-semibold">{evento.inscritos}/{evento.vagas}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas dos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Taxa de Ocupação</p>
                    <p className="text-xs text-muted-foreground">Vagas utilizadas</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {((eventos.reduce((sum, e) => sum + e.inscritos, 0) / eventos.reduce((sum, e) => sum + e.vagas, 0)) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Média por Evento</p>
                    <p className="text-xs text-muted-foreground">Inscritos/evento</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(eventos.reduce((sum, e) => sum + e.inscritos, 0) / eventos.length)}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">Eventos com Vagas</p>
                    <p className="text-xs text-muted-foreground">Ainda disponíveis</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {eventos.filter(e => e.inscritos < e.vagas).length}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Eventos Lotados</p>
                    <p className="text-xs text-muted-foreground">Sem vagas</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  {eventos.filter(e => e.inscritos >= e.vagas).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

