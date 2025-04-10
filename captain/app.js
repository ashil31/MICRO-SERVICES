const express = require('express');

const app = express();
const cookieParser = require('cookie-parser');

connectDB = require('./db/db');
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const captainRoutes = require('./routes/captain.routes');

app.use('/', captainRoutes);



module.exports = app;