import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function OficinaPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-950">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Settings className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Módulo Oficina</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Este módulo está em desenvolvimento e será lançado em breve.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Gestão de Ordem de Serviço
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Controle de Estoque de Peças
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Gestão de Clientes e Veículos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Financeiro
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

