# Resolução — Exercício 01: publicação

## Objetivo

Completar o formulário que publica uma imagem e uma legenda opcional. A tela coordena as três etapas já oferecidas pelo projeto: pedir autorização de upload, enviar os bytes diretamente ao storage e confirmar o post na API.

## Contratos consultados

- `requestUpload(file)` cria uma tentativa e devolve URL e campos temporários.
- `uploadImage(file, authorization)` envia o arquivo ao staging do MinIO.
- `finalizePublication({ uploadId, caption })` confirma o post e distingue sucesso de falhas que exigem ou não novo upload.

## Passo a passo da solução

1. O formulário valida tipo, tamanho e legenda antes de qualquer chamada.
2. Um primeiro envio pede autorização, envia o arquivo e guarda `uploadId` e legenda normalizada como `pendingPublication`.
3. A confirmação usa esses dados e, no sucesso, limpa o formulário e chama `router.refresh()` para renovar feed e galeria.
4. Se o servidor exigir novo upload, a tentativa guardada é descartada. Nos demais erros e em uma exceção de rede, ela permanece para que a confirmação seja repetida com a mesma intenção.
5. A ref `submitting` bloqueia um segundo submit antes da próxima renderização; `pending` também bloqueia controles e o fechamento do diálogo.

Guardar o `uploadId` antes da confirmação importa porque uma falha de resposta pode acontecer depois de o servidor criar o post. Repetir a confirmação compatível é idempotente e evita enviar outro arquivo.

## Como verificar manualmente

1. Inicie o ambiente e abra `/feed`.
2. Selecione JPEG, PNG ou WebP válido, escreva uma legenda e publique; confirme a foto em feed e galeria.
3. Bloqueie apenas `POST /api/v1/posts`, envie e retire o bloqueio; clique em **Tentar finalizar novamente**. Não deve ocorrer novo upload.
4. Selecione outro arquivo após um erro; a tentativa anterior e suas mensagens devem ser limpas.

## Limitação desta entrega

O ambiente de PostgreSQL, MinIO e Next.js foi iniciado e respondeu saudável. A validação visual no navegador e as capturas `sucesso.png`, `pendente.png` e `erro-recuperavel.png` permanecem pendentes e não foram substituídas por imagens artificiais.
