import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
   host: 'localhost',
   port: 5432,
   database: 'api_rest_treino',
   user: 'postgres',
   password: '86206'

})