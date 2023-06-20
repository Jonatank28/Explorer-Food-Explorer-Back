const { Router } = require('express');
const foodRoutes = Router();

//! Upload de imagem
const multer = require('multer');
const storage = require('../../services/multerConfig');
const upload = multer({ storage });


const FoodController = require('../../controllers/food/foodController');
const foodController = new FoodController();

//! Traz todas as comidas do banco de dados
foodRoutes.get('/foods', foodController.getFood);
foodRoutes.patch('/foods/create', upload.single('dishImage'), foodController.createDish);
foodRoutes.put('/foods/update/:id', upload.single('dishImage'), foodController.updateDish);
foodRoutes.delete('/foods/delete/:id', foodController.deleteDish);

foodRoutes.get('/foods-select/:id', foodController.getFoodSelect);


module.exports = foodRoutes;