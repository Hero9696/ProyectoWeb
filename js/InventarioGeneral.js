(() => {
  "use strict";

  const API = "http://localhost:3000/api";
  const $ = (s, c = document) => c.querySelector(s);

  function fmtFechaHora(f, h) {
    if (!f && !h) return "";
    return `${f || ""} ${h || ""}`.trim();
  }

  async function cargarInventario() {
    const tbody = $("#tbodyInventario");

    const lblActual = $("#invCantidadActual");
    const lblUltimo = $("#invUltimoIngreso");
    const lblFecha = $("#invFechaIngreso");
    const lblHora = $("#invHoraIngreso");

    try {
      const r = await fetch(`${API}/inventario-general`);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const lista = await r.json();

      if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay registros.</td></tr>`;
        return;
      }

      const ultimo = lista[0];

      // Tarjetas estilo Caja
      lblActual.textContent = ultimo.cantidadActual;
      lblUltimo.textContent = ultimo.ultimaCantidadIngre;
      lblFecha.textContent = ultimo.fechaIngreso;
      lblHora.textContent = ultimo.horaIngreso;

      // Tabla
      tbody.innerHTML = lista
        .map((inv, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${inv.cantidadActual}</td>
            <td>${inv.ultimaCantidadIngre}</td>
            <td>${fmtFechaHora(inv.fechaIngreso, inv.horaIngreso)}</td>
            <td>${fmtFechaHora(inv.fechaActualizacion, inv.horaActualizacion)}</td>
            <td>${inv.usuarioIngresoNombre}</td>
            <td>${inv.usuarioActualizaNombre}</td>
          </tr>
        `)
        .join("");

    } catch (e) {
      console.error("Error InventarioGeneral:", e);
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error al cargar inventario.</td></tr>`;
    }
  }

  document.addEventListener("DOMContentLoaded", cargarInventario);
})();
