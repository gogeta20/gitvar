# Sesion 2026-07-04 - estructura y devops

## Contexto

Definicion de la estructura raiz del proyecto y del papel de Docker en una aplicacion desktop con Tauri.

## Trabajo realizado

- Se definio una estructura raiz por temas: `frontend/`, `backend/`, `config/`, `devops/` y `db/`.
- Se agrego `docker-compose.yml` en la raiz para encapsular el entorno de desarrollo.
- Se agrego `Makefile` en la raiz para simplificar tareas repetitivas.
- Se creo `devops/docker/Dockerfile.dev` como imagen base para herramientas de desarrollo.
- Se actualizo `docs/plan.md` con la decision de usar SQLite local y Docker solo para entorno de desarrollo.

## Decisiones

- No usar Docker para ejecutar la app desktop final.
- No usar un contenedor separado para base de datos mientras la persistencia sea SQLite.
- Mantener los puntos de entrada operativos en la raiz para evitar rutas complejas.
