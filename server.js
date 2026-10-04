const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
const DATA_FILE = path.join(__dirname, 'stories.json');

function readStories(){
try{
if(!fs.existsSync(DATA_FILE)) return [];
return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
}catch(e){return []}
}
function saveStories(stories){
fs.writeFileSync(DATA_FILE, JSON.stringify(stories,null,2));
}

app.get('/api/stories', (req,res)=>{
res.json(readStories());
});

app.post('/api/stories', (req,res)=>{
if(req.body.adminKey !== process.env.ADMIN_KEY) return res.status(401).json({error:'Wrong admin key - use khamkor123'});
const stories = readStories();
const newStory = {
_id: Date.now().toString(),
title: req.body.title,
content: req.body.content,
image: req.body.image || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800',
views: 0,
likes: 0,
comments: [],
createdAt: new Date()
};
stories.unshift(newStory);
saveStories(stories);
res.json(newStory);
});

app.post('/api/stories/:id/view', (req,res)=>{
const stories = readStories();
const s = stories.find(x=>x._id==req.params.id);
if(s){s.views++; saveStories(stories);}
res.json(s);
});

app.post('/api/stories/:id/like', (req,res)=>{
const stories = readStories();
const s = stories.find(x=>x._id==req.params.id);
if(s){s.likes++; saveStories(stories);}
res.json(s);
});

app.post('/api/stories/:id/comment', (req,res)=>{
const stories = readStories();
const s = stories.find(x=>x._id==req.params.id);
if(s){
s.comments.push({name:req.body.name, text:req.body.text, date: new Date()});
saveStories(stories);
}
res.json(s);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server running on '+PORT+' - No MongoDB needed!'));