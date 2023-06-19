const { Router } = require('express');
const authRoutes = Router();

const AuthController = require('../../controllers/auth/authController');
const authController = new AuthController();

//! Login
authRoutes.post('/login', authController.login);


//! Valida token
authRoutes.get('/login-verify-token', authController.loginVerifyToken);

//! Register
authRoutes.post('/register', authController.register);

module.exports = authRoutes;