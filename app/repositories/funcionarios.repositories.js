import funcionarios from '../../data/funcionarios.json' with { type: 'json' }


export async function todosFuncionarios() {
   return funcionarios
}

export async function buscarFuncionarioPorId(id) {
   const funcionarios = await todosFuncionarios()
   // console.log(typeof funcionarios)

   return funcionarios.find(
      funcionario => funcionario.id === id
   )
}
const r = await buscarFuncionarioPorId('1')
// console.log(typeof r)


// const d = todosFuncionarios()

// d.then((r) => (r))

