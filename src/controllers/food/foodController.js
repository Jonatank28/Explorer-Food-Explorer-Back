const db = require('../../services/db');

class FoodController {
    //! Traz todas as comidas do banco de dados
    async getFood(req, res) {
        const sqlCategories = `SELECT * FROM categories`;
        const [resultCategories] = await db.promise().query(sqlCategories);

        const sqlFood = `SELECT * FROM food`;
        const [resultFood] = await db.promise().query(sqlFood);

        const categorizedFood = {
            "Refeições": [],
            "Sobremesas": [],
            "Bebidas": []
        };

        resultFood.forEach(food => {
            const categoryId = food.categoriesID;
            const categoryName = resultCategories.find(category => category.categoriesID === categoryId).name;
            categorizedFood[categoryName].push(food);
        });


        res.status(200).json(categorizedFood);
    }
}

module.exports = FoodController;