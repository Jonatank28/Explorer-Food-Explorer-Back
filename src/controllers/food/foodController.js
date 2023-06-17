const db = require('../../services/db');
const DiskStorage = require('../../providers/DiskStorage');
const multer = require('multer');
const uploadConfig = require('../../configs/upload');
const upload = multer(uploadConfig.MULTER);
class FoodController {
    // async getFood(req, res) {
    //     try {
    //         const sqlCategories = `SELECT * FROM categories`;
    //         const [resultCategories] = await db.promise().query(sqlCategories);

    //         const sqlFood = `SELECT * FROM food`;
    //         const [resultFood] = await db.promise().query(sqlFood);
    //         console.log("🚀 ~ resultFood:", resultFood)

    //         const categorizedFood = {};

    //         resultFood.forEach((food) => {
    //             const categoryId = food.categoriesID;
    //             const categoryName = resultCategories.find(
    //                 (category) => category.categoriesID === categoryId
    //             ).name;
    //             if (!categorizedFood[categoryName]) {
    //                 categorizedFood[categoryName] = [];
    //             }
    //             categorizedFood[categoryName].push(food);
    //         });

    //         const formattedResult = Object.keys(categorizedFood).map((categoryName) => ({
    //             category: categoryName,
    //             foods: categorizedFood[categoryName],
    //         }));

    //         const response = formattedResult.slice(0, 3);

    //         res.status(200).json(response);
    //     } catch (error) {
    //         res.status(500).json({ error: "Erro ao obter alimentos" });
    //     }
    // }
    async getFood(req, res) {
        try {
            const sqlCategories = `SELECT * FROM categories`;
            const [resultCategories] = await db.promise().query(sqlCategories);

            const sqlFood = `SELECT * FROM food`;
            const [resultFood] = await db.promise().query(sqlFood);
            console.log("🚀 ~ resultFood:", resultFood);

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
                foods: categorizedFood[categoryName].map((food) => {
                    const imagePath = `http://localhost:3333/images/${food.path}`;
                    return {
                        ...food,
                        imagePath,
                    };
                }),
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
        const { name, description, category, price, tags } = req.body;

        try {
            const sqlInsert = `INSERT INTO food(name, description, categoriesID, value, path) VALUES ( ?, ?, ?, ?, ?)`;
            const [resultInsert] = await db.promise().query(sqlInsert, [name, description, category, price, dishImage]);
            const foodID = resultInsert.insertId;

            // tags.forEach(async (tag) => {
            //     const sqlInsertTag = `INSERT INTO food_ingredients(foodID, tagsID) VALUES (?, ?)`;
            //     const [resultInsertTag] = await db.promise().query(sqlInsertTag, [resultInsert.insertId, tag]);
            // });

            res.status(200).json({ message: "Prato adicionado com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao adicionar um novo prato" });
        }
    }
}

module.exports = FoodController;


