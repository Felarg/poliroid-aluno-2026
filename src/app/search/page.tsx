/** Página de busca de usuários, separada das leituras de feed e galeria. */
import { SearchForm } from "@/features/users/search-form";

/** Compõe o título e o formulário interativo de busca. */
export default function SearchPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Buscar pessoas</h1>
      <SearchForm />
    </>
  );
}
