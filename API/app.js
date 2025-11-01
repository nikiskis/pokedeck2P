import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRoutes.js';
import authRoutes from './routes/authRoutes.js'; 
import paymentRoutes from './routes/paymentRoutes.js'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));