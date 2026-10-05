const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

async function initDB(){
  try{
    console.log("Connecting to Railway MySQL...");
    await pool.query(`CREATE TABLE IF NOT EXISTS stories (id VARCHAR(100) PRIMARY KEY, title TEXT, content LONGTEXT, image TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS comments (id VARCHAR(100) PRIMARY KEY, story_id VARCHAR(100), name TEXT, text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    try{ await pool.query(`ALTER TABLE stories ADD COLUMN image TEXT`); }catch(e){}
    try{ await pool.query(`ALTER TABLE stories ADD COLUMN views INT DEFAULT 0`); }catch(e){}
    try{ await pool.query(`ALTER TABLE stories ADD COLUMN likes INT DEFAULT 0`); }catch(e){}
    try{ await pool.query(`ALTER TABLE stories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); }catch(e){}
    console.log("✅ Railway MySQL Connected!");
  }catch(e){ console.error("DB Init Error:", e.message); }
}
initDB();

// GET ALL STORIES
app.get('/api/stories', async (req,res)=>{
  try{
    const [rows] = await pool.query('SELECT * FROM stories ORDER BY created_at DESC');
    console.log("Loaded", rows.length, "stories");
    res.json(rows);
  }catch(e){
    console.error("GET ERROR:", e.message);
    res.json([]);
  }
});

// GET ONE STORY
app.get('/api/stories/:id', async (req,res)=>{
  try{
    const [rows] = await pool.query('SELECT * FROM stories WHERE id=?', [req.params.id]);
    if(rows.length){
      await pool.query('UPDATE stories SET views=views+1 WHERE id=?', [req.params.id]);
      return res.json(rows[0]);
    }
    res.status(404).json({error:'Not found'});
  }catch(e){ res.status(404).json({error:'Not found'}); }
});

// POST STORY
app.post('/api/stories', async (req,res)=>{
  if(req.headers['x-admin-key']!=='khamkor123') return res.status(403).json({error:'Wrong key'});
  const id = Date.now().toString();
  try{
    await pool.query('INSERT INTO stories (id,title,content,image,views,likes) VALUES (?,?,?,?,0,0)', [id, req.body.title||'Untitled', req.body.content, req.body.image||'']);
    console.log("✅ SAVED:", id);
    res.json({success:true, id});
  }catch(e){
    console.error("POST ERROR:", e.message);
    res.status(500).json({error:e.message});
  }
});

// DELETE STORY
app.delete('/api/stories/:id', async (req,res)=>{
  if(req.headers['x-admin-key']!=='khamkor123') return res.status(403).json({error:'Wrong key'});
  try{
    await pool.query('DELETE FROM stories WHERE id=?', [req.params.id]);
    await pool.query('DELETE FROM comments WHERE story_id=?', [req.params.id]);
    console.log("🗑️ DELETED:", req.params.id);
    res.json({success:true});
  }catch(e){
    console.error("DELETE ERROR:", e.message);
    res.status(500).json({error:e.message});
  }
});

// LIKE
app.post('/api/stories/:id/like', async (req,res)=>{
  try{
    await pool.query('UPDATE stories SET likes=likes+1 WHERE id=?', [req.params.id]);
    res.json({success:true});
  }catch(e){ res.json({success:false}); }
});

// COMMENTS
app.get('/api/stories/:id/comments', async (req,res)=>{
  try{
    const [rows] = await pool.query('SELECT * FROM comments WHERE story_id=? ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  }catch(e){ res.json([]); }
});

app.post('/api/stories/:id/comments', async (req,res)=>{
  const cid = Date.now().toString();
  try{
    await pool.query('INSERT INTO comments (id,story_id,name,text) VALUES (?,?,?,?)', [cid, req.params.id, req.body.name||'Anonymous', req.body.text]);
    res.json({success:true});
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.listen(PORT, ()=>console.log('Server running on '+PORT));