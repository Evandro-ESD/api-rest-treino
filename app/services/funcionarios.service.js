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
   try {
      return await criarFuncionarioNoRepositorio(dadosFuncionario);
   } catch (error) {
      if (error.code === '23505') {
         const erroNegocio = new Error(
            'Já existe um funcionário com essa matrícula ou e-mail de login.'
         );

         erroNegocio.statusCode = 409;
         throw erroNegocio;
      }

      throw error;
   }
}

export async function atualizarFuncionario(id, dadosAtualizados) {
   return atualizarFuncionarioNoRepositorio(id, dadosAtualizados);
}

export async function excluirFuncionario(id) {
   return removerFuncionarioNoRepositorio(id);
}
