document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-button");

  function loadGallery(category) {
    const g = document.getElementById(`gallery-${category}`);
    g.innerHTML = "<p>Įkeliama...</p>";

    fetch(`cards/${category}.json`)
      .then(r => r.json())
      .then(data => {
        g.innerHTML = "";

        if (!data.length) {
          g.innerHTML = `<div class="gallery-fallback">⚠️ Nėra ${category} įrankių.</div>`;
          return;
        }

        data.forEach(item => {
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

        g.querySelectorAll(".install-link").forEach(link => {
          link.addEventListener("click", e => {
            e.preventDefault();
            window.location.href = link.href;
          });
        });
      })
      .catch(() => {
        g.innerHTML = `<div class="gallery-fallback">⚠️ Nepavyko įkelti.</div>`;
      });
  }

  loadGallery("cite-web");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      // deactivate all tabs
      tabs.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const target = btn.dataset.target;
      document.getElementById(target).classList.add("active");

      loadGallery(target);
    });
  });
});
