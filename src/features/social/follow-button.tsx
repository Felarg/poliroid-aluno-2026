/** Coordena a relação social e renova os dados do servidor após a confirmação. */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeFollow } from "./client-api";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

/** Mantém o último estado confirmado; uma falha permite repetir a mesma operação. */
export function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  // TODO: guardar relação confirmada, pendência e mensagem de erro.

  async function changeRelationship() {
    // TODO: enviar o estado desejado e atualizar a página após o sucesso.
  }

  // TODO: escolher o rótulo do botão.

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-pressed={following}
        disabled={pending}
        onClick={changeRelationship}
        className="rounded-lg bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
