# Plan

## Objetivo inicial

Construir la base de GitMap como aplicacion desktop para explorar repositorios Git de forma visual, empezando por un MVP de solo lectura.

## Direccion tecnica acordada

- Desktop con Tauri.
- Frontend con React y TypeScript.
- Backend local en Rust.
- SQLite como base de datos local embebida.
- Arquitectura pragmatica: dominio claro, casos de uso explicitos y separacion por capas sin sobreingenieria.
- Evitar por ahora CQRS duro, buses genericos y complejidad enterprise.
- Docker solo para encapsular el entorno de desarrollo y automatizar tareas, no para ejecutar la app desktop como producto final.

## MVP previsto

1. Abrir un repositorio local.
2. Leer commits, ramas y tags.
3. Pintar un grafo basico.
4. Seleccionar un commit.
5. Ver diff.
6. Cambiar tema y fuente.
7. Buscar commits.

## Criterios de implementacion

- Empezar en modo solo lectura.
- Priorizar velocidad de iteracion y seguridad del repositorio.
- Usar Git CLI primero si acelera el desarrollo.
- Introducir operaciones peligrosas solo cuando exista una simulacion visual y trazabilidad local.

## Estructura documental inicial

- `docs/normas.md`: reglas de trabajo y convenciones del proyecto.
- `docs/plan.md`: plan activo del proyecto, actualizable cuando cambie la direccion.

## Estructura raiz inicial

- `frontend/`: interfaz React y TypeScript.
- `backend/`: codigo Rust/Tauri cuando definamos el esqueleto final.
- `config/`: configuraciones del proyecto y plantillas.
- `devops/`: Dockerfiles y automatizacion de entorno.
- `db/`: recursos de persistencia local, migraciones o seeds si llegan a ser necesarias.
- `docker-compose.yml`: entorno de desarrollo aislado.
- `Makefile`: atajos operativos del proyecto.

## Direccion del frontend

- Estructura inicial en `frontend/src/`: `app/`, `shared/`, `core/`, `modules/`, `pages/` y `mocks/`.
- `shared/` reunira piezas potencialmente portables a React o Vue, como tipos, utilidades, contratos y tokens.
- `core/` sera la base reutilizable especifica de React, como componentes, layouts, hooks y providers.
- `modules/` contendra la funcionalidad propia de GitMap y no debe contaminar la base reutilizable.
- La explicacion y el razonamiento de esta decision se documentan en `docs/sesiones/2026-07-04-modelado-frontend.md`.
- Las pantallas deben consumir casos de uso, no servicios directos.
- Cada caso de uso puede resolver implementacion `api` o `mock` segun `VITE_DATA_SOURCE`.
- El detalle de esta convencion se documenta en `docs/sesiones/2026-07-04-frontend-ddd-y-casos-de-uso.md`.
- La base visual debe apoyarse en tokens globales y CSS Modules co-localizados para evitar dispersion de estilos.
- El detalle de esta convencion se documenta en `docs/sesiones/2026-07-04-estilos-frontend.md`.
- La personalizacion visual debe resolverse con tokens semanticos y presets de tema, no con colores directos en componentes.
- La primera validacion del sistema de temas se hace con un preset `dracula`.
- El detalle de esta convencion se documenta en `docs/sesiones/2026-07-04-sistema-de-temas.md`.
- La primera vertical visual se centra en un workspace de repositorio con mocks y una composicion inspirada en GitKraken.
- El detalle de esta fase se documenta en `docs/sesiones/2026-07-04-pantallas-y-mocks-iniciales.md`.

## Direccion del backend

- Mantener una separacion ligera en Rust: `domain/`, `app/`, `infrastructure/` y `presentation/`.
- Empezar con Git CLI para obtener datos reales del repositorio antes de evaluar otras integraciones.
- El primer caso de uso implementado es la lectura de ramas con `git for-each-ref`.
- El detalle de esta fase se documenta en `docs/sesiones/2026-07-04-backend-primer-caso-de-uso.md`.
- En esta rama de trabajo, el primer punto de conexion real entre frontend y backend es el panel de ramas.
- El resto del workspace se mantiene con mocks hasta que la integracion se consolide.
- El detalle de esta fase se documenta en `docs/sesiones/2026-07-04-branches-panel-real.md`.
- El segundo punto de conexion real entre frontend y backend es el panel central del commit graph.
- El primer render del grafo usa un layout simple propio con SVG por filas y calculo de lanes en frontend.
- El detalle de esta fase se documenta en `docs/sesiones/2026-07-04-commit-graph-real.md`.
- El trabajo actual se centra en definir un `GraphView v1` que deje atras la idea de tabla y convierta el panel central en una vista de grafo dedicada.
- El estado exacto de cierre y el punto de reanudacion se documentan en `docs/sesiones/2026-07-05-cierre-grafo-v1.md`.
- El grafo ya refleja el estado de working tree sucio mediante un nodo sintetico `Uncommitted changes`.
- Los limites y riesgos conocidos de ese slice se documentan en `docs/sesiones/2026-07-05-nodo-working-changes.md`.
- El layout engine del grafo se reescribio con el algoritmo clasico de columnas (el mismo principio que `git log --graph`), reemplazando la logica incremental que dejaba lanes fantasma tras un fork.
- El detalle del diagnostico y la solucion se documenta en `docs/sesiones/2026-07-05-layout-engine-clasico.md`.
- El grafo ahora reconoce cuando el working tree tiene cambios sin commitear: un nuevo endpoint `/api/status` expone `isDirty` y `headCommitId`, y el frontend antepone un commit sintetico "Uncommitted changes" al layout engine, visualmente distinto (punto hueco, linea punteada).
- El detalle de esta fase se documenta en `docs/sesiones/2026-07-05-nodo-working-changes.md`.
- Los commits que son punto de origen de varias ramas muestran un badge con la cantidad de ramas que divergen desde ahi, calculado en el frontend a partir del propio layout engine.
- El detalle de esta fase se documenta en `docs/sesiones/2026-07-05-badge-divergencia-ramas.md`.
