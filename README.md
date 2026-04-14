# MediAlert

MediAlert es un proyecto personal que armé para practicar un flujo más completo de una app de salud: autenticación, roles, reservas médicas, telemedicina, archivos clínicos y recordatorios de medicamentos.

Lo hice como proyecto de portafolio para seguir aprendiendo backend y también para entender mejor cómo se conectan las reglas de negocio con una interfaz real.

En mi entorno local lo trabajo como dos partes:

- backend: NestJS + TypeORM + MySQL
- frontend: React + Vite

## Qué hace el proyecto

La idea es simular una plataforma simple donde:

- un paciente puede registrarse e iniciar sesión
- puede buscar especialidades y médicos
- puede revisar disponibilidad presencial
- puede reservar y cancelar horas
- puede ver sus reservas
- puede usar telemedicina
- puede subir archivos personales
- puede gestionar un pastillero con recordatorios

También hay vistas más institucionales para:

- `ADMIN`
- `RECEPCION`

## Stack

### Backend

- NestJS
- TypeORM
- MySQL
- Swagger
- JWT
- EventEmitter

### Frontend

- React
- Vite
- TypeScript
- React Router
- Axios

## Módulos principales

- `autenticacion`: registro, login y JWT
- `usuarios`: manejo de usuarios y roles
- `pacientes`: relación entre usuario autenticado y entidad paciente
- `especialidades`: listado de especialidades
- `medicos`: médicos por especialidad y disponibilidad
- `bloques-horarios`: agenda base por médico
- `reservas`: reserva, listado y cancelación
- `telemedicina`: agenda remota y generación de sala demo
- `mis-archivos`: subida y consulta de archivos
- `pastillero`: medicamentos y recordatorios
- `seed`: datos base para entorno local/demo

## Roles

### PACIENTE

- reservar hora presencial
- reservar telemedicina
- ver y cancelar sus reservas
- gestionar sus archivos
- usar su pastillero

### RECEPCION

- revisar agenda operativa
- ver especialidades, médicos y bloques
- consultar archivos clínicos por paciente

### ADMIN

- vista institucional de especialidades y profesionales
- acceso al seed protegido
- supervisión general del sistema demo

## Estructura general

En local tengo esta separación:

```text
medialert-backend/
medialert/frontend/
```

Dentro del backend, lo más importante está en:

```text
src/
  autenticacion/
  bloques-horarios/
  especialidades/
  medicos/
  pacientes/
  reservas/
  telemedicina/
  mis-archivos/
  pastillero/
  seed/
```

## Instalación

### Backend

Desde esta carpeta:

```bash
/Users/randyvilchesmella/desa/medialert-backend
```

Instalar dependencias:

```bash
npm install
```

Levantar MySQL local:

```bash
docker compose up -d
```

### Frontend

Desde la carpeta del frontend:

```bash
cd /Users/randyvilchesmella/desa/medialert/frontend
npm install
```

## Variables de entorno del backend

Crea un `.env` en la raíz del backend usando `src/.env.example` como base.

Ejemplo mínimo:

```env
APP_PORT=3000
DB_HOST=localhost
DB_PORT=3307
DB_USER=medialert_user
DB_PASS=medialert_pass
DB_NAME=medialert
JWT_SECRETO=super-secret-dev
JWT_EXPIRA=8h
SEED_BOOTSTRAP_ENABLED=false
```

Variables útiles para demo:

- `SEED_BOOTSTRAP_ENABLED=true`
- `CORS_ORIGINS=http://localhost:5173,http://localhost:5174`
- `WHATSAPP_PROVIDER=mock`
- `TELEMEDICINA_VIDEO_PROVIDER=mock`

## Ejecución local

### Backend

```bash
npm run start:dev
```

Swagger:

```text
http://localhost:3000/api
```

### Frontend

```bash
cd /Users/randyvilchesmella/desa/medialert/frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Credenciales demo

Tanto `POST /seed/bootstrap` como `POST /seed/base` crean las mismas credenciales demo:

- `admin@medialert.cl / 123456`
- `recepcion@medialert.cl / 123456`
- `paciente@medialert.cl / 123456`

Credencial principal para preparar la demo:

- `admin@medialert.cl / 123456`

## Cómo inicializar una base vacía

Si partes desde cero y todavía no existe un admin:

1. Activa temporalmente en `.env`:

```env
SEED_BOOTSTRAP_ENABLED=true
```

2. Levanta el backend.
3. En Swagger ejecuta:

```text
POST /seed/bootstrap
```

4. Haz login con:

```text
admin@medialert.cl / 123456
```

5. Cuando ya esté inicializado, vuelve a dejar:

```env
SEED_BOOTSTRAP_ENABLED=false
```

6. Desde ahí el seed normal queda protegido en:

```text
POST /seed/base
```

## Pruebas principales

Dejé una guía más completa en:

- [`TESTING.md`](./TESTING.md)

Orden recomendado de prueba:

1. bootstrap del seed
2. login admin
3. login paciente
4. especialidades
5. médicos
6. disponibilidad presencial
7. reserva presencial
8. mis reservas
9. cancelación
10. telemedicina
11. mis archivos
12. pastillero

## Endpoints y pantallas clave

### Backend

- `POST /autenticacion/registrar`
- `POST /autenticacion/login`
- `POST /seed/bootstrap`
- `POST /seed/base`
- `GET /especialidades`
- `GET /medicos?especialidadId=...`
- `GET /medicos/:id/disponibilidad?fecha=...`
- `POST /reservas`
- `GET /reservas/mis`
- `PATCH /reservas/:id/cancelar`
- `GET /telemedicina/especialidades`
- `GET /telemedicina/medicos/:especialidadId`
- `GET /telemedicina/horarios/:medicoId?fecha=...`
- `POST /mis-archivos`
- `GET /mis-archivos/mis`
- `POST /pastillero`
- `GET /pastillero/mis`

### Frontend

- `/login`
- `/register`
- `/dashboard`
- `/especialidades`
- `/medicos`
- `/agenda`
- `/mis-reservas`
- `/telemedicina`
- `/mis-archivos`
- `/pastillero`

## Qué problemas resolví

Algunas cosas que fui corrigiendo mientras avanzaba:

- relación correcta entre `Usuario` y `Paciente` al registrarse
- bloqueo circular del seed inicial en una base vacía
- bloques demo en fechas futuras en vez de pasadas
- disponibilidad presencial y telemedicina usando modalidad correcta
- consistencia al reservar y cancelar
- validación para que un paciente no cancele reservas ajenas
- manejo más claro de vistas por rol en el frontend

## Qué aprendí

Con este proyecto practiqué varias cosas que antes había visto más separadas:

- modelar relaciones reales con TypeORM
- trabajar con roles y JWT
- pensar el flujo completo entre frontend y backend
- detectar bugs donde el problema no estaba en un solo lado
- validar reglas de negocio con datos reales y no solo con la UI
- documentar mejor un proyecto para dejarlo presentable

## Mejoras futuras

Si sigo trabajando este proyecto, me gustaría agregar:

- tests e2e más completos para reservas
- mejor manejo de errores en frontend
- dashboard real para admin
- edición de agenda por recepción/admin
- deploy del frontend y backend con una guía más cerrada
- CI básica con build y lint

## Estado actual

Hoy el proyecto me sirve bien como demo funcional de portafolio porque ya permite mostrar:

- login por roles
- seed inicial
- reservas presenciales
- telemedicina
- archivos
- pastillero

No está pensado como producto final, pero sí como un proyecto serio para mostrar cómo trabajo y cómo fui resolviendo problemas reales paso a paso.
