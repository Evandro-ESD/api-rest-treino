Regras de Negócio --- API REST Treino
1. Objetivo
Este documento define as regras de negócio, cadastro funcional,
autenticação, autorização e acesso aos dados da aplicação.

A finalidade é manter os requisitos organizados e distinguir o que já
está protegido pelo banco de dados, o que foi implementado na API e o
que ainda está planejado.

Importante: uma regra descrita neste documento não significa
necessariamente que já esteja implementada. O status de cada regra será
identificado como:
- Implementada no banco: protegida por uma restrição ou estrutura
  existente no PostgreSQL.
- Implementada na API: comportamento implementado e verificado
  manualmente por requisições.
- Parcial: existe estrutura ou parte do comportamento, mas a
  implementação completa ainda está pendente.
- Planejada: definida como requisito, mas ainda não implementada.
2. Conceitos fundamentais
2.1. Funcionário
Representa a pessoa cadastrada na organização.

O cadastro contém informações funcionais, como nome completo, matrícula,
filial, setor e e-mail de contato.

A tabela responsável é funcionarios.

Um funcionário pode existir sem possuir uma conta de acesso ao sistema.

O cadastro funcional possui um único campo de e-mail:
funcionarios.email.
2.2. Conta de acesso
Representa as credenciais utilizadas para autenticação.

A tabela responsável é contas_acesso, separada da tabela
funcionarios.

Cada conta está vinculada a um funcionário por meio de funcionario_id.

Regras:
- Um funcionário pode possuir, no máximo, uma conta de acesso.
- Uma conta deve pertencer a um funcionário existente.
- O e-mail utilizado para login é armazenado em contas_acesso.email
  e deve ser único.
- A senha deve ser armazenada somente como hash seguro.
- Uma conta pode estar desativada independentemente do cadastro
  funcional.
- A conta pode exigir confirmação de e-mail antes da ativação.
- O sistema não deve armazenar senhas em texto puro.
O e-mail funcional (funcionarios.email) e o e-mail de acesso
(contas_acesso.email) pertencem a finalidades diferentes. Não existe,
no modelo atual, uma regra de banco que obrigue esses dois valores a
serem iguais.

Status: estrutura principal e restrições de unicidade implementadas
no banco. O fluxo completo de autenticação e ativação ainda precisa ser
desenvolvido.
2.3. Unidade organizacional
Representa a posição de um funcionário na estrutura hierárquica da
organização.

A tabela responsável é unidades_organizacionais.

Tipos previstos:
- central
- area
- filial
- setor
- equipe
Uma unidade pode possuir uma unidade superior, definida por
unidade_pai_id.

Exemplo de hierarquia:

Central → Área 1 → Filial 01 → Setor Operacional → Setor Alpha.

O campo funcionarios.unidade_id identifica a unidade à qual o
funcionário está vinculado. Esse campo pode ser nulo quando o
funcionário ainda não estiver associado a uma unidade.

A unidade organizacional indica onde o funcionário está lotado, mas
não determina sozinha todas as suas permissões.

Status: estrutura hierárquica e relações principais implementadas no
banco. As regras de autorização baseadas nessa hierarquia ainda precisam
ser desenvolvidas.
2.4. Perfil de acesso
Representa o conjunto de responsabilidades funcionais de uma conta.

A tabela perfis_acesso contém os perfis cadastrados:
- RH: Recursos Humanos.
- OPERACIONAL: Operacional.
- LOGISTICA: Logística.
A associação entre contas e perfis é realizada por contas_perfis.

Uma conta pode possuir mais de um perfil, desde que cada associação seja
única.

O perfil define quais tipos de operação o usuário pode executar, mas
não determina, isoladamente, quais unidades ou funcionários ele pode
consultar.

Status: estrutura e restrições de integridade implementadas. A
validação efetiva das permissões ainda está pendente.
2.5. Escopo de acesso
Define sobre quais funcionários e unidades o usuário pode executar suas
operações.

