document.addEventListener("DOMContentLoaded", () => {
  async function loadGallery() {
    const g = document.getElementById("gallery");
    g.innerHTML = "<p>Įkeliama...</p>";

    try {
      const r = await fetch("data/all-scripts.json");
      const data = await r.json();

      g.innerHTML = data.length
        ? data
            .map(
              (item) => `
                <div class="card">
                  <a href="${item.url}" title="Install ${item.domain} script">
                    <img src="${item.icon}" alt="${item.domain}">
                  </a>
                  <a class="card-title" href="https://${item.domain}" target="_blank" rel="noopener noreferrer">
                    ${item.domain}
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
