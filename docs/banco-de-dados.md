# Banco de Dados — API REST Treino

**Projeto:** `api-rest-treino`  
**Banco de dados:** PostgreSQL  
**Status:** Modelagem inicial em desenvolvimento  
**Última atualização:** 20/10/2026

## 1. Objetivo

Este documento registra a estrutura relacional do banco de dados, os relacionamentos entre tabelas, as restrições de integridade e as principais decisões de modelagem do projeto.

O projeto tem finalidade educacional e busca aplicar práticas utilizadas no desenvolvimento de APIs REST profissionais, incluindo separação de responsabilidades, autenticação, autorização e organização hierárquica.

## 2. Estruturas existentes

### 2.1. `funcionarios`

Armazena os dados cadastrais dos funcionários.

| Coluna | Tipo / característica | Finalidade |
|---|---|---|
| `id` | INTEGER, PK, IDENTITY | Identificador do funcionário |
| `nome_completo` | VARCHAR, NOT NULL | Nome completo |
| `numero_matricula` | VARCHAR, NOT NULL, UNIQUE | Matrícula única |
| `filial` | VARCHAR, NOT NULL | Informação textual da filial |
| `setor` | VARCHAR, NOT NULL | Informação textual do setor |
| `email_login` | VARCHAR, NOT NULL, UNIQUE | E-mail de login cadastrado |
| `email_contato` | VARCHAR, NOT NULL | E-mail de contato |
| `ativo` | BOOLEAN, NOT NULL, DEFAULT TRUE | Estado cadastral |
| `criado_em` | TIMESTAMPTZ, DEFAULT NOW() | Data de criação |
| `email` | VARCHAR, nullable | Campo existente cuja finalidade precisa ser revisada |
| `unidade_id` | INTEGER, nullable, FK | Vínculo com a unidade organizacional |

**Restrições conhecidas:**
- A matrícula deve ser única.
- O e-mail de login deve ser único.
- A restrição `email_contato_igual_login` exige igualdade entre `email_contato` e `email_login`.
- `unidade_id` referencia `unidades_organizacionais(id)` por meio da restrição `fk_funcionarios_unidade`.

**Observação:** `filial` e `setor` são campos textuais legados. O novo vínculo organizacional é representado por `unidade_id`. A migração ou remoção dos campos antigos exige análise própria e não faz parte desta etapa.

### 2.2. `contas_acesso`

Armazena os dados relacionados à autenticação.

| Coluna | Tipo / característica | Finalidade |
|---|---|---|
| `id` | INTEGER, PK, IDENTITY | Identificador da conta |
| `funcionario_id` | INTEGER, NOT NULL, UNIQUE, FK | Funcionário associado |
| `email` | VARCHAR(254), NOT NULL, UNIQUE | E-mail da conta |
| `senha_hash` | VARCHAR(255), NOT NULL | Hash da senha |
| `ativo` | BOOLEAN, NOT NULL, DEFAULT TRUE | Estado da conta |
| `email_confirmado` | BOOLEAN, NOT NULL, DEFAULT FALSE | Confirmação do e-mail |
| `ultimo_acesso` | TIMESTAMPTZ, nullable | Data e hora do último acesso |
| `criado_em` | TIMESTAMPTZ, NOT NULL, DEFAULT NOW() | Data de criação |

**Relacionamentos e restrições:**
- `funcionario_id` referencia `funcionarios(id)`.
- `funcionario_id` possui restrição `UNIQUE`: cada funcionário pode ter, no máximo, uma conta.
- `email` possui restrição `UNIQUE`.
- `senha_hash` é obrigatório.

**Decisão de segurança:** senhas não devem ser armazenadas em texto puro. O projeto possui uma utilidade de hash e verificação de senhas utilizando Argon2.

A criação de contas, a confirmação de e-mail e a recuperação de senha ainda precisam ser integradas ao fluxo da API.

### 2.3. `unidades_organizacionais`

Representa a hierarquia organizacional por meio de uma relação autorreferenciada.

| Coluna | Tipo / característica | Finalidade |
|---|---|---|
| `id` | INTEGER, PK, IDENTITY | Identificador da unidade |
| `nome` | VARCHAR(100), NOT NULL | Nome da unidade |
| `tipo` | VARCHAR(20), NOT NULL | Categoria organizacional |
| `unidade_pai_id` | INTEGER, FK, nullable | Unidade superior |
| `ativo` | BOOLEAN, NOT NULL, DEFAULT TRUE | Estado da unidade |
| `criado_em` | TIMESTAMPTZ, NOT NULL, DEFAULT NOW() | Data de criação |

