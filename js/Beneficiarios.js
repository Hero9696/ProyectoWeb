    // ===== utilidades =====
    function setNowDates(formEl, fechaName, horaName){
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth()+1).padStart(2,'0');
      const dd = String(now.getDate()).padStart(2,'0');
      const HH = String(now.getHours()).padStart(2,'0');
      const II = String(now.getMinutes()).padStart(2,'0');
      formEl.querySelector(`[name="${fechaName}"]`).value ||= `${yyyy}-${mm}-${dd}`;
      formEl.querySelector(`[name="${horaName}"]`).value ||= `${HH}:${II}`;
    }

    function validateForm(form){
      // HTML5 constraint validation + marcar campos
      let ok = form.checkValidity();
      form.classList.add('was-validated');
      return ok;
    }

    // ===== datos de selects (placeholder para cascada) =====
    // Sustituye por fetch a tu API. Ejemplo mínimo para Guatemala.
    const DATA = {
      paises: [{id: 1, nombre: "Guatemala"}],
      departamentos: { 1: [
        {id: 101, nombre: "Guatemala"},
        {id: 102, nombre: "Sacatepéquez"},
        {id: 103, nombre: "El Progreso"}
      ]},
      municipios: {
        101: [{id: 10101, nombre: "Guatemala"}, {id:10102,nombre:"Mixco"}],
        102: [{id: 10201, nombre: "Antigua Guatemala"}],
        103: [{id: 10301, nombre: "Guastatoya"}]
      },
      lugares: {
        10101: [{id: 50001, nombre:"Zona 1"}, {id:50002,nombre:"Zona 7"}],
        10102: [{id: 50011, nombre:"El Milagro"}],
        10201: [{id: 50021, nombre:"Centro"}],
        10301: [{id: 50031, nombre:"Barrio El Pacífico"}]
      }
    };

    function fillSelect(select, items, placeholder="Seleccione…"){
      select.innerHTML = `<option value="">${placeholder}</option>` +
        items.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('');
      select.disabled = false;
    }

    function setupCascada(scope){
      const sPais = scope.querySelector('select[name^="idPais"]');
      const sDepa = scope.querySelector('select[name^="idDepartamento"]');
      const sMuni = scope.querySelector('select[name^="idMunicipio"], select[name="idMuniEncarga"]');
      const sLugar = scope.querySelector('select[name^="idLugar"]');

      // País
      fillSelect(sPais, DATA.paises);
      sPais.addEventListener('change', () => {
        sDepa.innerHTML = ""; sDepa.disabled = true;
        sMuni.innerHTML = ""; sMuni.disabled = true;
        sLugar.innerHTML = ""; sLugar.disabled = true;
        const deps = DATA.departamentos[sPais.value] || [];
        fillSelect(sDepa, deps, "Departamento…");
      });

      // Departamento
      sDepa.addEventListener('change', () => {
        sMuni.innerHTML = ""; sMuni.disabled = true;
        sLugar.innerHTML = ""; sLugar.disabled = true;
        const munis = DATA.municipios[sDepa.value] || [];
        fillSelect(sMuni, munis, "Municipio…");
      });

      // Municipio
      sMuni.addEventListener('change', () => {
        sLugar.innerHTML = ""; sLugar.disabled = true;
        const lugs = DATA.lugares[sMuni.value] || [];
        fillSelect(sLugar, lugs, "Lugar…");
      });
    }

    // ===== referencias =====
    const formB = document.getElementById('formBeneficiario');
    const formE = document.getElementById('formEncargado');
    const btnValidarBeneficiario = document.getElementById('btnValidarBeneficiario');
    const btnIrEncargado = document.getElementById('btnIrEncargado');
    const btnVolverBeneficiario = document.getElementById('btnVolverBeneficiario');
    const btnGuardarTodo = document.getElementById('btnGuardarTodo');
    const btnLimpiarTodo = document.getElementById('btnLimpiarTodo');
    const encTabBtn = document.getElementById('enc-tab');
    const step1Badge = document.getElementById('step1Badge');
    const step2Badge = document.getElementById('step2Badge');

    // Inicializar fechas/horas por defecto
    setNowDates(formB, 'fechaIngresoBene', 'horaIngresoBene');
    setNowDates(formB, 'fechaActualizacion', 'horaActualizacion');
    setNowDates(formE, 'fechaIngresoEncarga', 'horaIngresoEncarga');
    setNowDates(formE, 'fechaActualizacion', 'horaActualizacion');

    // Cascadas
    setupCascada(document.getElementById('bene'));
    setupCascada(document.getElementById('enc'));

    // Validar Beneficiario y habilitar Encargado
    btnValidarBeneficiario.addEventListener('click', () => {
      if (validateForm(formB)) {
        encTabBtn.classList.remove('disabled');
        encTabBtn.removeAttribute('tabindex');
        btnIrEncargado.disabled = false;
        step1Badge.classList.remove('disabled');
        step2Badge.classList.remove('disabled');
        step2Badge.style.background = 'var(--amarillo)';
        step2Badge.style.borderColor = 'var(--azul)';
        // Aviso visual
        const toastDiv = document.createElement('div');
        toastDiv.className = 'alert alert-success mt-3';
        toastDiv.textContent = 'Beneficiario validado. Ya puedes continuar con Encargado.';
        formB.appendChild(toastDiv);
        setTimeout(()=> toastDiv.remove(), 2500);
      } else {
        window.scrollTo({ top: formB.offsetTop - 80, behavior: 'smooth' });
      }
    });

    btnIrEncargado.addEventListener('click', () => {
      const tab = new bootstrap.Tab(encTabBtn);
      tab.show();
    });

    btnVolverBeneficiario?.addEventListener('click', () => {
      const beneTabBtn = document.getElementById('bene-tab');
      const tab = new bootstrap.Tab(beneTabBtn);
      tab.show();
    });

    // Guardar Encargado (solo demo)
    formE.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(formE)) return;

      const beneData = Object.fromEntries(new FormData(formB));
      const encData  = Object.fromEntries(new FormData(formE));

      // Aquí harías fetch POST a tu backend; por ahora mostramos en consola
      console.log('Beneficiario listo para enviar:', beneData);
      console.log('Encargado listo para enviar:', encData);

      alert('Datos validados (demo). Reemplaza con fetch() a tu API.');
    });

    // Guardar todo (demo)
    btnGuardarTodo.addEventListener('click', () => {
      const okB = validateForm(formB);
      const okE = !encTabBtn.classList.contains('disabled') ? validateForm(formE) : false;
      if (!okB) {
        alert('Falta completar/validar Beneficiario.');
        return;
      }
      if (!okE) {
        alert('Falta completar/validar Encargado.');
        return;
      }
      const beneData = Object.fromEntries(new FormData(formB));
      const encData  = Object.fromEntries(new FormData(formE));
      console.log('TODO EL PAQUETE:', { beneficiario: beneData, encargado: encData });
      alert('Paquete completo listo para enviar (demo).');
    });

    // Limpiar
    btnLimpiarTodo.addEventListener('click', () => {
      formB.reset(); formE.reset();
      formB.classList.remove('was-validated');
      formE.classList.remove('was-validated');
      // Deshabilitar Encargado nuevamente
      encTabBtn.classList.add('disabled');
      encTabBtn.setAttribute('tabindex','-1');
      document.getElementById('bene-tab').click();
      btnIrEncargado.disabled = true;
      step2Badge.classList.add('disabled');
      // Reset selects cascada
      document.querySelectorAll('#bene select, #enc select').forEach(s=>{
        s.innerHTML = '<option value="">Seleccione…</option>';
        s.disabled = true;
      });
      setupCascada(document.getElementById('bene'));
      setupCascada(document.getElementById('enc'));
      // Fechas / horas de nuevo
      setNowDates(formB, 'fechaIngresoBene', 'horaIngresoBene');
      setNowDates(formB, 'fechaActualizacion', 'horaActualizacion');
      setNowDates(formE, 'fechaIngresoEncarga', 'horaIngresoEncarga');
      setNowDates(formE, 'fechaActualizacion', 'horaActualizacion');
    });