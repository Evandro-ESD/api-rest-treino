import { pool } from '../config/database.js';

export async function todosFuncionarios() {
   const resultado = await pool.query(`
SELECT *
   FROM funcionarios
        ORDER BY id
    `);

   return resultado.rows;
}

export async function buscarFuncionarioPorId(id) {
   const resultado = await pool.query(
      'SELECT * FROM funcionarios WHERE id = $1',
      [id]
   );

   return resultado.rows[0];
}

export async function criarFuncionario(novoFuncionario) {
   const {
      nome_completo,
      numero_matricula,
      filial,
      setor,
      email,
      ativo = true,
      unidade_id = null
   } = novoFuncionario;

   const resultado = await pool.query(
      `INSERT INTO funcionarios(
      nome_completo,
      numero_matricula,
      filial,
      setor,
      email,
      ativo,
      unidade_id
   )
VALUES($1, $2, $3, $4, $5, $6, $7)
RETURNING * `,
      [
         nome_completo,
         numero_matricula,
         filial,
         setor,
         email,
         ativo,
         unidade_id
      ]
   );

   return resultado.rows[0];
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

   const campos = Object.keys(dadosAtualizados)
      .filter(campo => camposPermitidos.includes(campo));

   if (campos.length === 0) {
      return buscarFuncionarioPorId(id);
   }

   const valores = campos.map(
      campo => dadosAtualizados[campo]
   );

   const atribuicoes = campos.map(
      (campo, indice) => `${campo} = $${indice + 1} `
   );

   valores.push(id);

   const resultado = await pool.query(
      `UPDATE funcionarios
         SET ${atribuicoes.join(', ')}
         WHERE id = $${valores.length}
RETURNING * `,
      valores
   );

   return resultado.rows[0];
}

export async function removerFuncionario(id) {
   const resultado = await pool.query(
      'DELETE FROM funcionarios WHERE id = $1 RETURNING id',
      [id]
   );

   return resultado.rowCount > 0;
}
