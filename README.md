# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |
| `C`       | Cambiar skin |
| `1`–`6`   | Elegir skin directamente |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de **velocidad**: al destruir asteroides puede aparecer un rayo cian flotante. Al recogerlo, la nave obtiene empuje ×2.5 y un tope de velocidad alto durante **5 segundos**, con estela cian y contador en el HUD. Si no se recoge, desaparece a los 12 segundos.
- Power-up de **triple shot**: icono magenta con tres flechas paralelas. Durante **5 segundos**, cada disparo lanza 3 balas paralelas en línea recta, con contador en el HUD. Si no se recoge, desaparece a los 12 segundos.
- **Escudo**: power-up circular azul que puede aparecer al destruir asteroides. Al recogerlo, la nave queda rodeada por una burbuja protectora durante **8 segundos**: bloquea y destruye los proyectiles enemigos y, si la nave choca contra un asteroide, el escudo lo destruye (con puntos, explosión y fragmentos) en lugar de perder una vida. Cada impacto genera un destello y partículas. El HUD muestra el tiempo restante. La lógica de proyectiles enemigos (`EnemyBullet` y `enemyBullets`) ya está integrada para cuando se añadan naves enemigas.
- **Estrella fugaz**: asteroide especial pequeño que cruza el mapa a ~240 px/s (mucho más rápido que los normales), con estela luminosa. Aparece periódicamente, dura 7 segundos y se desvanece si no es destruida. Otorga 150 puntos y no se divide en fragmentos.
- **Skins de la nave**: 6 apariencias distintas (Clásica, Neón, Caza, Fantasma, Dorada y Esmeralda). Cada skin cambia la silueta, el color, el brillo, la llama del propulsor, las balas, la estela del boost y las partículas de explosión. Se cambian en cualquier momento con `C` (ciclar) o con las teclas `1`–`6`, y la elección se guarda en `localStorage`. La skin activa también se usa en los iconos de vidas y se muestra en el HUD.

## Comando `/worktree`

El proyecto incluye un comando local de OpenCode definido en `.opencode/commands/worktree.md`. Crea un worktree de git a partir de una descripción de la necesidad, derivando automáticamente el nombre de la rama y de la carpeta.

### Uso

```text
/worktree <necesidad>
```

Ejemplos:

| Invocación | Rama | Ruta |
| ---------- | ---- | ---- |
| `/worktree agregar escudo doble` | `feature/escudo-doble` | `.worktrees/escudo-doble` |
| `/worktree sistema de vidas` | `feature/sistema-de-vidas` | `.worktrees/sistema-de-vidas` |
| `/worktree triple-shot` | `feature/triple-shot` | `.worktrees/triple-shot` |

### Comportamiento

1. Toma la necesidad indicada y deriva un nombre corto en kebab-case: solo minúsculas, números y guiones, sin espacios ni acentos.
2. Si el texto recibido ya es un nombre válido y descriptivo, lo usa tal cual.
3. Verifica que no exista ya la rama `feature/<nombre>` ni la ruta `.worktrees/<nombre>`.
4. Si el nombre ya existe, no reutiliza ni sobrescribe nada: propone una alternativa y pide confirmación.
5. Ejecuta desde la raíz del proyecto:

   ```bash
   git worktree add -b feature/<nombre> .worktrees/<nombre>
   ```

6. Informa la ruta creada y la rama. No hace ningún otro cambio ni mueve la sesión de directorio.

Si el comando se invoca sin una descripción, pide la necesidad y no ejecuta nada.

### Notas

- Es un comando **solo de este proyecto** (`.opencode/commands/`), no de la configuración global de OpenCode.
- Al invocarlo, la sesión cambia al agente **Build**.
- El comando `git` se ejecuta con la herramienta de shell, por lo que pasa por el flujo de permisos de OpenCode.
- `.worktrees/` está incluido en `.gitignore`, así que los worktrees no ensucian el repositorio.
