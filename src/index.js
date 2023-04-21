const express = require('express');
const server = express();
require('dotenv').config();

const protocol = process.env.PROTOCOL || "http"
const ip = require('ip').address()
const port = process.env.PORT || 8080

const routes = require('./routes/routes')
server.use(routes)

const db = require('./db/bankSlipRepository');
const { json } = require('sequelize');
db.init()

server.get('/', (req, res)=>{
    res.send('Esta funcionando')
})

server.get('/rest/bankslips', (req, res) => {
    return res.status(200).send('Tudo certo por aqui');
});

server.listen(port, () => console.log(`
    Server started in ${protocol}://localhost:${port} or ${protocol}://${ip}:${port}
`))
