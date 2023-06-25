const db = require('../../services/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
class AuthController {

    //! Login do usuário
    async login(req, res) {
        const { email, password } = req.body;

        try {
            const sqlVerifyUser = `SELECT * FROM user WHERE email = ?`;
            const [user] = await db.promise().query(sqlVerifyUser, email);

            if (user.length === 0) {
                return res.status(400).json({ message: 'Senha e/ou email inválidos' });
            }

            const verifyPassword = await bcrypt.compare(password, user[0].password);

            if (!verifyPassword) {
                return res.status(400).json({ message: 'Senha e/ou email inválidos' });
            }

            const token = jwt.sign({ id: user[0].userID }, process.env.JWT_PASS ?? '', { expiresIn: '8h' });

            const { password: _, ...userLogin } = user[0];

            return res.status(200).json({
                user: userLogin,
                token: token
            });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao realizar login' });
        }
    }


    //! Verifica se o token do usuário é válido
    async loginVerifyToken(req, res) {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ message: "Não autorizado" });
        }

        const token = authorization.split(" ")[1];

        try {
            const { id } = jwt.verify(token, process.env.JWT_PASS);
            const sqlVerifyUser = `SELECT * FROM user WHERE userID = ?`;
            const [user] = await db.promise().query(sqlVerifyUser, id);

            if (user.length === 0) {
                return res.status(401).json({ message: "Não autorizado" });
            }

            const { password: _, ...loggedUser } = user[0];

            return res.status(200).json(loggedUser);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(419).json({ message: 'Token expirado' });
            } else {
                return res.status(403).json({ message: 'Não autorizado' });
            }
        }
    }

    //! Faz registro de um novo usuário
    async register(req, res) {
        const { name, email, password } = req.body;

        try {
            const sqlVerifyEmail = `SELECT * FROM user WHERE email = ?`;
            const [user] = await db.promise().query(sqlVerifyEmail, email);

            if (user.length > 0) {
                return res.status(400).json({ message: 'Email já cadastrado' });
            }

            const hashPassword = await bcrypt.hash(password, 10);

            const newUser = `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`;
            const [result] = await db.promise().query(newUser, [name, email, hashPassword]);

            return res.status(201).json({ message: 'Usuário criado com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao criar usuário' });
        }
    }
}

module.exports = AuthController;