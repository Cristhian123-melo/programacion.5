# StudentFlow – API de materias

Proyecto académico desarrollado para la clase de Programación. Este repositorio contiene el backend de **StudentFlow**, una API REST para consultar, crear, reemplazar, actualizar y eliminar materias.

## Tecnologías

- Node.js
- Express 5
- MySQL
- mysql2
- dotenv

## Requisitos

Antes de ejecutar el proyecto, instala:

- Node.js (versión 18 o superior; se recomienda una versión LTS).
- MySQL Server o XAMPP con MySQL iniciado.
- Git, para clonar y subir el repositorio.

## Estructura principal

```text
programacion/
├── BD y archivos/
│   ├── BD/                    # Scripts SQL, ajustes y documentación de la base de datos
│   └── ...                    # Documentos de apoyo y diagramas
├── Proyectos/                 # Documentos y ejercicios de clase
├── studentFlow_back/
│   ├── src/
│   │   ├── config/            # Conexión a la base de datos
│   │   ├── controllers/       # Controladores de la API
│   │   ├── middlewares/       # Middleware de contexto y manejo de errores
│   │   ├── repositories/      # Consultas y acceso a datos
│   │   ├── routes/            # Rutas HTTP
│   │   ├── services/          # Lógica de negocio
│   │   ├── utils/             # Utilidades y respuestas
│   │   ├── validators/        # Validaciones
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example           # Plantilla de variables de entorno
│   └── package.json
└── README.md
```

## Instalación y ejecución

1. Clona el repositorio y entra a la carpeta del backend:

   ```bash
   git clone URL_DEL_REPOSITORIO
   cd programacion/studentFlow_back
   ```

   Reemplaza `URL_DEL_REPOSITORIO` por la URL real del repositorio de GitHub.

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea la base de datos en MySQL. Puedes ejecutar los scripts SQL de la carpeta `BD y archivos/BD` en el orden indicado por sus nombres, empezando por el esquema y luego los datos iniciales y ajustes.

4. Crea el archivo local `.env` copiando la plantilla:

   **Windows CMD:**
   ```cmd
   copy .env.example .env
   ```

   **PowerShell:**
   ```powershell
   Copy-Item .env.example .env
   ```

5. Abre `.env` y configura los datos de conexión de tu MySQL. Ejemplo:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=studentflow
   DB_USER=root
   DB_PASSWORD=TU_CLAVE_MYSQL
   ```

   Cambia el usuario, la contraseña y el nombre de la base de datos según tu instalación. No subas el archivo `.env` a GitHub.

6. Inicia el servidor desde `studentFlow_back`:

   ```bash
   npm run dev
   ```

   Para ejecutarlo sin modo de desarrollo:

   ```bash
   npm start
   ```

   Si todo está configurado, el backend escuchará en `http://localhost:3000`.

## Rutas de la API

Todas las rutas de materias usan el prefijo `/api/v1/materias`.

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/v1/materias` | Lista las materias. |
| GET | `/api/v1/materias/:id` | Consulta una materia por su identificador. |
| POST | `/api/v1/materias` | Crea una materia. |
| PUT | `/api/v1/materias/:id` | Reemplaza los datos de una materia. |
| PATCH | `/api/v1/materias/:id` | Actualiza parcialmente una materia. |
| DELETE | `/api/v1/materias/:id` | Elimina una materia. |

También existe la ruta de comprobación del backend:

```http
GET http://localhost:3000/api/v1/health
```

Puedes probar los endpoints con Postman, Insomnia o una herramienta similar. Para las solicitudes `POST`, `PUT` y `PATCH`, envía los datos en formato JSON y revisa las validaciones definidas en el proyecto.

## Documentación de base de datos

En `BD y archivos/BD` se encuentran los scripts SQL y documentos relacionados con el esquema, los datos iniciales, los ajustes de consistencia y las verificaciones de StudentFlow.

## Notas

- La carpeta `node_modules` no se versiona. Se genera localmente con `npm install`.
- El archivo `.env` contiene configuración local y credenciales; está excluido del repositorio.
- `.env.example` es una plantilla sin contraseñas reales y sí debe compartirse.
- Este proyecto corresponde a una actividad académica y puede requerir ajustes según las indicaciones del docente.
