try{ require('dotenv').config(); }catch(e){}

const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2005',
  database: process.env.DB_NAME || 'stories_loft',
  port: process.env.DB_PORT? parseInt(process.env.DB_PORT) : 3306
};

if(process.env.DB_HOST){
  dbConfig.ssl = { rejectUnauthorized: true };
}

let db;
let dbReady = false;

try{
  db = mysql.createConnection(dbConfig);
  db.connect(err => {
    if(err) console.log("DB fail (site still runs):", err.message);
    else { console.log("DB Ready!"); dbReady = true; }
  });
} catch(e){ console.log("DB init fail", e.message); }

function safeQuery(sql, params, cb){
  if(!db ||!dbReady){ return cb(null, []); }
  db.query(sql, params, (err, rows)=>{
    if(err){ console.log("DB Error:", err.message); return cb(null, []); }
    cb(null, rows);
  });
}

app.get('/api/live', (req,res)=>{
  safeQuery("SELECT story_id, COUNT(*) as views FROM views_log GROUP BY story_id", [], (e, viewRows)=>{
    safeQuery("SELECT story_id, COUNT(*) as hearts FROM likes GROUP BY story_id", [], (e2, likeRows)=>{
      let data = {};
      (viewRows||[]).forEach(r=>{ data[r.story_id] = data[r.story_id]||{views:0, hearts:0}; data[r.story_id].views = r.views; });
      (likeRows||[]).forEach(r=>{ data[r.story_id] = data[r.story_id]||{views:0, hearts:0}; data[r.story_id].hearts = r.hearts; });
      res.json(data);
    });
  });
});

app.get('/api/views/:id', (req,res)=>{
  safeQuery("SELECT COUNT(*) as total FROM views_log WHERE story_id=?", [req.params.id], (e,r)=> res.json({views: r[0]?.total||0}));
});
app.post('/api/views/:id', (req,res)=>{
  safeQuery("INSERT INTO views_log (story_id, visitor_id) VALUES (?,?)", [req.params.id, req.body.visitor_id||'anon'], ()=>{});
  safeQuery("SELECT COUNT(*) as total FROM views_log WHERE story_id=?", [req.params.id], (e,r)=> res.json({views: r[0]?.total||0}));
});

app.get('/api/likes/:id', (req,res)=>{
  safeQuery("SELECT COUNT(*) as total FROM likes WHERE story_id=?", [req.params.id], (e,r)=> res.json({likes: r[0]?.total||0}));
});
app.post('/api/likes/:id', (req,res)=>{
  safeQuery("INSERT IGNORE INTO likes (story_id, visitor_id) VALUES (?,?)", [req.params.id, req.body.visitor_id||'anon'], ()=>{
    safeQuery("SELECT COUNT(*) as total FROM likes WHERE story_id=?", [req.params.id], (e,r)=> res.json({likes: r[0]?.total||0, hearts: r[0]?.total||0}));
  });
});

app.get('/api/comments/:id', (req,res)=>{
  safeQuery("SELECT * FROM comments WHERE story_id=? ORDER BY id DESC", [req.params.id], (e,r)=> res.json(r||[]));
});
app.post('/api/comments', (req,res)=>{
  const {story_id, name, comment}=req.body;
  safeQuery("INSERT INTO comments (story_id, name, comment) VALUES (?,?,?)", [story_id, name, comment], ()=> res.json({success:true}));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server running on "+PORT));