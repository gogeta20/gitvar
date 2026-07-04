# Sesion 2026-07-04 - backend primer caso de uso

## Contexto

Se inicio el backend en Rust con una prueba minima pero real: leer ramas del repositorio mediante Git CLI.

## Decision principal

No se fuerza DDD enterprise en Rust, pero si se mantiene una separacion clara:

- `domain/`
- `app/`
- `infrastructure/`
- `presentation/`

## Razonamiento

Rust no dificulta tener dominio y casos de uso claros.

Lo que suele resultar poco natural es:

- exceso de capas vacias
- abstracciones genericas demasiado pronto
- buses y ceremonias innecesarias

Para este proyecto, la aproximacion correcta es DDD ligero:

- tipos de dominio fuertes
- puertos explicitos
- casos de uso pequeños
- infraestructura aislada

## Slice implementado

Se implemento el caso de uso `read_branches`.

Flujo actual:

```txt
main
  -> presentation::cli
    -> app::branches::read_branches
      -> BranchReader
        -> GitCliBranchReader
          -> git for-each-ref
```

## Comando Git usado

Se usa:

```txt
git for-each-ref refs/heads refs/remotes --format=%(refname)|%(refname:short)|%(objectname)
```

## Intencion

Empezar por Git CLI permite:

- avanzar rapido
- entender bien el modelo de datos
- aislar el parseo
- cambiar mas adelante a otra implementacion si de verdad hace falta

## Resultado

El backend ya puede ejecutarse como binario y listar ramas de un repositorio.

Si no recibe argumento, intenta usar el repositorio raiz actual como objetivo.

## Verificacion realizada

Se valido con:

- `cargo test`
- `cargo run -- ..`

La ejecucion sobre este repo devolvio `0` ramas, lo cual es coherente porque el repositorio aun no tiene commits ni refs materializadas en `refs/heads/`.

## Siguiente paso sugerido

Mantener el mismo patron para:

- tags
- commits
- estado del working tree
