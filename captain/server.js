const http = require('http');
const dotenv = require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT_CAPTAIN || 5002;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Captain Service is running on port ${PORT}`);
});