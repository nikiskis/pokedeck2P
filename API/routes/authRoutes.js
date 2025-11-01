import express from 'express';
import { register, login, updateUser, deleteUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/user/:id', updateUser);   
router.delete('/user/:id', deleteUser); 
export default router;