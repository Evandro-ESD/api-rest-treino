import { Router } from 'express';
import {
   atualizarFuncionarioController,
   buscarFuncionarioPorIdController,
   criarFuncionarioController,
   excluirFuncionarioController,
   listarTodosFuncionarios
} from '../controllers/funcionarios.controller.js';

export const router = Router();

router.get('/funcionarios', listarTodosFuncionarios);
router.get('/funcionarios/:id', buscarFuncionarioPorIdController);
router.post('/funcionarios', criarFuncionarioController);
router.patch('/funcionarios/:id', atualizarFuncionarioController);
router.delete('/funcionarios/:id', excluirFuncionarioController);

