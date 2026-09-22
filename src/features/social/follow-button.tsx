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
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function changeRelationship() {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await changeFollow(userId, !following);
      setFollowing(result.followingByViewer);
      router.refresh();
    } catch (changeError) {
      setError(
        changeError instanceof Error
          ? changeError.message
          : "Não foi possível atualizar o follow.",
      );
    } finally {
      setPending(false);
    }
  }

  const label = following ? "Deixar de seguir" : "Seguir";

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
