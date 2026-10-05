const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let pool = null;
let useDB = false;

// Try to connect to Railway MySQL, but don't crash if fails
async function connectDB(){
 try{
  const mysql = require('mysql2/promise');
  if(process.env.MYSQL_URL){
    pool = mysql.createPool(process.env.MYSQL_URL);
    } else if(process.env.MYSQLHOST || process.env.DB_HOST){
    pool = mysql.createPool({
      host: process.env.MYSQLHOST || process.env.DB_HOST,
      user: process.env.MYSQLUSER || process.env.DB_USER,
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME,
      port: process.env.MYSQLPORT || process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 5
    });
  } else {
    console.log('No DB env found, using file fallback');
    return;
  }
  await pool.query('SELECT 1');
  useDB = true;
  console.log('✅ Railway MySQL Connected!');

   await pool.query(`CREATE TABLE IF NOT EXISTS stories (id VARCHAR(100) PRIMARY KEY, title TEXT, content LONGTEXT, image TEXT, views INT DEFAULT 0, likes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS comments (id VARCHAR(100) PRIMARY KEY, story_id VARCHAR(100), name TEXT, text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  try{ await pool.query(`ALTER TABLE stories ADD COLUMN views INT DEFAULT 0`); }catch(e){}
  try{ await pool.query(`ALTER TABLE stories ADD COLUMN likes INT DEFAULT 0`); }catch(e){}
  try{ await pool.query(`ALTER TABLE stories MODIFY COLUMN id VARCHAR(100)`); }catch(e){}
  try{ await pool.query(`ALTER TABLE comments MODIFY COLUMN id VARCHAR(100)`); }catch(e){}
  try{ await pool.query(`ALTER TABLE comments MODIFY COLUMN story_id VARCHAR(100)`); }catch(e){}
    try{ await pool.query(`ALTER TABLE stories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); }catch(e){}
 }catch(e){
  console.log('⚠️ DB Connection Failed:', e.message);
  console.log('Using file fallback, site will still work');
  useDB = false;
 }
}
connectDB();

// Fallback file storage
const fs = require('fs');
let fileStories = [];
try{ fileStories = JSON.parse(fs.readFileSync('stories.json','utf8')); }catch(e){ fileStories=[]; }
function saveFile(){ try{ fs.writeFileSync('stories.json', JSON.stringify(fileStories,null,2)); }catch(e){} }



app.get('/api/stories/:id', async (req,res)=>{
 try{
  if(useDB){ const [rows]=await pool.query('SELECT * FROM stories WHERE id=?',[req.params.id]); if(rows.length) return res.json(rows[0]); }
  const s=fileStories.find(x=>x.id==req.params.id); if(s) return res.json(s);
  res.status(404).send('Not found');
 }catch(e){ res.status(404).send('Not found'); }
});

app.post('/api/stories', async (req,res)=>{
 if(req.headers['x-admin-key']!=='khamkor123') return res.status(403).json({error:'Wrong key'});
 const id=Date.now().toString();
 const story={id,title:req.body.title,content:req.body.content,image:req.body.image||'',views:0,likes:0,created_at:new Date().toISOString()};
  try{
    await pool.query('INSERT INTO stories (id,title,content,image,created_at) VALUES (?,?,?,?,?)', [id, req.body.title, req.body.content, req.body.image || '', story.created_at]);
    console.log("✅ SAVED TO MYSQL:", id);
    res.json(story);
  }catch(e){ console.error("DB ERROR:", e.message); res.status(500).json({error:e.message}); }
});

app.post('/api/stories/:id/view', async (req,res)=>{
 try{ if(useDB) await pool.query('UPDATE stories SET views=views+1 WHERE id=?',[req.params.id]); else { let s=fileStories.find(x=>x.id==req.params.id); if(s) s.views=(s.views||0)+1; saveFile(); } }catch(e){}
 res.json({ok:true});
});

app.post('/api/stories/:id/like', async (req,res)=>{
 try{
  if(useDB){ await pool.query('UPDATE stories SET likes=likes+1 WHERE id=?',[req.params.id]); const [rows]=await pool.query('SELECT likes FROM stories WHERE id=?',[req.params.id]); return res.json({likes:rows[0]?.likes||0}); }
  let s=fileStories.find(x=>x.id==req.params.id); if(s){ s.likes=(s.likes||0)+1; saveFile(); return res.json({likes:s.likes}); }
  res.json({likes:1});
 }catch(e){ res.json({likes:0}); }
});

app.get('/api/stories/:id/comments', async (req,res)=>{
 try{ if(useDB){ const [rows]=await pool.query('SELECT * FROM comments WHERE story_id=? ORDER BY created_at DESC',[req.params.id]); return res.json(rows); } }catch(e){}
 res.json([]);
});

app.post('/api/stories/:id/comments', async (req,res)=>{
 try{
  if(useDB){
   const id=Date.now().toString();
   await pool.query('INSERT INTO comments (id,story_id,name,text,created_at) VALUES (?,?,?,?,?)',[id,req.params.id,req.body.name||'Anonymous',req.body.text, new Date().toISOString()]);
   const [rows]=await pool.query('SELECT * FROM comments WHERE story_id=? ORDER BY created_at DESC',[req.params.id]);
   return res.json(rows);
  }
  res.json([{name:req.body.name,text:req.body.text}]);
 }catch(e){ res.status(500).json({error:e.message}); }
});

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

app.listen(PORT,()=>console.log('Server running on '+PORT));