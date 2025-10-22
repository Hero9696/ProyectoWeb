// Archivo de Lógica de Enrutamiento (Simulación de Router Simple)
// Este script centraliza la navegación a páginas conocidas y aplica un fallback a 404.html si la ruta no existe.


document.addEventListener('DOMContentLoaded', () => {
    // Mapa de Rutas Válidas
    // Solo se permite la navegación a las rutas definidas aquí.
    const validRoutes = {
        'btnVistaBeneficiarios': 'view/VistaBeneficiarios.html',
        'btnVistaEncargado': 'view/VistaEncargado.html',
        'btnVistaDonaciones': 'view/VistaDonaciones.html',
        // Agrega aquí todas las demás rutas válidas de tu aplicación
    };
    
    // Define la página de fallback (el Canvas actual)
    const notFoundPage = './404.html';

    /**
     * Función centralizada para manejar la navegación interna.
     * Si el ID del botón tiene una ruta mapeada en validRoutes, navega.
     * De lo contrario, redirige al 404.html.
     */
    const go = (id) => {
        const href = validRoutes[id];
        
        if (href) {
            // Ruta válida encontrada: navega al destino.
            console.log(`Navegando a ruta válida: ${href}`);
            window.location.assign(href);
        } else {
            // Lógica de Fallback 404: Si la ruta no está definida, se redirige.
            console.warn(`Ruta desconocida para el ID ${id}. Redirigiendo a 404.`);
            window.location.assign(notFoundPage);
        }
    };

    // Función auxiliar para configurar Event Listeners en los botones
    const setupButtonNavigation = (id) => {
        const el = document.getElementById(id);
        if (!el) {
            // Si el elemento no existe, simplemente se ignora.
            return;
        }

        el.addEventListener('click', (e) => {
            // Permite click medio/ctrl+click para abrir en nueva pestaña
            if (e.ctrlKey || e.metaKey || e.button === 1) return;
            
            e.preventDefault();
            
            // Llama a la función de enrutamiento centralizada.
            go(id);
        });
    };
    
    // Configurar la navegación para las rutas conocidas:
    setupButtonNavigation('btnVistaBeneficiarios');
    setupButtonNavigation('btnVistaEncargado');
    setupButtonNavigation('btnVistaDonaciones');
    
    // Ejemplo de un botón que podría fallar si se añade al HTML sin un mapeo aquí:
    // setupButtonNavigation('btnRutaInvalida'); 
    
    console.log('Lógica de navegación inicializada con fallback a 404.');

});