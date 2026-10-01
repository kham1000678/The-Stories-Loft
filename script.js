const defaultStories=[
{id:1,title:"The Letter That Never Came",genre:"Love",excerpt:"She waited for three years for a letter that was never writ",author:"You",views:0,likes:0},
{id:2,title:"Midnight at Police Bazaar",genre:"Mystery",excerpt:"A missing diary, a tea stall that never closes",author:"You",views:0,likes:0},
{id:3,title:"The Last Song of Cherrapunji",genre:"Life",excerpt:"When the rain stops, what do you hear?",author:"You",views:0,likes:0}
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