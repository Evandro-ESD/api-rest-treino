import { Router } from 'express';
import { buscarFuncionarioPorIdController, listarTodosFuncionarios } from '../controllers/funcionarios.controller.js';

export const router = Router()

router.get('/funcionarios', listarTodosFuncionarios)
router.get('/funcionarios/:id', buscarFuncionarioPorIdController)


