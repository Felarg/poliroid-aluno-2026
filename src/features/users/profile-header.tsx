/** Apresenta a identidade pública e recebe ações por composição, sem acessar a rede. */
import type { ReactNode } from "react";
import type { UserDTO } from "./contracts";

interface ProfileHeaderProps {
  user: UserDTO;
  actions?: ReactNode;
}

/** Mantém a apresentação do perfil independente das regras de follow. */
export function ProfileHeader({ user, actions }: ProfileHeaderProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
      <div>
        <h1 className="text-2xl font-semibold">@{user.username}</h1>
        <p className="text-stone-600">{user.name}</p>
      </div>
      {actions}
    </section>
  );
}
