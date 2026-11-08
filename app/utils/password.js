import argon2 from 'argon2'

export async function gerarHashSenha(senha) {
   return await argon2.hash(senha)
}

export async function verificarSenha(senha, senhahash) {
   return await argon2.verify(senhahash, senha)
}