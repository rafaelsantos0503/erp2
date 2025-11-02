"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  BarChart3,
  Activity,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Receipt,
  ClipboardList,
  Wrench,
  DollarSign,
  ClipboardCheck,
} from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuModules: Record<string, MenuItem[]> = {
  corrida: [
    { href: "/corrida", label: "Dashboard", icon: LayoutDashboard },
    { href: "/corrida/eventos", label: "Eventos", icon: Activity },
    { href: "/corrida/atletas", label: "Atletas", icon: Users },
    { href: "/corrida/orcamento", label: "Orçamento", icon: Receipt },
    { href: "/corrida/pedido", label: "Pedido", icon: ClipboardList },
    { href: "/corrida/resultados", label: "Resultados", icon: TrendingUp },
    { href: "/corrida/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/corrida/configuracoes", label: "Configurações", icon: Settings },
  ],
  oficina: [
    { href: "/oficina", label: "Dashboard", icon: LayoutDashboard },
    { href: "/oficina/ordem-servico", label: "Ordem de Serviço", icon: ClipboardCheck },
    { href: "/oficina/clientes", label: "Clientes", icon: Users },
    { href: "/oficina/funcionarios", label: "Funcionários", icon: UserCheck },
    { href: "/oficina/financeiro", label: "Financeiro", icon: DollarSign },
    { href: "/oficina/relatorios", label: "Relatórios", icon: BarChart3 },
    { href: "/oficina/configuracoes", label: "Configurações", icon: Settings },
  ],
};

interface SidebarProps {
  module?: string;
}

export function Sidebar({ module = "corrida" }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = menuModules[module] || menuModules.corrida;
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const getModuleInfo = () => {
    switch (module) {
      case "corrida":
        return { title: "Corrida", subtitle: "Eventos Esportivos", icon: Trophy, color: "text-orange-500" };
      case "oficina":
        return { title: "Oficina", subtitle: "Mecânica Automotiva", icon: Wrench, color: "text-blue-500" };
      default:
        return { title: "ERP", subtitle: "Sistema", icon: LayoutDashboard, color: "text-primary" };
    }
  };

  const info = getModuleInfo();
  const ModuleIcon = info.icon;

  return (
    <div className={cn(
      "flex h-full flex-col border-r border-border bg-card transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute z-10 rounded-full border border-border bg-card p-1 shadow-sm hover:bg-accent transition-colors",
          isCollapsed ? "-right-3 top-20" : "-right-3 top-4"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className={cn("transition-all", isCollapsed ? "p-4" : "p-6")}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-2">
            <ModuleIcon className={`h-7 w-7 ${info.color} flex-shrink-0`} />
            <h1 className="text-2xl font-bold">{info.title}</h1>
          </div>
        )}
        {!isCollapsed && (
          <p className="text-sm text-muted-foreground">{info.subtitle}</p>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <ModuleIcon className={`h-6 w-6 ${info.color} flex-shrink-0`} />
          </div>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1", isCollapsed ? "px-2" : "px-4")}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2 transition-colors group relative",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed ? "justify-center px-2" : "px-4"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded bg-popover text-popover-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border shadow">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="border-t border-border p-4">
          <Link href="/">
            <button className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Voltar aos Módulos
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

