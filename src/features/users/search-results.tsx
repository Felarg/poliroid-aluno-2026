/** Apresenta resultados de busca sem conhecer formulário, rede ou regra de follow. */
import type { ReactNode } from "react";
import type { UserDTO, UserSearchResult } from "./contracts";
import { UserCard } from "./user-card";

interface SearchResultsProps {
  result: UserSearchResult;
  actionsFor: (user: UserDTO) => ReactNode;
}

/** Recebe os usuários e as ações que cada cartão deve mostrar. */
export function SearchResults({ result, actionsFor }: SearchResultsProps) {
  if (result.items.length === 0) {
    return <p className="text-stone-600">Nenhum usuário encontrado.</p>;
  }
  return (
    <div className="space-y-3">
      {result.items.map((user) => (
        <UserCard key={user.id} user={user} actions={actionsFor(user)} />
      ))}
      {result.truncated && (
        <p className="text-sm text-stone-600">
          Há mais resultados. Refine o termo para continuar.
        </p>
      )}
    </div>
  );
}

/** Reserva o espaço dos cartões enquanto a busca automática está pendente. */
export function SearchResultsSkeleton() {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">Buscando usuários…</span>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          aria-hidden="true"
          className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 motion-safe:animate-pulse"
        >
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-stone-200" />
            <div className="h-4 w-24 rounded bg-stone-100" />
          </div>
          <div className="h-10 w-20 rounded-lg bg-stone-200" />
        </div>
      ))}
    </div>
  );
}
