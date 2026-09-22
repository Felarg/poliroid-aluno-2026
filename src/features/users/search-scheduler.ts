/** Oferece a pausa da busca para o formulário sem esconder seu estado nem sua chamada de API. */

/** Agenda uma consulta após a pausa curta definida pela experiência da busca. */
export function scheduleSearch(callback: () => void) {
  return setTimeout(callback, 300);
}
