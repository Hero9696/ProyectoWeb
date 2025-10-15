// config/db.config.js

require('dotenv').config(); 
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true, 
  connectionLimit: 10,      
  queueLimit: 0             
});


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