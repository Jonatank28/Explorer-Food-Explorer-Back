const db = require('../../services/db');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pasta onde a imagem será salva
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + '-' + file.originalname;
        cb(null, fileName); // Nome do arquivo no destino
    }
});

const upload = multer({ storage: storage });

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

        const { data, formData } = req.body;
        console.log("🚀 ~ formData:", formData)
        console.log("🚀 ~ data:", data)

        res.status(200).json({ message: "Prato adicionado com sucesso" });

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