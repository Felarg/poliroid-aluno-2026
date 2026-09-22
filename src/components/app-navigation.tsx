/** Liga a rota atual do Next aos links de navegação compartilhados. */
"use client";

import { usePathname } from "next/navigation";
import { NavigationLinks } from "./navigation-links";

/** Atualiza o destaque da navegação quando o cliente muda de página. */
export function AppNavigation() {
  const pathname = usePathname();
  return <NavigationLinks pathname={pathname} />;
}
