/** Abre a publicação sobre o feed usando foco e isolamento do diálogo nativo. */
"use client";

import { useRef, useState } from "react";
import { PublishForm } from "./publish-form";

/** Preserva o rascunho ao fechar e bloqueia o fechamento durante o envio. */
export function PublishDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg bg-orange-700 px-4 py-2 font-medium text-white"
      >
        Nova publicação
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="publish-dialog-title"
        onCancel={(event) => {
          if (pending) {
            event.preventDefault();
          }
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-xl backdrop:bg-black/40"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="publish-dialog-title" className="text-xl font-semibold">
            Nova publicação
          </h2>
          <button
            type="button"
            disabled={pending}
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-50"
          >
            Fechar
          </button>
        </div>
        <PublishForm onPendingChange={setPending} />
      </dialog>
    </>
  );
}
