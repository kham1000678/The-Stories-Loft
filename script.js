// CHANGE NAME HERE ONLY - this will change everywhere
const AUTHOR_NAME = "k1000"; // <-- change this to your new name!

const defaultStories=[
{id:1,title:"The Letter That Never Came",genre:"Love",excerpt:"She waited for three years for a letter that was never written. Or was it?",content:"She kept the mailbox empty on purpose. Because if it was empty, the hope was still alive.\n\nThree winters passed in Shillong. The rain wrote its own letters on her window.\n\nAnd then one day, the letter came — but not from where she expected.",author:AUTHOR_NAME,date:"2026-09-28",readTime:"4 min",cover:"",likes:24,views:312},
{id:2,title:"Midnight at Police Bazaar",genre:"Mystery",excerpt:"A missing diary, a tea stall that never closes, and a city that remembers.",content:"Police Bazaar never sleeps. But that night, it was watching.\n\nThe diary was last seen at 11:47 PM. At the tea stall near the taxi stand.\n\nWhat happened after that, no one wants to remember.",author:AUTHOR_NAME,date:"2026-09-25",readTime:"5 min",cover:"",likes:18,views:210},
{id:3,title:"The Last Song of Cherrapunji",genre:"Life",excerpt:"When the rain stops, what do you hear? He went to find out.",content:"He took a bus to Cherrapunji with no return ticket.\n\nEveryone thought he was running away. He was actually running towards something.\n\nThe last song.",author:AUTHOR_NAME,date:"2026-09-20",readTime:"6 min",cover:"",likes:31,views:445}
];
function getStories(){
  let s=localStorage.getItem('loft_stories');
  if(s){try{const p=JSON.parse(s);if(p.length>0)return p}catch(e){}}
  localStorage.setItem('loft_stories',JSON.stringify(defaultStories));
  return [...defaultStories];
}
function saveStories(a){localStorage.setItem('loft_stories',JSON.stringify(a));}
let currentFilter='all',currentSearch='',currentSort='new';
function render(){
let stories=getStories();
if(currentFilter!=='all') stories=stories.filter(x=>x.genre===currentFilter);
if(currentSearch) stories=stories.filter(x=>x.title.toLowerCase().includes(currentSearch.toLowerCase())||x.excerpt.toLowerCase().includes(currentSearch.toLowerCase()));
if(currentSort==='popular') stories.sort((a,b)=>(b.likes||0)-(a.likes||0));
else if(currentSort==='views') stories.sort((a,b)=>(b.views||0)-(a.views||0));
else stories.sort((a,b)=>b.id-a.id);
const grid=document.getElementById('storiesGrid');if(!grid)return;
grid.innerHTML=stories.map(s=>`
<div class="card-pro" onclick="openStory(${s.id})">
<div class="card-cover" style="${s.cover?`background-image:url(${s.cover})`:''}"></div>
<div class="card-body">
<div class="card-meta"><span>${s.genre}</span>•<span>${s.readTime}</span>•<span>${s.date}</span></div>
<h3>${s.title}</h3>
<p>${s.excerpt}</p>
<div class="card-foot"><span>❤️ ${s.likes||0}</span><span>👁️ ${s.views||0}</span><span>By ${s.author}</span></div>
</div>
</div>`).join('')||'<p style="padding:20px">No stories found.</p>';
const ts=document.getElementById('totalStories');if(ts){ts.textContent=getStories().length;document.getElementById('totalViews').textContent=getStories().reduce((a,b)=>a+(b.views||0),0);document.getElementById('totalLikes').textContent=getStories().reduce((a,b)=>a+(b.likes||0),0);}
}
function filterBy(g){currentFilter=g;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===g));render();}
function searchStories(v){currentSearch=v;render();}
function sortStories(v){currentSort=v;render();}
function openStory(id){let stories=getStories();const i=stories.findIndex(x=>x.id===id);if(i>-1){stories[i].views=(stories[i].views||0)+1;saveStories(stories);}localStorage.setItem('loft_current',id);location.href='story.html';}
function toggleTheme(){const cur=document.documentElement.getAttribute('data-theme');const t=cur==='dark'?'light':'dark';if(t==='dark')document.documentElement.setAttribute('data-theme','dark');else document.documentElement.removeAttribute('data-theme');localStorage.setItem('theme',t);const btn=document.getElementById('themeToggle');if(btn)btn.textContent=t==='dark'?'☀️':'🌙';}
(function(){const t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');render();})();
function subscribe(e){e.preventDefault();alert('Subscribed! (Demo)');e.target.reset();}