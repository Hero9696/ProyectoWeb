/* Autenticación global – app protegida con login separado */
(() => {
  const STORAGE_KEY = "pollito.session";
  const SESSION_TTL_MIN = 240;              // 4h
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
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      const s = JSON.parse(raw);
      if(!s?.exp || now() > s.exp){ localStorage.removeItem(STORAGE_KEY); return null; }
      return s;
    }catch{ return null; }
  }
  function setSession(payload){
    const exp = now() + SESSION_TTL_MIN*60*1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, exp }));
  }
  function clearSession(){ localStorage.removeItem(STORAGE_KEY); }

  // --- login público (mock o API) ---
  async function login(user, pass){
    if(!USE_MOCK){
      const res = await fetch(LOGIN_ENDPOINT, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ user, pass })
      });
      if(res.status === 401) return { ok:false, msg:"Usuario o contraseña incorrectos" };
      if(!res.ok) return { ok:false, msg:"Error de servidor" };
      const json = await res.json();
      if(!json?.ok) return { ok:false, msg: json?.msg || "Error" };
      return { ok:true, data:{ token: json.token, user: json.user } };
    }else{
      const f = MOCK_USERS.find(x=>x.user===user && x.pass===pass);
      if(!f) return { ok:false, msg:"Usuario o contraseña incorrectos" };
      return { ok:true, data:{ token:"demo-token", user:{ id:1, nombre:f.nombre, rol:f.rol, user:f.user } } };
    }
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
    wrap.className = "ms-auto d-flex align-items-center gap-2";
    wrap.innerHTML = `
      <span class="text-light small" data-auth-user>Sin sesión</span>
      <button class="btn btn-sm btn-warning" type="button" data-auth-btn>Iniciar sesión</button>
    `;
    host.appendChild(wrap);
  }

  function applyHeaderState(){
    const s = getSession();
    const btns = document.querySelectorAll("[data-auth-btn]");
    const badges = document.querySelectorAll("[data-auth-user]");

    btns.forEach(btn=>{
      btn.textContent = s ? "Cerrar sesión" : "Iniciar sesión";
      btn.dataset.mode = s ? "logout" : "login";
      btn.onclick = () => {
        if(getSession()){
          clearSession();
          // al cerrar sesión, volver al login para no dejar fugas
          location.replace("./login.html");
        }else{
          location.replace("./login.html");
        }
      };
    });

    badges.forEach(b=>{
      const u = s?.user;
      b.textContent = s ? `${u?.nombre ?? u?.user ?? "Usuario"} (${u?.rol ?? "?"})` : "Sin sesión";
    });
  }

  // Reaplica estado al volver de otra pestaña
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) applyHeaderState();
  });

  // --- Protección de enlaces (si por algo llegaran sin sesión) ---
  function protectNavLinks(){
    document.querySelectorAll("a[href]").forEach(a=>{
      if(!a.hasAttribute("data-skip-auth")){
        a.addEventListener("click", (e)=>{
          if(!getSession()){ e.preventDefault(); location.replace("./login.html"); }
        });
      }
    });
  }

  // --- API pública para vistas (no login) ---
  function bindUI(opts={ injectIfMissing:true }){
    ensureAuthWidgets(opts);
    applyHeaderState();
    protectNavLinks();
  }

  // --- Exponer helpers para login.html y vistas ---
  window.PollitoAuth = {
    // sesión
    getSession, setSession, clearSession,
    // login
    login,
    // UI en vistas
    bindUI
  };
})();