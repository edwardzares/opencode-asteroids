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
- **Estrella fugaz**: asteroide especial pequeño que cruza el mapa a ~240 px/s (mucho más rápido que los normales), con estela luminosa. Aparece periódicamente, dura 7 segundos y se desvanece si no es destruida. Otorga 150 puntos y no se divide en fragmentos.
- **Skins de la nave**: 6 apariencias distintas (Clásica, Neón, Caza, Fantasma, Dorada y Esmeralda). Cada skin cambia la silueta, el color, el brillo, la llama del propulsor, las balas, la estela del boost y las partículas de explosión. Se cambian en cualquier momento con `C` (ciclar) o con las teclas `1`–`6`, y la elección se guarda en `localStorage`. La skin activa también se usa en los iconos de vidas y se muestra en el HUD.
