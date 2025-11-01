
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, TrendingUp, Users } from "lucide-react";

export default function ResultadosPage() {
  const resultados = [
    { posicao: 1, atleta: "João Silva", tempo: "18:45", categoria: "Masculino 25-35", evento: "Corrida 5K" },
    { posicao: 2, atleta: "Maria Santos", tempo: "19:12", categoria: "Feminino 25-35", evento: "Corrida 5K" },
    { posicao: 3, atleta: "Carlos Costa", tempo: "19:34", categoria: "Masculino 25-35", evento: "Corrida 5K" },
  ];

  const resultadosMaratona = [
    { posicao: 1, atleta: "Ana Oliveira", tempo: "1:28:45", categoria: "Feminino Elite", evento: "Maratona 21K" },
    { posicao: 2, atleta: "Pedro Costa", tempo: "1:32:12", categoria: "Masculino Elite", evento: "Maratona 21K" },
    { posicao: 3, atleta: "Fernanda Lima", tempo: "1:35:45", categoria: "Feminino Elite", evento: "Maratona 21K" },
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultados</h1>
          <p className="text-muted-foreground">Classificação e tempos dos eventos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Resultados</p>
                  <p className="text-2xl font-bold">1.024</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medalhas Distríbuidas</p>
                  <p className="text-2xl font-bold">450</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Medal className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">24:35</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pódio - Corrida 5K</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resultados.map((resultado) => (
                <div
                  key={resultado.posicao}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      resultado.posicao === 1 ? "bg-yellow-100 dark:bg-yellow-900" :
                      resultado.posicao === 2 ? "bg-gray-100 dark:bg-gray-800" :
                      "bg-orange-100 dark:bg-orange-900"
                    }`}>
                      <span className={`font-bold ${
                        resultado.posicao === 1 ? "text-yellow-600" :
                        resultado.posicao === 2 ? "text-gray-600" :
                        "text-orange-600"
                      }`}>
                        {resultado.posicao}º
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{resultado.atleta}</p>
                      <p className="text-sm text-muted-foreground">{resultado.categoria}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{resultado.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pódio - Maratona 21K</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resultadosMaratona.map((resultado) => (
                <div
                  key={resultado.posicao}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      resultado.posicao === 1 ? "bg-yellow-100 dark:bg-yellow-900" :
                      resultado.posicao === 2 ? "bg-gray-100 dark:bg-gray-800" :
                      "bg-orange-100 dark:bg-orange-900"
                    }`}>
                      <span className={`font-bold ${
                        resultado.posicao === 1 ? "text-yellow-600" :
                        resultado.posicao === 2 ? "text-gray-600" :
                        "text-orange-600"
                      }`}>
                        {resultado.posicao}º
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{resultado.atleta}</p>
                      <p className="text-sm text-muted-foreground">{resultado.categoria}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{resultado.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

