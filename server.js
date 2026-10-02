require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || '2005',
  database: 'stories_loft'
});
db.connect(e=>{ if(!e) console.log("DB Ready!") });

app.get('/api/live', (req,res)=>{
  // Get views count
  db.query("SELECT story_id, COUNT(*) as views FROM views_log GROUP BY story_id", (e, viewRows)=>{
    db.query("SELECT story_id, COUNT(*) as hearts FROM likes GROUP BY story_id", (e2, likeRows)=>{
      let data = {};
      (viewRows||[]).forEach(r=>{ data[r.story_id] = data[r.story_id]||{views:0, hearts:0}; data[r.story_id].views = r.views; });
      (likeRows||[]).forEach(r=>{ data[r.story_id] = data[r.story_id]||{views:0, hearts:0}; data[r.story_id].hearts = r.hearts; });
      res.json(data);
    });
  });
});

app.get('/api/views/:id', (req,res)=>{
  db.query("SELECT COUNT(*) as total FROM views_log WHERE story_id=?", [req.params.id], (e,r)=> res.json({views: r[0]?.total||0}));
});
app.post('/api/views/:id', (req,res)=>{
  const vid = req.body.visitor_id || 'anon';
  db.query("INSERT INTO views_log (story_id, visitor_id) VALUES (?,?)", [req.params.id, vid], ()=>{});
  db.query("SELECT COUNT(*) as total FROM views_log WHERE story_id=?", [req.params.id], (e,r)=> res.json({views: r[0]?.total||0}));
});

app.get('/api/likes/:id', (req,res)=>{
  db.query("SELECT COUNT(*) as total FROM likes WHERE story_id=?", [req.params.id], (e,r)=> res.json({likes: r[0]?.total||0}));
});
app.post('/api/likes/:id', (req,res)=>{
  db.query("INSERT IGNORE INTO likes (story_id, visitor_id) VALUES (?,?)", [req.params.id, req.body.visitor_id], ()=>{
    db.query("SELECT COUNT(*) as total FROM likes WHERE story_id=?", [req.params.id], (e,r)=> res.json({likes: r[0]?.total||0, hearts: r[0]?.total||0}));
  });
});

app.get('/api/comments/:id', (req,res)=>{
  db.query("SELECT * FROM comments WHERE story_id=? ORDER BY id DESC", [req.params.id], (e,r)=> res.json(r||[]));
});
app.post('/api/comments', (req,res)=>{
  const {story_id, name, comment}=req.body;
  db.query("INSERT INTO comments (story_id, name, comment) VALUES (?,?,?)", [story_id, name, comment], ()=> res.json({success:true}));
});

app.listen(3000, ()=> console.log("Server http://localhost:3000"));