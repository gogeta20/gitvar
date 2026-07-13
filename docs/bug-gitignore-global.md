# Bug: la app no respeta el gitignore global del usuario

## Sintoma

La app muestra archivos como modificados (ej. `.claude/...`) que en realidad estan
ignorados globalmente por el usuario via `core.excludesFile` (el gitignore global,
tipicamente `~/.gitignore` o `~/.config/git/ignore`).

Repro:

```
❯ git status
En la rama main
Tu rama está adelantada a 'origin/main' por 2 commits.
  (usa "git push" para publicar tus commits locales)

nada para hacer commit, el árbol de trabajo está limpio
```

La shell dice arbol limpio, pero GitMap muestra `.claude` (y potencialmente otros
archivos cubiertos por el gitignore global) como cambios sin commitear.

## Hipotesis de causa raiz

`GitCliStatusReader::read_status` (`backend/src/infrastructure/git/git_cli_status_reader.rs:19-20`)
ejecuta `git status --porcelain --untracked-files=all` via `Command::new("git")`,
igual que lo haria una shell. En teoria deberia respetar el mismo `core.excludesFile`
que la terminal.

La sospecha es que el proceso backend (lanzado por Tauri) no hereda el mismo
entorno que la shell interactiva del usuario (`HOME`, `XDG_CONFIG_HOME`, etc.).
Si el subproceso `git` no encuentra `~/.gitconfig`, no sabe que existe un
`core.excludesFile` configurado globalmente, y por tanto no lo aplica: trata como
"cambios reales" archivos que el usuario ignora globalmente en toda su maquina.

`GitCliFileDiffReader::is_untracked_file` (`backend/src/infrastructure/git/git_cli_file_diff_reader.rs:88-101`)
usa el mismo patron de invocacion de `git status --porcelain`, asi que arrastraria
el mismo problema si la hipotesis es correcta.

## Por que importa

Esto genera falsos positivos de "working tree sucio" en el grafo (nodo sintetico
`Uncommitted changes`) y en el panel de archivos cambiados, mostrando archivos que
el usuario nunca veria en su flujo normal de git.

## Siguiente paso

<!-- TODO: confirmar la hipotesis (revisar el entorno con el que Tauri lanza el
proceso backend / los subprocesos git: HOME, XDG_CONFIG_HOME, si se pasa env()
explicito en algun Command::new("git")) y corregirlo, ya sea heredando el entorno
del usuario o resolviendo `core.excludesFile` explicitamente antes de invocar git. -->
