1. README profesional

Tu README debería tener estas secciones mínimas:

Estructura recomendada

# MediAlert Backend

Backend de sistema de reservas médicas desarrollado con NestJS.

## Tecnologías

- NestJS
- TypeORM
- MySQL
- Docker
- JWT
- Swagger
- EventEmitter

## Funcionalidades

- Registro y login con JWT
- Roles: ADMIN, RECEPCION, MEDICO, PACIENTE
- Gestión de médicos, pacientes y especialidades
- Bloques horarios
- Reservas médicas
- Cancelación de reservas
- Seed base para datos demo
- Paginación
- Agenda médica

## Instalación

```bash
npm install
Variables de entorno

Crear archivo .env basado en .env.example.

Base de datos

Levantar MySQL con Docker.

docker compose up -d
Ejecutar proyecto
npm run start:dev
Swagger
http://localhost:3000/api
Seed

Login con usuario ADMIN y ejecutar:

POST /seed/base
Endpoints principales
POST /auth/registro
POST /auth/login
GET /especialidades
GET /medicos
GET /bloques-horarios
POST /reservas
PATCH /reservas/:id/cancelar
GET /agenda
Flujo de reserva médica
Obtener especialidades
Consultar fechas disponibles por especialidad
Consultar médicos disponibles por fecha
Consultar disponibilidad del médico
Crear reserva


Autor randy vilches
```
