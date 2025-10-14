// server.js (Actualizado con Swagger)

const express = require('express');
const bodyParser = require('body-parser'); 
require('dotenv').config(); 

// Importar Swagger y la especificación
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerconfig');

require('./config/dbconfig'); 

// Importar rutas...
const catalogosRoutes = require('./routes/catalogosRoutes');
const geografiaRoutes = require('./routes/geografiaroutes');
const personasRoutes = require('./routes/personasRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const seguridadRoutes = require('./routes/seguridaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(bodyParser.json());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// RUTA DE DOCUMENTACIÓN SWAGGER
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// INTEGRACIÓN DE RUTAS DE LA API
app.use('/api', catalogosRoutes);
app.use('/api', geografiaRoutes);
app.use('/api', personasRoutes);
app.use('/api', transaccionesRoutes);
app.use('/api', seguridadRoutes);

// ... (Resto del código de server.js)
// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'API del Sistema de Gestión de Beneficiarios en Node.js (MVC) en funcionamiento. Visita /docs para la documentación.',
        version: '1.0'
    });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📘 Documentación disponible en http://localhost:${PORT}/docs`);
});