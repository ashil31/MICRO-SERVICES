const jwt = require('jsonwebtoken');
const captainModel = require('../models/captain.model');
const blacklistTokenModel = require('../models/blacklisttoken.model');

module.exports.captainAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Get token from cookie or authorization header
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

        // Check if captain exists in the database
        const captain = await captainModel.findById(decoded.id);
        if (!captain) {
            return res.status(404).json({ error: 'captain not found' });
        }

        req.captain = captain; // Attach captain to request object

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}