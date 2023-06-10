const { Router } = require('express');
const routes = Router();
const urlBase = '/api'

// Autenticação
const auth = require("./auth/authRoutes");
routes.use(urlBase + '/', auth);


module.exports = routes;