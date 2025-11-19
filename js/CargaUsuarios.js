document.addEventListener("DOMContentLoaded", () => {
  if (!window.PollitoAuth) return;

  // Intentar varias veces hasta que el navbar (data-auth-user) exista
  const tryBind = () => {
    window.PollitoAuth.bindUI({ injectIfMissing: false });

    const hasBadge = document.querySelector("[data-auth-user]");
    if (!hasBadge) {
      // Si aún no existe, lo volvemos a intentar en un ratito
      setTimeout(tryBind, 150);
    } else {
      // 👇👇 AQUÍ: cuando ya hay badge, normalmente ya tenemos al usuario cargado
      const user = window.PollitoAuth.user;
      const inputUsr = document.querySelector('input[name="idUsuarioIngresa"]');

      if (inputUsr && user) {
        // Ajusta el nombre de la propiedad según cómo venga tu user:
        // prueba primero idUsuario, si no, id, etc.
        const id =
          user.idUsuario ??
          user.id ??
          user.idUsuarioIngresa ??
          user.idUsuarioLogin;

        if (id) {
          inputUsr.value = id;
        } else {
          console.warn("Usuario autenticado no trae un ID claro:", user);
        }
      }
    }
  };

  tryBind();
});
