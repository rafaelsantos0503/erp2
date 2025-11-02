"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, User, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { EmpresaSelect } from "@/components/empresa-select";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Detecta o módulo atual baseado na rota
  const moduloAtual = pathname?.startsWith('/corrida') ? 2 : pathname?.startsWith('/oficina') ? 3 : null;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme as 'light' | 'dark' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(currentTheme);
    
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Verifica se é superadmin (módulo 1)
  const isSuperAdmin = usuario?.modulo === 1;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Espaço reservado para conteúdo futuro */}
      </div>
      <div className="flex items-center gap-3">
        {/* Select de empresa - apenas para superadmin, filtrado por módulo atual */}
        {isSuperAdmin && moduloAtual && (
          <EmpresaSelect moduloFiltro={moduloAtual} />
        )}
        {usuario && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {usuario.nome}
          </span>
        )}
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <User className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-9 px-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}

