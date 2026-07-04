# Sesion 2026-07-04 - branches panel real

## Contexto

Se abrio la rama de trabajo `feature/real-branches-panel` para conectar frontend y backend en un slice pequeño y controlado.

## Decision principal

No se conecta todo el workspace de golpe.

Solo el panel de ramas consumira backend real. El resto de la UI seguira con mocks.

## Backend

Se ajusto el modulo de ramas:

- `use_cases.rs` se renombro a `read_branches.rs`
- se mantuvo el flujo por `Git CLI`
- se agrego una presentacion HTTP minima en `127.0.0.1:7878`

Endpoint expuesto:

```txt
GET /api/branches?repoPath=/ruta/al/repo
```

## Frontend

Se creo un modulo `branches` independiente con:

- dominio
- contrato
- caso de uso
- parser
- source `api`
- provider
- componente `BranchesPanel`

Este panel recibe:

- `repositoryPath`
- `activeBranchName`

y consulta ramas reales contra el backend local.

## Intencion

Este enfoque permite:

- probar la conexion real sin romper toda la UI
- validar el contrato entre capas
- mantener el resto del producto estable con mocks
- reducir el radio de fallo

## Verificacion realizada

Se valido con:

- `cargo test`
- `npm run check`
- `npm run build`

## Siguiente paso sugerido

Si la experiencia es estable, repetir el mismo patron para:

- commits
- tags
- working tree status
