const { query } = require('express');
const mysql = require('mysql');
require('dotenv').config();

async function init(){
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  return connection;
}

async function getOne(id){
  const connection = await init();
  const [rows] = await connection.query('SELECT * FROM bankslips WHERE id = ?', [id]);
  connection.end();
  if(rows.length === 0){
    return null;
  }
  else{
    return rows[0];
  }
}

async function getAll(){
  const connection = await init();
  const [rows] = await connection.query('SELECT * FROM bankslips');
  connection.end();
  return rows;
}

async function remove(id){
  const connection = await init();
  const [result] = await connection.query('DELETE FROM bankslips WHERE id = ?', [id]);
  connection.end();
  return result.affectedRows > 0;
}

async function update(entity){
  const { id } = entity;
  delete entity.id;
  const connection = await init();
  const [result] = await connection.query('UPDATE bankslips SET ? WHERE id = ?', [entity, id]);
  connection.end();
  return result.affectedRows > 0;
}

async function create(entity){
  const connection = await init();
  const [result] = await connection.query('INSERT INTO bankslips SET ?', [entity]);
  connection.end();
  return result.insertId;
}

module.exports = { init, getOne, getAll, remove, update, create };