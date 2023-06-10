const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

authRoutes.post('/login', authController.login);
authRoutes.post('/register', authController.register);

module.exports = authRoutes;