/** Estrutura visual comum às páginas; recebe a identidade pronta e não consulta o servidor. */
import type { ReactNode } from "react";
import { AppHeader } from "./app-header";

interface AppShellProps {
  username: string;
  children: ReactNode;
}

/** Mantém navegação e largura disponíveis iguais no feed e na galeria. */
export function AppShell({ username, children }: AppShellProps) {
  return (
    <div className="min-h-dvh">
      <AppHeader username={username} />
      <div className="md:pl-56">
        <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-8 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
