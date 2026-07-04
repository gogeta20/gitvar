# Sesion 2026-07-04 - frontend ddd y casos de uso

## Contexto

Se definio como debe fluir la logica de frontend antes de conectar integraciones reales.

## Decision principal

El frontend usara una aproximacion de DDD ligero con casos de uso explicitos.

La regla principal es:

- las pantallas no llaman servicios directamente
- las pantallas llaman casos de uso
- los casos de uso dependen de contratos
- la infraestructura resuelve si la fuente es `api` o `mock`

## Flujo esperado

```txt
Page / UI
  -> Use case
    -> Contract
      -> Infrastructure provider
        -> API or Mock
```

## Motivacion

Esto da varias ventajas practicas:

- evita acoplar componentes a `fetch`
- permite iterar en UI sin backend listo
- deja el parseo junto a la integracion
- mantiene la decision `api/mock` fuera de la pantalla
- prepara una base reutilizable para futuros proyectos

## Regla sobre mocks

Cada caso de uso debe poder funcionar con una implementacion `mock` cuando el entorno lo requiera.

La seleccion de fuente se hace con:

```txt
VITE_DATA_SOURCE=mock
VITE_DATA_SOURCE=api
```

## Regla sobre parseo

El parseo del dato externo debe vivir cerca de la fuente que lo entrega, no dentro del componente.

Esto evita:

- componentes con logica de transformacion
- duplicacion de mapeos
- mezcla entre UI y contrato externo

## Aplicacion inicial en el scaffold

Se implemento un ejemplo base con el modulo `user`:

- contrato `UserReader`
- caso de uso `getCurrentUser`
- parser `parseUserDto`
- fuente `api`
- fuente `mock`
- provider que resuelve por `env`
- componente `CurrentUserCard` que consume el caso de uso

Ademas se creo el scaffold tecnico base del frontend con:

- `Vite`
- `React`
- `TypeScript`
- aliases de importacion
- `VITE_DATA_SOURCE` como selector de fuente

## Relacion con la estructura general

- `shared/` contiene la resolucion comun por entorno.
- `core/` contiene layout y componentes base.
- `modules/` contiene el modulo funcional y su caso de uso.
- `pages/` compone la pantalla.

## Verificacion realizada

Se instalaron dependencias y se valido el scaffold con:

- `npm run check`
- `npm run build`

Ambas verificaciones pasaron correctamente.

## Siguiente paso sugerido

Expandir el primer modulo real de GitMap, empezando por la apertura de repositorio y una vista inicial de exploracion basada en mocks.
