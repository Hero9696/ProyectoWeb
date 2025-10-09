const contenedor = document.getElementById('contenidoPrincipal');

    document.getElementById('btnVistaBeneficiarios').addEventListener('click', async ()=>{
      const html = await fetch('../view/VistaBeneficiarios.html').then(r=>r.text());
      contenedor.innerHTML = html;
    });

    document.getElementById('btnVistaEncargado').addEventListener('click', async ()=>{
      const html = await fetch('../view/VistaEncargado.html').then(r=>r.text());
      contenedor.innerHTML = html;
    });