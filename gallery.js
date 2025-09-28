fetch("scripts.json")
  .then((r) => r.json())
  .then((data) => {
    const g = document.getElementById("gallery");
    g.innerHTML = "";
    data.forEach((item) => {
      const c = document.createElement("div");
      c.className = "card";
      c.innerHTML = `
        <a href="${item.url}" class="install-link" title="${item.domain}">
          <img src="${item.icon}" alt="${item.domain}">
        </a>`;
      const img = c.querySelector("img");
      img.onerror = () => {
        const f = document.createElement("div");
        f.className = "img-fallback";
        f.textContent = (img.alt || "???").slice(0, 3).toUpperCase();
        img.replaceWith(f);
      };
      g.appendChild(c);
    });

    document.querySelectorAll(".install-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = link.href;
      });
    });
  })
  .catch(() => {
    const g = document.getElementById("gallery");
    g.innerHTML = `<div class="gallery-fallback">⚠️ Failed to load gallery.</div>`;
  });
