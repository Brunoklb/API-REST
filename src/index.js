/* eslint-disable no-undef */
const express = require('express');
const server = express();
require('dotenv').config();

const protocol = process.env.PROTOCOL || 'http';
const ip = require('ip').address();
const port = process.env.PORT || 8080;

const routes = require('./routes/BankSlipRoutes');
server.use(express.json());
server.use(routes);

server.listen(port, () => console.log(`
    Server started in ${protocol}://localhost:${port} or ${protocol}://${ip}:${port}
`));
