1. Como ficará o fluxo do sistema

1. RH cadastra o funcionário

Nome, matrícula, lotação, e-mail inicial e demais dados funcionais. O RH não deve cadastrar nem conhecer a senha pessoal do funcionário.




2. O sistema prepara o acesso

Cria a conta vinculada ao funcionário e envia uma mensagem para o e-mail cadastrado pelo RH, com um fluxo seguro de ativação e definição da senha.




3. O funcionário administra os dados pessoais

Pode atualizar os campos pessoais autorizados e seu endereço, mas não pode alterar livremente matrícula, lotação ou permissões funcionais.




4. Recuperação de acesso

O funcionário solicita a redefinição de senha e recebe um link ou código temporário no e-mail previamente cadastrado. O sistema não revela se um endereço está cadastrado e invalida o token após o uso ou a expiração.



2. Regras de autorização que vamos adotar
Ação	RH	Funcionário
Cadastrar funcionário	Sim	Não
Alterar matrícula e lotação	Sim	Não
Consultar dados funcionais	Conforme permissão	Próprios dados autorizados
Alterar endereço pessoal	Conforme permissão	Próprio endereço
Alterar senha	Não em nome do funcionário	Sim
Solicitar recuperação de senha	Não é necessário	Sim
Alterar o e-mail de acesso	Conforme processo administrativo	Mediante verificação de identidade e do novo e-mail
A API deverá identificar o usuário autenticado e verificar suas permissões no servidor. Não basta confiar no id enviado pelo navegador.
3. O que isso significa para o código atual
Seu controller permite atualmente chamar cadastrarFuncionario(req.body), e o repository grava diretamente os dados funcionais. Vamos evoluir esse fluxo sem misturar as credenciais com os dados do RH.

Também há uma decisão pendente sobre setor: hoje, funcionarios armazena setor como texto, enquanto a nova tabela setores possui um identificador e uma relação com filiais. No modelo definitivo, o funcionário deverá referenciar setor_id, e a filial será obtida pelo relacionamento do setor. Isso evita lotações inconsistentes.

Minha recomendação para o próximo passo: definir o ciclo de vida da conta, antes de escrever o cadastro de acesso. O RH cadastra o funcionário e seu e-mail inicial; a conta fica pendente até o funcionário confirmar o e-mail e definir a própria senha.

Assim, não precisamos criar uma senha provisória, nem permitir que o RH conheça a senha do funcionário.