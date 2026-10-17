# API REST de funcionários

API de treinamento feita com Node.js e Express para consultar funcionários
armazenados em `data/funcionarios.json`.

## Requisitos

- Node.js com suporte a módulos ES e importação de JSON.
- npm.

## Instalação e execução

Instale as dependências:

```bash
npm install
```

Inicie em modo de desenvolvimento, com reinicialização automática:

```bash
npm run dev
```

Ou inicie normalmente:

```bash
npm start
```

O servidor usa a porta `3001` e pode ser acessado em `http://localhost:3001`.
Ao iniciar, a aplicação também registra a mensagem de inicialização no terminal.

## Rotas disponíveis

| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/` | Retorna uma página HTML com uma mini documentação da API. |
| `GET` | `/funcionarios` | Retorna a lista de funcionários em JSON. |
| `GET` | `/funcionarios/:id` | Retorna um funcionário específico pelo `id`. |
| `POST` | `/funcionarios` | Cadastra um funcionário e gera seu `id`. |
| `PATCH` | `/funcionarios/:id` | Atualiza os campos informados de um funcionário. |
| `DELETE` | `/funcionarios/:id` | Remove um funcionário. |

Exemplos de chamada:

```bash
curl http://localhost:3001/
curl http://localhost:3001/funcionarios
curl http://localhost:3001/funcionarios/1
curl -X POST http://localhost:3001/funcionarios -H "Content-Type: application/json" -d "{\"nome_completo\":\"Ana Costa\",\"numero_matricula\":\"MAT2026002\",\"filial\":\"São Paulo - SP\",\"setor\":\"Tecnologia da Informação\",\"data_nascimento\":\"1990-01-01\",\"contato_telefonico\":\"(11) 99999-9999\",\"email\":\"ana.costa@empresa.com.br\",\"endereco\":{\"logradouro\":\"Av. Brasil\",\"numero\":\"100\",\"complemento\":\"\",\"bairro\":\"Centro\",\"cidade\":\"São Paulo\",\"estado\":\"SP\",\"cep\":\"01000-000\"}}"
curl -X PATCH http://localhost:3001/funcionarios/1 -H "Content-Type: application/json" -d "{\"setor\":\"Recursos Humanos\"}"
curl -X DELETE http://localhost:3001/funcionarios/1
```

A consulta bem-sucedida retorna o status `200` e um array de funcionários ou
um único objeto, conforme a rota utilizada. Cada registro contém `id`,
`nome_completo`, `numero_matricula`, `filial`, `setor`, `data_nascimento`,
`contato_telefonico`, `email` e `endereco`. O endereço contém `logradouro`,
`numero`, `complemento`, `bairro`, `cidade`, `estado` e `cep`. Os IDs atuais
são strings sequenciais. O cadastro retorna `201` e gera o próximo ID
sequencial. A atualização parcial retorna `200` com o funcionário atualizado;
a remoção retorna `200` com uma mensagem de confirmação.

Se o funcionário informado não existir, a rota `/funcionarios/:id` responde com
status `404` e uma mensagem JSON: `"Funcionário não encontrado!"`.

As operações de escrita exigem um corpo JSON do tipo objeto. Se o corpo estiver
ausente ou vazio, a API responde com status `400`.

Se ocorrer um erro ao listar ou buscar os funcionários, o controller registra o
problema no terminal e responde com status `500` e uma mensagem JSON.

## Organização do código

```text
app.js                                  Configura o Express e registra as rotas
server.js                               Inicia o servidor na porta 3001
app/
  routes/funcionarios.routes.js        Registra as rotas CRUD de funcionários
  controllers/funcionarios.controller.js
                                        Trata a requisição e a resposta HTTP
  services/funcionarios.service.js     Coordena a consulta dos funcionários
  repositories/funcionarios.repositories.js
                                        Lê e persiste os dados locais em JSON
data/funcionarios.json                 Dados iniciais dos funcionários
```

O fluxo das operações é:

```text
GET /funcionarios
  -> rota
  -> controller
  -> service
  -> repository
  -> data/funcionarios.json

POST /funcionarios, PATCH /funcionarios/:id, DELETE /funcionarios/:id
  -> rota
  -> controller
  -> service
  -> repository
  -> data/funcionarios.json
```

O Express está configurado para interpretar corpos de requisição JSON. Os
dados são persistidos em um arquivo JSON; não há banco de dados.

## Scripts npm

- `npm start`: inicia o servidor com Node.js.
- `npm run dev`: inicia o servidor usando Nodemon.
- `npm test`: ainda é apenas o script padrão de placeholder; não há testes
  automatizados configurados.

## Alterações documentadas

- Inclusão da rota raiz (`/`) com uma mini documentação HTML da API.
- Inclusão da rota `GET /funcionarios/:id` para consulta de um funcionário por
  identificador.
- Inclusão das rotas `POST`, `PATCH` e `DELETE` para o CRUD de funcionários.
- Ajuste da documentação para refletir a estrutura real do projeto e dos
  endpoints disponíveis.
"# api-rest-treino" 
"# api-rest-treino" 
