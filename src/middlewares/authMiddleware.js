const db = require('../services/db');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ message: "Não autorizado" })
    }

    const token = authorization.split(" ")[1]

    const { id } = jwt.verify(token, process.env.JWT_PASS ?? '')

    const sqlVerifyUser = `SELECT * FROM user WHERE userID = ?`;
    const [user] = await db.promise().query(sqlVerifyUser, id);

    if (user.length === 0) {
        return res.status(400).json({ message: "Não autorizado" });
    }

    const { password: _, ...loggedUuser } = user[0]

    req.user = loggedUuser

    next()
}

module.exports = authMiddleware