# Bug: el grafo te devuelve a la fila seleccionada mientras scrolleas

## Sintoma

Si seleccionas una rama en la tabla de `Branches` (o cualquier commit) y despues
intentas hacer scroll en el `History map` para navegar el historial, cada pocos
segundos la vista salta de vuelta a la fila seleccionada. En la practica esto
hace imposible navegar y revisar commits distintos al seleccionado.

Repro: seleccionar una rama, scrollear hacia arriba/abajo en la tabla de commits,
esperar ~2 segundos sin soltar el mouse.

## Causa raiz

En `frontend/src/modules/graph/ui/CommitGraphPanel.tsx:185-187`:

```ts
useEffect(() => {
  selectedRowRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
}, [selectedCommitId, graphCommits]);
```

Este efecto tambien se dispara cuando cambia la referencia de `graphCommits`, no
solo `selectedCommitId`. `graphCommits` depende (via `useMemo`) de
`commitsWithSynthetic` -> `commitsWithWorkingChanges` -> `workingStatus`
(`CommitGraphPanel.tsx:104-131`).

`workingStatus` se actualiza por polling cada 2 segundos
(`CommitGraphPanel.tsx:89-101`, `window.setInterval(fetchWorkingStatus, 2000)`),
y cada respuesta trae un objeto nuevo aunque el contenido no haya cambiado. Eso
invalida la memoizacion de `graphCommits` en cada poll, lo que vuelve a disparar
el `scrollIntoView` sobre la fila seleccionada aunque el usuario no haya tocado
la seleccion.

## Por que importa

Rompe la navegacion libre del grafo despues de seleccionar cualquier commit o
rama: cada ~2s la vista se reposiciona sola.

## Siguiente paso

<!-- TODO: separar el auto-scroll del cambio real de seleccion. Opciones:
1) Dependencia solo de `selectedCommitId` (y quizas un flag que distinga
   seleccion "por click humano" de rebuild de grafo).
2) Memoizar `workingStatus` por valor (comparar campos antes de `setWorkingStatus`)
   para que el polling no genere una referencia nueva si nada cambio realmente. -->
