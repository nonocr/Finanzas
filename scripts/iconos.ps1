# Dibuja los iconos alternos de la app (uno por tema de src/lib/themes.ts) para iOS y Android.
# El icono principal (Negra) lo genera `npx @capacitor/assets generate` desde assets/.
# Uso (Windows PowerShell, desde la raiz del repo):
#   node scripts/temas-iconos.mjs; powershell -ExecutionPolicy Bypass -File scripts/iconos.ps1
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

# Colores calculados por las recetas de src/lib/themes.ts (node scripts/temas-iconos.mjs los escribe).
$temas = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'iconos.json') | ConvertFrom-Json
# Las tres barras de public/favicon.svg (viewBox 64x64).
$geo = @(
  @{ x = 15;   y = 22; w = 9; h = 24 },
  @{ x = 27.5; y = 9;  w = 9; h = 37 },
  @{ x = 40;   y = 17; w = 9; h = 29 }
)
$densidades = @{ ldpi = 36; mdpi = 48; hdpi = 72; xhdpi = 96; xxhdpi = 144; xxxhdpi = 192 }

function C($hex) { [Drawing.ColorTranslator]::FromHtml($hex) }

function RoundRect([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object Drawing.Drawing2D.GraphicsPath
  $d = 2 * $r
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

# shape: 'square' (lleno, para iOS), 'none' (transparente, capa frontal de Android),
#        'rounded' (cuadro redondeado, Android antiguo) o 'circle' (icono redondo, Android antiguo).
# box: lado del cuadro de 64 unidades, centrado.
function Dibujar($tema, [int]$size, [string]$shape, [float]$box, [string]$archivo) {
  $bmp = New-Object Drawing.Bitmap $size, $size, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([Drawing.Color]::Transparent)
  $fondo = New-Object Drawing.SolidBrush (C $tema.bg)
  switch ($shape) {
    'square'  { $g.FillRectangle($fondo, 0, 0, $size, $size) }
    'rounded' { $m = $size * 0.05; $p = RoundRect $m $m ($size - 2 * $m) ($size - 2 * $m) ($size * 0.1); $g.FillPath($fondo, $p); $p.Dispose() }
    'circle'  { $g.FillEllipse($fondo, 0, 0, $size, $size) }
  }
  $fondo.Dispose()
  $s = $box / 64; $o = ($size - $box) / 2
  for ($i = 0; $i -lt 3; $i++) {
    $b = $geo[$i]
    $br = New-Object Drawing.SolidBrush (C $tema.bars[$i])
    $p = RoundRect ($o + $b.x * $s) ($o + $b.y * $s) ($b.w * $s) ($b.h * $s) (2.5 * $s)
    $g.FillPath($br, $p); $p.Dispose(); $br.Dispose()
  }
  $g.Dispose()
  New-Item -ItemType Directory -Force (Split-Path -Parent $archivo) | Out-Null
  $bmp.Save($archivo, [Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$res = Join-Path $root 'android/app/src/main/res'
$xcassets = Join-Path $root 'ios/App/App/Assets.xcassets'
$colores = @()

foreach ($t in $temas) {
  # iOS: un solo PNG de 1024, cuadrado y sin transparencia (el sistema redondea las esquinas).
  $set = Join-Path $xcassets "$($t.ios).appiconset"
  Dibujar $t 1024 'square' 1024 (Join-Path $set 'icon-1024.png')
  $json = @"
{
  "images": [
    {
      "idiom": "universal",
      "size": "1024x1024",
      "filename": "icon-1024.png",
      "platform": "ios"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
"@
  [IO.File]::WriteAllText((Join-Path $set 'Contents.json'), $json.Replace("`r`n", "`n") + "`n")

  # Android: misma composicion que el icono principal que genera @capacitor/assets.
  $n = "ic_launcher_$($t.android)"
  foreach ($d in $densidades.Keys) {
    $px = $densidades[$d]
    $dir = Join-Path $res "mipmap-$d"
    Dibujar $t $px 'none' $px (Join-Path $dir "${n}_foreground.png")
    Dibujar $t $px 'rounded' ($px * 0.9) (Join-Path $dir "$n.png")
    Dibujar $t $px 'circle' ($px * 0.9) (Join-Path $dir "${n}_round.png")
  }
  $xml = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/icono_fondo_$($t.android)" />
    <foreground>
        <inset android:drawable="@mipmap/${n}_foreground" android:inset="16.7%" />
    </foreground>
</adaptive-icon>
"@
  $anydpi = Join-Path $res 'mipmap-anydpi-v26'
  [IO.File]::WriteAllText((Join-Path $anydpi "$n.xml"), $xml.Replace("`r`n", "`n") + "`n")
  [IO.File]::WriteAllText((Join-Path $anydpi "${n}_round.xml"), $xml.Replace("`r`n", "`n") + "`n")
  $colores += "    <color name=`"icono_fondo_$($t.android)`">$($t.bg)</color>"
}

$valores = "<?xml version=`"1.0`" encoding=`"utf-8`"?>`n<!-- Generado por scripts/iconos.ps1: fondo de los iconos alternos de cada tema. -->`n<resources>`n" + ($colores -join "`n") + "`n</resources>`n"
[IO.File]::WriteAllText((Join-Path $res 'values/finanzas_iconos.xml'), $valores)
'Iconos generados: ' + ($temas | ForEach-Object { $_.ios }) -join ', '
