import { listarFuncionarios, obterFuncionarioPorId } from '../services/funcionarios.service.js'


export async function listarTodosFuncionarios(req, res) {
   try {
      const data = await listarFuncionarios()

      return res.status(200).json(data)

   }
   catch (error) {
      console.log("Erro interno!", error)

      return res.status(500).json({
         message: `Erro interno nonservidor.`
         // message: `Erro interno nonservidor: ${error.message || error}`
      })
   }
}

export async function buscarFuncionarioPorIdController(req, res) {
   try {
      const id = req.params.id

      const funcionario = await obterFuncionarioPorId(id)

      if (!funcionario) {
         return res.status(404).json({
            message: "Funcionário não encontrado!"
         })
      }

      return res.status(200).json(funcionario)
   }
   catch (error) {
      console.error('Erro ao buscar funcionário:', error)

      return res.status(500).json({
         message: `Erro interno nonservidor.`
      })
   }
}