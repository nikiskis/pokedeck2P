import express from 'express';
import { 
    obtenerProductos, 
    actualizarStock, 
    editarProductoCompleto, 
    crearProducto, 
    eliminarProducto,
    activarProducto   
} from '../controllers/catalogoController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/images';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/producto', obtenerProductos); 
router.put('/producto/:id/stock', actualizarStock); 
router.put('/producto/:id', upload.single('imagen'), editarProductoCompleto);
router.post('/producto', upload.single('imagen'), crearProducto); 
router.delete('/producto/:id', eliminarProducto); 
router.put('/producto/:id/activate', activarProducto);

export default router;