# PostScript — Publicação de artigos

Uma aplicação editorial responsiva para criar e acompanhar artigos usando **JavaScript**, **Fetch API** e uma API REST local com **JSON Server**.

> **Versão:** 1.1.0

## Funcionalidades

- Criar artigos com título, conteúdo, autor, data e categoria.
- Consultar e excluir artigos pela API.
- Buscar artigos por título, conteúdo, autor ou categoria.
- Ordenar publicações por data.
- Visualizar o payload JSON enquanto preenche o formulário.
- Usar ferramentas simples de formatação e pré-visualização do conteúdo.
- Acompanhar o estado da conexão com a API.
- Usar a interface em dispositivos móveis ou desktops.

## Tecnologias

- HTML5 e CSS3
- JavaScript
- Fetch API
- JSON Server `1.0.0-beta.15`

## Pré-requisitos

- Node.js instalado.
- pnpm instalado.

## Como executar

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   git clone https://github.com/ihuryferreira/PostScript.git
   cd PostScript
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Inicie a API em um terminal:

   ```bash
   pnpm run json-server
   ```

   A API ficará disponível em `http://localhost:3001`.

4. Em outro terminal, inicie um servidor estático na raiz do projeto:

   ```bash
   pnpm dlx serve .
   ```

   Abra no navegador o endereço informado pelo servidor. A aplicação precisa ser servida por HTTP e a API deve continuar rodando em paralelo.

## API

| Método | Endpoint | Ação |
| --- | --- | --- |
| `GET` | `http://localhost:3001/articles` | Lista os artigos |
| `POST` | `http://localhost:3001/articles` | Publica um artigo |
| `DELETE` | `http://localhost:3001/articles/:id` | Exclui um artigo |

O envio utiliza `Content-Type: application/json`. Exemplo de payload:

```json
{
  "title": "Dominando requisições POST",
  "content": "Um artigo sobre a Fetch API.",
  "author": "Ihury Ferrera",
  "date": "2026-11-01",
  "tag": "JavaScript"
}
```

Os dados locais da API são armazenados em [`src/data/db.json`](./src/data/db.json).

## Estrutura do projeto

```text
.
├── index.html
├── package.json
└── src/
    ├── index.js
    ├── style.css
    └── data/
        └── db.json
```

## Autor

**Ihury Ferrera**

- Portfólio: [ihuryferreira.com.br](https://ihuryferreira.com.br)
- Repositório: [github.com/ihuryferreira/PostScript](https://github.com/ihuryferreira/PostScript)
