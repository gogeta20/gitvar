# Sesion 2026-07-05 - colapsar Branches y recuperar el fondo del grafo

## Contexto

Despues de conectar `Branches` con el `History map`, aparecieron dos necesidades de usabilidad:

1. Poder esconder el sidebar de ramas para ganar ancho horizontal cuando el foco esta en el grafo.
2. Recuperar el fondo tintado del canal del grafo, porque ayudaba a distinguir ramas/lane a simple vista.

## Solucion aplicada

- `RepositoryWorkspace.tsx` ya no usa un toggle aislado de `Branches`; ahora mantiene tres estados:
  - `isSidebarOpen`
  - `isBranchesOpen`
  - `isStashOpen`
- El lateral izquierdo se dividio en:
  - un `sidebarRail` estrecho con accesos/atajos (`<`, `Br`, `St`)
  - un bloque de `sidebarPanels` que solo aparece cuando el menu esta abierto
- `Branches` paso a renderizarse como seccion embebida dentro del menu (`embedded`), para que deje de ser una card independiente y se comporte como contenido interno del sidebar.
- Se agrego una seccion `Stash` mock con items falsos (`stash@{0}`, `stash@{1}`, `stash@{2}`) para probar la idea de grupos funcionales anidados desde el principio.
- Cada seccion (`Branches`, `Stash`) tiene su propio boton `Show` / `Hide`, que fija la norma del sidebar: las funcionalidades agrupadas deben poder ocultarse individualmente una vez desplegado el menu general.
- Cuando el menu lateral completo esta colapsado:
  - el grid del workspace cambia a la variante `workspaceSidebarCollapsed`
  - el rail de accesos permanece visible
  - el espacio horizontal se devuelve al panel central del grafo
- `CommitGraphPanel.module.css` recupero un `linear-gradient` sutil en `graphCell`, basado en `--lane-color`, para volver a distinguir visualmente las lanes sin reintroducir el fondo fuerte que habiamos quitado antes para la seleccion de rama.

## Nota sobre el acento de seleccion

Se mantuvo separado el concepto de:

- fondo tintado del canal del grafo: permanente, sirve para leer mejor lanes
- borde de la fila seleccionada por rama: puntual, sirve para localizar el commit tip de la rama clicada

Esa separacion evita confundir "el color del lane" con "la fila seleccionada".
