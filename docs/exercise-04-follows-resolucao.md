# Resolução — Exercício 04: seguir e deixar de seguir

## Objetivo e contrato

`changeFollow(userId, following)` usa PUT para garantir follow e DELETE para garantir ausência. O botão representa somente o último estado confirmado pela API.

## Passo a passo

1. O componente inicia `following` pela prop do perfil e mantém `pending` e `error` localmente.
2. No clique, calcula a intenção desejada com `!following`, bloqueia cliques paralelos e limpa erro anterior.
3. A resposta atualiza o estado confirmado e chama `router.refresh()` para que feed e perfil sejam relidos.
4. Uma falha mantém o estado anterior, anuncia a mensagem e libera nova tentativa.

PUT e DELETE são usados em vez de toggle para que repetir uma intenção após falha seja idempotente. O botão não acessa o banco nem conhece a regra de contenção; essa responsabilidade fica na API.

## Como verificar manualmente

Abra o perfil de Marina, siga, repita follow, deixe de seguir e volte ao feed. Em uma falha de rede, o botão deve manter o último estado confirmado e permitir repetir.

## Limitação desta entrega

O ambiente real está saudável, mas a validação visual e as capturas de navegador não foram executadas nesta entrega.