**Tipos permitidos:** `central`, `area`, `filial`, `setor` e `equipe`.

**Restrições:**
- `unidade_pai_id` referencia `unidades_organizacionais(id)`.
- A unidade não pode ser seu próprio pai diretamente.
- `unidade_pai_id` pode ser NULL, permitindo a unidade raiz.

**Hierarquia de teste cadastrada:**

```text
Central
└── Área 1
    └── Filial 01
        ├── Setor Administrativo
        └── Setor Operacional
            ├── Setor Alpha
            └── Setor Bravo
```

O cadastro demonstra a estrutura hierárquica pretendida. Regras que validem combinações permitidas entre os tipos de unidade, ciclos indiretos e atribuições organizacionais ainda precisam ser implementadas ou verificadas.

### 2.4. `perfis_acesso`

Catálogo dos perfis disponíveis no sistema.

| Coluna | Tipo / característica | Finalidade |
|---|---|---|
| `id` | INTEGER, PK, IDENTITY | Identificador do perfil |
| `codigo` | VARCHAR(30), NOT NULL, UNIQUE | Código único do perfil |
| `nome` | VARCHAR(100), NOT NULL | Nome legível |
| `descricao` | TEXT, nullable | Descrição do perfil |
| `ativo` | BOOLEAN, NOT NULL, DEFAULT TRUE | Estado do perfil |
| `criado_em` | TIMESTAMPTZ, NOT NULL, DEFAULT NOW() | Data de criação |

**Perfis cadastrados:**

| ID confirmado | Código | Nome |
|---:|---|---|
| 1 | `RH` | Recursos Humanos |
| 2 | `OPERACIONAL` | Operacional |
| 3 | `LOGISTICA` | Logística |

Os perfis representam funções de acesso à aplicação. Eles não substituem o vínculo organizacional do funcionário.

### 2.5. `contas_perfis`

Tabela associativa entre contas e perfis, permitindo uma relação muitos-para-muitos.

| Coluna | Tipo / característica | Finalidade |
|---|---|---|
| `id` | INTEGER, PK, IDENTITY | Identificador da associação |
| `conta_acesso_id` | INTEGER, NOT NULL, FK | Conta associada |
| `perfil_acesso_id` | INTEGER, NOT NULL, FK | Perfil associado |
| `criado_em` | TIMESTAMPTZ, NOT NULL, DEFAULT NOW() | Data da associação |

**Restrições:**
- `conta_acesso_id` referencia `contas_acesso(id)`.
- `perfil_acesso_id` referencia `perfis_acesso(id)`.
- A restrição `uq_conta_perfil` impede que o mesmo perfil seja atribuído duas vezes à mesma conta.
- As duas chaves estrangeiras possuem `ON DELETE CASCADE`.

A tabela registra as associações, mas não implementa, por si só, a autorização das operações da API.

### 2.6. Tabelas anteriores

As seguintes tabelas já existiam no banco antes da criação da nova hierarquia:

- `area`: cadastro de áreas, com identificador, código, nome, estado e data de criação.
- `filiais`: cadastro de filiais, com informações geográficas e referência à tabela `area`.
- `setores`: cadastro de setores vinculados a filiais.
- `enderecos`: armazenamento de informações de endereço.

Essas estruturas ainda precisam de um inventário completo de colunas, restrições e relacionamentos. Sua existência não significa que já foram integradas ao novo modelo organizacional.

## 3. Relacionamentos principais

```text
funcionarios
    │
    ├── 0..1 conta de acesso
    │       └── contas_acesso
    │               │
    │               └── contas_perfis
    │                       └── perfis_acesso
    │
    └── unidade_id
            └── unidades_organizacionais
                    └── unidade_pai_id
                            └── unidades_organizacionais
```

A relação entre funcionário e conta é opcional do ponto de vista do cadastro: um funcionário pode existir antes de ter uma conta de acesso.

A relação entre conta e perfil permite múltiplos perfis por conta. O banco ainda não possui uma tabela específica de permissões por ação nem uma estrutura completa para registrar exceções de escopo.

### Complemento — Estruturas anteriores confirmadas

#### `area`

- Chave primária: `id`.
- `codigo` é obrigatório e único.
- `nome` é obrigatório.
- `ativo` é obrigatório e possui valor padrão `TRUE`.
- `criado_em` é obrigatório e possui valor padrão `NOW()`.

A tabela possui a restrição única `aisp_codigo_key` e a chave primária `aisp_pkey`.

#### `filiais`

