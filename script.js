document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-button");

  async function loadGallery(category) {
    const g = document.getElementById(`gallery-${category}`);
    g.innerHTML = "<p>Įkeliama...</p>";

    try {
      const r = await fetch(`cards/${category}.json`);
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
        </div>
      `
            )
            .join("")
        : `<div class="gallery-fallback">⚠️ Nėra ${category} įrankių.</div>`;

      // image fallback handling
      g.querySelectorAll("img").forEach((img) => {
        img.onerror = () => {
          const f = document.createElement("div");
          f.className = "img-fallback";
          f.textContent = (img.alt || "???").slice(0, 5).toUpperCase();
          img.replaceWith(f);
        };
      });
    } catch {
      g.innerHTML = `<div class="gallery-fallback">⚠️ Nepavyko įkelti.</div>`;
    }
  }

  loadGallery("cite-web");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      // deactivate all tabs
      tabs.forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const target = btn.dataset.target;
      document.getElementById(target).classList.add("active");

      loadGallery(target);
    });
  });
});
