# Comandos

Referencia rapida para levantar y verificar el proyecto en el entorno de desarrollo (contenedor `gitmap-dev`).

## Entorno Docker

- `make up`: construye y levanta el contenedor `dev`.
- `make down`: detiene el contenedor.
- `make shell`: abre una shell dentro del contenedor.
- `make logs`: sigue los logs del contenedor.
- `make clean`: baja el contenedor y elimina volumenes (borra `node_modules` y cache de cargo).

El puerto `5173` (frontend) esta mapeado al host en `docker-compose.yml`.

## Backend (Rust)

Ejecutar dentro del contenedor (`make shell` primero):

- `cd backend && cargo check`: verifica que compile sin generar binario.
- `cd backend && cargo build`: compila.
- `cd backend && cargo run`: levanta el servidor HTTP en `127.0.0.1:7878`.
- `cd backend && cargo test`: corre los tests.

El binario expone el servidor solo en `127.0.0.1`, por lo que hoy es accesible desde dentro del contenedor pero no desde el host. Si se necesita acceso desde fuera, hay que cambiar el bind a `0.0.0.0:7878` y mapear el puerto en `docker-compose.yml`.

## Frontend (React + Vite)

Ejecutar dentro del contenedor:

- `cd frontend && npm install`: instala dependencias (necesario la primera vez o tras `make clean`).
- `cd frontend && npm run dev -- --host 0.0.0.0`: levanta Vite accesible desde el host en `http://localhost:5173/`.
- `cd frontend && npm run check`: verifica tipos con `tsc --noEmit`.
- `cd frontend && npm run build`: compila para produccion (`tsc -b && vite build`).
- `cd frontend && npm run preview`: sirve el build de produccion.

## Flujo tipico para retomar el proyecto

1. `make up`
2. `docker exec gitmap-dev bash -c "cd frontend && npm install"` (si `node_modules` esta vacio)
3. `docker exec -d gitmap-dev bash -c "cd frontend && npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1"`
4. Abrir `http://localhost:5173/` en el navegador.
