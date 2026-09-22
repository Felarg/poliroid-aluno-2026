"use client";

/** Oferece recuperação simples sem mostrar detalhes internos da falha. */
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-2xl font-semibold">
        Não foi possível carregar a página
      </h1>
      <p className="mt-3 text-stone-600">
        Tente novamente em alguns instantes.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-stone-900 px-5 py-3 text-white focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Tentar novamente
      </button>
    </main>
  );
}
