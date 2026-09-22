/** Reserva o espaço dos cartões enquanto as listas ainda não chegaram ao navegador. */

/** Define a mesma organização visual usada pelo feed e pela galeria. */
interface PostListSkeletonProps {
  gallery?: boolean;
}

/** Mantém fotos quadradas de até 320 px e anuncia a espera sem texto piscando na tela. */
export function PostListSkeleton({ gallery = false }: PostListSkeletonProps) {
  let layoutClassName = "flex flex-col items-center gap-6";
  if (gallery) {
    layoutClassName = "flex flex-wrap justify-center gap-6";
  }

  return (
    <div role="status">
      <span className="sr-only">Carregando publicações…</span>
      <div aria-hidden="true" className={layoutClassName}>
        {[0, 1].map((index) => (
          <div
            key={index}
            className="w-80 max-w-full flex-none overflow-hidden rounded-xl border border-stone-200 bg-white motion-safe:animate-pulse"
          >
            <div className="aspect-square w-full bg-stone-200" />
            {!gallery && (
              <div className="space-y-2 p-4">
                <div className="h-6 w-28 rounded bg-stone-200" />
                <div className="h-6 w-3/4 rounded bg-stone-100" />
                <div className="h-5 w-36 rounded bg-stone-100" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
