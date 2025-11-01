import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function OfficePage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-950">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Building2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Módulo Office</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Este módulo está em desenvolvimento e será lançado em breve.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Gestão de Documentos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Tarefas e Projetos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Calendário
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Clientes e Contatos
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

