// ===== Datos para demostración (inicialmente vacío, se llenará desde la API) =====
const DATA = {
    beneficiarios: []
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

async function fetchBeneficiarios() {
    try {
        const response = await fetch('http://localhost:3000/api/beneficiarios');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const beneficiarios = await response.json();
        DATA.beneficiarios = beneficiarios; // Actualizar los datos globales
        const selectBeneficiario = document.querySelector('select[name="idBeneficiarioVenta"]');
        selectBeneficiario.innerHTML = '<option value="">Seleccione beneficiario...</option>'; // Limpiar opciones existentes
        DATA.beneficiarios.forEach(bene => {
            const option = document.createElement('option');
            option.value = bene.idBeneficiario; // Asegúrate de que el campo sea idBeneficiario
            option.textContent = bene.nombreCompleto;
            selectBeneficiario.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar beneficiarios:', error);
        alert('No se pudieron cargar los beneficiarios. Intente de nuevo más tarde.');
    }
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
    fetchBeneficiarios(); // Llama a la función para cargar beneficiarios

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
        } else {
            document.getElementById('subtotalCalculado').value = "0.00";
            document.getElementById('montoCaja').textContent = "0.00";
            document.getElementById('montoInventario').textContent = "0.00";
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
        ventaData.detalles = DETALLES_VENTA.map(det => ({
            cantidad: det.cantidad,
            valorUnidad: det.valorUnidad,
            subtotal: det.subtotal
        }));

        try {
            const response = await fetch('http://localhost:3000/api/ventas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ventaData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la venta.');
            }

            alert(result.message || 'Venta guardada exitosamente.');
            
            // Limpiar todo después de guardar
            btnCancelarTodo.click();
        } catch (error) {
            console.error('Error al guardar la venta:', error);
            alert(`Error al guardar la venta: ${error.message}`);
        }
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