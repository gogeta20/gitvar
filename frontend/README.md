# Frontend

Base del frontend de GitMap.

## Estructura inicial

- `src/app/`: wiring de la aplicacion, providers, router y estilos globales.
- `src/shared/`: piezas potencialmente portables a otros frameworks.
- `src/core/`: base reutilizable especifica de React.
- `src/modules/`: modulos funcionales propios de GitMap.
- `src/pages/`: composicion de pantallas.
- `src/mocks/`: datos y escenarios temporales de desarrollo.

## Intencion

La estructura debe permitir validar GitMap primero y, cuando madure, extraer una base reutilizable para futuros proyectos frontend.

## Convencion de arquitectura

- DDD ligero en frontend: dominio claro, aplicacion explicita e infraestructura separada.
- Los componentes o pantallas no llaman a servicios externos directamente.
- Cada pantalla consume casos de uso.
- Cada caso de uso decide entre fuente `api` o `mock` segun `VITE_DATA_SOURCE`.
- El parseo y el mock viven cerca del propio caso de uso para no dispersar la logica.

## Convencion de estilos

- `src/app/styles/tokens.css`: variables globales de color, spacing, radios, sombras y tipografia.
- `src/app/styles/globals.css`: reset y estilos globales minimos.
- Cada componente o layout debe usar `*.module.css` co-localizado.
- Evitar CSS global por pagina salvo casos muy justificados.
- `core/` debe exponer primitivas visuales consistentes para que la personalizacion futura no dependa de parches dispersos.
