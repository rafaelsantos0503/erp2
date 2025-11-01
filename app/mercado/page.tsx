import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

export default function MercadoPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-gray-950">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Store className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Módulo Mercado</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            Este módulo está em desenvolvimento e será lançado em breve.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Gestão de Produtos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Controle de Estoque
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Vendas e Caixa
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              ✓ Fornecedores
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

