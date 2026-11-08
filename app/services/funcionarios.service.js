
import {
   atualizarFuncionario as atualizarFuncionarioNoRepositorio,
   buscarFuncionarioPorId,
   criarFuncionario as criarFuncionarioNoRepositorio,
   removerFuncionario as removerFuncionarioNoRepositorio,
   todosFuncionarios
} from '../repositories/funcionarios.repositories.js';

export async function listarFuncionarios() {
   return todosFuncionarios();
}

export async function obterFuncionarioPorId(id) {
   return buscarFuncionarioPorId(id);
}

export async function cadastrarFuncionario(dadosFuncionario) {

   // 1. Validar os campos obrigatórios
   const camposObrigatorios = [
      'nome_completo',
      'numero_matricula',
      'filial',
      'setor',
      'email'
   ];

   for (const campo of camposObrigatorios) {
      const valor = dadosFuncionario[campo];

      if (typeof valor !== 'string' || valor.trim().length === 0) {
         const erroNegocio = new Error(
            `O campo "${campo}" é obrigatório e deve ser preenchido.`
         );

         erroNegocio.statusCode = 400;
         throw erroNegocio;
      }
   }

   // 2. Validar o formato do e-mail
   const email = dadosFuncionario.email;

   const formatoEmailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

   if (!formatoEmailValido) {
      const erroNegocio = new Error(
         'O campo "email" deve conter um endereço de e-mail válido.'
      );

      erroNegocio.statusCode = 400;
      throw erroNegocio;
   }

   // 3. Validar o campo ativo, quando informado
   if (
      dadosFuncionario.ativo !== undefined &&
      typeof dadosFuncionario.ativo !== 'boolean'
   ) {
      const erroNegocio = new Error(
         'O campo "ativo" deve ser do tipo boolean.'
      );

      erroNegocio.statusCode = 400;
      throw erroNegocio;
   }

   // 4. Validar unidade_id, quando informado
   const unidadeId = dadosFuncionario.unidade_id;

   if (
      unidadeId !== undefined &&
      unidadeId !== null &&
      (!Number.isInteger(unidadeId) || unidadeId <= 0)
   ) {
      const erroNegocio = new Error(
         'O campo "unidade_id" deve ser um inteiro positivo ou null.'
      );

      erroNegocio.statusCode = 400;
      throw erroNegocio;
   }

   // 5. Executar o cadastro no Repository
   try {
      return await criarFuncionarioNoRepositorio(dadosFuncionario);

   } catch (error) {

      // 6. Tratar violações de unicidade do PostgreSQL
      if (error.code === '23505') {
         let mensagem;

         if (
            error.constraint ===
            'funcionarios_numero_matricula_key'
         ) {
            mensagem = 'Já existe um funcionário com essa matrícula.';

         } else if (
            error.constraint === 'uq_funcionarios_email'
         ) {
            mensagem = 'Já existe um funcionário com esse e-mail.';

         } else {
            mensagem =
               'Já existe um funcionário com um dado único informado.';
         }

         const erroNegocio = new Error(mensagem);
         erroNegocio.statusCode = 409;

         throw erroNegocio;
      }

      // 7. Tratar unidade organizacional inexistente
      if (
         error.code === '23503' &&
         error.constraint === 'fk_funcionarios_unidade'
      ) {
         const erroNegocio = new Error(
            'A unidade organizacional informada não existe.'
         );

         erroNegocio.statusCode = 400;

         throw erroNegocio;
      }

      // 8. Repassar erros não reconhecidos
      throw error;
   }
}

export async function atualizarFuncionario(id, dadosAtualizados) {

   const camposPermitidos = [
      'nome_completo',
      'numero_matricula',
      'filial',
      'setor',
      'email',
      'ativo',
      'unidade_id'
   ];

   const camposRecebidos = Object.keys(dadosAtualizados);

   // 1. Rejeitar campos desconhecidos
   const camposInvalidos = camposRecebidos.filter(
      campo => !camposPermitidos.includes(campo)
   );

   if (camposInvalidos.length > 0) {
      const erroNegocio = new Error(
         `Campos não permitidos para atualização: ${camposInvalidos.join(', ')}`
      );

      erroNegocio.statusCode = 400;
      throw erroNegocio;
   }

   // 2. Definir os tipos esperados
   const tiposEsperados = {
      nome_completo: 'string',
      numero_matricula: 'string',
      filial: 'string',
      setor: 'string',
      email: 'string',
      ativo: 'boolean',
      unidade_id: 'number'
   };

   // 3. Validar os tipos dos valores recebidos
   for (const campo of camposRecebidos) {
      const valor = dadosAtualizados[campo];

      // Permitir null para unidade_id
      if (campo === 'unidade_id' && valor === null) {
         continue;
      }

      // Validar o tipo
      if (typeof valor !== tiposEsperados[campo]) {
         const erroNegocio = new Error(
            `O campo "${campo}" deve ser do tipo ${tiposEsperados[campo]}.`
         );

         erroNegocio.statusCode = 400;
         throw erroNegocio;
      }

      // Validar unidade_id como inteiro positivo
      if (
         campo === 'unidade_id' &&
         (!Number.isInteger(valor) || valor <= 0)
      ) {
         const erroNegocio = new Error(
            'O campo "unidade_id" deve ser um inteiro positivo ou null.'
         );

         erroNegocio.statusCode = 400;
         throw erroNegocio;
      }

      // Validar strings vazias ou contendo apenas espaços
      if (typeof valor === 'string' && valor.trim().length === 0) {
         const erroNegocio = new Error(
            `O campo "${campo}" não pode ser vazio.`
         );

         erroNegocio.statusCode = 400;
         throw erroNegocio;
      }

      // Validar formato do e-mail
      if (campo === 'email') {
         const formatoEmailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

         if (!formatoEmailValido) {
            const erroNegocio = new Error(
               'O campo "email" deve conter um endereço de e-mail válido.'
            );

            erroNegocio.statusCode = 400;
            throw erroNegocio;
         }
      }
   }

   // 4. Executar a atualização somente após as validações
   try {
      return await atualizarFuncionarioNoRepositorio(
         id,
         dadosAtualizados
      );

   } catch (error) {

      // 5. Tratar violações de unicidade do PostgreSQL
      if (error.code === '23505') {
         let mensagem;

         if (
            error.constraint ===
            'funcionarios_numero_matricula_key'
         ) {
            mensagem = 'Já existe um funcionário com essa matrícula.';

         } else if (
            error.constraint === 'uq_funcionarios_email'
         ) {
            mensagem = 'Já existe um funcionário com esse e-mail.';

         } else {
            mensagem =
               'Já existe um funcionário com um dado único informado.';
         }

         const erroNegocio = new Error(mensagem);
         erroNegocio.statusCode = 409;

         throw erroNegocio;
      }

      // 6. Tratar unidade organizacional inexistente
      if (
         error.code === '23503' &&
         error.constraint === 'fk_funcionarios_unidade'
      ) {
         const erroNegocio = new Error(
            'A unidade organizacional informada não existe.'
         );

         erroNegocio.statusCode = 400;

         throw erroNegocio;
      }

      // 7. Repassar erros não reconhecidos
      throw error;
   }
}

export async function excluirFuncionario(id) {
   return removerFuncionarioNoRepositorio(id);
}
