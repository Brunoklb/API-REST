/* eslint-disable no-undef */
const express = require('express');
const server = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../documentation/swagger.json');

const protocol = process.env.PROTOCOL || 'http';
const ip = require('ip').address();
const port = process.env.PORT || 8080;

const routes = require('./routes/BankSlipRoutes');
server.use(express.json());
server.use(routes);

// Rota para servir a documentação da API com SwaggerUI
server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

server.listen(port, () => console.log(`
    Server started in ${protocol}://localhost:${port} or ${protocol}://${ip}:${port}
`));
