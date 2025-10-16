// ===== Datos mock para cascada =====
const DATA = {
    paises: [{ id: 1, nombre: 'Guatemala' }],
    departamentos: {
        1: [
            { id: 101, nombre: 'Guatemala' },
            { id: 102, nombre: 'Sacatepéquez' },
            { id: 103, nombre: 'El Progreso' }
        ]
    },
    municipios: {
        101: [
            { id: 10101, nombre: 'Guatemala' },
            { id: 10102, nombre: 'Mixco' }
        ],
        102: [
            { id: 10201, nombre: 'Antigua Guatemala' }
        ],
        103: [
            { id: 10301, nombre: 'Guastatoya' }
        ]
    }
};

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

function fillSelect(select, items, placeholder = "Seleccione…") {
    select.innerHTML = `<option value="">${placeholder}</option>` +
        items.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('');
    select.disabled = false;
}

function setupCascada(scope) {
    const sPais = scope.querySelector('select[name="idPaisDonante"]');
    const sDepa = scope.querySelector('select[name="idDepartamentoDona"]');
    const sMuni = scope.querySelector('select[name="idMunicipioDona"]');

    // País
    fillSelect(sPais, DATA.paises);
    sPais.addEventListener('change', () => {
        sDepa.innerHTML = "";
        sDepa.disabled = true;
        sMuni.innerHTML = "";
        sMuni.disabled = true;
        const deps = DATA.departamentos[sPais.value] || [];
        fillSelect(sDepa, deps, "Departamento…");
    });

    // Departamento
    sDepa.addEventListener('change', () => {
        sMuni.innerHTML = "";
        sMuni.disabled = true;
        const munis = DATA.municipios[sDepa.value] || [];
        fillSelect(sMuni, munis, "Municipio…");
    });
}

// ===== Estado global =====
let DONANTE_ID = null;
let DONANTE_DATA = null;

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', function() {
    const formDonante = document.getElementById('formDonante');
    const formDonacion = document.getElementById('formDonacion');
    const btnValidarDonante = document.getElementById('btnValidarDonante');
    const btnVolverDonante = document.getElementById('btnVolverDonante');
    const btnLimpiarDonante = document.getElementById('btnLimpiarDonante');
    const btnCancelarTodo = document.getElementById('btnCancelarTodo');
    const donacionTabBtn = document.getElementById('donacion-tab');
    const step1Badge = document.getElementById('step1Badge');
    const step2Badge = document.getElementById('step2Badge');
    const donanteInfo = document.getElementById('donanteInfo');

    // Inicializar cascada y fechas
    setupCascada(document.getElementById('donante'));
    setNowDates(formDonante, 'fechaIngresoDona', 'horaIngresoDona');
    setNowDates(formDonante, 'fechaActualizacion', 'horaActualizacion');
    setNowDates(formDonacion, 'fechaIngreso', 'horaIngreso');
    setNowDates(formDonacion, 'fechaActualizacion', 'horaActualizacion');

    // Validar Donante
    btnValidarDonante.addEventListener('click', async function() {
        if (!validateForm(formDonante)) return;

        const donanteData = Object.fromEntries(new FormData(formDonante));
        DONANTE_DATA = donanteData;

        // 🔗 Simular creación en backend
        // const res = await fetch('/api/donantes', { 
        //     method: 'POST', 
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(donanteData)
        // });
        // const created = await res.json();
        // DONANTE_ID = created.idDonador;

        DONANTE_ID = Math.floor(Math.random() * 9000) + 1000; // Demo

        // Mostrar info del donante
        const nombreCompleto = `${donanteData.nombre1Donante} ${donanteData.apellido1Donante}`;
        donanteInfo.textContent = `${nombreCompleto} (ID: ${DONANTE_ID})`;

        // Habilitar siguiente paso
        donacionTabBtn.classList.remove('disabled');
        donacionTabBtn.removeAttribute('tabindex');
        step2Badge.classList.remove('disabled');
        step2Badge.style.background = 'var(--amarillo)';
        step2Badge.style.borderColor = 'var(--azul)';

        // Ir a pestaña de donación
        const tab = new bootstrap.Tab(donacionTabBtn);
        tab.show();

        // Bloquear formulario de donante
        [...formDonante.elements].forEach(el => el.disabled = true);
        btnValidarDonante.disabled = true;
    });

    // Volver a donante
    btnVolverDonante.addEventListener('click', function() {
        const donanteTabBtn = document.getElementById('donante-tab');
        const tab = new bootstrap.Tab(donanteTabBtn);
        tab.show();
    });

    // Guardar Donación
    formDonacion.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm(formDonacion)) return;

        if (!DONANTE_ID) {
            alert('Primero debe validar el donante.');
            return;
        }

        const donacionData = Object.fromEntries(new FormData(formDonacion));
        donacionData.idDonador = DONANTE_ID;

        // 🔗 Envío al backend
        console.log('DONACIÓN A GUARDAR:', donacionData);
        console.log('DONANTE ASOCIADO:', DONANTE_DATA);

        // Simular envío exitoso
        alert('Donación registrada exitosamente (demo). Ver consola para detalles.');

        // Aquí también se actualizarían Caja y TransaccionesCaja
        console.log('ACTUALIZAR CAJA con monto:', donacionData.montoDonado);
        console.log('CREAR TRANSACCIÓN EN CAJA para donación');

        // Limpiar todo después de guardar
        btnCancelarTodo.click();
    });

    // Limpiar formulario donante
    btnLimpiarDonante.addEventListener('click', function() {
        formDonante.reset();
        formDonante.classList.remove('was-validated');
        setupCascada(document.getElementById('donante'));
        setNowDates(formDonante, 'fechaIngresoDona', 'horaIngresoDona');
        setNowDates(formDonante, 'fechaActualizacion', 'horaActualizacion');
    });

    // Cancelar todo
    btnCancelarTodo.addEventListener('click', function() {
        formDonante.reset();
        formDonacion.reset();
        formDonante.classList.remove('was-validated');
        formDonacion.classList.remove('was-validated');
        
        // Resetear estado
        DONANTE_ID = null;
        DONANTE_DATA = null;
        
        // Resetear UI
        donacionTabBtn.classList.add('disabled');
        donacionTabBtn.setAttribute('tabindex', '-1');
        document.getElementById('donante-tab').click();
        step2Badge.classList.add('disabled');
        donanteInfo.textContent = '-';
        
        // Habilitar formulario donante
        [...formDonante.elements].forEach(el => el.disabled = false);
        btnValidarDonante.disabled = false;
        
        // Reinicializar
        setupCascada(document.getElementById('donante'));
        setNowDates(formDonante, 'fechaIngresoDona', 'horaIngresoDona');
        setNowDates(formDonante, 'fechaActualizacion', 'horaActualizacion');
        setNowDates(formDonacion, 'fechaIngreso', 'horaIngreso');
        setNowDates(formDonacion, 'fechaActualizacion', 'horaActualizacion');
    });
});