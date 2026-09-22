# Resolução — Exercício 05: feed cronológico

## Objetivo e contrato

`getPostsPage("feed", cursor)` devolve a próxima página e um cursor opaco. O componente mantém os itens já lidos e coordena apenas a continuação.

## Passo a passo

1. Sem cursor ou durante pendência, `loadMore` retorna e impede chamadas duplicadas.
2. A função guarda o cursor e um identificador de requisição, limpa erro e pede a próxima página.
3. A resposta atual anexa posts e troca o cursor; resposta antiga é descartada.
4. Erro conserva todos os posts e permite outra tentativa; cursor nulo remove o botão.

O identificador evita aplicar uma resposta que deixou de representar a lista atual. O componente não decide quem entra no feed: a API monta os autores elegíveis.

## Como verificar manualmente

Abra `/feed`, percorra duas páginas, bloqueie apenas a continuação e confira que os cards existentes permanecem e o botão permite nova tentativa.

## Limitação desta entrega

O ambiente real está saudável, mas a validação visual e as capturas de navegador não foram executadas nesta entrega.
