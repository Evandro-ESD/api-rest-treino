
import assert from 'node:assert/strict';
import test from 'node:test';

import {
   gerarHashSenha,
   verificarSenha
} from './app/utils/password.js';

test('deve gerar um hash válido para a senha', async () => {
   const senha = 'SenhaForte@123';

   const hash = await gerarHashSenha(senha);

   assert.equal(typeof hash, 'string');
   assert.ok(hash.length > 0);
});

test('deve reconhecer uma senha correta', async () => {
   const senha = 'SenhaForte@123';

   const hash = await gerarHashSenha(senha);

   const resultado = await verificarSenha(senha, hash);

   assert.equal(resultado, true);
});

test('deve rejeitar uma senha incorreta', async () => {
   const senha = 'SenhaForte@123';

   const hash = await gerarHashSenha(senha);

   const resultado = await verificarSenha('SenhaErrada@123', hash);

   assert.equal(resultado, false);
});
