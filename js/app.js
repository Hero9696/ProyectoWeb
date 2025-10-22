document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');

    /**
     * Función para cargar contenido HTML desde un archivo en un elemento.
     * @param {string} url - La ruta al archivo HTML (relativa a la raíz del sitio).
     * @param {HTMLElement} element - El elemento donde se inyectará el HTML.
     */
    const loadHTML = async (url, element) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${url}, estado: ${response.status}`);
            }
            const text = await response.text();
            element.innerHTML = text;
        } catch (error) {
            console.error('Error al cargar el contenido:', error);
            element.innerHTML = '<p>Error al cargar el contenido. Por favor, revisa la consola.</p>';
        }
    };

    /**
     * Enrutador simple para cargar vistas basadas en la ruta del navegador.
     * @param {string} path - La ruta de la URL (ej. "/", "/usuarios").
     */
    const router = (path) => {
        // Limpia el contenido principal antes de cargar el nuevo
        mainContent.innerHTML = ''; 

        // Define las rutas y qué vista cargar para cada una
        const routes = {
            '/': 'view/login.html',
            '/usuarios': 'view/usuarios.html',
            '/caja': 'view/caja.html'
            // Agrega más rutas aquí
        };

        // Busca la vista correspondiente o usa una página de error 404 si no la encuentra
        const viewPath = routes[path] || 'view/404.html'; 
        
        // Carga la vista en el contenedor principal
        loadHTML(viewPath, mainContent);
    };

    // --- INICIALIZACIÓN DE LA APLICACIÓN ---

    // 1. Cargar componentes reutilizables (navbar y footer)
    // Las rutas son relativas a la raíz del sitio web.
    loadHTML('components/navbar.html', navbarContainer);
    loadHTML('components/footer.html', footerContainer);

    // 2. Cargar la vista inicial basada en la URL actual
    router(window.location.pathname);

    // 3. Interceptar clics en los enlaces de navegación para evitar recargas de página
    document.body.addEventListener('click', e => {
        // Busca si el clic fue en un elemento con la clase 'nav-link'
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault(); // Previene la recarga completa de la página
            const path = link.getAttribute('href');
            
            // Actualiza la URL en la barra de direcciones sin recargar
            window.history.pushState({}, '', path);
            
            // Carga la nueva vista usando nuestro router
            router(path);
        }
    });

    // 4. Manejar los botones de atrás/adelante del navegador
    window.addEventListener('popstate', () => {
        // Cuando el usuario usa los botones del navegador, volvemos a llamar al router
        // para cargar la vista correspondiente a la nueva URL.
        router(window.location.pathname);
    });
});