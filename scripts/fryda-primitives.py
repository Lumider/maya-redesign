#!/usr/bin/env python3
"""Genera src/fryda-primitives.scss desde design-tokens/Primitives.json.

Los primitives de color FrYDA (export de Figma Variables) se convierten en
custom properties CSS: color/yanbal-orange/60 → --fry-yanbal-orange-60.

Desde la adopción de la librería oficial (docs/fryda-adopcion.md), cada
variable local referencia su equivalente del CDN oficial de FrYDA
(--fry-p-color-…, cargado versionado en index.html) con el hex del export
como fallback: la fuente de verdad es el CDN y el prototipo sigue
funcionando idéntico si el CDN no responde (los valores están verificados
como iguales). Correr tras actualizar el JSON:
    python3 scripts/fryda-primitives.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / 'design-tokens' / 'Primitives.json').read_text())
modo = next(iter(datos['modes']))

lineas = [
    '/* GENERADO por scripts/fryda-primitives.py — NO editar a mano.',
    '   Fuente de verdad: CDN oficial FrYDA (--fry-p-color-*, ver index.html);',
    '   fallback: design-tokens/Primitives.json (mismo valor, verificado). */',
    '',
    ':root {',
]
n = 0
for v in datos['variables']:
    if v['type'] != 'COLOR':
        continue
    c = v['valuesByMode'][modo]
    if not isinstance(c, dict) or 'r' not in c:
        continue
    sufijo = v['name'].removeprefix('color/').replace('/', '-')
    r, g, b, a = (round(c['r'] * 255), round(c['g'] * 255), round(c['b'] * 255), c.get('a', 1))
    valor = f'#{r:02x}{g:02x}{b:02x}' if a >= 1 else f'rgba({r}, {g}, {b}, {round(a, 3)})'
    linea = f'  --fry-{sufijo}: var(--fry-p-color-{sufijo}, {valor});'
    if len(linea) > 100:  # printWidth de Prettier: emitir ya en su forma multilínea
        linea = f'  --fry-{sufijo}: var(\n    --fry-p-color-{sufijo},\n    {valor}\n  );'
    lineas.append(linea)
    n += 1
lineas += ['}', '']
(RAIZ / 'src' / 'fryda-primitives.scss').write_text('\n'.join(lineas))
print(f'✓ {n} primitives de color → src/fryda-primitives.scss (CDN + fallback)')
