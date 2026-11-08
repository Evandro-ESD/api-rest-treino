
CREATE TABLE unidades_organizacionais (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    unidade_pai_id INTEGER,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_unidade_pai
        FOREIGN KEY (unidade_pai_id)
        REFERENCES unidades_organizacionais(id),

    CONSTRAINT chk_unidade_tipo
        CHECK (
            tipo IN (
                'central',
                'area',
                'filial',
                'setor',
                'equipe'
            )
        ),

    CONSTRAINT chk_unidade_nao_e_pai_de_si
        CHECK (unidade_pai_id IS NULL OR unidade_pai_id <> id)
);


// Cadastrar a Central
INSERT INTO unidades_organizacionais (nome, tipo)
VALUES ('Central', 'central')
RETURNING *;


// Criar a primeira área
Agora vamos cadastrar a Área 1 como filha da Central.

INSERT INTO unidades_organizacionais (
    nome,
    tipo,
    unidade_pai_id
)
VALUES (
    'Área 1',
    'area',
    1
)
RETURNING *;


Cadastrar a primeira filial
Agora vamos criar a Filial 01, subordinada à Área 1.

Execute no pgAdmin:

INSERT INTO unidades_organizacionais (
    nome,
    tipo,
    unidade_pai_id
)
VALUES (
    'Filial 01',
    'filial',
    2
)
RETURNING *;

riar o setor administrativo da filial
Vamos cadastrar o setor administrativo como filho da Filial 01. Primeiro, precisamos confirmar o identificador que o PostgreSQL atribuiu à filial.

Execute:

SELECT id, nome, tipo, unidade_pai_id
FROM unidades_organizacionais
WHERE tipo = 'filial';

Cadastrar o Setor Administrativo
Execute no pgAdmin:

INSERT INTO unidades_organizacionais (
    nome,
    tipo,
    unidade_pai_id
)
VALUES (
    'Setor Administrativo',
    'setor',
    3
)
RETURNING *;



// Cadastrar o Setor Operacional
Agora vamos cadastrar o segundo setor da Filial 01.

Execute no pgAdmin:

INSERT INTO unidades_organizacionais (
    nome,
    tipo,
    unidade_pai_id
)
VALUES (
    'Setor Operacional',
    'setor',
    3
)
RETURNING *;

// Cadastrar a equipe Alpha
Vamos criar a primeira equipe operacional subordinada ao Setor Operacional.

Execute no pgAdmin:

INSERT INTO unidades_organizacionais (
    nome,
    tipo,
    unidade_pai_id
)
VALUES (
    'Setor Alpha',
    'equipe',
    5
)
RETURNING *;

//Etapa 11 — Cadastrar a equipe Bravo
Vamos repetir o procedimento para a segunda equipe. Observe que ela também ficará subordinada ao Setor Operacional, e não ao Alpha.

Execute no pgAdmin:

INSERT INTO unidades_organizacionais (
    nome,
    tipo,
    unidade_pai_id
)
VALUES (
    'Setor Bravo',
    'equipe',
    5
)
RETURNING *;

//Etapa 12 — Consultar a hierarquia completa
Execute no pgAdmin:


WITH RECURSIVE hierarquia AS (
    SELECT
        id,
        nome,
        tipo,
        unidade_pai_id,
        0 AS nivel,
        nome::TEXT AS caminho
    FROM unidades_organizacionais
    WHERE unidade_pai_id IS NULL

    UNION ALL

    SELECT
        filha.id,
        filha.nome,
        filha.tipo,
        filha.unidade_pai_id,
        pai.nivel + 1,
        pai.caminho || ' > ' || filha.nome
    FROM unidades_organizacionais AS filha
    INNER JOIN hierarquia AS pai
        ON filha.unidade_pai_id = pai.id
)
SELECT
    id,
    repeat('    ', nivel) || nome AS unidade,
    tipo,
    unidade_pai_id,
    nivel,
    caminho
FROM hierarquia
ORDER BY caminho;


//Etapa 2 — Criar a tabela perfis_acesso
CREATE TABLE perfis_acesso (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


//Etapa 3 — Cadastrar os perfis iniciais

INSERT INTO perfis_acesso (codigo, nome, descricao)
VALUES
    ('RH', 'Recursos Humanos', 'Gerencia os dados de funcionários conforme seu escopo autorizado.'),
    ('OPERACIONAL', 'Operacional', 'Acessa as funcionalidades operacionais autorizadas.'),
    ('LOGISTICA', 'Logística', 'Acessa as funcionalidades logísticas autorizadas.');


// Etapa 4 — Criar a tabela de relacionamento contas_perfis

A regra será:
- Uma conta pode ter vários perfis.
- Um mesmo perfil pode ser atribuído a várias contas.
- A mesma conta não poderá receber o mesmo perfil duas vezes.
- Se uma conta ou um perfil for excluído no futuro, o relacionamento correspondente será removido automaticamente.

CREATE TABLE contas_perfis (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    conta_acesso_id INTEGER NOT NULL,
    perfil_acesso_id INTEGER NOT NULL,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_contas_perfis_conta
        FOREIGN KEY (conta_acesso_id)
        REFERENCES contas_acesso(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_contas_perfis_perfil
        FOREIGN KEY (perfil_acesso_id)
        REFERENCES perfis_acesso(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_conta_perfil
        UNIQUE (conta_acesso_id, perfil_acesso_id)
);