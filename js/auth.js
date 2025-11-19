/* Autenticación global – app protegida con login separado */
(() => {
  const STORAGE_KEY     = "pollito.session.v2";
  const SESSION_TTL_MIN = 240;                 // 4 horas
  const LOGIN_PAGE      = "../view/login.html";   // Ajusta si tu ruta es distinta

  // ======= PORT DEL BACKEND =========
  // Debe coincidir con process.env.PORT o el valor por defecto de server.js
  const API_PORT  = 3000;                      // <-- si tu .env tiene PORT=3307, pon 3307 aquí
  const API_BASE  = `http://localhost:${API_PORT}`;
  const LOGIN_ENDPOINT = `${API_BASE}/api/auth/login`;
  // ==================================

  const now = () => Date.now();

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getSession() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const s = JSON.parse(raw);
      if (!s.exp || s.exp < now()) {
        clearSession();
        return null;
      }
      return s;
    } catch (e) {
      clearSession();
      return null;
    }
  }

  function setSession(payload) {
    const { accessToken, refreshToken, user } = payload;

    const session = {
      token: accessToken,
      refreshToken,
      user: {
        id:       user.idUsuario,
        nombre:   user.nombreUsuario,
        rol:      user.idRol,
        username: user.nombreUsuario
      },
      exp: now() + SESSION_TTL_MIN * 60 * 1000
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  // --- login contra tu backend ---
  async function login(username, password) {
    username = (username || "").trim();

    if (!username || !password) {
      return { ok: false, error: "Usuario y contraseña son obligatorios." };
    }

    try {


      const resp = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreUsuario: username,
          contrasena:    password
        })
      });


      const rawText = await resp.text();

      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        console.warn("No se pudo parsear JSON de login:", e);
      }

      if (!resp.ok) {
        return {
          ok: false,
          error: data?.message || `Error al iniciar sesión (HTTP ${resp.status}).`
        };
      }

      if (!data || !data.accessToken || !data.user) {
        return { ok: false, error: "Respuesta inválida del servidor de autenticación." };
      }

      const session = setSession(data); // guarda idUsuario, rol, etc.
      return { ok: true, data: session };

    } catch (e) {
      console.error("Error REAL en fetch login:", e);
      return { ok: false, error: `No se pudo conectar con el servidor: ${e.message}` };
    }
  }


  function ensureAuthWidgets(options = {}) {
    const { injectIfMissing = false } = options;
    const hasBtn   = document.querySelector("[data-auth-btn]");
    const hasBadge = document.querySelector("[data-auth-user]");
    if (hasBtn && hasBadge) return;

    if (!injectIfMissing) return;

    const host =
      document.querySelector(".navbar .navbar-collapse") ||
      document.querySelector(".navbar .container") ||
      document.querySelector(".navbar");
    if (!host) return;

    const wrap = document.createElement("div");
    wrap.className = "ms-auto d-flex align-items-center gap-2";
    wrap.innerHTML = `
      <span class="text-light small d-none" data-auth-user>Sin sesión</span>
      <button class="btn btn-sm btn-warning" type="button" data-auth-btn>Iniciar sesión</button>
    `;
    host.appendChild(wrap);
  }

  function applyHeaderState() {
    const s      = getSession();
    const btns   = document.querySelectorAll("[data-auth-btn]");
    const badges = document.querySelectorAll("[data-auth-user]");

    btns.forEach(btn => {
      if (!s) {
        btn.textContent = "Iniciar sesión";
        btn.onclick = () => { window.location.href = LOGIN_PAGE; };
      } else {
        btn.textContent = "Cerrar sesión";
        btn.onclick = () => {
          clearSession();
          window.location.href = LOGIN_PAGE;
        };
      }
    });

    badges.forEach(b => {
      if (!s) {
        b.classList.remove("d-none");
        b.textContent = "Sin sesión";
      } else {
        b.classList.remove("d-none");
        b.textContent = `${s.user.nombre}`;
      }
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) applyHeaderState();
  });

  function protectNavLinks() {
    const s    = getSession();
    const path = location.pathname;
    const isLogin =
      path.endsWith("login.html") ||
      path.endsWith("/login") ||
      path.endsWith("/view/login.html");

    if (!s && !isLogin) {
      window.location.replace(LOGIN_PAGE);
    }
  }

  function bindUI(opts = { injectIfMissing: true }) {
    ensureAuthWidgets(opts);
    applyHeaderState();
    protectNavLinks();
  }

  function redirectToHome() {
    window.location.replace("/index.html");
  }

  window.PollitoAuth = {
    getSession,
    setSession,
    clearSession,
    login,
    redirectToHome,
    LOGIN_PAGE,
    bindUI
  };
})();
