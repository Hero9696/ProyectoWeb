// js/caja.js

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api'; // Asume que tu API corre en este puerto

    const saldoActualElem = document.getElementById('saldoActual');
    const ingresosHoyElem = document.getElementById('ingresosHoy');
    const egresosHoyElem = document.getElementById('egresosHoy');
    const tablaMovimientosBody = document.getElementById('tablaMovimientos');

    // Función para formatear montos a moneda
    const formatCurrency = (amount) => {
        return `Q ${parseFloat(amount).toFixed(2)}`;
    };

    // Cargar Saldo Actual
    const loadCajaStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/caja/estado`);
            const data = await response.json();
            if (response.ok) {
                saldoActualElem.textContent = formatCurrency(data.montoTotal);
            } else {
                console.error('Error al cargar saldo actual:', data.message);
                saldoActualElem.textContent = 'Error';
            }
        } catch (error) {
            console.error('Error de red al cargar saldo actual:', error);
            saldoActualElem.textContent = 'Error';
        }
    };

    // Cargar Resumen Diario
    const loadDailySummary = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/caja/resumen-diario`);
            const data = await response.json();
            if (response.ok) {
                ingresosHoyElem.textContent = `+ ${formatCurrency(data.ingresosHoy)}`;
                egresosHoyElem.textContent = `- ${formatCurrency(Math.abs(data.egresosHoy))}`;
            } else {
                console.error('Error al cargar resumen diario:', data.message);
                ingresosHoyElem.textContent = 'Error';
                egresosHoyElem.textContent = 'Error';
            }
        } catch (error) {
            console.error('Error de red al cargar resumen diario:', error);
            ingresosHoyElem.textContent = 'Error';
            egresosHoyElem.textContent = 'Error';
        }
    };

    // Cargar Últimos Movimientos
    const loadLatestTransactions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/caja/ultimos-movimientos?limit=5`); // Limite a 5 movimientos
            const data = await response.json();
            if (response.ok) {
                tablaMovimientosBody.innerHTML = ''; // Limpiar tabla
                if (data.length === 0) {
                    tablaMovimientosBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay movimientos recientes.</td></tr>';
                    return;
                }
                data.forEach(trx => {
                    const row = document.createElement('tr');
                    const montoClass = trx.montoTrx > 0 ? 'text-success' : 'text-danger';
                    const tipoBadgeClass = trx.montoTrx > 0 ? 'bg-success' : 'bg-danger';
                    const signo = trx.montoTrx > 0 ? '+' : '';

                    row.innerHTML = `
                        <td>${trx.fechaIngreso} ${trx.horaIngreso}</td>
                        <td><span class="badge ${tipoBadgeClass}">${trx.tipoTransaccion}</span></td>
                        <td>${trx.descripcionTrx}</td>
                        <td class="text-end ${montoClass} fw-bold">${signo} ${formatCurrency(trx.montoTrx)}</td>
                    `;
                    tablaMovimientosBody.appendChild(row);
                });
            } else {
                console.error('Error al cargar últimos movimientos:', data.message);
                tablaMovimientosBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar movimientos.</td></tr>';
            }
        } catch (error) {
            console.error('Error de red al cargar últimos movimientos:', error);
            tablaMovimientosBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error de red.</td></tr>';
        }
    };

    // Cargar todos los datos al iniciar la página
    loadCajaStatus();
    loadDailySummary();
    loadLatestTransactions();
});