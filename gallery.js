fetch('scripts.json')
  .then(r => r.json())
  .then(data => {
    const g = document.getElementById('gallery');
    g.innerHTML = '';
    data.forEach(item => {
      const c = document.createElement('div');
      c.className = 'card';
      c.innerHTML = `
        <a href="${item.url}" target="_blank">
          <img src="${item.icon}" alt="${item.domain}">
        </a>`;
      const img = c.querySelector('img');
      img.onerror = () => {
        const f = document.createElement('div');
        f.className = 'img-fallback';
        f.textContent = (img.alt || '?')[0].toUpperCase();
        img.replaceWith(f);
      };
      g.appendChild(c);
    });
  })
  .catch(() => {
    document.getElementById('gallery').textContent = '⚠️ Failed to load gallery.';
  });
