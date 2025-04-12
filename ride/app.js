const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();


const connectDB = require('./db/db');
connectDB();

const rideRoutes = require('./routes/ride.routes');
app.use('/', rideRoutes);

const rabbitMq = require('./service/rabbit');
rabbitMq.connectRabbit();

const cookieParser = require('cookie-parser');
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;