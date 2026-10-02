const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
app.use(express.json());

// Serve all static files
app.use(express.static(path.join(__dirname)));

// --- DB setup (safe, won't crash) ---
let db=null, dbReady=false;
try {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Msdian07*',
    database: process.env.DB_NAME || 'stories_loft',
    port: process.env.DB_PORT? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 5
  };
  if (process.env.DB_HOST &&!process.env.DB_HOST.includes('localhost')) {
    config.ssl = { rejectUnauthorized: true };
  }
  db = mysql.createPool(config).promise();
  db.query('SELECT 1').then(()=>{ dbReady=true; console.log('DB Ready!'); }).catch(e=>{ console.log('DB fail (site still runs):', e.message); db=null; dbReady=false; });
} catch(e){ console.log('DB init fail:', e.message); }

async function safeQuery(sql, params, fallback){
  if (!dbReady ||!db) return fallback;
  try { const [rows]=await db.query(sql, params); return rows; }
  catch(e){ console.log('Query fail:', e.message); return fallback; }
}

// --- API routes ---
app.get('/api/stories', async (req,res)=>{
  const stories = await safeQuery('SELECT * FROM stories ORDER BY id DESC', [], []);
  res.json(stories);
});
app.get('/api/live', async (req,res)=>{
  const s = await safeQuery('SELECT COUNT(*) as c FROM stories', [], [{c:0}]);
  const v = await safeQuery('SELECT SUM(views) as s FROM stories', [], [{s:0}]);
  const l = await safeQuery('SELECT COUNT(*) as c FROM hearts', [], [{c:0}]);
  res.json({ stories: s[0].c||0, reads: v[0].s||0, likes: l[0].c||0 });
});
app.post('/api/view/:id', async (req,res)=>{
  await safeQuery('UPDATE stories SET views = views + 1 WHERE id =?', [req.params.id], []);
  res.json({ok:true});
});
app.post('/api/like/:id', async (req,res)=>{
  await safeQuery('INSERT IGNORE INTO hearts (story_id, ip) VALUES (?,?)', [req.params.id, req.ip], []);
  res.json({ok:true});
});

// --- IMPORTANT: Homepage route ---
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('Server running on '+PORT));