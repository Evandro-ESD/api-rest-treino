import {
   atualizarFuncionario,
   cadastrarFuncionario,
   excluirFuncionario,
   listarFuncionarios,
   obterFuncionarioPorId
} from '../services/funcionarios.service.js';

export async function listarTodosFuncionarios(req, res) {
   try {
      const data = await listarFuncionarios();
      return res.status(200).json(data);
   }
   catch (error) {
      console.error('Erro ao listar funcionários:', error);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
   }
}

export async function buscarFuncionarioPorIdController(req, res) {
   try {
      const funcionario = await obterFuncionarioPorId(req.params.id);

      if (!funcionario) {
         return res.status(404).json({ message: 'Funcionário não encontrado!' });
      }

      return res.status(200).json(funcionario);
   }
   catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
   }
}

export async function criarFuncionarioController(req, res) {
   if (!corpoValido(req.body) || !Object.keys(req.body).some(chave => chave !== 'id')) {
      return res.status(400).json({ message: 'Informe os dados do funcionário.' });
   }

   try {
      const funcionario = await cadastrarFuncionario(req.body);
      return res.status(201).json(funcionario);
   }

   catch (error) {
      // Erros de negócio esperados: 400, 404, 409 etc.
      if (error.statusCode) {
         console.warn(
            `Requisição rejeitada (${error.statusCode}): ${error.message}`
         );

         return res.status(error.statusCode).json({
            message: error.message
         });
      }

      // Erros inesperados: falhas técnicas ou bugs
      console.error('Erro inesperado ao criar funcionário:', error);

      return res.status(500).json({
         message: 'Erro interno no servidor.'
      });
   }

}

export async function atualizarFuncionarioController(req, res) {
   if (!corpoValido(req.body)) {
      return res.status(400).json({ message: 'Informe os dados do funcionário.' });
   }

   const dadosAtualizados = Object.fromEntries(
      Object.entries(req.body).filter(([chave]) => chave !== 'id')
   );

   if (Object.keys(dadosAtualizados).length === 0) {
      return res.status(400).json({ message: 'Informe os dados do funcionário.' });
   }

   try {
      const funcionario = await atualizarFuncionario(req.params.id, dadosAtualizados);

      if (!funcionario) {
         return res.status(404).json({ message: 'Funcionário não encontrado!' });
      }

      return res.status(200).json(funcionario);
   }
   catch (error) {
      console.error('Erro ao atualizar funcionário:', error);

      if (error.statusCode) {
         return res.status(error.statusCode).json({
            message: error.message
         });
      }

      return res.status(500).json({
         message: 'Erro interno no servidor.'
      });
   }
}

export async function excluirFuncionarioController(req, res) {
   try {
      const removido = await excluirFuncionario(req.params.id);

      if (!removido) {
         return res.status(404).json({ message: 'Funcionário não encontrado!' });
      }

      return res.status(200).json({ message: 'Funcionário removido com sucesso.' });
   }
   catch (error) {
      console.error('Erro ao remover funcionário:', error);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
   }
}

function corpoValido(body) {
   return body !== null && typeof body === 'object' && !Array.isArray(body);
}