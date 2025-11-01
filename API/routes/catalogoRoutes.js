import express from 'express';
import { obtenerProductos } from '../controllers/catalogoController.js';

const router = express.Router();

router.get('/producto', obtenerProductos); 

export default router;