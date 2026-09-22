# Poliroid

Este repositório contém exercícios de React para uma rede de fotos. O ambiente, a API e os dados de demonstração já estão preparados; cada grupo completa uma funcionalidade da interface.

## Subir o ambiente

1. Copie `.env.example` para `.env`.
2. Execute `docker compose up --build -d --wait`.
3. Abra http://localhost:3000.

O viewer padrão é Gabriel. O seed também prepara Marina, Lucas e Ana, com fotos e relações para explorar as telas.

## Exercícios

Cada grupo escolhe um exercício e altera apenas o arquivo indicado no seu enunciado.

| Exercício | Guia |
| --- | --- |
| 1. Publicação | [Abrir exercício](docs/exercise-01-publicacao-aluno.md) |
| 2. Perfil e galeria | [Abrir exercício](docs/exercise-02-perfil-galeria-aluno.md) |
| 3. Busca | [Abrir exercício](docs/exercise-03-busca-aluno.md) |
| 4. Follows | [Abrir exercício](docs/exercise-04-follows-aluno.md) |
| 5. Feed | [Abrir exercício](docs/exercise-05-feed-aluno.md) |
| 6. Likes | [Abrir exercício](docs/exercise-06-likes-aluno.md) |

## Comandos úteis

```sh
docker compose exec app npm run format
docker compose exec app npm run check
docker compose exec app npm run build
```

As funções de API e os componentes de apresentação necessários a cada exercício já existem. Use os contratos e os arquivos apontados no próprio enunciado.
