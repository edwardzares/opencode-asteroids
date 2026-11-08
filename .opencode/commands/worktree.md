---
description: Crea un worktree en .worktrees con rama feature/<nombre> a partir de una necesidad
agent: build
---

Crea un git worktree nuevo para este proyecto (03-asteroids) a partir de esta necesidad:

$ARGUMENTS

Instrucciones:

1. Deriva un nombre corto en kebab-case que resuma la necesidad: solo minúsculas, números y guiones, sin espacios ni acentos. Ejemplo: "agregar escudo doble" -> `escudo-doble`.
2. Si el texto recibido ya es un nombre válido y descriptivo (por ejemplo `escudo-doble`), úsalo tal cual.
3. Verifica que no exista ya la rama `feature/<nombre>` ni la ruta `.worktrees/<nombre>` usando `git worktree list` y `git branch --list "feature/<nombre>"`.
   - Si ya existe, no la reutilices ni la sobrescribas: propone un nombre alternativo y pide confirmación.
4. Desde la raíz del proyecto ejecuta exactamente:
   `git worktree add -b feature/<nombre> .worktrees/<nombre>`
5. Responde con la ruta creada y la rama. No hagas ningún otro cambio ni muevas la sesión de directorio.

Si la necesidad indicada arriba está vacía, no ejecutes nada: pide al usuario que describa lo que necesita.
