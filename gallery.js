fetch('scripts.json')
  .then(res => res.json())
  .then(data => {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // clear placeholder
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <a href="${item.url}" target="_blank">
          <img src="${item.icon}" alt="${item.label}">
          <span>${item.label}</span>
        </a>
      `;
      gallery.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Error loading scripts.json:', err);
    document.getElementById('gallery').innerHTML = '<p>Failed to load gallery.</p>';
  });
