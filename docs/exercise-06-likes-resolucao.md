# Resolução — Exercício 06: curtidas

## Objetivo e contrato

`changeLike(postId, liked)` usa PUT ou DELETE e devolve estado pessoal, contador e permissão confirmados. O cartão recebe esse resultado por `onChanged`.

## Passo a passo

1. O botão calcula a intenção desejada a partir de `liked`, bloqueia a ação durante pendência ou sem permissão e limpa o erro anterior.
2. No sucesso, entrega a resposta completa ao pai e chama `router.refresh()`.
3. Em falha, mantém o último estado confirmado, anuncia o problema e permite repetir a mesma intenção.

O contador vem do servidor porque somar ou subtrair no botão poderia divergir após repetição ou resposta perdida. `aria-pressed` e o rótulo descrevem o estado para tecnologias assistivas.

## Como verificar manualmente

Curta e remova curtida de uma foto própria e de autora seguida; tente autora não seguida e uma falha de rede. Confira contador, estado e recuperação.

## Limitação desta entrega

O ambiente real está saudável, mas a validação visual e as capturas de navegador não foram executadas nesta entrega.
