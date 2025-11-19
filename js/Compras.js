// js/Compras.js
(() => {
  'use strict';

  const API = "http://localhost:3000/api";

  // Helpers
  const $id = (id) => document.getElementById(id);

  // ==========================
  // Obtener usuario logueado
  // ==========================
function getLoggedUserId() {
  try {
    const s = window.PollitoAuth?.getSession?.();
    if (s && s.user && s.user.id) return s.user.id;

    if (window.PollitoAuth?.user?.idUsuario) {
      return window.PollitoAuth.user.idUsuario;
    }
  } catch (e) {
    console.warn('No se pudo obtener usuario logueado:', e);
  }
  // Fallback
  return 1;
}

  // ==========================
  // Calcular total automático
  // ==========================
  function calcularTotal() {
    const inpCant   = $id('cantidadCompra');
    const inpPrecio = $id('precioUnitario');
    const inpTotal  = $id('totalCompra');

    if (!inpCant || !inpPrecio || !inpTotal) return;

    const cant   = parseFloat(inpCant.value)   || 0;
    const precio = parseFloat(inpPrecio.value) || 0;
    const total  = cant * precio;

    inpTotal.value = total.toFixed(2);
  }

  // ==========================
  // Inicio
  // ==========================
  document.addEventListener('DOMContentLoaded', () => {

    const form      = $id('formCompra');
    const inpCant   = $id('cantidadCompra');
    const inpPrecio = $id('precioUnitario');
    const btnReset  = $id('btnReset');

    if (!form) {
      console.error('[Compras] No se encontró el formulario #formCompra');
      return;
    }

    // Inicializar total
    calcularTotal();

    // Eventos de cálculo
    if (inpCant)   inpCant.addEventListener('input', calcularTotal);
    if (inpPrecio) inpPrecio.addEventListener('input', calcularTotal);

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        setTimeout(() => {
          calcularTotal();
        }, 10);
      });
    }

    // Envío del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      form.classList.add('was-validated');

      if (!form.checkValidity()) {
        console.warn('[Compras] Formulario no válido');
        return;
      }

      const cantidadCompra = parseFloat($id('cantidadCompra').value) || 0;
      const precioUnitario = parseFloat($id('precioUnitario').value) || 0;
      const totalCompra    = cantidadCompra * precioUnitario;
          const idUsuario = getLoggedUserId();

      const payload = {
        idCajaCompra: 1,                  // siempre caja 1
        cantidadCompra,
        precioUnitario,
        totalCompra,
        idUsuarioIngresa: idUsuario // 👈 usuario logueado
        // fecha/hora NO se envían: el backend debe usar CURDATE()/CURTIME()
      };


      try {
        const resp = await fetch(`${API}/compras`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const text = await resp.text();
        let msg = text;
        try { msg = JSON.parse(text).message || msg; } catch {}

        if (!resp.ok) {
          throw new Error(msg || `HTTP ${resp.status}`);
        }

        alert('Compra registrada correctamente ✅');

        form.reset();
        form.classList.remove('was-validated');
        calcularTotal();
      } catch (err) {
        console.error('[Compras] Error al registrar compra:', err);
        alert('Error al registrar compra: ' + (err.message || 'Error desconocido'));
      }
    });
  });
})();
