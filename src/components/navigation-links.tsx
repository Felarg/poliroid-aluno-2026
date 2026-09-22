/** Links da navegação principal; recebe a rota atual sem usar estado do Next. */
import Link from "next/link";

interface NavigationLinksProps {
  pathname: string;
}

/** Marca o link atual para leitores de tela e aplica o mesmo destaque visual. */
export function NavigationLinks({ pathname }: NavigationLinksProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex gap-2 md:flex-col md:gap-3"
    >
      <Link
        href="/search"
        prefetch={true}
        aria-current={pathname === "/search" ? "page" : undefined}
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-orange-50 hover:text-orange-700 aria-[current=page]:bg-orange-50 aria-[current=page]:font-semibold aria-[current=page]:text-orange-700 md:py-3"
      >
        <span aria-hidden="true" className="text-xl">
          ⌕
        </span>
        Buscar
      </Link>
      <Link
        href="/gallery"
        prefetch={true}
        aria-current={pathname === "/gallery" ? "page" : undefined}
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-orange-50 hover:text-orange-700 aria-[current=page]:bg-orange-50 aria-[current=page]:font-semibold aria-[current=page]:text-orange-700 md:py-3"
      >
        <svg
          aria-hidden="true"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
        Minha galeria
      </Link>
      <Link
        href="/feed"
        prefetch={true}
        aria-current={pathname === "/feed" ? "page" : undefined}
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-orange-50 hover:text-orange-700 aria-[current=page]:bg-orange-50 aria-[current=page]:font-semibold aria-[current=page]:text-orange-700 md:py-3"
      >
        <svg
          aria-hidden="true"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" />
        </svg>
        Feed
      </Link>
    </nav>
  );
}
