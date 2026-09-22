# AGENTS.md

## Propósito e prioridade

Este repositório é um clone simplificado do Instagram para ensinar Engenharia de Software e system design. **O objetivo principal é didática: produza o código mais simples, modular e fácil de ler que atenda aos requisitos e fluxos.** Antes de alterar código, leia [docs/design.md](docs/design.md) e o documento da funcionalidade. Decisões pendentes e possibilidades de evolução não são requisitos aprovados.

Aprofunde as decisões que ensinam algo central: separação entre metadados e grandes arquivos, contenção, consistência, idempotência, paginação e custo das leituras. Use as ideias do Hello Interview como referência para explicar problema, solução e trade-off. Não transforme exemplos de escala em obrigações de implementação.

## Implementação simples e modular

- Faça uma fatia vertical por vez: dados reais, operação de API e interface. Modele apenas os contratos necessários ao fluxo.
- Prefira nomes claros, funções pequenas, fluxo explícito e composição. Evite expressões compactas difíceis de acompanhar.
- Organize por funcionalidade e responsabilidade. Páginas compõem; módulos de funcionalidades coordenam comportamento; operações de servidor concentram regras e persistência.
- Componentes de apresentação recebem dados e callbacks por props tipadas. Não acessam banco nem fazem chamadas de rede implícitas.
- Mantenha contratos estáveis entre consumidores e implementações. Não importe detalhes internos de outra funcionalidade.
- Extraia código quando houver responsabilidade clara ou reutilização concreta. Modularidade não exige uma camada, interface ou arquivo para cada função.
- Comece com estado local. Compartilhe estado apenas onde necessário; ações específicas entram por props ou composição.
- Use APIs nativas e recursos prontos do framework ou de bibliotecas consolidadas. Não crie um framework próprio de HTTP, formulários, cache ou persistência.
- Não implemente robustez de produção por antecipação: retries genéricos, circuit breakers, hierarquias de erros, filas, telemetria extensa e tratamento de todas as falhas possíveis estão fora do escopo.
- Preserve o essencial: validação de entrada, autoria, permissões, constraints e transações que protegem as regras do produto. Simplicidade não permite dados incorretos.

## Legibilidade para alunos e modularidade

Estas regras valem para a funcionalidade atual e para todas as próximas. O leitor conhece JavaScript básico e está aprendendo React e desenvolvimento web. **Minimize o esforço para entender o comportamento, não o número de linhas. Simplifique a implementação, nunca os requisitos.**

- Escreva o fluxo principal como etapas reconhecíveis do caso de uso. Extraia blocos com intenção própria para funções com nomes concretos; não extraia apenas para encurtar uma função.
- Mantenha um nível de detalhe por função. Coordenação não deve se misturar com montagem de payloads, parsing de respostas, transporte HTTP ou detalhes de transformação de imagem.
- Prefira condicionais explícitas, blocos com chaves e variáveis intermediárias bem nomeadas. Evite ternários aninhados e encadeamentos difíceis de narrar.
- Divida componentes grandes por responsabilidade: seleção com prévia, campo de legenda e cartão de publicação são exemplos. Uma parte com comportamento próprio pode ser um componente mesmo com um único uso; não transforme cada trecho de JSX em um arquivo.
- Componentes de apresentação recebem contratos pequenos: dados e callbacks específicos. Não conhecem o estado completo do pai, rotas de API nem regras alheias à sua responsabilidade.
- Separe comunicação HTTP da apresentação quando ela tornar o componente difícil de ler. Funções de API recebem dados e retornam resultados; nunca recebem setters do React.
- Mantenha estado próximo de quem o usa e uma única fonte de verdade. Não esconda o caso de uso em uma função genérica que recebe todo o estado e seus setters.
- Mantenha helpers locais quando só fizerem sentido no arquivo. Crie módulos por responsabilidade independente, reutilização concreta ou ganho claro de navegação. Não antecipe hooks, serviços, classes, factories ou componentes genéricos.
- Use nomes que expliquem os dados e as operações.
- Comente brevemente os motivos, invariantes e APIs pouco familiares: repetição idempotente, preservação de dados após falhas, locks e liberação de recursos. Não comente o óbvio para compensar funções confusas.
- Antes de refatorar, identifique as garantias existentes. Preserve validações, acessibilidade, progresso, bloqueio de envio duplicado e recuperação de falhas. Separe correções de bugs de mudanças estruturais e explique ambas.
- Revise o diff perguntando se um aluno consegue narrar o fluxo principal, localizar os detalhes por nomes claros e entender cada componente por seu pequeno contrato. As extrações devem reduzir a carga mental, não apenas espalhar código.
- Verifique sucesso, falha e repetição pertinentes; compilar não comprova equivalência de comportamento.

