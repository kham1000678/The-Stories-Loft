const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
let stories=[]; try{stories=JSON.parse(fs.readFileSync('stories.json','utf8'));}catch(e){stories=[];}
function save(){fs.writeFileSync('stories.json', JSON.stringify(stories,null,2));}
app.get('/api/stories',(req,res)=>{res.json(stories);});
app.get('/api/stories/:id',(req,res)=>{const s=stories.find(x=>x.id==req.params.id); if(!s) return res.status(404).send('Not found'); res.json(s);});
app.post('/api/stories',(req,res)=>{if(req.headers['x-admin-key']!=='khamkor123') return res.status(403).json({error:'Wrong key'}); const {title,content,image}=req.body; const story={id:Date.now().toString(),title,content,image,views:0,createdAt:new Date().toISOString()}; stories.unshift(story); save(); res.json(story);});
app.post('/api/stories/:id/view',(req,res)=>{const s=stories.find(x=>x.id==req.params.id); if(s){s.views=(s.views||0)+1; save();} res.json({ok:true});});
app.delete('/api/stories/:id',(req,res)=>{if(req.headers['x-admin-key']!=='khamkor123') return res.status(403).json({error:'Wrong key'}); stories=stories.filter(x=>x.id!=req.params.id); save(); res.json({ok:true});});
app.listen(PORT,()=>console.log('Server running on '+PORT));