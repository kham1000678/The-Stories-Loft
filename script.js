const defaultStories=[
{id:1,title:"The Letter That Never Came",genre:"Love",excerpt:"She waited for three years for a letter that was never written. Or was it?",content:"Full story of The Letter...\n\nShe kept the mailbox empty on purpose. Because if it was empty, the hope was still alive.\n\nThree winters passed in Shillong. The rain wrote its own letters on her window.",author:"Khamkor Syiemlieh",date:"2026-09-28",readTime:"4 min",cover:"",likes:24,views:312},
{id:2,title:"Midnight at Police Bazaar",genre:"Mystery",excerpt:"A missing diary, a tea stall that never closes, and a city that remembers.",content:"Police Bazaar never sleeps. But that night, it was watching.\n\nThe diary was last seen at 11:47 PM.",author:"Khamkor Syiemlieh",date:"2026-09-25",readTime:"5 min",cover:"",likes:18,views:210}
];
function getStories(){const s=localStorage.getItem('loft_stories');if(s){try{return JSON.parse(s)}catch(e){}}return [...defaultStories];}
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
document.getElementById('totalStories').textContent=getStories().length;
document.getElementById('totalViews').textContent=getStories().reduce((a,b)=>a+(b.views||0),0);
document.getElementById('totalLikes').textContent=getStories().reduce((a,b)=>a+(b.likes||0),0);
}
function filterBy(g){currentFilter=g;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===g));render();}
function searchStories(v){currentSearch=v;render();}
function sortStories(v){currentSort=v;render();}
function openStory(id){let stories=getStories();const i=stories.findIndex(x=>x.id===id);if(i>-1){stories[i].views=(stories[i].views||0)+1;saveStories(stories);}localStorage.setItem('loft_current',id);location.href='story.html';}
function toggleTheme(){const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);document.getElementById('themeToggle').textContent=t==='dark'?'☀️':'🌙';}
(function(){const t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}render();})();
function subscribe(e){e.preventDefault();alert('Subscribed! You will get next story. (Demo - connect to Email service later)');e.target.reset();}