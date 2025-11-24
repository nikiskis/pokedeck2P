import express from 'express';
import { register, login, updateUser, deleteUser, getOrderHistory, getSecurityQuestions, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.get('/history/:id', getOrderHistory);

router.post('/security-questions', getSecurityQuestions);
router.post('/reset-password', resetPassword);

export default router;