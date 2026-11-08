CREATE TABLE contas_acesso (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id INTEGER NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    email_confirmado BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_acesso TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_contas_acesso_email
        UNIQUE (email),

    CONSTRAINT fk_contas_acesso_funcionario
        FOREIGN KEY (funcionario_id)
        REFERENCES funcionarios(id)
);


CREATE TABLE funcionarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    numero_matricula VARCHAR(30) NOT NULL UNIQUE,
    data_nascimento DATE,
    contato_telefonico VARCHAR(20),
    setor_id INTEGER NOT NULL,
    endereco_id INTEGER UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_funcionarios_setor
        FOREIGN KEY (setor_id)
        REFERENCES setores(id),

    CONSTRAINT fk_funcionarios_endereco
        FOREIGN KEY (endereco_id)
        REFERENCES enderecos(id)
);


CREATE TABLE aisp (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE filiais (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    bairro VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL DEFAULT 'RJ',
    area_id INTEGER NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT fk_filiais_area
		FOREIGN KEY (area_id)
		REFERENCES area(id)
);


CREATE TABLE setores (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    filial_id INTEGER NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_setores_nome_filial
        UNIQUE (nome, filial_id),

    CONSTRAINT fk_setores_filial
        FOREIGN KEY (filial_id)
        REFERENCES filiais(id)
);


CREATE TABLE enderecos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL DEFAULT 'RJ',
    cep VARCHAR(9) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