O escopo pode ser limitado à própria pessoa, a uma filial ou a uma
abrangência superior, conforme as regras autorizadas.

O escopo não deve ser determinado exclusivamente pelo frontend. A API
deve verificar a autorização no servidor em todas as operações
protegidas.

Status: requisito definido; implementação pendente.
3. Regras de cadastro de funcionários
RN-001 --- Matrícula única
Cada funcionário deve possuir um número de matrícula exclusivo.

O banco possui uma restrição UNIQUE em
funcionarios.numero_matricula.

A API deve tratar uma tentativa de cadastro ou atualização com matrícula
já utilizada como conflito, sem expor detalhes internos do PostgreSQL.

Status: implementada no banco e na API; duplicidade verificada
manualmente com resposta HTTP 409.
RN-002 --- E-mail funcional único
Cada funcionário deve possuir um único e-mail de contato no cadastro
funcional.

O campo utilizado é funcionarios.email, protegido pela restrição única
uq_funcionarios_email.

A API deve validar o formato do e-mail e tratar a tentativa de utilizar
um endereço já cadastrado como conflito.

Status: implementada no banco e na API; formato inválido retorna
HTTP 400 e e-mail duplicado retorna HTTP 409, conforme testes manuais.
RN-003 --- Separação entre e-mail funcional e e-mail de acesso
O e-mail de contato do funcionário é armazenado em funcionarios.email.

O e-mail utilizado para autenticação é armazenado em
contas_acesso.email, que possui sua própria regra de unicidade.

Os dois campos pertencem a tabelas e finalidades diferentes. O modelo
atual não possui uma restrição que obrigue seus valores a serem iguais.
A aplicação não deve presumir essa igualdade.

Status: separação estrutural implementada no banco. A política
funcional sobre eventual igualdade ou diferença entre os endereços
deverá ser definida antes da implementação do fluxo de contas.
RN-004 --- Cadastro funcional independente da conta
O cadastro de um funcionário não deve exigir que uma conta de acesso
seja criada imediatamente.

Isso permite registrar os dados funcionais antes de iniciar o processo
de ativação da conta.

Status: suportada pela separação das tabelas; fluxo completo de
criação de conta pela API pendente.
RN-005 --- Unidade organizacional válida
Quando um funcionário estiver vinculado a uma unidade, essa unidade
deverá existir na tabela unidades_organizacionais.

A chave estrangeira fk_funcionarios_unidade protege a integridade
dessa relação.

O campo funcionarios.unidade_id pode receber NULL, permitindo o
cadastro de um funcionário ainda sem unidade vinculada.

A API deve rejeitar um identificador de unidade inexistente com uma
mensagem controlada.

Status: implementada no banco e na API. Unidade inexistente retorna
HTTP 400; valor NULL é aceito. Comportamentos verificados manualmente
em POST e PATCH.
4. Regras de criação e ativação de contas
RN-006 --- Criação de conta por usuário autorizado
Somente um usuário autorizado poderá iniciar a criação de uma conta de
acesso.

O processo deverá verificar a identidade do solicitante, seu perfil e
seu escopo de atuação.

Status: planejada.
RN-007 --- Ativação por confirmação de e-mail
A conta deverá permanecer pendente até que o funcionário conclua o
processo de ativação.

Fluxo previsto:
1. Um usuário autorizado cadastra o funcionário.
2. Um usuário autorizado inicia a criação da conta.
3. O sistema envia um link de ativação para o e-mail definido para
   acesso.
4. O funcionário acessa o link e comprova o controle do endereço de
   e-mail.
5. O funcionário define sua própria senha.
6. O sistema confirma o e-mail e ativa a conta, conforme as condições
   de segurança definidas.
7. A conta passa a poder autenticar-se se estiver ativa e cumprir os
   demais requisitos de acesso.
O token de ativação deve ser aleatório, protegido contra uso indevido,
ter prazo de validade e ser de uso único.

