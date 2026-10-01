const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stories_loft',
  port: process.env.DB_PORT || 3306
};

let pool;

async function initDB(){
  // Step 1: Connect WITHOUT database to create it
  const tempPool = await mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port
  });
  await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await tempPool.end();

  // Step 2: Now connect WITH database
  pool = mysql.createPool(dbConfig);
  await pool.query(`CREATE TABLE IF NOT EXISTS stories (id VARCHAR(100) PRIMARY KEY, views INT DEFAULT 0, hearts INT DEFAULT 0)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS views_log (id INT AUTO_INCREMENT PRIMARY KEY, story_id VARCHAR(100), viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  console.log('✅ DB Ready! Database created automatically!');
}
initDB();

app.all('/api/stories/:id/view', async (req,res)=>{
  const id = req.params.id;
  await pool.query('INSERT IGNORE INTO stories (id) VALUES (?)', [id]);
  await pool.query('UPDATE stories SET views = views + 1 WHERE id=?', [id]);
  await pool.query('INSERT INTO views_log (story_id) VALUES (?)', [id]);
  const [rows] = await pool.query('SELECT * FROM stories WHERE id=?', [id]);
  res.json(rows[0]);
});

app.all('/api/stories/:id/heart', async (req,res)=>{
  const id = req.params.id;
  await pool.query('INSERT IGNORE INTO stories (id) VALUES (?)', [id]);
  await pool.query('UPDATE stories SET hearts = hearts + 1 WHERE id=?', [id]);
  const [rows] = await pool.query('SELECT * FROM stories WHERE id=?', [id]);
  res.json(rows[0]);
});

app.get('/api/dashboard', async (req,res)=>{
  const [stories] = await pool.query('SELECT * FROM stories');
  const [today] = await pool.query('SELECT COUNT(*) as total FROM views_log WHERE DATE(viewed_at)=CURDATE()');
  const [totalV] = await pool.query('SELECT SUM(views) as total FROM stories');
  const [totalH] = await pool.query('SELECT SUM(hearts) as total FROM stories');
  res.json({
    visitors_today: today[0].total,
    total_views: totalV[0].total || 0,
    total_likes: totalH[0].total || 0,
    stories
  });
});





app.listen(process.env.PORT || 3000, ()=> console.log(`✅ Server http://localhost:${process.env.PORT || 3000}`));