## Páginas e apresentação de fotos

- Feed e galeria são páginas diferentes, com navegação explícita. Não reúna as duas listas na mesma página.
- Use o mesmo componente e a mesma regra de tamanho para as imagens do feed e da galeria: quadro quadrado, largura de até 320 px, reduzida apenas pelo espaço disponível em telas menores. A galeria organiza os cartões lado a lado quando couberem; não reduz suas fotos para obter mais colunas.
- Preserve a proporção da foto com `object-cover`, sem distorção. O recorte é visual; o arquivo final e suas dimensões originais permanecem disponíveis no storage e no contrato.

## Stack e convenções

- Use a versão estável mais recente do Next.js ao iniciar a implementação, com App Router, React e TypeScript estrito. Consulte a documentação da versão instalada ao usar suas APIs.
- Use Server Components por padrão e Client Components onde houver interação ou APIs do navegador. Use Route Handlers para a API documentada e recursos nativos de navegação, carregamento e erros.
- Use Tailwind CSS para estilos; prefira elementos HTML semânticos e composição simples.
- PostgreSQL é a fonte de verdade dos metadados; MinIO guarda as imagens. Redis não faz parte da implementação inicial.
- Isole a identidade mockada em `getViewerId`, exclusivamente no servidor.
- Código e identificadores em inglês; interface, comentários, docstrings e documentos em português.

## Formatação, linting e documentação

Esses cuidados são parte da entrega e têm prioridade: o código será material de leitura e estudo.

- Use **Prettier** para formatação consistente de código e documentos. Ao criar a aplicação, configure comandos de formatação e de checagem.
- Use **ESLint**, com as regras recomendadas para Next.js, React e TypeScript. Corrija os avisos; não desative regras apenas para fazer a verificação passar.
- Mantenha TypeScript estrito. Não use `any`, casts amplos ou supressões para esconder problemas de modelagem.
- Escreva **docstrings JSDoc/TSDoc** curtas em funções, componentes e contratos exportados, além de regras de domínio ou operações não óbvias. Explique responsabilidade e motivo; registre entradas, retorno, efeitos e erros esperados quando ajudarem o leitor. Não repita os tipos nem comente cada linha.
- Comente o porquê das decisões de design, especialmente locks, transações e separação entre banco e storage. Atualize a documentação junto com o comportamento.
- Trate os erros esperados do fluxo com mensagens claras. Não catalogue toda exceção possível nem oculte falhas com sucesso falso.
- Preserve acessibilidade básica: rótulos, teclado, foco e indicação de ações pendentes.
- Mantenha credenciais no servidor. Autorizações temporárias de upload vão apenas ao cliente que precisa usá-las; não devem aparecer em logs.
- Escreva uma docstring no começo de cada arquivo de código explicando por que ele existe e como se encaixa no projeto. Seja objetivo e considere um desenvolvedor iniciante.
- Mantenha o README atualizado com o funcionamento e os comandos do projeto.

## Verificação e fluxo de trabalho

1. Inspecione o estado atual e declare a menor entrega coerente.
2. Implemente os requisitos com a solução mais fácil de explicar e revise o diff.
3. Execute formatação, linting, checagem de tipos e build quando disponíveis e pertinentes à alteração.
4. Confira manualmente o fluxo alterado com dados preparados, sem depender da UI de outra funcionalidade. Use PostgreSQL e MinIO reais quando o fluxo envolver essas integrações.
5. Registre o que foi executado, o resultado e limitações concretas.

**Não escreva testes automatizados nem monte infraestrutura de testes, salvo pedido explícito.** A verificação manual dos fluxos e as checagens estáticas são suficientes para este escopo. Benchmarks e simulações extensas de falhas são aprofundamentos opcionais.

Quando um comando ainda não existir, declare isso. Nunca invente resultados nem declare Docker, Windows, Codespaces ou uma integração como validados sem execução correspondente.