O link não deve permitir que terceiros escolham uma senha para o
funcionário sem a devida validação.

Status: planejada. O provedor de e-mail ainda precisa ser
configurado.
RN-008 --- Senha definida pelo próprio funcionário
O usuário responsável pelo cadastro não deve conhecer nem definir a
senha pessoal do funcionário.

A senha será definida pelo próprio funcionário durante a ativação da
conta.

Status: requisito definido; fluxo pendente.
RN-009 --- Armazenamento seguro de senhas
A aplicação deve utilizar Argon2 para gerar e verificar hashes de
senhas.

O sistema não deve armazenar senhas em texto puro nem registrar senhas
em logs.

A implementação de app/utils/password.js contém as funções
gerarHashSenha() e verificarSenha().

Status: utilitário implementado e testado; integração com o fluxo de
autenticação pendente.
RN-010 --- Recuperação de senha
A recuperação deverá utilizar um token temporário, de uso único e com
prazo de validade.

Após a validação do token, o funcionário poderá definir uma nova senha.

A resposta pública da API deve evitar revelar se determinado e-mail está
ou não cadastrado.

Status: planejada.
5. Regras de autenticação
RN-011 --- Condições para autenticar
Para realizar login, a conta deverá:
- Existir.
- Estar ativa.
- Ter concluído a confirmação de e-mail, quando exigida pela política
  de ativação.
- Possuir uma senha válida para o hash armazenado.
A autenticação deve falhar quando qualquer condição obrigatória não for
atendida.

A API não deve revelar se a falha ocorreu porque o e-mail não existe, a
senha está incorreta ou a conta está desativada, quando essa distinção
puder facilitar a descoberta de contas.

Status: planejada.
RN-012 --- Atualização do último acesso
Após uma autenticação bem-sucedida, a aplicação deverá atualizar
contas_acesso.ultimo_acesso.

O campo deve representar um acesso autenticado com sucesso, não apenas
uma tentativa de login.

Status: coluna implementada; atualização automática pela API
pendente.
RN-013 --- Desativação de conta
Uma conta desativada não poderá autenticar-se.

A aplicação também deverá considerar a desativação durante a validação
de sessões ou tokens existentes, conforme a estratégia de autenticação
adotada.

Desativar uma conta não significa necessariamente excluir o cadastro
funcional.

Status: coluna implementada; comportamento na API pendente.
6. Regras de autorização por perfil e escopo
A autorização deve combinar três fatores:
1. Identidade: quem está autenticado?
2. Permissão: qual operação essa pessoa pode executar?
3. Escopo: sobre quais dados essa operação pode ser executada?
RN-014 --- RH da Central
O usuário com perfil RH autorizado para a Central poderá consultar os
funcionários de todas as filiais dentro de sua abrangência autorizada.

O frontend poderá oferecer filtros por filial, mas a restrição de acesso
deverá ser aplicada no servidor.

Status: planejada.
RN-015 --- RH de uma filial
O usuário com perfil RH vinculado a uma filial poderá acessar os
funcionários daquela filial, conforme as permissões atribuídas.

Não poderá consultar ou modificar funcionários de outras filiais sem
autorização adicional.

Status: planejada.
RN-016 --- Administração operacional e logística
Os usuários administrativos dos setores Operacional e Logística poderão
acessar somente os dados necessários às suas responsabilidades e dentro
de sua abrangência autorizada.

A API deverá limitar tanto os registros retornados quanto os campos
disponíveis.

Não basta esconder informações na interface: dados não autorizados não
devem ser enviados ao cliente.

Status: planejada.
RN-017 --- Funcionário operacional
O funcionário operacional comum poderá consultar inicialmente apenas
seus próprios dados pessoais e funcionais autorizados.

O acesso a outros funcionários dependerá de uma permissão específica.

Status: planejada.
RN-018 --- Associação de múltiplos perfis
Uma conta poderá possuir mais de um perfil, desde que essas associações
sejam autorizadas.

