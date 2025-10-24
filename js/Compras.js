// Archivo: js/Compras.js

const API_BASE = 'http://localhost:3000/api'; // URL base de la API (aún en construcción)

// ************************************************************
// FUNCIÓN DE UTILIDAD (Auto-Sellado de Fecha/Hora)
// ************************************************************
function obtenerFechaHoraActual() {
    const ahora = new Date();
    
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    const fecha = `${year}-${month}-${day}`;
    
    const hours = String(ahora.getHours()).padStart(2, '0');
    const minutes = String(ahora.getMinutes()).padStart(2, '0');
    const seconds = String(ahora.getSeconds()).padStart(2, '0');
    const hora = `${hours}:${minutes}:${seconds}`;

    // Usamos HH:MM para el input type="time"
    return { fecha, hora: hora.substring(0, 5) }; 
}

// ************************************************************
// LÓGICA PRINCIPAL (Ejemplo de Llenado)
// ************************************************************

function inicializarFormulario() {
    // 1. AUTO-SELLADO DE CAMPOS DE AUDITORÍA (FECHA/HORA)
    const { fecha, hora } = obtenerFechaHoraActual();
    document.getElementById('fechaCompra').value = fecha;
    document.getElementById('horaCompra').value = hora;
    
    console.log("Formulario de Compras inicializado.");
    console.log(`Fecha de Auditoría: ${fecha} Hora: ${hora}`);
}

async function registrarCompra(e) {
    e.preventDefault();
    const form = e.target;
    
    // 1. Mapeo de datos del formulario a un objeto JSON
    const data = {
        "idCajaCompra": parseInt(form.idCajaCompra.value) || 0,
        "cantidadCompra": parseFloat(form.cantidadCompra.value) || 0,
        "totalCompra": parseFloat(form.totalCompra.value).toFixed(2) || "0.00", // Aseguramos 2 decimales
        "fechaCompra": form.fechaCompra.value,
        "horaCompra": form.horaCompra.value,
        "idUsuarioIngresa": parseInt(form.idUsuarioIngresa.value) || 0
    };
    
    // **NOTA PARA EL PROGRAMADOR:** // Aquí es donde se haría la llamada fetch/POST a la API:
    /*
    try {
        const response = await fetch(`${API_BASE}/compras`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al registrar la compra.');
        
        alert("✅ Compra registrada con éxito.");
        form.reset();
        inicializarFormulario(); // Re-sellar fecha/hora
        
    } catch (error) {
        alert("Error de API: La compra no pudo ser registrada. Consulte la consola.");
        console.error("Error en el registro:", error);
    }
    */
    
    // MUESTRA DE DATOS DE EJEMPLO (Sin API)
    console.log("=========================================");
    console.log("SIMULACIÓN DE ENVÍO DE DATOS DE COMPRA:");
    console.log("=========================================");
    console.table(data);
    alert("Datos listos para enviar (ver consola). La API no está implementada.");
    
    // Opcional: Resetear fecha/hora para la siguiente entrada
    inicializarFormulario();
}


// ************************************************************
// ENLACE DE EVENTOS AL DOM
// ************************************************************
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el formulario al cargar la página (auto-sellar fecha/hora)
    inicializarFormulario(); 
    
    // Enlazar la función al evento submit del formulario
    const form = document.getElementById('formCompra');
    if (form) {
        form.addEventListener('submit', registrarCompra);
    }
});