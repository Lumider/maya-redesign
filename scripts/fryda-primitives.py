#!/usr/bin/env python3
"""Genera src/fryda-primitives.scss desde design-tokens/Primitives.json.

Los primitives de color FrYDA (export de Figma Variables) se convierten en
custom properties CSS: color/yanbal-orange/60 → --fry-yanbal-orange-60.
Correr tras actualizar el JSON:  python3 scripts/fryda-primitives.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
datos = json.loads((RAIZ / 'design-tokens' / 'Primitives.json').read_text())
modo = next(iter(datos['modes']))

lineas = [
    '/* GENERADO por scripts/fryda-primitives.py — NO editar a mano.',
    '   Fuente: design-tokens/Primitives.json (FrYDA Foundations · Figma Variables). */',
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
    nombre = '--fry-' + v['name'].removeprefix('color/').replace('/', '-')
    r, g, b, a = (round(c['r'] * 255), round(c['g'] * 255), round(c['b'] * 255), c.get('a', 1))
    valor = f'#{r:02x}{g:02x}{b:02x}' if a >= 1 else f'rgba({r}, {g}, {b}, {round(a, 3)})'
    lineas.append(f'  {nombre}: {valor};')
    n += 1
lineas += ['}', '']
(RAIZ / 'src' / 'fryda-primitives.scss').write_text('\n'.join(lineas))
print(f'✓ {n} primitives de color → src/fryda-primitives.scss')
