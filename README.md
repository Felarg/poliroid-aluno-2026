# Poliroid

Este repositório contém exercícios de React para uma rede de fotos. O ambiente, a API e os dados de demonstração já estão preparados; cada grupo completa uma funcionalidade da interface.

## Antes de começar

Você precisa de uma conta no [GitHub](https://github.com/signup). O caminho recomendado é o GitHub Codespaces: ele abre o projeto no navegador e já prepara VS Code, Node, Docker, banco de dados e extensões. Não é preciso instalar nada no computador.

Cada grupo trabalha diretamente no repositório da turma, com permissão de escrita, mas nunca altera `main` nem `resolucao/main` diretamente. O grupo cria sua própria branch e abre um pull request para a branch de integração.

1. Entre na sua conta do GitHub e abra [gabrielcnegre/poliroid-aluno-2026](https://github.com/gabrielcnegre/poliroid-aluno-2026).
2. Confirme com o professor que sua conta recebeu acesso de escrita ao repositório.
3. Use esse mesmo repositório nos passos abaixo; não crie fork.

## Caminho recomendado: GitHub Codespaces

1. Abra o repositório da turma no GitHub.
2. Clique no botão verde **Code**.
3. Abra a aba **Codespaces** e clique em **Create codespace on resolucao/main**. Essa é a base que reúne as resoluções dos exercícios.
4. Espere a preparação terminar. O GitHub abrirá uma versão do VS Code no navegador. Na primeira vez, isso pode levar alguns minutos.
5. Abra o terminal pelo menu **Terminal > New Terminal** e execute:

   ```sh
   docker compose up --build -d --wait
   ```

6. No painel inferior, abra a aba **Ports** e clique no ícone de navegador da porta **3000**, chamada **Poliroid**. A aplicação será aberta em outra aba.

O devcontainer instala Node, Docker Compose, GitHub CLI e extensões para ESLint, Prettier, Tailwind CSS, Docker, PostgreSQL e Markdown. Ele também prepara o `.env` com as URLs do próprio Codespace, permitindo uploads de imagens para o MinIO.

Não compartilhe as URLs das portas 9000 e 9001 nem altere sua visibilidade: elas ficam privadas. A porta 9000 entrega imagens e recebe uploads; a 9001 é o console do MinIO, útil apenas para inspeção.

### Fazer o exercício no Codespaces

1. Escolha um enunciado na seção [Exercícios](#exercícios). Ele informa o único arquivo que o grupo deve alterar.
2. No terminal, crie uma branch. Uma branch é um espaço separado para as mudanças do grupo:

   ```sh
   git switch -c resolucao/feature-03-busca-grupo-01
   ```

   Troque `feature-03-busca-grupo-01` pela feature e nome do seu grupo, usando apenas letras minúsculas, números e hífens. Cada grupo cria sua própria branch a partir de `resolucao/main`.

3. Edite o arquivo indicado, salve e confira a aplicação pela porta 3000.
4. Antes de enviar, veja o que mudou:

   ```sh
   git status
   git diff
   ```

5. Valide o que estiver disponível. Os comandos são executados dentro do container da aplicação:

   ```sh
   docker compose exec app npm run format:check
   docker compose exec app npm run lint
   docker compose exec app npm run typecheck
   ```

6. Grave uma versão da alteração no Git. Substitua o caminho pelo arquivo do seu exercício:

   ```sh
   git add src/features/users/search-form.tsx
   git commit -m "Completa busca do grupo 01"
   git push -u origin resolucao/feature-03-busca-grupo-01
   ```

   `git add` seleciona os arquivos do próximo commit, `git commit` grava uma versão com uma mensagem e `git push` envia a branch para o GitHub.

7. Crie o pull request pelo terminal. O comando usa a mensagem do commit como título e descrição inicial; ele abre uma URL para que você confira o resultado no GitHub:

   ```sh
   gh pr create \
     --repo gabrielcnegre/poliroid-aluno-2026 \
   --base resolucao/main \
   --head SEU-USUARIO:resolucao/feature-03-busca-grupo-01 \
     --fill
   ```

   Troque `SEU-USUARIO` pelo nome da conta que criou o fork e `resolucao/feature-03-busca-grupo-01` pelo nome da branch do grupo. O destino deve ser sempre `gabrielcnegre/poliroid-aluno-2026`, na branch `resolucao/main`; a `main` não recebe exercícios diretamente.

   O Codespaces normalmente já fornece a autenticação necessária. Se o comando informar que você não está autenticado, execute `gh auth login` e siga as opções para entrar na sua conta do GitHub. Como alternativa, você pode executar `gh pr create --web` para abrir a criação do pull request no navegador.

Ao terminar, pare o ambiente para economizar recursos:

```sh
docker compose down
```

Depois, na página [github.com/codespaces](https://github.com/codespaces), use **Stop codespace**. Suas alterações continuam guardadas no Codespace e no GitHub depois do `push`.

## Alternativa: VS Code com Dev Container no computador

Use esta opção apenas se o grupo preferir programar localmente. O projeto será aberto em um container igual ao do Codespaces.

### Windows

1. Instale [Git for Windows](https://git-scm.com/download/win), [Docker Desktop](https://www.docker.com/products/docker-desktop/) e [Visual Studio Code](https://code.visualstudio.com/).
2. Durante a configuração do Docker Desktop, habilite o backend **WSL 2**. Reinicie o computador caso ele peça.
3. Abra o VS Code, clique no ícone de extensões e instale **Dev Containers** (publicada pela Microsoft).
4. Abra o PowerShell ou Git Bash e siga os passos de [clonar e abrir o projeto](#clonar-e-abrir-o-projeto).

### Linux

1. Instale Git, Visual Studio Code, Docker Engine e o plugin Docker Compose seguindo a documentação da sua distribuição Linux.
2. Permita que seu usuário use o Docker sem `sudo` e entre novamente na sessão:

   ```sh
   sudo usermod -aG docker $USER
   ```

3. No VS Code, instale a extensão **Dev Containers** (publicada pela Microsoft).
4. Siga os passos de [clonar e abrir o projeto](#clonar-e-abrir-o-projeto).

### Clonar e abrir o projeto

1. No GitHub, abra o fork do grupo, clique em **Code**, escolha **HTTPS** e copie a URL. No terminal, substitua a URL no comando abaixo:

   ```sh
   git clone https://github.com/SEU-USUARIO/poliroid-aluno-2026.git
   cd poliroid-aluno-2026
   code .
   ```

2. Quando o VS Code mostrar a notificação, clique em **Reopen in Container**. Caso ela não apareça, pressione `F1` (ou `Ctrl+Shift+P`), procure **Dev Containers: Reopen in Container** e confirme.
3. Aguarde a criação do container. As extensões do projeto serão instaladas automaticamente.
4. No terminal integrado do VS Code, copie o arquivo de configuração e inicie os serviços:

   ```sh
   cp .env.example .env
   docker compose up --build -d --wait
   ```

   No PowerShell do Windows, se o comando `cp` não funcionar, use:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Abra [http://localhost:3000](http://localhost:3000) no navegador e siga os mesmos passos da seção [Fazer o exercício no Codespaces](#fazer-o-exercício-no-codespaces), incluindo branch, commit, push e pull request.

## Ambiente e dados de demonstração

1. Copie `.env.example` para `.env`.
2. Execute `docker compose up --build -d --wait`.
3. Abra http://localhost:3000.

O viewer padrão é Gabriel. O seed também prepara Marina, Lucas e Ana, com fotos e relações para explorar as telas.

## Exercícios

Cada grupo escolhe um exercício e altera apenas o arquivo indicado no seu enunciado.

| Exercício           | Guia                                                        |
| ------------------- | ----------------------------------------------------------- |
| 1. Publicação       | [Abrir exercício](docs/exercise-01-publicacao-aluno.md)     |
| 2. Perfil e galeria | [Abrir exercício](docs/exercise-02-perfil-galeria-aluno.md) |
| 3. Busca            | [Abrir exercício](docs/exercise-03-busca-aluno.md)          |
| 4. Follows          | [Abrir exercício](docs/exercise-04-follows-aluno.md)        |
| 5. Feed             | [Abrir exercício](docs/exercise-05-feed-aluno.md)           |
| 6. Likes            | [Abrir exercício](docs/exercise-06-likes-aluno.md)          |

## Comandos úteis

```sh
docker compose exec app npm run format
docker compose exec app npm run check
docker compose exec app npm run build
```

As funções de API e os componentes de apresentação necessários a cada exercício já existem. Use os contratos e os arquivos apontados no próprio enunciado.
