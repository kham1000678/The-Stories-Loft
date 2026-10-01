// CHANGE NAME HERE ONLY - this will change everywhere
const AUTHOR_NAME = "k1000"; // <-- change this to your new name!

const defaultStories=[
<<<<<<< HEAD
{id:1,title:"The Letter That Never Came",genre:"Love",excerpt:"She waited for three years for a letter that was never written. Or was it?",content:"She kept the mailbox empty on purpose. Because if it was empty, the hope was still alive.\n\nThree winters passed in Shillong. The rain wrote its own letters on her window.\n\nAnd then one day, the letter came — but not from where she expected.",author:AUTHOR_NAME,date:"2026-09-28",readTime:"4 min",cover:"",likes:24,views:312},
{id:2,title:"Midnight at Police Bazaar",genre:"Mystery",excerpt:"A missing diary, a tea stall that never closes, and a city that remembers.",content:"Police Bazaar never sleeps. But that night, it was watching.\n\nThe diary was last seen at 11:47 PM. At the tea stall near the taxi stand.\n\nWhat happened after that, no one wants to remember.",author:AUTHOR_NAME,date:"2026-09-25",readTime:"5 min",cover:"",likes:18,views:210},
{id:3,title:"The Last Song of Cherrapunji",genre:"Life",excerpt:"When the rain stops, what do you hear? He went to find out.",content:"He took a bus to Cherrapunji with no return ticket.\n\nEveryone thought he was running away. He was actually running towards something.\n\nThe last song.",author:AUTHOR_NAME,date:"2026-09-20",readTime:"6 min",cover:"",likes:31,views:445}
=======
{id:1,title:"The Letter That Never Came",genre:"Love",excerpt:"She waited for three years for a letter that was never writ",author:"You",views:0,likes:0},
{id:2,title:"Midnight at Police Bazaar",genre:"Mystery",excerpt:"A missing diary, a tea stall that never closes",author:"You",views:0,likes:0},
{id:3,title:"The Last Song of Cherrapunji",genre:"Life",excerpt:"When the rain stops, what do you hear?",author:"You",views:0,likes:0}
>>>>>>> professional
];

let realData = {};

async function loadRealData(){
  try{
    const res = await fetch('http://localhost:3000/api/dashboard');
    const data = await res.json();
    data.stories.forEach(s=>{ realData[s.id]=s; });
    render();
  }catch(e){ console.log('Server not running, showing local'); }
}

function getStories(){
  let s = localStorage.getItem('loft_stories');
  let stories = s? JSON.parse(s) : [...defaultStories];
  // Merge real counts
  return stories.map(st=>{
    const real = realData[st.id];
    if(real) return {...st, views: real.views, likes: real.hearts};
    return st;
  });
}

let currentFilter='all', currentSearch='', currentSort='new';

function render(){
  let stories = getStories();
  if(currentFilter!=='all') stories = stories.filter(x=>x.genre===currentFilter);
  if(currentSearch) stories = stories.filter(x=>x.title.toLowerCase().includes(currentSearch.toLowerCase()));

  const container = document.getElementById('stories') || document.getElementById('storyGrid');
  if(!container) return;

  container.innerHTML = stories.map(st=>`
    <div class="card" onclick="location.href='story.html?id=${st.id}'" style="border:1px solid #333;padding:16px;margin:10px;border-radius:10px;cursor:pointer">
      <h3>${st.title}</h3>
      <p>${st.excerpt}</p>
      <small>${st.genre} • ❤️ ${st.likes||0} • 👁️ ${st.views||0}</small>
    </div>
  `).join('');
}

loadRealData();
render();

// For search/filter buttons if you have them
function setFilter(f){ currentFilter=f; render(); }
function setSearch(v){ currentSearch=v; render(); }