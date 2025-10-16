const contenedor = document.getElementById('contenidoPrincipal');

document.getElementById('btnVistaBeneficiarios').addEventListener('click', async ()=>{
    const html = await fetch('../view/VistaBeneficiarios.html').then(r=>r.text());
    contenedor.innerHTML = html;
});

document.getElementById('btnVistaEncargado').addEventListener('click', async ()=>{
    const html = await fetch('../view/VistaEncargado.html').then(r=>r.text());
    contenedor.innerHTML = html;
});

// NUEVAS VISTAS PARA DANIEL
document.getElementById('btnVistaVentas').addEventListener('click', async ()=>{
    const html = await fetch('../view/VistaVentas.html').then(r=>r.text());
    contenedor.innerHTML = html;
});

document.getElementById('btnVistaDonantes').addEventListener('click', async ()=>{
    const html = await fetch('../view/VistaDonantes.html').then(r=>r.text());
    contenedor.innerHTML = html;
});