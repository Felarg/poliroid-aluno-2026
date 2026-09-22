/** Busca usuários enquanto o termo muda e descarta respostas da consulta anterior. */
"use client";

import { useEffect, useRef, useState } from "react";
import type { UserSearchResult } from "./contracts";
import { FollowButton } from "@/features/social/follow-button";
import { SearchResults, SearchResultsSkeleton } from "./search-results";
import { searchUsers } from "./client-api";
import { scheduleSearch } from "./search-scheduler";

/** Coordena pausa na digitação e estados da busca. */
export function SearchForm() {
  const [term, setTerm] = useState("");
  const [result, setResult] = useState<UserSearchResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      requestId.current += 1;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  async function fetchResults(
    normalized: string,
    currentRequest: number,
  ) {
    try {
      const body = await searchUsers(normalized);
      if (currentRequest === requestId.current) {
        setResult(body);
      }
    } catch (searchError) {
      if (currentRequest === requestId.current) {
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Não foi possível buscar usuários.",
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setPending(false);
      }
    }
  }

  function changeTerm(value: string) {
    // TODO: atualizar a tela, validar o termo e agendar a busca.
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="user-search" className="mb-2 block font-medium">
          Buscar usuários
        </label>
        <input
          id="user-search"
          type="search"
          value={term}
          onChange={(event) => changeTerm(event.target.value)}
          placeholder="Início do nome ou username"
          aria-describedby="search-help"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
        <p id="search-help" className="mt-2 text-sm text-stone-600">
          Digite pelo menos 2 caracteres. A busca começa após uma pausa curta.
        </p>
      </div>
      {pending && <SearchResultsSkeleton />}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <SearchResults
          result={result}
          actionsFor={(user) => (
            <FollowButton
              userId={user.id}
              initialFollowing={user.followingByViewer}
            />
          )}
        />
      )}
    </div>
  );
}
