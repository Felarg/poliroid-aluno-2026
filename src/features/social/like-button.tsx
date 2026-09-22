/** Ação de curtida isolada do cartão para manter apresentação e transporte separados. */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LikeResult } from "./contracts";
import { changeLike } from "./client-api";

interface LikeButtonProps {
  postId: string;
  liked: boolean;
  canLike: boolean;
  onChanged: (result: LikeResult) => void;
}

/** Garante o estado desejado e permite repetir a operação após falha de resposta. */
export function LikeButton({
  postId,
  liked,
  canLike,
  onChanged,
}: LikeButtonProps) {
  const router = useRouter();
  // TODO: guardar pendência e mensagem de erro.
  async function toggle() {
    if (pending || !canLike) {
      return;
    }
    // TODO: confirmar a intenção de curtir ou remover e avisar o componente pai.
  }
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={liked ? "Remover curtida" : "Curtir publicação"}
        aria-pressed={liked}
        disabled={pending || !canLike}
        onClick={toggle}
        className="rounded-lg px-2 py-1 text-xl text-orange-600 hover:bg-orange-50 disabled:opacity-50"
      >
        {liked ? "♥" : "♡"}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
