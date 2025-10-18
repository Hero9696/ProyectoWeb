// config/db.config.js

require('dotenv').config(); 
// config/dbconfig.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  dateStrings: true,
  

  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,              // <- ¡imprescindible!
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0

  
});

module.exports = pool;



async function testConnection() {
  try {
 
    const connection = await pool.getConnection();
    
   
    console.log('✅ Conexión exitosa a la base de datos.');
    
   
    connection.release(); 

  } catch (error) {

    console.error('❌ Error al conectar a la base de datos:', error.message);

  }
}


testConnection();


module.exports = pool;