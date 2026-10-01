const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let stories = {
  1: { views: 0, hearts: 0 }
};

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "The Stories Loft API is running." });
});

app.get("/api/stories/:id", (req, res) => {
  const id = req.params.id;
  if (!stories[id]) stories[id] = { views: 0, hearts: 0 };
  res.json(stories[id]);
});

app.post("/api/stories/:id/view", (req, res) => {
  const id = req.params.id;
  if (!stories[id]) stories[id] = { views: 0, hearts: 0 };
  stories[id].views++;
  res.json(stories[id]);
});

app.post("/api/stories/:id/heart", (req, res) => {
  const id = req.params.id;
  if (!stories[id]) stories[id] = { views: 0, hearts: 0 };
  stories[id].hearts++;
  res.json(stories[id]);
});

app.listen(PORT, () => {
  console.log(`The Stories Loft API is running on http://localhost:${PORT}`);
});