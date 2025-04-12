const http = require('http');
const dotenv = require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT_RIDE || 5003;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Ride Service is running on port ${PORT}`);
});