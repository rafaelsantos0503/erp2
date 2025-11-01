
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Trophy, Calendar } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do módulo Corrida</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Eventos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Dias para Inscrição</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </div>
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Medalhas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Distribuir Medalha até Top %</label>
                  <input
                    type="number"
                    defaultValue={50}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </div>
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notificações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-medium">Notificar novos eventos</p>
                  <p className="text-sm text-muted-foreground">Receba alertas de novos eventos cadastrados</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-medium">Notificar novas inscrições</p>
                  <p className="text-sm text-muted-foreground">Receba confirmações de inscrições</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de vagas</p>
                  <p className="text-sm text-muted-foreground">Receba alertas de eventos próximos do limite</p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
              <Button>Salvar Preferências</Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

