"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthRouteGuard } from "@/components/auth-route-guard";

export default function OficinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRouteGuard requiredModulo={3}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar module="oficina" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthRouteGuard>
  );
}

