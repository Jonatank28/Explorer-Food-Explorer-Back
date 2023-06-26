const { Router } = require('express');
const foodRoutes = Router();

//! Upload de imagem
const multer = require('multer');
const storage = require('../../services/multerConfig');
const upload = multer({ storage });

const FoodController = require('../../controllers/food/foodController');
const foodController = new FoodController();

// Full pratos
foodRoutes.get('/foods/:id', foodController.getFood);
// Cria um novo prato
foodRoutes.patch('/foods/create', upload.single('dishImage'), foodController.createDish);
// Busca um prato pelo id
foodRoutes.get('/foods-select/:id', foodController.getFoodSelect);
// Busca um prato pelo id para fazer update
foodRoutes.put('/foods/update/:id', upload.single('dishImage'), foodController.updateDish);
// Busca um prato pelo id para fazer update do favorite
foodRoutes.put('/foods/update/favorite/:id/:userID', foodController.updateFavorite);
// Busca um prato pelo id para fazer delete do prato
foodRoutes.delete('/foods/delete/:id', foodController.deleteDish);

module.exports = foodRoutes;