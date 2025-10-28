const mysql = require("mysql2/promise");
require("dotenv").config();
const fs = require("fs");

const MYSQL_DB = process.env.MYSQL_DB;
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PWD = process.env.MYSQL_PWD;
const MYSQL_PORT = process.env.MYSQL_PORT || 19041;

let db;
async function initDB() {
  if (db) return db;

  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PWD,
    port: MYSQL_PORT,
    ssl: { ca: fs.readFileSync("./ca/ca.pem") },
  });

  console.log(`Connected to database: ${MYSQL_DB}`);

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DB}\``);
  console.log(`Database '${MYSQL_DB}' ensured`);

  await connection.query(`USE \`${MYSQL_DB}\``);

  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS country (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capital VARCHAR(100),
    region VARCHAR(100),
    population BIGINT,
    currency_code VARCHAR(3),
    exchange_rate DECIMAL(20,4),
    estimated_gdp DECIMAL(20,2),
    flag_url VARCHAR(255),
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.query(createTableSQL);
  console.log("Table 'country' ensured");
// system status
  const createSystemStatusSQL = `
  CREATE TABLE IF NOT EXISTS system_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
  )
`;
  await connection.query(createSystemStatusSQL);

  await connection.query(`INSERT IGNORE INTO system_status (id) VALUES (1)`);

  db = connection;
  return db;
}

module.exports = { initDB };
