const { Router } = require('express');
const foodRoutes = Router();

const FoodController = require('../../controllers/food/foodController');
const foodController = new FoodController();

//! Traz todas as comidas do banco de dados
foodRoutes.get('/foods', foodController.getFood);
// foodRoutes.post('/foods', foodController.getFoodSelect);
foodRoutes.get('/foods-select/:id', foodController.getFoodSelect);


module.exports = foodRoutes;