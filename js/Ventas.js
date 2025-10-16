// ===== Datos mock para demostración =====
const DATA = {
    beneficiarios: [
        { id: 1, nombre: 'Juan Pérez García' },
        { id: 2, nombre: 'María López Hernández' },
        { id: 3, nombre: 'Carlos Ramírez Santos' }
    ]
};

// ===== Estado global =====
let DETALLES_VENTA = [];
let TOTAL_VENTA = 0;
let TOTAL_CAJA = 0;
let TOTAL_INVENTARIO = 0;

// ===== Utilidades =====
function setNowDates(formEl, fechaName, horaName) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const II = String(now.getMinutes()).padStart(2, '0');
    formEl.querySelector(`[name="${fechaName}"]`).value ||= `${yyyy}-${mm}-${dd}`;
    formEl.querySelector(`[name="${horaName}"]`).value ||= `${HH}:${II}`;
}

function validateForm(form) {
    const ok = form.checkValidity();
    form.classList.add('was-validated');
    return ok;
}

function calcularDistribucion(cantidad, valorUnidad) {
    const subtotal = cantidad * valorUnidad;
    
    // Lógica: Q40 por cada 6 pollitos van a Caja
    const gruposDeSeis = Math.floor(cantidad / 6);
    const montoCaja = gruposDeSeis * 40;
    const montoInventario = subtotal - montoCaja;
    
    return { subtotal, montoCaja, montoInventario };
}

