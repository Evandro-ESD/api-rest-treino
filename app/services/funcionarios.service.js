import { buscarFuncionarioPorId, todosFuncionarios } from '../repositories/funcionarios.repositories.js'

export async function listarFuncionarios() {
   return todosFuncionarios()
}

export async function obterFuncionarioPorId(id) {
   return buscarFuncionarioPorId(id)
}

