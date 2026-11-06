// Escribe scripts/iconos/iconos.json con los colores de los íconos alternos, calculados por las recetas de src/lib/theme/themes.ts.
// Luego scripts/iconos/iconos.ps1 los dibuja para iOS y Android.
//   node scripts/iconos/temas-iconos.mjs && powershell -ExecutionPolicy Bypass -File scripts/iconos/iconos.ps1
// (Node 22.6+ lee el TypeScript de themes.ts directamente.)
import { writeFileSync } from 'node:fs';
import { THEMES } from '../../src/lib/theme/themes.ts';

const iconos = THEMES.filter((t) => t.iconName).map((t) => ({
  ios: t.iconName,
  android: t.iconName.toLowerCase(),
  bg: t.icon.bg,
  bars: t.icon.bars,
}));
writeFileSync(new URL('./iconos.json', import.meta.url), JSON.stringify(iconos, null, 2) + '\n');
console.log(`scripts/iconos/iconos.json: ${iconos.map((i) => i.ios).join(', ')}`);