A existência de vários perfis não deve conceder automaticamente acesso
irrestrito a todas as unidades.

As permissões efetivas deverão resultar da combinação das regras de
perfil e escopo definidas pela aplicação.

Status: associação e unicidade implementadas no banco; avaliação das
permissões pendente.
RN-019 --- Validação no servidor
Toda operação protegida deverá validar a autorização na API, inclusive
consultas por ID, alterações e exclusões.

Não será permitido confiar exclusivamente em informações enviadas pelo
frontend, como funcionario_id, unidade_id, perfil ou
identificadores equivalentes.

A API deverá obter a identidade autenticada de uma fonte confiável e
verificar se ela pode atuar sobre o recurso solicitado.

Status: planejada.
7. Regras de integridade e exclusão
RN-020 --- Integridade das associações
As associações devem respeitar as chaves estrangeiras existentes:
- Uma conta de acesso referencia um funcionário existente.
- Uma conta em contas_perfis referencia uma conta existente.
- Uma associação em contas_perfis referencia um perfil existente.
- Uma unidade organizacional pode referenciar uma unidade superior
  existente.
- Um funcionário pode referenciar uma unidade organizacional
  existente, quando unidade_id não for nulo.
Status: implementada no banco.
RN-021 --- Unicidade das associações de perfil
A mesma conta não pode receber duas associações idênticas com o mesmo
perfil.

A restrição uq_conta_perfil protege essa regra.

Status: implementada no banco.
RN-022 --- Exclusão de contas e associações
As associações de perfil em contas_perfis são excluídas
automaticamente quando a conta correspondente é excluída, por causa de
ON DELETE CASCADE.

A exclusão de um funcionário referenciado por uma conta de acesso não
possui, atualmente, ON DELETE CASCADE nessa relação. Portanto, o banco
pode impedir a exclusão do funcionário enquanto a conta existir.

A API deverá definir e implementar uma política explícita para
desativação, exclusão e retenção de registros. Não se deve presumir que
excluir um funcionário seja equivalente a desativar uma conta.

Status: comportamento de integridade implementado no banco; política
funcional pendente.
RN-023 --- Hierarquia organizacional
Uma unidade não pode ser sua própria unidade superior, devido à
restrição chk_unidade_nao_e_pai_de_si.

Entretanto, essa restrição não impede todos os ciclos hierárquicos
indiretos. Por exemplo, duas unidades poderiam ser configuradas como
pais uma da outra se nenhuma outra validação impedir isso.

A aplicação deverá validar as regras de hierarquia necessárias para
evitar ciclos e combinações incompatíveis entre os tipos de unidade.

Status: restrição direta implementada; validação completa da
hierarquia pendente.
8. Segurança e tratamento de erros
RN-024 --- Credenciais e tokens
Senhas, hashes, tokens de ativação e tokens de recuperação não devem ser
expostos em respostas desnecessárias ou registrados em logs.

Tokens de ativação e recuperação deverão ter validade limitada e ser
invalidados após o uso.

Status: planejada para os fluxos de autenticação.
RN-025 --- Tratamento de erros de banco
A API deverá tratar violações de restrições do PostgreSQL de maneira
controlada.

No cadastro e na atualização de funcionários, os seguintes casos já
possuem tratamento específico:
- Matrícula duplicada (23505, restrição
  funcionarios_numero_matricula_key): HTTP 409.
- E-mail funcional duplicado (23505, restrição
  uq_funcionarios_email): HTTP 409.
- Unidade organizacional inexistente (23503, restrição
  fk_funcionarios_unidade): HTTP 400.
Também devem ser tratados, conforme os respectivos fluxos forem
implementados:
- E-mail de conta de acesso duplicado.
- Associação com funcionário ou perfil inexistente.
- Tentativa de excluir registro referenciado.
- Outras violações de integridade do banco.
O cliente deverá receber um código HTTP apropriado e uma mensagem útil,
sem expor detalhes internos do banco, consultas SQL, credenciais ou
stack traces em produção.

