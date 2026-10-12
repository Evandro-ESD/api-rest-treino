import express from 'express'
import { router } from './app/routes/funcionarios.routes.js'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
   res.send(`
      <pre style="font-family: sans-serif; font-size: 16px; line-height: 1.6; padding: 20px;">
📌 <b>Mini Documentação da API</b>

• Método HTTP: GET
• URL Base: http://localhost:3001
• Endpoint: /funcionarios
• Autenticação: Nenhuma (Pública)

👉 Acesse a rota clicando aqui: <a href="/funcionarios" target="_blank">/funcionarios</a>

• Método HTTP: GET
• URL Base: http://localhost:3001
• Endpoint: /funcionarios/:id
• Autenticação: Nenhuma (Pública)

👉 Consulta por ID: <a href="/funcionarios/1" target="_blank">/funcionarios/1</a>

👉 Exemplo de requisição:
curl http://localhost:3001/funcionarios/1
      </pre>
   `)
})

app.use(router)

export default app;