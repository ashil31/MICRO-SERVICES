const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const blacklistTokenModel = require('../models/blacklisttoken.model');

module.exports.userAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1]; // Get token from cookie or authorization header
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Check if token is blacklisted
        const blacklistedToken = await blacklistTokenModel.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ error: 'Token is blacklisted' });
        }
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists in the database
        const user = await userModel.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user; // Attach user to request object

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}