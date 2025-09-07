
(function(){
  // Navbar active
  const path = location.pathname.replace(/\/$/, '/index.html') // normalize
  const map = {
    '/': 'home',
    '/index.html': 'home',
    '/tools.html': 'tools',
    '/blog.html': 'blog',
    '/about.html': 'about'
  };
  document.querySelectorAll('[data-nav]').forEach(a => {
    if(a.getAttribute('data-nav') === map[path] ){
      a.classList.add('active');
    }
  });
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  // Populate featured tools on homepage
  const featuredEl = document.getElementById('featured');
  if(featuredEl){
    fetch('/data/tools.json').then(r=>r.json()).then(tools=>{
      const featured = tools.filter(t=>t.featured).slice(0,6);
      featuredEl.innerHTML = featured.map(t=>toolCardHTML(t)).join('');
    }).catch(()=>{
      featuredEl.innerHTML = '<p class="lead">Add tools in <code>data/tools.json</code> to see them here.</p>';
    });
  }

  // Tools page logic
  const toolsGrid = document.getElementById('toolsGrid');
  const toolSearch = document.getElementById('toolSearch');
  const toolTags = document.getElementById('toolTags');
  if(toolsGrid){
    fetch('/data/tools.json').then(r=>r.json()).then(tools=>{
      let current = tools.slice(0);
      renderTools(current);
      renderTags(tools);

      function renderTools(list){
        toolsGrid.innerHTML = list.map(t=>toolCardHTML(t)).join('');
      }
      function filter(){
        const q = (toolSearch.value || '').toLowerCase().trim();
        const activeTag = toolTags.querySelector('.tag.active');
        const tagText = activeTag ? activeTag.dataset.tag : null;
        const filtered = tools.filter(t=>{
          const text = (t.name + ' ' + t.description + ' ' + (t.tags||[]).join(' ')).toLowerCase();
          const matchesText = !q || text.includes(q);
          const matchesTag = !tagText || (t.tags||[]).map(x=>x.toLowerCase()).includes(tagText.toLowerCase());
          return matchesText && matchesTag;
        });
        renderTools(filtered);
      }
      toolSearch && toolSearch.addEventListener('input', filter);
      toolTags.addEventListener('click', (e)=>{
        const el = e.target.closest('.tag');
        if(!el) return;
        toolTags.querySelectorAll('.tag').forEach(t=>t.classList.remove('active'));
        if(!el.classList.contains('active')) el.classList.add('active'); else el.classList.remove('active');
        filter();
      });
    }).catch(()=>{
      toolsGrid.innerHTML = '<p class="lead">Could not load tools. Make sure <code>data/tools.json</code> exists.</p>';
    });
  }

  // Blog page logic
  const postsGrid = document.getElementById('postsGrid');
  const blogSearch = document.getElementById('blogSearch');
  if(postsGrid){
    fetch('/data/posts.json').then(r=>r.json()).then(posts=>{
      function render(list){
        postsGrid.innerHTML = list.map(p=>postCardHTML(p)).join('');
      }
      render(posts);
      blogSearch && blogSearch.addEventListener('input', ()=>{
        const q = (blogSearch.value||'').toLowerCase().trim();
        const filtered = posts.filter(p=> (p.title + ' ' + (p.excerpt||'')).toLowerCase().includes(q));
        render(filtered);
      });
    }).catch(()=>{
      postsGrid.innerHTML = '<p class="lead">Add posts by creating files in <code>/posts/</code> and listing them in <code>data/posts.json</code>.</p>';
    });
  }

  // Helpers
  function toolCardHTML(t){
    const badge = t.new ? '<span class="badge">New</span>' : '';
    const tags = (t.tags||[]).map(tag=>`<span class="tag">${escapeHTML(tag)}</span>`).join(' ');
    const ext = t.url && !/^\//.test(t.url) ? ' target="_blank" rel="noopener"' : '';
    return `
      <article class="card tool-card">
        ${badge}
        <h3>${escapeHTML(t.name)}</h3>
        <p>${escapeHTML(t.description || '')}</p>
        <div style="margin:10px 0 6px 0">${tags}</div>
        ${t.url ? `<a class="btn" href="${escapeHTML(t.url)}"${ext}>Open</a>` : ''}
      </article>
    `;
  }
  function postCardHTML(p){
    return `
      <article class="card post-card">
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.excerpt || '')}</p>
        <div style="margin:10px 0"><span class="tag">${escapeHTML(p.date||'')}</span></div>
        <a class="btn" href="${escapeHTML(p.path)}">Read</a>
      </article>
    `;
  }
  function renderTags(tools){
    const tagSet = new Set();
    tools.forEach(t => (t.tags||[]).forEach(tag => tagSet.add(tag)));
    if(tagSet.size === 0){ toolTags.innerHTML = ''; return; }
    toolTags.innerHTML = Array.from(tagSet).sort().map(tag=>`<button class="tag" data-tag="${escapeAttr(tag)}">${escapeHTML(tag)}</button>`).join(' ');
  }
  function escapeHTML(s){return (s||'').replace(/[&<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
  function escapeAttr(s){return (s||'').replace(/"/g, '&quot;')}
})();
