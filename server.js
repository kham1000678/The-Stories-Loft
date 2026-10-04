const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'));

let DB_FILE = './stories.json';
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

function readDB(){ return JSON.parse(fs.readFileSync(DB_FILE)); }
function saveDB(d){ fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2)); }

// GET all stories
app.get('/api/stories', (req,res)=>{
  let db = readDB();
  res.json(db.sort((a,b)=>b.id-a.id));
});

// GET one story
app.get('/api/stories/:id', (req,res)=>{
  let db = readDB();
  let s = db.find(x=>x.id==req.params.id);
  if(!s) return res.status(404).json({});
  res.json(s);
});

// POST new story (from admin)
app.post('/api/stories', (req,res)=>{
  let db = readDB();
  let newStory = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    image: req.body.image || '',
    views: 0,
    hearts: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  db.push(newStory);
  saveDB(db);
  res.json(newStory);
});

// VIEW count - real
app.post('/api/stories/:id/view', (req,res)=>{
  let db = readDB();
  let s = db.find(x=>x.id==req.params.id);
  if(s){ s.views = (s.views||0)+1; saveDB(db); }
  res.json(s);
});

// LIKE / HEART - real
app.post('/api/stories/:id/heart', (req,res)=>{
  let db = readDB();
  let s = db.find(x=>x.id==req.params.id);
  if(s){ s.hearts = (s.hearts||0)+1; saveDB(db); }
  res.json(s);
});

// GET comments
app.get('/api/stories/:id/comments', (req,res)=>{
  let db = readDB();
  let s = db.find(x=>x.id==req.params.id);
  res.json(s?.comments || []);
});

// POST comment - everyone sees
app.post('/api/stories/:id/comments', (req,res)=>{
  let db = readDB();
  let s = db.find(x=>x.id==req.params.id);
  if(!s) return res.status(404).json({});
  let c = {
    id: Date.now(),
    name: req.body.name || 'Reader',
    text: req.body.text,
    time: new Date().toLocaleString()
  };
  s.comments = s.comments || [];
  s.comments.push(c);
  saveDB(db);
  res.json(c);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Running on '+PORT));