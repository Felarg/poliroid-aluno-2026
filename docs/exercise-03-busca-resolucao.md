# Resolução — Exercício 03: busca de usuários

## Objetivo e contratos

O formulário consulta `searchUsers` automaticamente depois de uma pausa de 300 ms. `scheduleSearch` oferece o debounce, `SearchResults` apresenta cartões e `UserSearchResult` mantém o resultado e a indicação de truncamento.

## Passo a passo da solução

1. Toda alteração incrementa `requestId` e cancela o timer anterior.
2. A tela mantém o texto original, limpa resultado, erro e pendência, e calcula o termo com `trim`.
3. Termos com menos de dois caracteres não consultam; termos acima de 50 mostram erro local.
4. Para um termo válido, `scheduleSearch` inicia a busca após 300 ms e mostra o skeleton enquanto ela está pendente.
5. A resposta só atualiza a tela quando o identificador da requisição ainda é o atual. Isso evita que uma busca antiga substitua o resultado de uma digitação posterior.

O debounce reduz chamadas durante a digitação, mas não ordena respostas de rede; por isso o identificador continua necessário. O erro é limpo na próxima alteração, permitindo uma nova tentativa sem estado global.

## Como verificar manualmente

1. Abra `/search` e digite `mar`; confira cartões e ação de seguir.
2. Digite apenas uma letra e confirme ausência de consulta.
3. Digite rapidamente termos diferentes; somente o termo final deve aparecer.
4. Bloqueie a API de usuários para conferir erro recuperável; altere o termo e confirme que a tela permite nova busca.

## Limitação desta entrega

O ambiente real de PostgreSQL, MinIO e Next.js foi iniciado com saúde confirmada. A inspeção visual no navegador e as capturas de estados ainda não foram executadas; não há imagens artificiais nesta resolução.
