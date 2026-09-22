/** Resultado visual de busca com navegação para o perfil e espaço para ações. */
import Link from "next/link";
import type { ReactNode } from "react";
import type { UserDTO } from "./contracts";

interface UserCardProps {
  user: UserDTO;
  actions?: ReactNode;
}

/** Apresenta dados públicos; o chamador compõe o comportamento social. */
export function UserCard({ user, actions }: UserCardProps) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4">
      <Link
        href={`/users/${user.id}`}
        className="min-w-0 rounded-lg focus:ring-2 focus:ring-orange-600 focus:outline-none"
      >
        <p className="truncate font-semibold">@{user.username}</p>
        <p className="truncate text-sm text-stone-600">{user.name}</p>
      </Link>
      {actions}
    </article>
  );
}
