const express = require('express');
const cors = require('cors');
const app = express();
const routes = require("./src/routes");
const db = require('./src/services/db');
const DiskStorage = require('./src/providers/DiskStorage');

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(routes);

const multer = require('multer');
const uploadConfig = require('./src/configs/upload');
const upload = multer(uploadConfig.MULTER);

app.post('/api/teste', upload.single('dishImage'), async (req, res) => {
    const dishImage = req.file.filename;

    res.status(200).json({ dishImage, name });


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

    // const sqlInsert = `INSERT INTO teste(dishImage) VALUES (?)`;
    // const [resultInsert] = await db.promise().query(sqlInsert, dishImage);
    // res.status(200).json({ resultInsert });


});


app.listen(3333, () => {
    console.log('Server is running on port 3333');
});
