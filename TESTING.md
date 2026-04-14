# MediAlert Local Testing Guide

Guia de pruebas locales para validar el proyecto completo antes de deploy.

Alcance:
- backend NestJS + TypeORM + MySQL
- frontend React + Vite
- entorno local/demo

## 1. Preparacion

### Backend

Directorio:

```bash
/Users/randyvilchesmella/desa/medialert-backend
```

Instalacion y arranque:

```bash
npm install
docker compose up -d
npm run start:dev
```

Swagger:

```text
http://localhost:3000/api
```

### Frontend

Directorio:

```bash
/Users/randyvilchesmella/desa/medialert/frontend
```

Instalacion y arranque:

```bash
npm install
npm run dev
```

App:

```text
http://localhost:5173
```

### Variables minimas recomendadas

Backend `.env`:

```env
APP_PORT=3000
DB_HOST=localhost
DB_PORT=3307
DB_USER=medialert_user
DB_PASS=medialert_pass
DB_NAME=medialert
JWT_SECRETO=super-secret-dev
JWT_EXPIRA=8h
SEED_BOOTSTRAP_ENABLED=true
```

Notas:
- `SEED_BOOTSTRAP_ENABLED=true` se usa solo para inicializar una base vacia.
- Despues del bootstrap, vuelve a `false`.

## 2. Credenciales Demo Esperadas

Generadas tanto por `POST /seed/bootstrap` como por `POST /seed/base`:

- `admin@medialert.cl / 123456`
- `recepcion@medialert.cl / 123456`
- `paciente@medialert.cl / 123456`

Credencial demo principal para preparar y validar el entorno:

- `admin@medialert.cl / 123456`

## 3. Orden Recomendado De Prueba

1. Bootstrap del seed
2. Login admin
3. Login paciente
4. Especialidades
5. Medicos
6. Disponibilidad presencial
7. Reserva presencial
8. Mis reservas
9. Cancelacion
10. Telemedicina
11. Mis archivos
12. Pastillero

## 4. Checklist De Pruebas

### A. Bootstrap inicial del seed

Canal:
- Swagger

Rol:
- sin token, solo si `SEED_BOOTSTRAP_ENABLED=true`

Endpoint:
- `POST /seed/bootstrap`

Resultado esperado:
- respuesta `200`
- crea admin, recepcion, paciente demo
- crea especialidad demo
- crea medico demo
- crea bloques futuros presenciales y de telemedicina

Paso de cierre:
- cambiar `SEED_BOOTSTRAP_ENABLED=false` en `.env`

### B. Login admin

Canal:
- Swagger

Rol:
- admin

Endpoint:
- `POST /autenticacion/login`

Body:

```json
{
  "correo": "admin@medialert.cl",
  "contrasena": "123456"
}
```

Resultado esperado:
- devuelve `accessToken`

### C. Login paciente

Canal:
- Swagger y UI

Rol:
- paciente

Endpoint:
- `POST /autenticacion/login`

Body:

```json
{
  "correo": "paciente@medialert.cl",
  "contrasena": "123456"
}
```

Resultado esperado:
- devuelve `accessToken`
- el token permite usar reservas, archivos y pastillero

### D. Especialidades

Canal:
- Swagger y UI

Rol:
- publico o usuario autenticado

Endpoint:
- `GET /especialidades`

Pantalla:
- `/especialidades`

Resultado esperado:
- aparece al menos `Medicina General`

### E. Medicos por especialidad

Canal:
- Swagger y UI

Rol:
- publico o usuario autenticado

Endpoint:
- `GET /medicos?especialidadId=<id>`

Pantalla:
- `/medicos?especialidadId=<id>&especialidadNombre=Medicina%20General`

Resultado esperado:
- aparece al menos un medico demo
- desde UI se puede navegar a agenda presencial

### F. Disponibilidad presencial

Canal:
- Swagger y UI

Rol:
- paciente

Endpoint:
- `GET /medicos/{medicoId}/disponibilidad?fecha=2026-04-13`

Pantalla:
- `/agenda?medicoId=<id>&medicoNombre=<nombre>&especialidadId=<id>&especialidadNombre=<nombre>`

Datos de prueba:
- usa el `medicoId` que devuelva bloques reales
- fecha sugerida: la primera futura con bloques del seed

Resultado esperado:
- respuesta con `bloques` no vacios
- en UI aparecen dias disponibles y horarios

### G. Reserva presencial

Canal:
- Swagger y UI

Rol:
- paciente

Endpoint:
- `POST /reservas`

Body:

```json
{
  "bloqueHorarioId": 1,
  "motivo": "Control general"
}
```

Pantalla:
- `/agenda`

