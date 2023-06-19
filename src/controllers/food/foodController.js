const db = require('../../services/db');
require('dotenv/config')
class FoodController {

    //! Lista todos os pratos
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
                foods: categorizedFood[categoryName].map((food) => {
                    const imagePath = `${process.env.BASE_URL + food.path}`;
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

    //! Lista um prato selecionado
    async getFoodSelect(req, res) {
        const id = req.params.id;
        try {

            let data = {};

            const sqlFood = `SELECT * FROM food WHERE foodID = ?`;
            const [resultFood] = await db.promise().query(sqlFood, id);
            console.log("🚀 ~ resultFood:", resultFood)

            const sqlIngredients = `SELECT a.*, b.name as ingrediente FROM food_ingredients AS a LEFT JOIN ingredients b on (a.ingredientsID = b.ingredientsID) WHERE foodID = ?`;
            const [resultIngredients] = await db.promise().query(sqlIngredients, id);

            const formatResult = resultFood.map((food) => {
                const imagePath = `${process.env.BASE_URL + food.path}`;
                return {
                    ...food,
                    imagePath,
                };
            })

            data = {
                food: formatResult,
                ingredients: resultIngredients,
            };

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: "Erro ao obter alimento selecionado" });
        }
    }

    //! Cria um novo prato
    async createDish(req, res) {
        const dishImage = req.file.filename;
        const { name, description, category, price, tags } = req.body;

        //! Insere o prato no banco de dados
        try {
            const sqlInsert = `INSERT INTO food(name, description, categoriesID, value, path) VALUES (?, ?, ?, ?, ?)`;
            const [resultInsert] = await db.promise().query(sqlInsert, [name, description, category, price, dishImage]);
            const foodID = resultInsert.insertId;

            const sqlGetTags = `SELECT name, ingredientsID FROM ingredients`;
            const [resultGetTags] = await db.promise().query(sqlGetTags);
            const existingTags = resultGetTags.map((tag) => tag.name);

            //! Verifica se a tag já existe no banco de dados e insere caso não exista e retorna todos os ids das tags
            const tagsIds = await Promise.all(
                tags.map(async (currentTag) => {
                    const existingTag = existingTags.find((tag) => tag === currentTag);

                    if (!existingTag) {
                        const sqlInsertTag = `INSERT INTO ingredients (name) VALUES (?)`;
                        const [insertResult] = await db.promise().query(sqlInsertTag, [currentTag]);

                        const insertedTagId = insertResult.insertId;
                        return insertedTagId;
                    } else {
                        const existingTagId = resultGetTags.find((tag) => tag.name === currentTag).ingredientsID;
                        return existingTagId;
                    }
                })
            );

            await Promise.all(
                tagsIds.map(async (tagId) => {
                    const sqlInsertTag = `INSERT INTO food_ingredients(foodID, ingredientsID) VALUES (?, ?)`;
                    await db.promise().query(sqlInsertTag, [foodID, tagId]);
                })
            );

            res.status(200).json({ message: "Prato adicionado com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao adicionar um novo prato" });
        }
    }

}

module.exports = FoodController;


