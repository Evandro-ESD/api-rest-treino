
import { pool } from './app/config/database.js';

try {
   const resultado = await pool.query(
      'SELECT current_database() AS banco, current_user AS usuario'
   );

   console.log('Conexão estabelecida com sucesso!');
   console.log(resultado.rows[0]);
} catch (erro) {
   console.error('Erro ao conectar ao PostgreSQL:', erro.message);
} finally {
   await pool.end();
}
