const db = require('../../services/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {

    async login(req, res) {
        const { email, password } = req.body;

        const sqlVerifyUser = `SELECT * FROM user WHERE email = ?`;
        const [user] = await db.promise().query(sqlVerifyUser, email);

        if (user.length === 0) {
            return res.status(400).json({ message: 'Senha e/ou email inválidos' });
        }

        const verifyPassword = await bcrypt.compare(password, user[0].password);

        if (!verifyPassword) {
            return res.status(400).json({ message: 'Senha e/ou email inválidos' });
        }

        const token = jwt.sign({ id: user[0].userID }, process.env.JWT_PASS, { expiresIn: '8h' });

        const { password: _, ...userLogin } = user[0]

        res.status(200).json({
            user: userLogin,
            token: token
        })
    }

    async register(req, res) {
        const { name, email, password } = req.body;

        const sqlVerifyEmail = `SELECT * FROM user WHERE email = ?`;
        const [user] = await db.promise().query(sqlVerifyEmail, email);

        if (user.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUSer = `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`
        const [result] = await db.promise().query(newUSer, [name, email, hashPassword]);

        res.status(201).json({ message: 'Usuário criado com sucesso' });
    }
}

module.exports = AuthController;