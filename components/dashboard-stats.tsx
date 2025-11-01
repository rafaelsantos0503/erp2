import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Package } from "lucide-react";

const stats = [
  {
    title: "Vendas do Mês",
    value: "R$ 45.231",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Novos Clientes",
    value: "284",
    change: "+8.2%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Produtos Ativos",
    value: "1,423",
    change: "+5.1%",
    icon: Package,
    trend: "up",
  },
  {
    title: "Taxa de Conversão",
    value: "68.2%",
    change: "+2.4%",
    icon: TrendingUp,
    trend: "up",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                <p className="text-xs text-muted-foreground">vs mês anterior</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

