# Resolução do exercício 02: perfil e galeria

## Objetivo e base pronta

Este exercício completa a continuação paginada da galeria de um perfil. A primeira página já chega pelas props; `PostCollection` apresenta os cartões e `client-api.ts` fornece `getPostsPage`. A implementação deste exercício coordena somente o estado da lista, do cursor, da requisição e do erro.

## Contratos consultados

- `Page<PostDTO>` contém `items` e `nextCursor`; o cursor é opaco e não deve ser interpretado.
- `getPostsPage("user", cursor, userId)` busca a próxima página do autor.
- `PostCollection` mantém o estado vazio e o layout quadrado da galeria.
- O botão de curtida continua composto por `LikeButton`; a paginação não cria chamadas por cartão.

## Fluxo implementado

1. Se não existe cursor ou já há uma requisição pendente, o clique é ignorado.
2. A função incrementa `requestId`, marca a interface como pendente e limpa o erro anterior.
3. A API recebe exatamente o tipo `"user"`, o cursor atual e o `userId`.
4. Em sucesso, os novos itens são acrescentados aos posts existentes e o cursor recebido substitui o anterior. Com `null`, o botão deixa de aparecer.
5. Em falha, a mensagem é anunciada por `role="alert"`; os cartões anteriores permanecem e o cursor continua disponível para nova tentativa.
6. `finally` libera o estado pendente. A comparação de `requestId` impede que uma resposta antiga altere a lista ou o estado de uma leitura posterior.

Essa separação torna o exercício completável porque o componente não precisa conhecer SQL, storage ou o formato interno do cursor: ele apenas coordena um contrato tipado entre a API e a apresentação.

## Sucesso, pendência, erro e repetição

- **Sucesso:** a segunda página aparece abaixo da primeira, sem duplicar os cartões, e o próximo cursor controla a continuação.
- **Pendente:** o botão fica desabilitado e exibe “Carregando…”, evitando cliques duplicados.
- **Erro recuperável:** a mensagem aparece, os posts já visíveis não são apagados e o botão pode ser tentado novamente.
- **Repetição:** a mesma requisição pode ser repetida após erro; uma resposta antiga não sobrescreve estado mais recente graças ao identificador da requisição.

## Verificação manual reproduzível

1. Inicie o Compose original com PostgreSQL, MinIO e Next.js; confirme `GET /api/health` com banco e storage saudáveis.
2. Abra a galeria de Marina, que possui mais de uma página, e clique em “Carregar mais”. Confira a manutenção dos primeiros cartões, o acréscimo da página e o desaparecimento do botão quando `nextCursor` for `null`.
3. Abra Ana e confirme “Nenhuma publicação nesta galeria.”.
4. No Chrome, atrase a requisição da continuação para capturar o botão desabilitado e o texto “Carregando…”.
5. Faça a requisição falhar, confira `role="alert"`, preserve os cartões e clique novamente para confirmar a recuperação.

Durante esta execução, a consulta à API do Codespaces falhou por indisponibilidade de `api.github.com`; portanto, a validação visual no Codespace e as capturas reais ainda precisam ser executadas no ambiente remoto. Nenhuma imagem sintética é apresentada como evidência.
