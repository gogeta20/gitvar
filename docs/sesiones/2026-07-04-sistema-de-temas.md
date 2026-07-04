# Sesion 2026-07-04 - sistema de temas

## Contexto

Se decidio que GitMap debe poder adoptar temas familiares para programadores, como Dracula o los temas por defecto de VS Code y JetBrains, sin reescribir componentes.

## Decision principal

La UI no debe depender de colores hardcoded dentro de componentes o paginas.

En su lugar, la base visual debe apoyarse en:

- tokens semanticos
- preset de tema
- activacion del tema por atributo de documento

## Estructura aplicada

Se introdujo un primer sistema simple:

- `tokens.css` define el contrato visual
- `:root[data-theme="dracula"]` redefine los valores del tema activo
- la app fija temporalmente `data-theme="dracula"` para validar el enfoque

## Tipos de token

La estructura inicial contempla al menos:

- fondo de app
- superficies
- bordes
- texto primario, secundario y acento
- badges
- colores de lanes del grafo
- sombras y radios

## Regla importante

Los componentes deben consumir intencion visual, no colores concretos.

Ejemplos correctos:

- `--color-bg-panel`
- `--color-border-selected`
- `--color-graph-lane-1`

Ejemplos a evitar como contrato principal:

- `--slate-900`
- `--blue-500`
- hex directos dentro de modulos CSS

## Fuente usada para Dracula

La paleta base de Dracula se tomo de la paleta oficial publicada por Dracula Theme.

## Siguiente paso sugerido

Si la prueba visual funciona bien, el siguiente paso es:

- extraer presets en archivos de tema
- añadir selector de tema
- permitir persistencia de tema por preferencia local
