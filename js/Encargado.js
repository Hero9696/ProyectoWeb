    // ========= datos mock para cascada =========
    const DATA = {
      paises: [{id:1, nombre:'Guatemala'}],
      departamentos:{1:[{id:101,nombre:'Guatemala'},{id:102,nombre:'Sacatepéquez'},{id:103,nombre:'El Progreso'}]},
      municipios:{
        101:[{id:10101,nombre:'Guatemala'},{id:10102,nombre:'Mixco'}],
        102:[{id:10201,nombre:'Antigua Guatemala'}],
        103:[{id:10301,nombre:'Guastatoya'}]
      },
      lugares:{
        10101:[{id:50001,nombre:'Zona 1'},{id:50002,nombre:'Zona 7'}],
        10102:[{id:50011,nombre:'El Milagro'}],
        10201:[{id:50021,nombre:'Centro'}],
        10301:[{id:50031,nombre:'Barrio El Pacífico'}]
      }
    };
    function fillSelect(select, items, ph='Seleccione…'){
      select.innerHTML = `<option value="">${ph}</option>` + items.map(o=>`<option value="${o.id}">${o.nombre}</option>`).join('');
      select.disabled = false;
    }
    function setupCascada(scope){
      const sPais  = scope.querySelector('select[name^="idPais"]');
      const sDepa  = scope.querySelector('select[name^="idDepartamento"]');
      const sMuni  = scope.querySelector('select[name^="idMunicipio"], select[name="idMuniEncarga"]');
      const sLugar = scope.querySelector('select[name^="idLugar"]');
      fillSelect(sPais, DATA.paises);
      sPais.addEventListener('change', ()=>{
        sDepa.innerHTML=''; sDepa.disabled=true;
        sMuni.innerHTML=''; sMuni.disabled=true;
        sLugar.innerHTML=''; sLugar.disabled=true;
        fillSelect(sDepa, DATA.departamentos[sPais.value]||[], 'Departamento…');
      });
      sDepa.addEventListener('change', ()=>{
        sMuni.innerHTML=''; sMuni.disabled=true;
        sLugar.innerHTML=''; sLugar.disabled=true;
        fillSelect(sMuni, DATA.municipios[sDepa.value]||[], 'Municipio…');
      });
      sMuni.addEventListener('change', ()=>{
        sLugar.innerHTML=''; sLugar.disabled=true;
        fillSelect(sLugar, DATA.lugares[sMuni.value]||[], 'Lugar…');
      });
    }

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
    function validateForm(form){ const ok = form.checkValidity(); form.classList.add('was-validated'); return ok; }

    // ======= refs
    const formEnc = document.getElementById('formEncargado');
    const formBen = document.getElementById('formBeneficiario');
    const encHeader = document.getElementById('encHeader');
    const encNombreHdr = document.getElementById('encNombreHdr');
    const encIdHdr = document.getElementById('encIdHdr');
    const encIdentHdr = document.getElementById('encIdentHdr');
    const btnValidarEnc = document.getElementById('btnValidarEncargado');
    const btnAgregarBene = document.getElementById('btnAgregarBene');
    const btnGuardarTodo = document.getElementById('btnGuardarTodo');
    const tablaBeneTbody = document.querySelector('#tablaBene tbody');
    const stepEnc = document.getElementById('stepEnc');
    const stepBen = document.getElementById('stepBen');

    // Inicializaciones
    setupCascada(formEnc);
    setupCascada(formBen);
    setNowDates(formEnc, 'fechaIngresoEncarga', 'horaIngresoEncarga');
    setNowDates(formEnc, 'fechaActualizacion', 'horaActualizacion');
    setNowDates(formBen, 'fechaIngresoBene', 'horaIngresoBene');
    setNowDates(formBen, 'fechaActualizacion', 'horaActualizacion');

    // Estado
    let ENCARGADO_ID = null;
    const BENEFICIARIOS = [];

    // Validar Encargado -> bloquear, mostrar en header y habilitar beneficiarios
    btnValidarEnc.addEventListener('click', async ()=>{
      if(!validateForm(formEnc)) return;

      const encData = Object.fromEntries(new FormData(formEnc));
      // 🔗 Aquí normalmente enviarías al backend para crear el Encargado y obtener su ID:
      // const res = await fetch('/api/encargados', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(encData)});
      // const created = await res.json(); ENCARGADO_ID = created.idEncargado;
      // DEMO: generamos un ID ficticio
      ENCARGADO_ID = Math.floor(Math.random()*9000)+1000;

      // Mostrar en encabezado
      encNombreHdr.textContent = `${encData.nombre1Encargado} ${encData.apellido1Encargado}`;
      encIdHdr.textContent = ENCARGADO_ID;
      encIdentHdr.textContent = encData.IdentificacionEncarga;
      encHeader.classList.remove('d-none');

      // Bloquear form Encargado para evitar cambios accidentales
      [...formEnc.elements].forEach(el=>el.disabled = true);
      document.getElementById('btnLimpiarEnc').disabled = true;
      btnValidarEnc.disabled = true;

      // Habilitar sección beneficiarios
      formBen.classList.remove('disabled-section');
      stepBen.classList.remove('disabled');
      stepBen.style.background = 'var(--amarillo)';
      stepBen.style.borderColor = 'var(--azul)';
    });

    // Agregar beneficiario a la tabla (sin enviar aún)
    btnAgregarBene.addEventListener('click', ()=>{
      if(!ENCARGADO_ID){ alert('Primero valida el Encargado.'); return; }
      if(!validateForm(formBen)) return;

      const b = Object.fromEntries(new FormData(formBen));
      b.idEncargadoBene = ENCARGADO_ID; // vínculo clave
      BENEFICIARIOS.push(b);

      // Pintar fila
      const idx = BENEFICIARIOS.length;
      const nombre = `${b.nombre1Beneficiario} ${b.nombre2Beneficiario||''} ${b.apellido1Beneficiario}`.trim();
      const ubic = `Pais:${b.idPaisBene || '-'} Dep:${b.idDepartamentoBene || '-'} Mun:${b.idMunicipioBene || '-'} Lug:${b.idLugarBene || '-'}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx}</td>
        <td>${nombre}</td>
        <td class="text-muted small">${ubic}</td>
        <td>${b.estadoBeneficiario}</td>
        <td class="small">${b.fechaIngresoBene} ${b.horaIngresoBene}</td>
        <td><button class="btn btn-sm btn-outline-danger" data-rm="${idx-1}">Quitar</button></td>
      `;
      tablaBeneTbody.appendChild(tr);

      // Habilita guardar
      btnGuardarTodo.disabled = BENEFICIARIOS.length===0;

      // Reset rápido del form, dejando fecha/hora
      const keep = {
        fechaIngresoBene: b.fechaIngresoBene,
        horaIngresoBene: b.horaIngresoBene,
        fechaActualizacion: b.fechaActualizacion,
        horaActualizacion: b.horaActualizacion,
        idUsuarioIngreso: b.idUsuarioIngreso,
        idUsuarioActualiza: b.idUsuarioActualiza
      };
      formBen.reset();
      setNowDates(formBen, 'fechaIngresoBene', 'horaIngresoBene');
      setNowDates(formBen, 'fechaActualizacion', 'horaActualizacion');
      formBen.elements.idUsuarioIngreso.value = keep.idUsuarioIngreso || '';
      formBen.elements.idUsuarioActualiza.value = keep.idUsuarioActualiza || '';
    });

    // Quitar beneficiario
    tablaBeneTbody.addEventListener('click', (e)=>{
      const btn = e.target.closest('button[data-rm]');
      if(!btn) return;
      const i = Number(btn.dataset.rm);
      BENEFICIARIOS.splice(i,1);
      // Re-render simple
      tablaBeneTbody.innerHTML = '';
      BENEFICIARIOS.forEach((b,ix)=>{
        const nombre = `${b.nombre1Beneficiario} ${b.nombre2Beneficiario||''} ${b.apellido1Beneficiario}`.trim();
        const ubic = `Pais:${b.idPaisBene || '-'} Dep:${b.idDepartamentoBene || '-'} Mun:${b.idMunicipioBene || '-'} Lug:${b.idLugarBene || '-'}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ix+1}</td>
          <td>${nombre}</td>
          <td class="text-muted small">${ubic}</td>
          <td>${b.estadoBeneficiario}</td>
          <td class="small">${b.fechaIngresoBene} ${b.horaIngresoBene}</td>
          <td><button class="btn btn-sm btn-outline-danger" data-rm="${ix}">Quitar</button></td>
        `;
        tablaBeneTbody.appendChild(tr);
      });
      btnGuardarTodo.disabled = BENEFICIARIOS.length===0;
    });

    // Guardar todo (primero Encargado ya creado, luego muchos beneficiarios con su idEncargadoBene)
    document.getElementById('btnGuardarTodo').addEventListener('click', async ()=>{
      if(!ENCARGADO_ID){ alert('Falta validar Encargado.'); return; }
      if(BENEFICIARIOS.length===0){ alert('Agrega al menos un beneficiario.'); return; }

      // 🔗 Ejemplo de envío en lote:
      // await fetch('/api/beneficiarios/bulk', {
      //   method:'POST',
      //   headers:{'Content-Type':'application/json'},
      //   body: JSON.stringify({ idEncargado: ENCARGADO_ID, beneficiarios: BENEFICIARIOS })
      // });

      console.log('LISTO PARA ENVIAR =>',{ idEncargado: ENCARGADO_ID, beneficiarios: BENEFICIARIOS });
      alert('Demo: ver consola. Cada beneficiario lleva idEncargadoBene = ' + ENCARGADO_ID);
    });
