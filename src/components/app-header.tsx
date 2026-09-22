/** Cabeçalho comum: apresenta marca, viewer e navegação sem buscar dados. */
import Link from "next/link";
import { AppNavigation } from "./app-navigation";

interface AppHeaderProps {
  username: string;
}

/** Recebe somente o nome do viewer; o layout resolve a identidade no servidor. */
export function AppHeader({ username }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 space-y-4 border-b border-stone-200 bg-white px-5 py-4 md:fixed md:inset-y-0 md:left-0 md:flex md:w-56 md:flex-col md:space-y-8 md:border-r md:border-b-0 md:px-6 md:py-10">
      <div className="flex items-center justify-between gap-4 md:flex-col md:items-start">
        <Link
          href="/feed"
          prefetch={true}
          className="text-3xl font-bold tracking-tight"
        >
          poliroid<span className="text-orange-600">.</span>
        </Link>
        <span className="max-w-40 truncate text-sm text-stone-500">
          @{username}
        </span>
      </div>
      <AppNavigation />
    </header>
  );
}