Resultado esperado:
- se crea una reserva
- el bloque usado pasa a `RESERVADO`
- la agenda ya no debe ofrecer ese bloque como disponible

### H. Mis reservas

Canal:
- Swagger y UI

Rol:
- paciente

Endpoint:
- `GET /reservas/mis`

Pantalla:
- `/mis-reservas`

Resultado esperado:
- aparece la reserva activa del paciente autenticado
- no deben listarse reservas canceladas

### I. Cancelacion de reserva

Canal:
- Swagger y UI

Rol:
- paciente dueño de la reserva

Endpoint:
- `PATCH /reservas/{id}/cancelar`

Pantalla:
- `/mis-reservas`

Resultado esperado:
- la reserva queda en estado `CANCELADA`
- el bloque asociado vuelve a `DISPONIBLE`
- `GET /reservas/mis` ya no debe mostrar esa reserva

Validacion posterior:
- repetir `GET /medicos/{medicoId}/disponibilidad?fecha=...`
- el bloque cancelado debe reaparecer

### J. Telemedicina

Canal:
- Swagger y UI

Rol:
- paciente

Endpoints:
- `GET /telemedicina/especialidades`
- `GET /telemedicina/medicos/{especialidadId}`
- `GET /telemedicina/horarios/{medicoId}?fecha=2026-04-13`
- `POST /telemedicina/reservar`

Pantallas:
- `/telemedicina`
- `/telemedicina/medicos/:especialidadId`
- `/telemedicina/agenda/:medicoId`

Body de reserva sugerido:

```json
{
  "bloqueHorarioId": 1,
  "motivo": "Consulta remota de seguimiento"
}
```

Resultado esperado:
- especialidades con disponibilidad remota visibles
- medicos con agenda remota visibles
- horarios remotos visibles
- reserva telemedica creada
- si el proveedor mock esta activo, se genera link demo

### K. Mis archivos

Canal:
- Swagger y UI

Rol:
- paciente

Endpoints:
- `POST /mis-archivos`
- `GET /mis-archivos/mis`
- `GET /mis-archivos/{id}`
- `GET /mis-archivos/{id}/descargar`
- `DELETE /mis-archivos/{id}`

Pantalla:
- `/mis-archivos`

Datos de prueba:
- categoria: `EXAMEN`
- archivo pequeno `.pdf`, `.jpg` o `.png`

Resultado esperado:
- el archivo se sube sin error
- aparece listado en "mis archivos"
- se puede ver detalle y descargar
- se puede eliminar siendo el paciente dueño

### L. Pastillero

Canal:
- Swagger y UI

Rol:
- paciente

Endpoints:
- `POST /pastillero`
- `GET /pastillero/mis`
- `GET /pastillero/{id}`
- `PATCH /pastillero/{id}`
- `DELETE /pastillero/{id}`

Pantalla:
- `/pastillero`

Body sugerido:

```json
{
  "nombreMedicamento": "Paracetamol",
  "dosis": "500 mg",
  "horaInicio": "08:00",
  "fechaInicio": "2026-04-13",
  "frecuenciaHoras": 8,
  "duracionDias": 5,
  "alarmaActiva": true,
  "recordarMinutosAntes": 15,
  "whatsappRecordatorioActivo": false,
  "observaciones": "Despues de comidas"
}
```

Resultado esperado:
- el medicamento se crea
- aparece en la lista de activos
- detalle correcto
- actualizacion correcta
- eliminacion logica correcta

## 5. Prueba Rapida De Regresion

Si el tiempo es limitado, validar al menos:

1. `POST /seed/bootstrap`
2. `POST /autenticacion/login` como admin
3. `POST /autenticacion/login` como paciente
4. `GET /especialidades`
5. `GET /medicos?especialidadId=...`
6. `GET /medicos/{medicoId}/disponibilidad?fecha=...`
7. `POST /reservas`
8. `GET /reservas/mis`
9. `PATCH /reservas/{id}/cancelar`
10. `GET /telemedicina/especialidades`
11. `POST /mis-archivos`
12. `POST /pastillero`

## 6. Resultado Esperado Global Antes De Deploy

El proyecto queda listo para publicar si se cumple todo esto:

- bootstrap inicial ejecuta sin bloqueo circular
- admin y paciente pueden iniciar sesion
- el paciente ve especialidades y medicos
- la agenda presencial muestra bloques reales
- reservar cambia el bloque a `RESERVADO`
- cancelar devuelve el bloque a `DISPONIBLE`
- telemedicina lista y reserva correctamente
- mis archivos funciona con subida, listado y descarga
- pastillero funciona con CRUD basico del paciente