- Chave primária: `id`.
- `nome` é obrigatório e único.
- `bairro`, `municipio` e `estado` são obrigatórios.
- `area_id` é obrigatório e referencia `area(id)` por meio de `fk_filiais_area`.
- `ativo` é obrigatório e possui valor padrão `TRUE`.
- `criado_em` é obrigatório e possui valor padrão `NOW()`.

A restrição `filiais_nome_key` impede nomes de filiais duplicados em toda a tabela.

#### `setores`

- Chave primária: `id`.
- `nome` é obrigatório.
- `filial_id` é obrigatório e referencia `filiais(id)` por meio de `fk_setores_filial`.
- `ativo` é obrigatório e possui valor padrão `TRUE`.
- `criado_em` é obrigatório e possui valor padrão `NOW()`.

A restrição `uq_setores_nome_filial` impede a repetição do mesmo nome de setor dentro da mesma filial, permitindo que filiais diferentes tenham setores com nomes iguais.

#### `enderecos`

- Chave primária: `id`.
- `logradouro`, `numero`, `bairro`, `municipio`, `estado` e `cep` são obrigatórios.
- `complemento` é opcional.
- `estado` possui valor padrão `RJ`.
- `criado_em` possui valor padrão `NOW()` e é obrigatório.

Não foram encontradas chaves estrangeiras para `enderecos` na consulta realizada. É necessário definir posteriormente como cada endereço será vinculado ao funcionário, considerando as regras de negócio e a possibilidade de existir mais de um endereço por pessoa.

### Relacionamentos confirmados do modelo anterior

```text
area
└── filiais
    └── setores

enderecos
└── sem relacionamento formal confirmado
    com funcionarios
```

O modelo anterior e `unidades_organizacionais` coexistem no banco. Ainda não foi realizada uma migração entre eles, e não se deve presumir que seus registros estejam sincronizados.

**Nota técnica:** os campos `NOT NULL` aparecem como restrições individuais no catálogo do PostgreSQL. Para a documentação funcional, é suficiente registrar que as respectivas colunas são obrigatórias; não é necessário reproduzir os nomes internos de todas essas restrições.

### 3.1. Chaves estrangeiras confirmadas

A consulta ao catálogo do PostgreSQL confirmou os seguintes relacionamentos:

| Tabela de origem | Coluna | Tabela de destino | Coluna de destino |
|---|---|---|---|
| `contas_acesso` | `funcionario_id` | `funcionarios` | `id` |
| `contas_perfis` | `conta_acesso_id` | `contas_acesso` | `id` |
| `contas_perfis` | `perfil_acesso_id` | `perfis_acesso` | `id` |
| `funcionarios` | `unidade_id` | `unidades_organizacionais` | `id` |
| `unidades_organizacionais` | `unidade_pai_id` | `unidades_organizacionais` | `id` |

**Comportamento de exclusão:**

As duas chaves estrangeiras de `contas_perfis` possuem `ON DELETE CASCADE`. Se uma conta ou um perfil for excluído fisicamente, as associações correspondentes serão removidas automaticamente.

As demais chaves estrangeiras não declaram `ON DELETE CASCADE` na definição consultada. Portanto, não devemos presumir que a exclusão de um funcionário ou de uma unidade organizacional removerá automaticamente seus registros dependentes.

**Observação:** uma chave estrangeira garante a integridade referencial, mas não determina, sozinha, a quantidade de registros permitidos em cada relação. As restrições `UNIQUE` e `NOT NULL` também participam dessas regras.

### 3.2. Estado da validação estrutural

As relações entre funcionários, contas de acesso, perfis e unidades organizacionais foram verificadas no catálogo do banco.

Essa validação confirma a existência das chaves estrangeiras, mas não comprova, por si só, que a API implementa autenticação ou autorização. Essas funcionalidades continuam sendo etapas de desenvolvimento.

### 3.3. Chaves primárias e restrições de unicidade confirmadas

A consulta ao catálogo do PostgreSQL confirmou as seguintes restrições:

| Tabela | Restrição | Colunas |
|---|---|---|
| `funcionarios` | PRIMARY KEY | `id` |
| `funcionarios` | UNIQUE | `numero_matricula` |
| `funcionarios` | UNIQUE | `email_login` |
| `contas_acesso` | PRIMARY KEY | `id` |
| `contas_acesso` | UNIQUE | `funcionario_id` |
| `contas_acesso` | UNIQUE | `email` |
| `contas_perfis` | PRIMARY KEY | `id` |
| `contas_perfis` | UNIQUE | `conta_acesso_id`, `perfil_acesso_id` |
| `perfis_acesso` | PRIMARY KEY | `id` |
| `perfis_acesso` | UNIQUE | `codigo` |
| `unidades_organizacionais` | PRIMARY KEY | `id` |

