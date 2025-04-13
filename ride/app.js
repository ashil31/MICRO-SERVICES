const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();


const connectDB = require('./db/db');
connectDB();


const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const rideRoutes = require('./routes/ride.routes');
app.use('/', rideRoutes);

const rabbitMq = require('./service/rabbit');
rabbitMq.connectRabbit();

module.exports = app;