import { Router } from 'express';
import { DespesaController } from '../controllers/DespesaController';

const router = Router();
const despesaController = new DespesaController();

router.post('/', (req, res) => despesaController.create(req, res));
router.get('/', (req, res) => despesaController.list(req, res));
router.get('/opcoes-filtros', (req, res) => despesaController.getOpcoesFiltros(req, res));
router.get('/relatorio-mensal', (req, res) => despesaController.relatorioMensal(req, res));
router.get('/:id', (req, res) => despesaController.getById(req, res));
router.put('/:id', (req, res) => despesaController.update(req, res));
router.delete('/:id', (req, res) => despesaController.delete(req, res));

export default router;



