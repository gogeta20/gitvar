# Sesion 2026-07-04 - modelado frontend

## Contexto

Se definio la estructura base del frontend antes de generar el scaffold tecnico de React.

## Objetivo de la decision

Crear una base que sirva para GitMap ahora, pero que tambien pueda evolucionar hacia un skeleton reutilizable para futuros proyectos frontend.

## Decision principal

La estructura inicial del frontend sera:

```txt
src/
  app/
  shared/
  core/
  modules/
  pages/
  mocks/
```

## Intencion de cada capa

### `app/`

Punto de ensamblaje de la aplicacion.

- Providers globales.
- Router.
- estilos globales.
- bootstrap de la app.

### `shared/`

Zona con vocacion de portabilidad entre frameworks.

Aqui deben vivir solo piezas agnosticas o casi agnosticas del framework:

- tipos compartidos
- contratos
- utilidades puras
- configuraciones
- tokens de tema
- helpers de validacion
- logica sin dependencia de React

La idea es que esta capa pueda inspirar o migrarse a otra implementacion futura, incluso si algun dia existe una variante en Vue.

### `core/`

Base reutilizable especifica de React.

Aqui deben vivir:

- componentes base
- layouts
- hooks
- providers de React
- estado base ligado a React
- integraciones genericas de UI

Esta capa debe ser lo bastante limpia como para extraerse mas adelante a un proyecto tipo `skeleton-react`, pero sin intentar forzar compatibilidad directa con otros frameworks.

### `modules/`

Funcionalidad propia de GitMap.

Aqui iran los modulos concretos del producto, por ejemplo:

- grafo de commits
- detalle de commit
- preferencias visuales
- exploracion del repositorio

Regla importante: la logica especifica de GitMap no debe ir a `core/`.

### `pages/`

Composicion de pantallas a partir de `core/` y `modules/`.

Esta capa organiza vistas completas y ayuda a que los modulos no se acoplen a la estructura de navegacion.

### `mocks/`

Datos y escenarios falsos para iterar rapido en UI sin bloquearse por backend o integraciones tempranas.

## Razonamiento

No se eligio una estructura puramente por `features/` porque el objetivo no es solo construir GitMap, sino tambien aprender y consolidar una base frontend reutilizable.

Tampoco se intento crear una capa universal para React y Vue en la UI, porque eso llevaria demasiado pronto a abstracciones pobres. En cambio:

- `shared/` apunta a lo portable.
- `core/` apunta a lo reusable dentro de React.
- `modules/` concentra el dominio especifico de GitMap.

## Resultado aplicado

Se creo la estructura inicial en `frontend/src/` con las carpetas:

- `app/`
- `shared/`
- `core/`
- `modules/`
- `pages/`
- `mocks/`

## Siguiente paso sugerido

Generar el scaffold tecnico de `React + TypeScript` dentro de `frontend/` respetando esta estructura desde el inicio.
