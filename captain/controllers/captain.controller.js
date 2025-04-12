const captainModel = require('../models/captain.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklisttoken.model');
const { subscribeToQueue } = require('../service/rabbit');

module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if captain already exists 
        const existingcaptain = await captainModel.findOne({email});
        if (existingcaptain) {
            return res.status(400).json({ error: 'captain already exists' });
        } 

        const hashedPassword = await bcrypt.hash(password, 10);
        const captain = new captainModel({ name, email, password: hashedPassword });
        await captain.save();

        // Generate JWT token
        const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true, secure: true });
        delete captain._doc.password;  // Remove password from captain object
        res.status(201).json({ token, captain });
        res.status(201).json({ message: 'captain registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const captain = await captainModel.findOne({ email }).select('+password');
        if (!captain) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, captain.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        delete captain._doc.password; // Remove password from captain object
        // Set token in cookie
        res.cookie('token', token);
        res.status(200).json({ token, captain });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.getCaptainProfile = async (req, res) => {
    try {
        res.status(200).json(req.captain);
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
        res.status(200).json({ message: 'captain logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.toggleAvailability = async (req, res) => {
    try {
        const captain = await captainModel.findById(req.captain._id);
        if (!captain) {
            return res.status(404).json({ error: 'captain not found' });
        }
        // Toggle availability
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        res.status(200).json({captain});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

subscribeToQueue('new_ride', async (data) => {
    console.log(JSON.parse(data));    
});