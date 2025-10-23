/* Autenticación global – app protegida con login separado */
(() => {
  const STORAGE_KEY = "pollito.session";
  const SESSION_TTL_MIN = 240;              // 4h
  const LOGIN_PAGE = "view/login.html";          // Página de login
  const LOGIN_ENDPOINT = "/api/auth/login"; // tu API real cuando exista
  const USE_MOCK = true;                    // pon false cuando uses tu API

  // Usuarios demo (solo mock)
  const MOCK_USERS = [
    { user:"admin", pass:"admin123", nombre:"Administrador",     rol:"ADMIN" },
    { user:"caja",  pass:"caja123",  nombre:"Operador de Caja",  rol:"CAJA" },
    { user:"inv",   pass:"inv123",   nombre:"Inventarios",       rol:"INVENTARIO" }
  ];

  // --- helpers sesión ---
  const now = () => Date.now();
  function getSession(){
    // AUTH DESHABILITADO: Siempre devuelve una sesión falsa para acceso libre.
    return {
      token: "fake-token-auth-disabled",
      user: {
        id: 1,
        nombre: "Usuario (Auth Deshabilitado)",
        rol: "ADMIN",
        user: "dev"
      },
      exp: now() + 999999999 // Expiración en el futuro lejano
    };
  }
  function setSession(payload){
    // AUTH DESHABILITADO: No hacer nada.
  }
  function clearSession(){
    // AUTH DESHABILITADO: No hacer nada.
  }

  // --- login público (mock o API) ---
  async function login(user, pass){
    // AUTH DESHABILITADO: No es necesario, pero devolvemos éxito para no romper flujos.
    return { ok: true, data: getSession() };
  }

  // --- UI: sincronizar/inyectar widgets de sesión ---
  function ensureAuthWidgets(options={}){
    const { injectIfMissing=false } = options;
    const hasBtn = document.querySelector("[data-auth-btn]");
    const hasBadge = document.querySelector("[data-auth-user]");
    if (hasBtn && hasBadge) return;

    if (!injectIfMissing) return;

    // intenta colocar a la derecha de la navbar
    const host =
      document.querySelector(".navbar .navbar-collapse") ||
      document.querySelector(".navbar .container") ||
      document.querySelector(".navbar");
    if (!host) return;

    const wrap = document.createElement("div");
    wrap.className = "ms-auto d-flex align-items-center gap-2 d-none"; // Oculto por defecto
    wrap.innerHTML = `
      <span class="text-light small" data-auth-user>Sin sesión</span>
      <button class="btn btn-sm btn-warning" type="button" data-auth-btn>Iniciar sesión</button>
    `;
    host.appendChild(wrap);
    // AUTH DESHABILITADO: Ocultar el contenedor.
    wrap.style.display = 'none';
  }

  function applyHeaderState(){
    const s = getSession();
    const btns = document.querySelectorAll("[data-auth-btn]");
    const badges = document.querySelectorAll("[data-auth-user]");

    btns.forEach(btn=>{
      // AUTH DESHABILITADO: Ocultar botones.
      btn.style.display = 'none';
    });

    badges.forEach(b=>{
      // AUTH DESHABILITADO: Ocultar badges.
      b.style.display = 'none';
    });
  }

  // Reaplica estado al volver de otra pestaña
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) applyHeaderState();
  });

  // --- Protección de enlaces (si por algo llegaran sin sesión) ---
  function protectNavLinks(){
    // AUTH DESHABILITADO: No proteger ningún enlace.
    return;
  }

  // --- API pública para vistas (no login) ---
  function bindUI(opts={ injectIfMissing:true }){
    ensureAuthWidgets(opts);
    applyHeaderState();
    protectNavLinks();
  }

  // --- Helper para redirigir a la home page ---
  function redirectToHome() {
    // Asume que la página principal es index.html en la raíz
    window.location.replace("index.html");
  }

  // --- Exponer helpers para login.html y vistas ---
  window.PollitoAuth = {
    // sesión
    getSession, setSession, clearSession,
    // login
    login,
    // navegación
    redirectToHome,
    LOGIN_PAGE,
    // UI en vistas
    bindUI
  };
})();