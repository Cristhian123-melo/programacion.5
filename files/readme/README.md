# Libro Mayor — Backend multi-tenant + Panel de administración

## 1. Instalar PostgreSQL (si no lo tienes)
- Windows/Mac: descarga desde https://www.postgresql.org/download/
- Crea una base de datos vacía llamada `libro_mayor`.

## 2. Preparar el backend
```bash
cd backend
npm install
cp .env.example .env
```
Abre `.env` y llena tus datos reales de PostgreSQL, y genera tus dos secretos con:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
(corre ese comando dos veces, uno para JWT_SECRET y otro para JWT_ADMIN_SECRET)

## 3. Crear las tablas
```bash
psql "postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/libro_mayor" -f migrations/schema.sql
```

## 4. Crear tu propia cuenta de administrador (tú, el dueño)
```bash
node scripts/crear-admin.js tuemail@ejemplo.com unaContraseñaSegura123
```

## 5. Levantar el servidor
```bash
npm run dev
```
Deberías ver: `Backend corriendo en http://localhost:4000`

## 6. Abrir tu panel de administración
Abre el archivo `frontend-admin/panel-admin.html` haciendo doble clic (se abre en tu navegador,
sin necesidad de servidor ni build). Entra con el email/contraseña que creaste en el paso 4.

Ahí verás la tabla de tus clientes (vacía al principio) y podrás suspender/reactivar/resetear
contraseñas en cuanto registres tenants de prueba.

## 7. Crear un cliente de prueba (simulando una venta)
```bash
curl -X POST http://localhost:4000/api/auth/registrar-tenant \
  -H "Content-Type: application/json" \
  -d '{"nombreNegocio":"Prestamos Don Jose","email":"donjose@ejemplo.com","password":"claveDelCliente123"}'
```
Refresca `panel-admin.html` y ya debe aparecer "Prestamos Don Jose" en la lista, con botón
de Suspender. Pruébalo: suspende, y si intentas hacer login con ese usuario (paso 8), el
backend te va a rechazar con el mensaje de "suscripción suspendida".

## 8. Probar el login de un cliente
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"donjose@ejemplo.com","password":"claveDelCliente123"}'
```
Te devuelve un `token`. Ese token es lo que tu frontend (tu archivo `prestamos-appOriginal.jsx`)
debe guardar y mandar en cada petición al backend, en vez del password-gate local que tenía.

## Próximo paso: conectar tu frontend real
Tu `prestamos-appOriginal.jsx` hoy hace login contra `localStorage` (una sola contraseña,
para un solo usuario, en un solo navegador). El cambio que falta es reemplazar esa pantalla
de login por una que llame a `POST /api/auth/login` de este backend, y guarde el `token`
recibido para mandarlo en cada petición futura (créditos, calendario, estadísticas — las
rutas de las Guías 1 y 2, ya adaptadas al patrón de `tenant_id` que ves en `routes/creditos.js`).

Cuando quieras, seguimos con ese paso: adaptar el login de tu app real para que hable con
este backend en vez de con el almacenamiento local del navegador.

## Desplegarlo para que tu cliente lo use como un link real
- Backend + PostgreSQL: Railway o Render (ambos tienen plan gratis para empezar,
  y crean la base de datos por ti con un clic).
- Frontend (tu app React compilada con `npm run build`): Vercel o Netlify — subes la
  carpeta `dist/` y te dan un link tipo `https://libromayor.vercel.app` para mandarle a tu cliente.
- El panel de administración (`panel-admin.html`) también lo puedes subir a Vercel/Netlify
  como un sitio aparte, solo para ti — o simplemente lo dejas en tu computador y lo abres
  localmente cuando necesites suspender/activar a alguien.
