async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    Array.from(nodes).map(async (el) => {
      const url = el.getAttribute("data-include");
      const res = await fetch(url, { cache: "no-store" });
      const html = await res.text();
      el.innerHTML = html;
    })
  );

  // Marca activo en el navbar
  const here = location.pathname.replace(/\/+$/, "");
  document.querySelectorAll("nav a[href]").forEach(a => {
    const href = a.getAttribute("href").replace(/\/+$/, "");
    if (href === here || (href.endsWith("/index.html") && here.endsWith("/"))) {
      a.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", includePartials);
function wireNavbarToggle(){
  const nav = document.querySelector('.nav');
  const btn = document.querySelector('.nav__toggle');
  if (!nav || !btn) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
}
document.addEventListener("DOMContentLoaded", () => {
  includePartials().then(wireNavbarToggle);
});

