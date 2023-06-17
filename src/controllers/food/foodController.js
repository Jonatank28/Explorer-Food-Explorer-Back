const db = require('../../services/db');
const DiskStorage = require('../../providers/DiskStorage');
const multer = require('multer');
const uploadConfig = require('../../configs/upload');
const upload = multer(uploadConfig.MULTER);
class FoodController {
    async getFood(req, res) {
        try {
            const sqlCategories = `SELECT * FROM categories`;
            const [resultCategories] = await db.promise().query(sqlCategories);

            const sqlFood = `SELECT * FROM food`;
            const [resultFood] = await db.promise().query(sqlFood);

            const categorizedFood = {};

            resultFood.forEach((food) => {
                const categoryId = food.categoriesID;
                const categoryName = resultCategories.find(
                    (category) => category.categoriesID === categoryId
                ).name;
                if (!categorizedFood[categoryName]) {
                    categorizedFood[categoryName] = [];
                }
                categorizedFood[categoryName].push(food);
            });

            const formattedResult = Object.keys(categorizedFood).map((categoryName) => ({
                category: categoryName,
                foods: categorizedFood[categoryName],
            }));

            const response = formattedResult.slice(0, 3);

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: "Erro ao obter alimentos" });
        }
    }

    async getFoodSelect(req, res) {
        const id = req.params.id;
        try {

            let data = {};

            const sqlFood = `SELECT * FROM food WHERE foodID = ?`;
            const [resultFood] = await db.promise().query(sqlFood, id);

            const sqlIngredients = `SELECT a.*, b.name as ingrediente FROM food_ingredients AS a LEFT JOIN ingredients b on (a.ingredientsID = b.ingredientsID) WHERE foodID = ?`;
            const [resultIngredients] = await db.promise().query(sqlIngredients, id);

            data = {
                food: resultFood,
                ingredients: resultIngredients,
            };

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: "Erro ao obter alimento selecionado" });
        }
    }

    async createDish(req, res) {
        const dishImage = req.file.filename;

        // res.status(200).json({ dishImage, name });


        // const testeID = 12;

        // // //! Verificar se o id ja tem foto
        // const sqlSelect = `SELECT * FROM teste WHERE testeID = ?`;
        // const [resultSelect] = await db.promise().query(sqlSelect, testeID);

        // //! Se existir foto, deletar a foto antiga
        // const oldDishImage = resultSelect[0].dishImage;

        // const diskStorage = new DiskStorage();

        // // //! Deletar foto antiga
        // if (oldDishImage) {
        //     await diskStorage.deleteFile(oldDishImage);
        //     const sqlInsert = `INSERT INTO teste(dishImage) VALUES (?)`;
        //     const [resultInsert] = await db.promise().query(sqlInsert, dishImage);
        //     res.status(200).json({ resultInsert });
        //     return
        // }

        const sqlInsert = `INSERT INTO teste(dishImage) VALUES (?)`;
        const [resultInsert] = await db.promise().query(sqlInsert, dishImage);
        res.status(200).json({ resultInsert });

    }
}

module.exports = FoodController;










// const sqlInsertFoot = `INSERT INTO food (name, description, value, path, categoriesID) VALUES (?, ?, ?, ?, ?)`;
            // const [resultInsertFoot] = await db.promise().query(sqlInsertFoot, [
            //     data.name,
            //     data.description,
            //     data.price,
            //     imagePath, // Usando o caminho da imagem salva
            //     data.category
            // ]);