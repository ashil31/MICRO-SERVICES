const express = require('express');

const expressProxy = require('express-http-proxy');

const app = express();


app.use('/user', expressProxy('http://localhost:6061'));
app.use('/captain', expressProxy('http://localhost:6062'));
app.use('/ride', expressProxy('http://localhost:6063'));

app.listen(6060, () => {
  console.log('Gateway is running on port 6060');
});