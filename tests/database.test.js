
import assert from 'node:assert/strict';
import test from 'node:test';

import { pool } from './app/config/database.js';

test('deve conectar ao banco de dados api_rest_treino', async () => {
   try {
      const resultado = await pool.query(
         `SELECT
            current_database() AS banco,
            current_user AS usuario`
      );

      assert.equal(resultado.rows[0].banco, 'api_rest_treino');
      assert.equal(resultado.rows[0].usuario, 'postgres');

   } finally {
      await pool.end();
   }
});
