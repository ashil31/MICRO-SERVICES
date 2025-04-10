const http = require('http');
const dotenv = require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT_USER || 5001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});