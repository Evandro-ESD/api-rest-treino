import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', '..', 'data', 'funcionarios.json');

export async function todosFuncionarios() {
   const data = await fs.readFile(filePath, 'utf-8');
   return JSON.parse(data);
}

export async function buscarFuncionarioPorId(id) {
   const funcionarios = await todosFuncionarios();
   return funcionarios.find(funcionario => funcionario.id === id);
}

export async function criarFuncionario(novoFuncionario) {
   const funcionarios = await todosFuncionarios();
   const maiorId = funcionarios.reduce((maior, funcionario) => {
      const id = Number(funcionario.id);
      return Number.isSafeInteger(id) && id > maior ? id : maior;
   }, 0);
   const funcionario = { ...novoFuncionario, id: String(maiorId + 1) };

   funcionarios.push(funcionario);
   await salvarFuncionarios(funcionarios);

   return funcionario;
}

export async function atualizarFuncionario(id, dadosAtualizados) {
   const funcionarios = await todosFuncionarios();
   const indice = funcionarios.findIndex(funcionario => funcionario.id === id);

   if (indice === -1) {
      return undefined;
   }

   funcionarios[indice] = {
      ...funcionarios[indice],
      ...dadosAtualizados,
      id: funcionarios[indice].id
   };
   await salvarFuncionarios(funcionarios);

   return funcionarios[indice];
}

export async function removerFuncionario(id) {
   const funcionarios = await todosFuncionarios();
   const funcionariosRestantes = funcionarios.filter(funcionario => funcionario.id !== id);

   if (funcionariosRestantes.length === funcionarios.length) {
      return false;
   }

   await salvarFuncionarios(funcionariosRestantes);
   return true;
}

async function salvarFuncionarios(funcionarios) {
   await fs.writeFile(filePath, `${JSON.stringify(funcionarios, null, 2)}\n`, 'utf-8');
}