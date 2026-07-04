# Sesion 2026-07-04 - commit graph real

## Contexto

Se inicio la segunda conexion real entre frontend y backend: el panel central del grafo de commits.

## Decision principal

No se usa una libreria de diagramas generica para este primer intento.

Se construye un grafo simple propio con:

- endpoint real de commits en backend
- layout de lanes calculado en frontend
- render por filas con SVG

## Backend

Se agrego el caso de uso `read_commits` y el endpoint:

```txt
GET /api/commits?repoPath=/ruta/al/repo
```

La lectura se hace con:

```txt
git log --all --topo-order --decorate=short --date=iso-strict --pretty=format:...
```

## Frontend

Se creo un modulo `graph` con:

- contrato
- caso de uso
- parser
- source `api`
- provider
- builder de lanes
- `CommitGraphPanel`

## Intencion

Esta version no busca perfeccion visual.

Busca validar:

- contrato real de commits
- orden topologico
- asignacion simple de lanes
- integracion visual sin depender de mocks en el panel central

## Estado del detalle

El panel derecho sigue con detalle mock.

La seleccion del commit ya sale del grafo real, pero el contenido fino del detalle se refinara en slices posteriores.

## Siguiente paso sugerido

Mejorar la calidad del layout del grafo:

- merges
- continuidad de lanes
- diferenciacion de refs
- estado remoto/local en decoraciones
