const defaultStories=[
{id:1,title:"The Letter That Never Came",genre:"Love",excerpt:"A story of waiting, rain, and a mailbox that stayed empty for years.",content:"It rained that year like it would never stop.\n\nEvery evening at 5:30, she would walk to the old red mailbox at the end of the lane. The postman knew her by now. He would just shake his head, gently.\n\nShe had written 47 letters. He had promised he would reply to one.\n\nThe 48th letter she never sent.",author:"Loft Original",date:"2026-09-28",readTime:"4 min",cover:""},
{id:2,title:"The Light in the Old Loft",genre:"Mystery",excerpt:"She heard footsteps every night from the loft. No one lived there.",content:"The house was 80 years old. The loft had been locked since 1972.\n\nBut at 2:13 AM every night, the bulb in the loft would flicker on.\n\nOn Night 11, she finally climbed up. The loft was empty, except for a single chair facing the window, still warm.",author:"Loft Original",date:"2026-09-27",readTime:"5 min",cover:""},
{id:3,title:"Tea at 4 PM",genre:"Life",excerpt:"Some conversations only happen over a second cup of tea.",content:"In Assam, we don't measure time in hours. We measure it in cups of tea.\n\nFirst cup: formalities. Second cup: truth.",author:"Loft Original",date:"2026-09-26",readTime:"3 min",cover:""}
];
function getStories(){const s=localStorage.getItem('loft_stories');if(s){try{return JSON.parse(s)}catch(e){}}localStorage.setItem('loft_stories',JSON.stringify(defaultStories));return defaultStories;}
function saveStories(s){localStorage.setItem('loft_stories',JSON.stringify(s));}
function renderStories(filter="all",search=""){
  const grid=document.getElementById('storyGrid');if(!grid)return;
  let stories=getStories();
  document.getElementById('totalStories').innerText=stories.length;
  if(filter!=="all")stories=stories.filter(s=>s.genre===filter);
  if(search){const q=search.toLowerCase();stories=stories.filter(s=>s.title.toLowerCase().includes(q)||s.excerpt.toLowerCase().includes(q));}
  grid.innerHTML=stories.map(s=>`
    <div class="card">
      ${s.cover?`<img class="cover" src="${s.cover}">`:""}
      <div class="card-top"><span class="tag">${s.genre}</span><small>${s.readTime} • ${s.date}</small></div>
      <h3>${s.title}</h3><p>${s.excerpt}</p><a href="story.html?id=${s.id}">Read story →</a>
    </div>`).join('')||`<p style="grid-column:1/-1;text-align:center;padding:40px;color:#888">No stories found</p>`;
}
document.addEventListener('DOMContentLoaded',()=>{
  renderStories();
  const si=document.getElementById('searchInput');
  if(si)si.addEventListener('input',e=>{const a=document.querySelector('.filter-btn.active')?.dataset.filter||'all';renderStories(a,e.target.value);});
  document.querySelectorAll('.filter-btn').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderStories(b.dataset.filter,si?.value||"");});});
});