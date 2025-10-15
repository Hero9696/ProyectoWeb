// config/swagger.config.js

const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Beneficiarios (MVC/Node.js)',
      version: '1.0.0',
      description: 'Documentación de la API de backend para la gestión de usuarios, encargados, donantes, beneficiarios, inventario y ventas.',
      contact: {
        name: 'Tu Nombre/Empresa',
        url: 'http://tu-empresa.com',
        email: 'contacto@tu-empresa.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Ajusta el puerto si es necesario
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ],
  },
  // Especifica las rutas donde se encuentran los archivos con las anotaciones JSDoc
  apis: ['./routes/*.js', './controllers/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;