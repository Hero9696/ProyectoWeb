// /js/index.js — navegación directa a las vistas
document.addEventListener('DOMContentLoaded', () => {
  const go = (id, href) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
      // opcional: permitir click medio/ctrl+click abriendo en nueva pestaña
      if (e.ctrlKey || e.metaKey || e.button === 1) return;
      e.preventDefault();
      window.location.assign(href);
    });
  };

  go('btnVistaBeneficiarios', './VistaBeneficiarios.html');
  go('btnVistaEncargado',     './VistaEncargado.html');
  go('btnVistaDonaciones',    './VistaDonaciones.html');
});
