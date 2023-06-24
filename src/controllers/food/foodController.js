const db = require('../../services/db');
require('dotenv/config')
const fs = require('fs');
const path = require('path');
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
            res.status(500).json({ error: "Erro ao obter pratos" });
        }
    }

    //! Lista um prato selecionado
    async getFoodSelect(req, res) {
        const id = req.params.id;
        try {

            let data = {};

            const sqlFood = `SELECT * FROM food WHERE foodID = ?`;
            const [resultFood] = await db.promise().query(sqlFood, id);

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
            res.status(500).json({ error: "Erro ao obter prato selecionado" });
        }
    }

    //! Cria um novo prato
    async createDish(req, res) {
        const dishImage = req.file.filename;
        const { name, description, category, price, tags } = req.body;

        //! Insere o prato no banco de dados na tabela food
        try {
            const sqlInsert = `INSERT INTO food(name, description, categoriesID, value, path) VALUES (?, ?, ?, ?, ?)`;
            const [resultInsert] = await db.promise().query(sqlInsert, [name, description, category, price, dishImage]);
            const foodID = resultInsert.insertId;

            const sqlGetTags = `SELECT name, ingredientsID FROM ingredients`;
            const [resultGetTags] = await db.promise().query(sqlGetTags);
            const existingTags = resultGetTags.map((tag) => tag.name);

            //! Verifica se a tag já existe no banco de dados e insere caso não exista e retorna todos os ids das tags
            const tagsIds = await Promise.all(
                tags?.map(async (currentTag) => {
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

            //! Insere as tags no banco de dados na tabela food_ingredients
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

    //! Atualiza um prato
    async updateDish(req, res) {
        const dishImage = req.file
        const { id } = req.params;
        const { name, description, category, price, tags } = req.body;

        const sqlSelectPreviousPhoto = `SELECT path FROM food WHERE foodID = ?`;
        const sqlUpdatePhotoProfile = `UPDATE food SET path = ? WHERE foodID = ?`;

        //! Atualiza a foto do prato se o usuário enviou uma nova foto
        if (dishImage) {
            //! Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.path;

            //! Atualizar a foto de perfil no banco de dados
            await db.promise().query(sqlUpdatePhotoProfile, [dishImage.filename, id]);

            //! Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve('uploads/', previousPhotoProfile);
                fs.unlink(previousPhotoPath, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }
        }

        //! Atualizar os dados do usuário no banco de dados
        const sqlUpdate = `UPDATE food SET name = ?, description = ?, categoriesID = ?, value = ? WHERE foodID = ?`;
        const [resultUpdate] = await db.promise().query(sqlUpdate, [name, description, category, price, id]);

        //! Atualizar as tags do prato no banco de dados
        const sqlDeleteTags = `DELETE FROM food_ingredients WHERE foodID = ?`;
        await db.promise().query(sqlDeleteTags, [id]);

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
        //! Insere as tags no banco de dados na tabela food_ingredients
        await Promise.all(
            tagsIds.map(async (tagId) => {
                const sqlInsertTag = `INSERT INTO food_ingredients(foodID, ingredientsID) VALUES (?, ?)`;
                await db.promise().query(sqlInsertTag, [id, tagId]);
            })
        );
        res.status(200).json({ message: "Prato atualizado com sucesso" });
    }

    //! Atualiza o status do prato (favorito ou não)
    async updateFavorite(req, res) {
        try {
            const { id } = req.params;
            const sqlSelectFavorite = `SELECT favorite FROM food WHERE foodID = ?`;
            const [rows] = await db.promise().query(sqlSelectFavorite, [id]);
            const favorite = rows[0]?.favorite;
            const sqlUpdateFavorite = `UPDATE food SET favorite = ? WHERE foodID = ?`;
            const [resultUpdate] = await db.promise().query(sqlUpdateFavorite, [!favorite, id]);
            res.status(200).json({ message: "Status do prato atualizado com sucesso" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao atualizar o status do prato" });
        }
    }

    //! Deleta um prato
    async deleteDish(req, res) {
        const { id } = req.params;
        // deletar prato da tabela food e food_ingredients e também deletar a foto do prato
        try {
            const sqlSelectPreviousPhoto = `SELECT path FROM food WHERE foodID = ?`;
            const sqlDeleteDish = `DELETE FROM food WHERE foodID = ?`;
            const sqlDeleteDishIngredients = `DELETE FROM food_ingredients WHERE foodID = ?`;

            //! Obter o nome da foto de perfil anterior
            const [rows] = await db.promise().query(sqlSelectPreviousPhoto, [id]);
            const previousPhotoProfile = rows[0]?.path;

            //! Excluir a foto de perfil anterior
            if (previousPhotoProfile) {
                const previousPhotoPath = path.resolve('uploads/', previousPhotoProfile);
                fs.unlink(previousPhotoPath, (error) => {
                    if (error) {
                        return console.error('Erro ao excluir a imagem anterior:', error);
                    } else {
                        return console.log('Imagem anterior excluída com sucesso!');
                    }
                });
            }

            //! Deletar o prato
            await db.promise().query(sqlDeleteDish, [id]);
            await db.promise().query(sqlDeleteDishIngredients, [id]);

            console.log("prato deletado com sucesso")

            res.status(200).json({ message: "Prato deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ error: "Erro ao deletar o prato" });
        }
    }
}

module.exports = FoodController;


