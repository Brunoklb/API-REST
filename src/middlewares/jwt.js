/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function protectRoute(req, res, next) {
	const token = req.headers.authorization;

	if (!token) {
		return res.status(401).json({ message: 'Token not provided.' });
	}

	try {
		const decodedToken = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
		req.userId = decodedToken.userId;
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token.' });
	}
}

module.exports = protectRoute;
