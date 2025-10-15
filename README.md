# Proyecto Web

Este es un proyecto web que consta de un frontend y un backend.

## Descripción

(Aquí puedes agregar una descripción más detallada de tu proyecto, sus objetivos y funcionalidades principales).

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

*   [Node.js](https://nodejs.org/) (se utilizó la v22.18.0 para el desarrollo)

## Instalación y Puesta en Marcha (Backend)

Para levantar el servidor del backend y tenerlo funcionando localmente, sigue estos pasos.

1.  **Clona el repositorio (si aún no lo has hecho):**
    ```bash
    git clone <URL-del-repositorio>
    cd proyectoweb
    ```

2.  **Navega a la carpeta del backend:**
    Desde la raíz del proyecto, muévete al directorio `backend`.
    ```bash
    cd backend
    ```

3.  **Instala las dependencias:**
    Una vez dentro de la carpeta `backend`, ejecuta el siguiente comando para instalar todas las dependencias necesarias que se encuentran definidas en el archivo `package.json`.
    ```bash
    npm install
    ```

4.  **Inicia el servidor:**
    Después de que la instalación se complete, puedes iniciar el servidor de desarrollo con:
    ```bash
    npm start
    ```
    Si todo va bien, el servidor estará escuchando en el puerto especificado en la configuración (usualmente `http://localhost:3000` o similar).