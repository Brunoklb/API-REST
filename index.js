const express = require('express');
const server = express();

server.get('/', (req, res) => {
    return res.json({mensage: 'Teste'})
});

server.listen(8080, ()=>{
    console.log('Servidor está funcionando')
});
