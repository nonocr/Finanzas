// Los temas se calculan en src/lib/themes.ts, pero se repiten en archivos que no son TypeScript: los valores de Negra
// en src/index.css (primer pintado), los colores de los íconos (scripts/iconos.json) y los íconos alternos en los
// proyectos de iOS y Android. Aquí se comprueba que todo siga cuadrando.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEMES, themeVars } from '../src/lib/themes.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));
const alternates = THEMES.filter((t) => t.iconName);

describe('temas en CSS y en los proyectos nativos', () => {
  it('Negra repite sus valores en @theme de index.css', () => {
    const css = read('src/index.css');
    for (const [name, value] of Object.entries(themeVars(THEMES[0].tokens))) expect(css, name).toContain(`${name}: ${value};`);
  });

  it('scripts/iconos.json está al día (node scripts/temas-iconos.mjs)', () => {
    const json = JSON.parse(read('scripts/iconos.json'));
    expect(json).toEqual(
      alternates.map((t) => ({ ios: t.iconName, android: t.iconName.toLowerCase(), bg: t.icon.bg, bars: t.icon.bars })),
    );
  });

  it('cada ícono alterno existe en iOS y en Android', () => {
    const pbx = read('ios/App/App.xcodeproj/project.pbxproj');
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    const plugin = read('android/app/src/main/java/com/nonocr/finanzas/IconoAppPlugin.java');
    expect(pbx).toContain(`ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES = "${alternates.map((t) => t.iconName).join(' ')}";`);
    for (const name of ['Negra', ...alternates.map((t) => t.iconName)]) {
      expect(manifest).toContain(`android:name=".${name}"`);
      expect(plugin).toContain(`"${name}"`);
    }
    for (const t of alternates) {
      const r = t.iconName.toLowerCase();
      expect(exists(`ios/App/App/Assets.xcassets/${t.iconName}.appiconset/icon-1024.png`), t.name).toBe(true);
      expect(exists(`android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_${r}.xml`), t.name).toBe(true);
      expect(exists(`android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_${r}_foreground.png`), t.name).toBe(true);
      expect(manifest).toContain(`@mipmap/ic_launcher_${r}`);
    }
  });
});
