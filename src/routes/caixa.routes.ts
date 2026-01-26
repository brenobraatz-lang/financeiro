import { Router } from 'express';
import { CaixaController } from '../controllers/CaixaController';

const router = Router();
const caixaController = new CaixaController();

router.post('/entradas', (req, res) => caixaController.createEntrada(req, res));
router.get('/entradas', (req, res) => caixaController.listEntradas(req, res));
router.get('/mensal', (req, res) => caixaController.getCaixaMensal(req, res));
router.put('/entradas/:id', (req, res) => caixaController.updateEntrada(req, res));
router.delete('/entradas/:id', (req, res) => caixaController.deleteEntrada(req, res));

export default router;

