const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklisttoken.model');

module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists 
        const existinguser = await userModel.findOne({email});
        if (existinguser) {
            return res.status(400).json({ error: 'User already exists' });
        } 

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(201).json({ token, user });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set token in cookie
        res.cookie('token', token);
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.getUserProfile = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ error: 'No token provided' });
        }

        // Add token to blacklist
        const blacklistedToken = new blacklistTokenModel({ token });
        await blacklistedToken.save();

        // Clear cookie
        res.clearCookie('token');
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}