// js/dirige.js

document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("loginForm");
  const userI = document.getElementById("user");
  const passI = document.getElementById("pass");

  if (!form) {
    console.error("No se encontró el formulario #loginForm");
    return;
  }

  // Si ya hay sesión activa, manda directo al home
  if (window.PollitoAuth && typeof window.PollitoAuth.getSession === "function") {
    const currentSession = window.PollitoAuth.getSession();
    if (currentSession) {
      console.log("Sesión ya existente, redirigiendo al home...");
      window.PollitoAuth.redirectToHome();
      return;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // IMPIDE recarga de página

    const username = userI.value.trim();
    const password = passI.value.trim();

    if (!username || !password) {
      alert("Debes ingresar usuario y contraseña.");
      return;
    }

    console.log("Enviando login con:", { username });

    const res = await window.PollitoAuth.login(username, password);

    console.log("Resultado login:", res);

    if (!res.ok) {
      alert(res.error || "No se pudo iniciar sesión.");
      return;
    }

    // Login correcto → redirigir al home
    window.PollitoAuth.redirectToHome();
  });
});