function actualizarTotales() {
    TOTAL_VENTA = DETALLES_VENTA.reduce((sum, det) => sum + det.subtotal, 0);
    TOTAL_CAJA = DETALLES_VENTA.reduce((sum, det) => sum + det.montoCaja, 0);
    TOTAL_INVENTARIO = DETALLES_VENTA.reduce((sum, det) => sum + det.montoInventario, 0);
    
    document.getElementById('totalVenta').textContent = `Q ${TOTAL_VENTA.toFixed(2)}`;
    document.getElementById('totalCaja').textContent = `Q ${TOTAL_CAJA.toFixed(2)}`;
    document.getElementById('totalInventario').textContent = `Q ${TOTAL_INVENTARIO.toFixed(2)}`;
    
    // Habilitar guardar si hay detalles
    document.getElementById('btnGuardarVenta').disabled = DETALLES_VENTA.length === 0;
}

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', function() {
    const formVenta = document.getElementById('formVenta');
    const formDetalle = document.getElementById('formDetalleVenta');
    const selectBeneficiario = document.querySelector('select[name="idBeneficiarioVenta"]');
    const btnAgregarDetalle = document.getElementById('btnAgregarDetalle');
    const btnGuardarVenta = document.getElementById('btnGuardarVenta');
    const btnCancelarTodo = document.getElementById('btnCancelarTodo');
    const btnLimpiarDetalle = document.getElementById('btnLimpiarDetalle');
    const tablaDetalles = document.querySelector('#tablaDetalles tbody');

    // Llenar select de beneficiarios
    DATA.beneficiarios.forEach(bene => {
        const option = document.createElement('option');
        option.value = bene.id;
        option.textContent = bene.nombre;
        selectBeneficiario.appendChild(option);
    });

    // Fechas automáticas
    setNowDates(formVenta, 'fechaVenta', 'horaVenta');

    // Cálculo en tiempo real del detalle
    const inputCantidad = document.querySelector('input[name="cantidad"]');
    const inputValorUnidad = document.querySelector('input[name="valorUnidad"]');
    
    function actualizarCalculo() {
        const cantidad = parseInt(inputCantidad.value) || 0;
        const valorUnidad = parseFloat(inputValorUnidad.value) || 0;
        
        if (cantidad > 0 && valorUnidad > 0) {
            const { subtotal, montoCaja, montoInventario } = calcularDistribucion(cantidad, valorUnidad);
            
            document.getElementById('subtotalCalculado').value = subtotal.toFixed(2);
            document.getElementById('montoCaja').textContent = montoCaja.toFixed(2);
            document.getElementById('montoInventario').textContent = montoInventario.toFixed(2);
        }
    }

    inputCantidad.addEventListener('input', actualizarCalculo);
    inputValorUnidad.addEventListener('input', actualizarCalculo);

    // Agregar detalle a la venta
    btnAgregarDetalle.addEventListener('click', function() {
        if (!validateForm(formDetalle)) return;
        if (!validateForm(formVenta)) {
            alert('Primero complete los datos principales de la venta.');
            return;
        }

        const cantidad = parseInt(inputCantidad.value);
        const valorUnidad = parseFloat(inputValorUnidad.value);
        const { subtotal, montoCaja, montoInventario } = calcularDistribucion(cantidad, valorUnidad);

        const detalle = {
            cantidad,
            valorUnidad,
            subtotal,
            montoCaja,
            montoInventario
        };

        DETALLES_VENTA.push(detalle);

        // Agregar a tabla
        const idx = DETALLES_VENTA.length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx}</td>
            <td>${cantidad}</td>
            <td>Q ${valorUnidad.toFixed(2)}</td>
            <td>Q ${subtotal.toFixed(2)}</td>
            <td>Q ${montoCaja.toFixed(2)}</td>
            <td>Q ${montoInventario.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-outline-danger" data-rm="${idx-1}">Quitar</button></td>
        `;
        tablaDetalles.appendChild(tr);

        actualizarTotales();
        formDetalle.reset();
        actualizarCalculo(); // Resetear cálculos
    });

    // Quitar detalle
    tablaDetalles.addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-rm]');
        if (!btn) return;
        
        const index = parseInt(btn.dataset.rm);
        DETALLES_VENTA.splice(index, 1);
        
        // Re-renderizar tabla
        tablaDetalles.innerHTML = '';
        DETALLES_VENTA.forEach((det, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${det.cantidad}</td>
                <td>Q ${det.valorUnidad.toFixed(2)}</td>
                <td>Q ${det.subtotal.toFixed(2)}</td>
                <td>Q ${det.montoCaja.toFixed(2)}</td>
                <td>Q ${det.montoInventario.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-outline-danger" data-rm="${idx}">Quitar</button></td>
            `;
            tablaDetalles.appendChild(tr);
        });
        
        actualizarTotales();
    });

    // Guardar venta completa
    btnGuardarVenta.addEventListener('click', async function() {
        if (DETALLES_VENTA.length === 0) {
            alert('Agregue al menos un detalle de venta.');
            return;
        }

        if (!validateForm(formVenta)) {
            alert('Complete los datos principales de la venta.');
            return;
        }

        const ventaData = Object.fromEntries(new FormData(formVenta));
        ventaData.TotalVenta = TOTAL_VENTA;

        // 🔗 Aquí iría el envío al backend
        console.log('VENTA PRINCIPAL:', ventaData);
        console.log('DETALLES:', DETALLES_VENTA);
        console.log('DISTRIBUCIÓN - Caja:', TOTAL_CAJA, 'Inventario:', TOTAL_INVENTARIO);

        // Simular envío exitoso
        alert('Venta guardada exitosamente (demo). Ver consola para detalles.');
        
        // Limpiar todo después de guardar
        btnCancelarTodo.click();
    });

    // Limpiar detalle individual
    btnLimpiarDetalle.addEventListener('click', function() {
        formDetalle.reset();
        actualizarCalculo();
    });

    // Cancelar todo
    btnCancelarTodo.addEventListener('click', function() {
        formVenta.reset();
        formDetalle.reset();
        formVenta.classList.remove('was-validated');
        formDetalle.classList.remove('was-validated');
        DETALLES_VENTA = [];
        tablaDetalles.innerHTML = '';
        actualizarTotales();
        setNowDates(formVenta, 'fechaVenta', 'horaVenta');
        actualizarCalculo();
    });

    // Inicializar cálculo
    actualizarCalculo();
});