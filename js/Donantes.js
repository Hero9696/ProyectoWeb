// ===== Datos para cascada (inicialmente vacío, se llenará desde la API) =====
const DATA = {
    paises: [],
    departamentos: {},
    municipios: {}
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

async function fetchPaises() {
    try {
        const response = await fetch('http://localhost:3000/api/paises');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const paisesData = await response.json();
        DATA.paises = paisesData.map(p => ({ id: p.idPais, nombre: p.nombrePais }));
    } catch (error) {
        console.error('Error al cargar países:', error);
        alert('No se pudieron cargar los países.');
    }
}

async function fetchDepartamentos() {
    try {
        const response = await fetch('http://localhost:3000/api/departamentos');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const deps = await response.json();
        DATA.departamentos = deps.reduce((acc, dep) => {
            if (!acc[dep.idPaisDepa]) acc[dep.idPaisDepa] = [];
            acc[dep.idPaisDepa].push({ id: dep.idDepartamento, nombre: dep.nombreDepartamento });
            return acc;
        }, {});
    } catch (error) {
        console.error('Error al cargar departamentos:', error);
        alert('No se pudieron cargar los departamentos.');
    }
}

async function fetchMunicipios() {
    try {
        const response = await fetch('http://localhost:3000/api/municipios');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const munis = await response.json();
        DATA.municipios = munis.reduce((acc, muni) => {
            if (!acc[muni.idDepartamentoMuni]) acc[muni.idDepartamentoMuni] = [];
            acc[muni.idDepartamentoMuni].push({ id: muni.idMunicipio, nombre: muni.nombreMunicipio });
            return acc;
        }, {});
    } catch (error) {
        console.error('Error al cargar municipios:', error);
        alert('No se pudieron cargar los municipios.');
    }
}

function fillSelect(select, items, placeholder = "Seleccione…") {
    select.innerHTML = `<option value="">${placeholder}</option>` +
        items.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('');
    select.disabled = false;
}

async function setupCascada(scope) {
    const sPais = scope.querySelector('select[name="idPaisDonante"]');
    const sDepa = scope.querySelector('select[name="idDepartamentoDona"]');
    const sMuni = scope.querySelector('select[name="idMunicipioDona"]');

    await fetchPaises();
    fillSelect(sPais, DATA.paises);

    sPais.addEventListener('change', async () => {
        sDepa.innerHTML = "";
        sDepa.disabled = true;
        sMuni.innerHTML = "";
        sMuni.disabled = true;
        if (sPais.value) {
            await fetchDepartamentos();
            const deps = DATA.departamentos[sPais.value] || [];
            fillSelect(sDepa, deps, "Departamento…");
        }
    });

    sDepa.addEventListener('change', async () => {
        sMuni.innerHTML = "";
        sMuni.disabled = true;
        if (sDepa.value) {
            await fetchMunicipios();
            const munis = DATA.municipios[sDepa.value] || [];
            fillSelect(sMuni, munis, "Municipio…");
        }
    });
}

// ===== Estado global =====
let DONANTE_ID = null;
let DONANTE_DATA = null;

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', async function() {
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
    await setupCascada(document.getElementById('donante'));
    setNowDates(formDonante, 'fechaIngresoDona', 'horaIngresoDona');
    setNowDates(formDonante, 'fechaActualizacion', 'horaActualizacion');
    setNowDates(formDonacion, 'fechaIngreso', 'horaIngreso');
    setNowDates(formDonacion, 'fechaActualizacion', 'horaActualizacion');

    // Validar Donante
    btnValidarDonante.addEventListener('click', async function() {
        if (!validateForm(formDonante)) return;

        const donanteData = Object.fromEntries(new FormData(formDonante));
        DONANTE_DATA = donanteData;

        try {
            const response = await fetch('http://localhost:3000/api/donantes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(donanteData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al crear el donante.');
            }

            DONANTE_ID = result.idDonador; // Asumiendo que el backend devuelve idDonador

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

        } catch (error) {
            console.error('Error al crear donante:', error);
            alert(`Error al crear donante: ${error.message}`);
        }
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
        donacionData.idUsuarioIngreso = donacionData.idUsuarioIngreso || 1; // Default a 1 si no se especifica

        try {
            // 1. Registrar Donación
            const donacionResponse = await fetch('http://localhost:3000/api/donaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idDonador: donacionData.idDonador,
                    montoDonado: parseFloat(donacionData.montoDonado),
                    idUsuarioIngreso: parseInt(donacionData.idUsuarioIngreso)
                })
            });

            const donacionResult = await donacionResponse.json();

            if (!donacionResponse.ok) {
                throw new Error(donacionResult.message || 'Error al registrar la donación.');
            }

            // 2. Actualizar Caja y registrar Transacción de Caja
            const cajaMovimientoData = {
                montoTrx: parseFloat(donacionData.montoDonado),
                idTipoTrx: 1, // Asumiendo que 1 es el ID para 'Ingreso por Donación'
                descripcionTrx: `Donación de ${DONANTE_DATA.nombre1Donante} ${DONANTE_DATA.apellido1Donante} (ID: ${DONANTE_ID})`,
                idUsuarioIngreso: parseInt(donacionData.idUsuarioIngreso)
            };

            const cajaResponse = await fetch('http://localhost:3000/api/caja/movimiento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cajaMovimientoData)
            });

            const cajaResult = await cajaResponse.json();

            if (!cajaResponse.ok) {
                throw new Error(cajaResult.message || 'Error al actualizar la caja.');
            }

            alert('Donación registrada y caja actualizada exitosamente.');
            
            // Limpiar todo después de guardar
            btnCancelarTodo.click();

        } catch (error) {
            console.error('Error en la transacción de donación:', error);
            alert(`Error en la transacción de donación: ${error.message}`);
        }
    });

    // Limpiar formulario donante
    btnLimpiarDonante.addEventListener('click', function() {
        formDonante.reset();
        formDonante.classList.remove('was-validated');
        // Re-inicializar cascada y fechas
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