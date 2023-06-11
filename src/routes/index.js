const { Router } = require('express');
const routes = Router();
const urlBase = '/api'

//! Autenticação
const auth = require("./auth/authRoutes");
routes.use(urlBase + '/', auth);

//! Food
const food = require("./food/foodRoutes");
routes.use(urlBase + '/', food);


module.exports = routes;