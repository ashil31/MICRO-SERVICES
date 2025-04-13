const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklisttoken.model');
const { subscribeToQueue } = require('../service/rabbit');
const EventEmitter = require('events');
const rideEventEmitter = new EventEmitter();

// Global array to store waiting responses for long polling ride acceptance


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
        delete user._doc.password;  // Remove password from user object
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
        delete user._doc.password; // Remove password from user object
        // Set token in cookie
        res.cookie('token', token);
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.getUserProfile = async (req, res) => {
    try {
        res.send(req.user);
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

// New endpoint for long polling for ride acceptance
// This endpoint waits for a ride accepted event (from RabbitMQ) or a timeout after 30 seconds.
module.exports.acceptedRide = async (req, res) => {
    // Long polling: wait for 'ride-accepted' event
    rideEventEmitter.once('ride-accepted', (data) => {
        res.send(data);
    });

    // Set timeout for long polling (e.g., 30 seconds)
    setTimeout(() => {
        res.status(204).send();
    }, 30000);
}

subscribeToQueue('ride_accepted', async (msg) => {
    const data = JSON.parse(msg);
    rideEventEmitter.emit('ride-accepted', data);
});