Status: parcial. Tratamento e testes manuais realizados nos fluxos
POST e PATCH de funcionários para duplicidade de matrícula, duplicidade
de e-mail funcional e chave estrangeira inválida. Os demais fluxos e
erros ainda precisam ser consolidados.
RN-026 --- Privilégio mínimo
Cada operação deverá conceder apenas o acesso necessário à sua
finalidade.

A autorização deve ser aplicada em consultas, alterações e exclusões,
não somente no endpoint de listagem.

Status: planejada.
9. Responsabilidades das camadas da API
A implementação deverá preservar a arquitetura adotada no projeto:

Routes → Controllers → Services → Repositories
Routes
Responsáveis por declarar os endpoints e associar os middlewares e
controllers adequados.
Controllers
Responsáveis por receber requisições HTTP, extrair os dados necessários,
chamar os serviços e construir as respostas HTTP.
Services
Responsáveis por aplicar regras de negócio, coordenar operações e
decidir se a ação solicitada é válida conforme as regras funcionais.

A autorização deverá ser verificada antes de executar operações
protegidas, com apoio dos middlewares e serviços apropriados.
Repositories
Responsáveis pelo acesso ao PostgreSQL, incluindo consultas, inserções,
atualizações e exclusões.

As restrições do banco continuam sendo uma camada importante de proteção
da integridade dos dados.
Princípio arquitetural
A interface não substitui a autorização da API, e a API não deve
depender apenas das validações do frontend.

As regras de negócio precisam permanecer centralizadas e consistentes,
independentemente do cliente que consome a API.
10. Estado atual e próximos passos
Já implementado ou existente
- Tabela de funcionários com restrição de unicidade para matrícula.
- Campo único funcionarios.email para o e-mail funcional, com
  restrição de unicidade.
- Campo contas_acesso.email separado para o e-mail utilizado no
  login.
- Tabela separada para contas de acesso.
- Utilitário de hash e verificação de senha com Argon2 em
  app/utils/password.js.
- Tabela de perfis e tabela associativa entre contas e perfis.
- Estrutura hierárquica de unidades organizacionais.
- Chaves estrangeiras e restrições de integridade no banco.
- Validações de cadastro e atualização de funcionários para campos
  obrigatórios, formato de e-mail, tipos de dados e unidade
  organizacional.
- Tratamento de matrícula e e-mail funcional duplicados nos fluxos de
  cadastro e atualização de funcionários.
- Tratamento de unidade organizacional inexistente nos fluxos de
  cadastro e atualização de funcionários.
- Aceitação de unidade_id: null nos fluxos de cadastro e
  atualização.
- Testes manuais desses comportamentos com Thunder Client.
- Documentação inicial do banco em docs/banco-de-dados.md.
Ainda precisa ser implementado ou validado
- Definir formalmente se o e-mail de acesso poderá ser diferente do
  e-mail funcional.
- Cadastro e ativação segura de contas.
- Integração com um provedor de e-mail.
- Login e validação de credenciais.
- Recuperação e redefinição de senha.
- Emissão, validação e invalidação de sessões ou tokens.
- Atualização automática do último acesso.
- Desativação de contas e tratamento de sessões existentes.
- Autorização por perfil e escopo organizacional.
- Limitação dos campos retornados conforme as permissões.
- Tratamento dos erros de banco nos fluxos de contas, perfis e
  exclusões.
- Política de desativação e exclusão de funcionários e contas.
- Validação completa da hierarquia organizacional.
- Testes automatizados das regras de negócio e de segurança.
Este documento será atualizado à medida que cada regra for implementada
e testada.

Critério de conclusão: uma regra só deverá ser marcada como
implementada quando existir implementação verificável e, quando
aplicável, um teste que comprove seu comportamento. Os testes manuais
devem ser identificados como tais, sem serem apresentados como testes
automatizados.