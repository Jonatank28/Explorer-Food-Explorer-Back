const db = require('../../services/db');

class FoodController {
    async getFood(req, res) {
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
    }

}

module.exports = FoodController;
