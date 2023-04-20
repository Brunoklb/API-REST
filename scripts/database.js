const mysql = require('mysql');
require('dotenv').config();

// Função que faz a conexão com o banco de dados
async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  return connection;
}

// Função que consulta um registro por id
async function getOne(id) {
  const connection = await init();
  const [rows] = await connection.query('SELECT * FROM bankslips WHERE id = ?', [id]);
  connection.end();
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

// Função que lista todos os registros
async function getAll() {
  const connection = await init();
  const [rows] = await connection.query('SELECT * FROM bankslips');
  connection.end();
  return rows;
}

// Função que remove um registro por id
async function remove(id) {
  const connection = await init();
  const [result] = await connection.query('DELETE FROM bankslips WHERE id = ?', [id]);
  connection.end();
  return result.affectedRows > 0;
}

// Função que atualiza um registro
async function update(entidade) {
  const { id } = entidade;
  delete entidade.id;
  const connection = await init();
  const [result] = await connection.query('UPDATE bankslips SET ? WHERE id = ?', [entidade, id]);
  connection.end();
  return result.affectedRows > 0;
}

// Função que cria um novo registro
async function create(entidade) {
  const connection = await init();
  const [result] = await connection.query('INSERT INTO bankslips SET ?', [entidade]);
  connection.end();
  return result.insertId;
}

module.exports = { init, getOne, getAll, remove, update, create };
