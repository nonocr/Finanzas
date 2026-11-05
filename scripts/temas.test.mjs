// Los temas viven en src/lib/themes.ts, pero se repiten en archivos que no son TypeScript: los valores de Negra en
// src/index.css (primer pintado) y los íconos alternos en los proyectos de iOS y Android. Aquí se comprueba que
// todo siga cuadrando.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEMES, themeVars } from '../src/lib/themes.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('temas en archivos nativos y CSS', () => {
  it('Negra repite los valores de @theme en index.css', () => {
    const css = read('src/index.css');
    for (const [name, value] of Object.entries(themeVars(THEMES[0].tokens))) {
      if (value.startsWith('rgb(')) continue;
      expect(css, name).toContain(`${name}: ${value};`);
    }
  });

  it('cada ícono alterno existe en iOS y en Android', () => {
    const pbx = read('ios/App/App.xcodeproj/project.pbxproj');
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    const plugin = read('android/app/src/main/java/com/nonocr/finanzas/IconoAppPlugin.java');
    const script = read('scripts/iconos.ps1');
    const alternates = THEMES.flatMap((t) => (t.iconName ? [t] : []));
    expect(pbx).toContain(`ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES = "${alternates.map((t) => t.iconName).join(' ')}";`);
    for (const name of ['Negra', ...alternates.map((t) => t.iconName)]) {
      expect(manifest).toContain(`android:name=".${name}"`);
      expect(plugin).toContain(`"${name}"`);
    }
    // Los colores con que se dibujan los íconos son los del tema.
    for (const t of alternates) {
      expect(script).toContain(`ios = '${t.iconName}'`);
      expect(script).toContain(`bg = '${t.icon.bg}'; bars = @('${t.icon.bars.join("', '")}')`);
    }
  });
});
