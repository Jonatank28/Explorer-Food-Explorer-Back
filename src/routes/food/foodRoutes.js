const { Router } = require('express');
const foodRoutes = Router();

const FoodController = require('../../controllers/food/foodController');
const foodController = new FoodController();

//! Traz todas as comidas do banco de dados
foodRoutes.get('/foods', foodController.getFood);


module.exports = foodRoutes;