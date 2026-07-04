# Sesion 2026-07-04 - estilos frontend

## Contexto

Se reviso la organizacion de estilos del scaffold inicial del frontend para evitar dispersion temprana y deuda visual.

## Problema detectado

Aunque el scaffold inicial funcionaba, empezaba a aparecer una señal de riesgo:

- varios archivos CSS sueltos
- mezcla entre estilos globales y locales
- convencion poco clara para crecer

Esto, llevado al tiempo, termina dificultando la personalizacion y haciendo costoso tocar la UI.

## Decision principal

La base de estilos del frontend usara:

- tokens globales en `src/app/styles/tokens.css`
- estilos globales minimos en `src/app/styles/globals.css`
- CSS Modules co-localizados por componente, layout o pagina

## Intencion

Separar claramente:

- sistema visual compartido
- reglas globales minimas
- estilo local de cada pieza

## Reglas acordadas

1. `globals.css` solo debe contener reset, base del documento y reglas globales minimas.
2. Colores, spacing, radios, sombras y tipografia deben salir de tokens.
3. Cada componente o layout nuevo debe preferir `*.module.css`.
4. Evitar clases globales de pagina si no son necesarias.
5. `core/` debe concentrar primitivas visuales reutilizables y consistentes.

## Motivacion

Esta convencion prepara mejor el terreno para:

- personalizacion futura
- extraccion de un `skeleton-react`
- menor acoplamiento entre vistas
- cambios de tema menos dolorosos

## Aplicacion en el scaffold

Se realizo un refactor inicial:

- `global.css` se sustituyo por `tokens.css` y `globals.css`
- `ShellLayout` ahora usa `ShellLayout.module.css`
- `InfoCard` ahora usa `InfoCard.module.css`
- `HomePage` ahora usa `HomePage.module.css`

## Siguiente paso sugerido

Mantener esta convencion al crear el primer modulo real de GitMap para comprobar que sigue siendo comoda bajo uso real.
