# Sesion 2026-07-04 - pantallas y mocks iniciales

## Contexto

Se inicio la primera vertical visual real de GitMap, tomando GitKraken como referencia de layout y flujo base.

## Objetivo

Dejar una primera pantalla útil para discutir producto y UX antes de conectar el backend Git real.

## Decision de diseño

Se usa GitKraken como punto de partida visual, pero no como objetivo de copia exacta.

La estructura elegida para la pantalla principal es:

- sidebar izquierda para repositorios y ramas
- panel central para historial y grafo simplificado
- panel derecho para detalle del commit y preview de operaciones futuras

## Decision técnica

Se crea un módulo `repository` con la misma convención acordada para frontend:

- `domain/`
- `application/`
- `infrastructure/`
- `ui/`

## Flujo implementado

```txt
HomePage
  -> RepositoryWorkspace
    -> loadRepositoryWorkspace
      -> RepositoryReader
        -> provider api/mock
```

## Mocks incluidos

El workspace mock incluye:

- lista de repositorios
- lista de ramas
- historial de commits
- commit seleccionado
- repositorio seleccionado

## Ajuste de flujo aplicado

La primera pantalla ya no mezcla seleccion y exploracion.

Ahora el flujo simulado queda asi:

1. Home para elegir repositorio.
2. Click en repositorio.
3. Apertura del workspace a ancho completo.
4. Layout en tres paneles: ramas y repos, grafo e historial, detalle y preview.

## Intencion

Este mock ya no es genérico. Está pensado para empezar a validar:

- composición de paneles
- densidad visual
- lectura de historial
- jerarquía de información
- espacio reservado para acciones seguras futuras

## Siguiente paso sugerido

Iterar sobre esta pantalla:

- mejorar el grafo visual
- añadir búsqueda y filtros
- definir el estado de selección y navegación
- preparar el primer contrato real con backend
