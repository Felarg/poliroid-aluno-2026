/** Mantém a estrutura compartilhada montada durante a navegação entre páginas. */
import type { Metadata } from "next";
import "./globals.css";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { getViewer } from "@/features/users/get-viewer";

export const metadata: Metadata = {
  title: "Poliroid",
  description: "Uma rede de fotos para aprender Engenharia de Software.",
};

/** Define idioma e estilos comuns às páginas da aplicação. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const viewer = await getViewer();
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <AppShell username={viewer.username}>{children}</AppShell>
      </body>
    </html>
  );
}