**Consequências para o modelo:**

- Cada funcionário possui um identificador único, matrícula única e e-mail de login único.
- Cada funcionário pode estar associado a, no máximo, uma conta de acesso.
- O e-mail de uma conta de acesso não pode se repetir em outra conta.
- Uma conta pode receber vários perfis, mas não pode receber o mesmo perfil duas vezes.
- O código de cada perfil é único.
- Nomes de unidades organizacionais podem se repetir, pois não há restrição de unicidade para essa coluna.

Essas restrições protegem a integridade dos dados no banco, independentemente da interface utilizada para cadastrar os registros.


## 4. Regras de negócio registradas

1. Cada funcionário deve possuir matrícula única.
2. O e-mail de login do funcionário deve ser único.
3. O e-mail de contato deve ser igual ao e-mail de login, conforme a restrição atual.
4. Um funcionário pode ser cadastrado antes da criação da conta de acesso.
5. Uma conta deve estar vinculada a um funcionário.
6. Um funcionário pode possuir vários perfis de acesso.
7. O mesmo perfil não pode ser associado duas vezes à mesma conta.
8. A hierarquia organizacional deve ser utilizada como base para determinar o escopo de acesso.
9. As permissões devem ser verificadas no servidor, e não apenas controladas pela interface.
10. O funcionário deve definir a própria senha durante o processo de ativação, sem que o RH conheça essa senha.

## 5. Diretrizes de autorização

As regras funcionais definidas para o projeto são:

- **RH Central:** acesso aos funcionários de todas as unidades, conforme as permissões concedidas.
- **RH de filial:** acesso limitado ao escopo da própria filial.
- **Administrativos de outros setores:** acesso limitado à própria filial e aos dados necessários à função.
- **Funcionário operacional:** acesso aos próprios dados pessoais, salvo outras permissões explicitamente autorizadas.

Essas regras representam requisitos de negócio. A autorização efetiva ainda precisa ser implementada na API.

Ter um perfil `RH`, `OPERACIONAL` ou `LOGISTICA` não deve conceder acesso irrestrito automaticamente. O servidor precisa verificar o perfil, a unidade autorizada e a operação solicitada.

## 6. Fluxo planejado de ativação

1. O RH autorizado cadastra o funcionário.
2. A API prepara uma conta pendente associada ao funcionário.
3. O sistema envia um link ou código de ativação ao e-mail previamente cadastrado.
4. O funcionário confirma o e-mail e define a própria senha.
5. O sistema valida o token de ativação e registra o estado correspondente.
6. O login só é permitido quando os requisitos de ativação e acesso estiverem satisfeitos.

O serviço de envio de e-mails ainda não está configurado. Portanto, esse fluxo é um requisito planejado, não uma funcionalidade concluída.

A recuperação de senha também deverá utilizar um mecanismo temporário, de uso único e com expiração. A resposta da API não deverá revelar se um e-mail está cadastrado.

## 7. Estado atual

**Implementado ou criado no banco:**
- Tabela `funcionarios` e restrições conhecidas.
- Tabela `contas_acesso`, ainda sem contas cadastradas.
- Tabela `unidades_organizacionais` e hierarquia de teste.
- Coluna `funcionarios.unidade_id` e respectiva chave estrangeira.
- Tabelas `perfis_acesso` e `contas_perfis`.
- Perfis iniciais RH, Operacional e Logística.
- Utilidade de hash e verificação de senhas com Argon2.

**Pendente:**
- Criar o fluxo da API para provisionamento de contas.
- Configurar o envio de e-mails.
- Implementar ativação e recuperação de senha.
- Implementar autenticação e autorização na API.
- Definir permissões por operação e escopo organizacional.
- Inventariar completamente as tabelas anteriores.
- Revisar a finalidade do campo `funcionarios.email`.
- Avaliar validações adicionais para a hierarquia e a consistência dos dados.

## 8. Procedimento de manutenção

Quando uma tabela, coluna, restrição ou regra de negócio for alterada:

1. Implementar e validar a alteração no banco.
2. Registrar a mudança neste documento.
3. Atualizar os documentos de regras e autenticação, quando aplicável.
4. Registrar decisões que ainda estejam pendentes sem apresentá-las como implementadas.

**Princípio do projeto:** a documentação deve refletir o banco real e distinguir claramente implementações concluídas, requisitos definidos e funcionalidades futuras.
