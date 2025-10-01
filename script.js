document.addEventListener("DOMContentLoaded", () => {
  async function loadGallery() {
    const g = document.getElementById("gallery");
    g.innerHTML = "<p>Įkeliama...</p>";

    try {
      const r = await fetch("data/scripts.json");
      const data = await r.json();

      g.innerHTML = data.length
        ? data
            .map(
              (item) => `
        <div class="card">
          <a href="${item.url}" title="${item.domain}">
            <img src="${item.icon}" alt="${item.domain}">
            <div class="card-title">${item.domain}</div>
          </a>
        </div>`
            )
            .join("")
        : `<div class="gallery-fallback">⚠️ Nėra įrankių.</div>`;

      g.querySelectorAll("img").forEach((img) => {
        img.onerror = () => {
          const f = document.createElement("div");
          f.className = "img-fallback";
          f.textContent = (img.alt || "???").toUpperCase();
          img.replaceWith(f);
        };
      });
    } catch {
      g.innerHTML = `<div class="gallery-fallback">⚠️ Nepavyko įkelti.</div>`;
    }
  }

  loadGallery();
});
