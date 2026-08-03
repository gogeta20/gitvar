# Comandos

Referencia rapida para levantar y verificar el proyecto en el entorno de desarrollo (contenedor `gitmap-dev`).

## Entorno Docker

- `make up`: construye y levanta el contenedor `dev`.
- `make down`: detiene el contenedor.
- `make shell`: abre una shell dentro del contenedor.
- `make logs`: sigue los logs del contenedor.
- `make clean`: baja el contenedor y elimina volumenes (borra `node_modules` y cache de cargo).

Los puertos `5174` (frontend) y `7879` (backend) estan mapeados al host en `docker-compose.yml`.

## Backend (Rust)

Ejecutar dentro del contenedor (`make shell` primero):

- `cd backend && cargo check`: verifica que compile sin generar binario.
- `cd backend && cargo build`: compila.
- `cd backend && cargo run`: levanta el servidor HTTP en `0.0.0.0:7879`.
- `cd backend && cargo test`: corre los tests.

El binario ya expone el servidor en `0.0.0.0`, por lo que es accesible desde el host mediante el puerto publicado por Docker.

## Frontend (React + Vite)

Ejecutar dentro del contenedor:

- `cd frontend && npm install`: instala dependencias (necesario la primera vez o tras `make clean`).
- `cd frontend && npm run dev -- --host 0.0.0.0 --port 5174`: levanta Vite accesible desde el host en `http://localhost:5174/`.
- `cd frontend && npm run check`: verifica tipos (`tsc -b --noEmit tsconfig.app.json`; el proyecto usa project references, por lo que un `tsc --noEmit` sin `-b` no revisa nada realmente).
- `cd frontend && npm run build`: compila para produccion (`tsc -b && vite build`).
- `cd frontend && npm run preview`: sirve el build de produccion.

## Incidencias de arranque importantes

- `make up` no debe compilar herramientas pesadas de Rust ajenas al flujo normal de desarrollo. En esta copia del proyecto se quito la instalacion automatica de `tauri-cli` desde `devops/docker/Dockerfile.dev`, porque hacia que el primer build lanzara una compilacion enorme dentro de Docker (`cargo install tauri-cli`) y disparara la carga del equipo durante mucho tiempo.
- Si el host empieza a saturarse tras `make up` y aparecen muchos procesos `rustc`, revisar primero si alguien reintrodujo una instalacion de herramientas en el `Dockerfile.dev` o si se esta forzando un rebuild innecesario de la imagen.
- El flujo recomendado es separar el arranque base de las herramientas opcionales: primero levantar el contenedor y los servidores (`backend`/`frontend`), y solo despues instalar utilidades puntuales como `tauri-cli` si realmente se van a usar.
- Si hace falta cortar una compilacion runaway, parar el build de Docker y luego detener o matar el contenedor/procesos asociados antes de reintentar. No conviene insistir con `make up` hasta entender que capa esta recompilando.

## Navegar carpetas del host fuera del proyecto

El navegador de carpetas de "Open a folder" solo ve lo que este montado dentro del contenedor. Ahora, por defecto, `docker-compose.yml` monta el `HOME` del host en `/host/home` y el backend usa esa ruta como carpeta inicial de exploracion. En una maquina Linux tipica, eso hace que la app arranque directamente en algo como `/home/usuario` sin configuracion adicional.

Si por algun motivo ese mount no existe o no aplica en una maquina concreta, el backend cae automaticamente a `/workspace`, asi que el proyecto sigue siendo abrible aunque no vea el resto del host.

Solo hace falta un `docker-compose.override.yml` (gitignoreado, no se versiona) si alguien quiere usar otra raiz distinta, por ejemplo una carpeta de proyectos mas acotada:

```yaml
services:
  dev:
    volumes:
      - /ruta/a/tus/proyectos:/host/projects
    environment:
      - GITMAP_BROWSE_ROOT=/host/projects
```

`docker compose up` mezcla automaticamente ese archivo si existe.

Importante: el mount NO debe ser `:ro` (solo lectura). Las acciones de stage/unstage/discard (por archivo y por hunk) escriben directamente sobre el repo abierto (`git add`, `git apply`, etc.); con `:ro` fallan con "Read-only file system".

## App de escritorio (Tauri) desde el contenedor (opcional, por desarrollador)

`frontend/src-tauri` ya trae el backend embebido (arranca el mismo servidor HTTP en un thread interno, sin necesidad de correrlo aparte). Para ver la ventana nativa hace falta reenviar X11 y, si se quiere aceleracion por hardware, la GPU del host. Agregar esto al `docker-compose.override.yml` de cada desarrollador:

```yaml
services:
  dev:
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix:ro
    devices:
      - /dev/dri:/dev/dri
    group_add:
      - "44"   # grupo "video" del host (ver `getent group video`)
      - "110"  # grupo "render" del host (ver `getent group render`)
    environment:
      - DISPLAY=${DISPLAY}
```

Los numeros de grupo varian por maquina; confirmar con `getent group video render` en el host. Sin el mount de `/dev/dri`, WebKitGTK cae a renderizado por software (mas lento, con glitches visuales) por errores tipo `MESA: Failed to query drm device` / `libGL error: failed to load driver: iris` — no es un bug de la app, es falta de passthrough de GPU.

Ademas, `tauri-cli` ya no se instala durante `make up` para no convertir el arranque normal del proyecto en una compilacion larga de Rust. Si hace falta trabajar con la app desktop, instalarlo manualmente dentro del contenedor:

```bash
cd /workspace/frontend && cargo install tauri-cli
```

Luego, en el host, permitir que el contenedor use el display (`xhost +local:`), tener vite corriendo (puerto segun el clone, ver seccion de Frontend), y lanzar la app:

```bash
xhost +local:
docker exec -it <container> bash -c "cd /workspace/frontend && cargo tauri dev"
```

## Flujo tipico para retomar el proyecto

1. `make up`
2. `docker exec gitmap-dev-parallel bash -c "cd frontend && npm install"` (si `node_modules` esta vacio)
3. `docker exec -d gitmap-dev-parallel bash -c "cd backend && cargo run > /tmp/backend.log 2>&1"`
4. `docker exec -d gitmap-dev-parallel bash -c "cd frontend && npm run dev -- --host 0.0.0.0 --port 5174 > /tmp/vite.log 2>&1"`
5. Abrir `http://localhost:5174/` en el navegador.
