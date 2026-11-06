Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path (Join-Path $PSScriptRoot "..\design-references\DISENO_02_APROBADO_FULL.png")).Path
$outDir = (Resolve-Path (Join-Path $PSScriptRoot "..\public\images")).Path

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Save-CleanCrop {
  param(
    [string]$Name,
    [double]$Cx,
    [double]$Cy,
    [double]$W,
    [double]$H,
    [double]$UnrotateDeg,
    [double]$Scale = 4.0
  )

  $outW = [int][Math]::Round($W * $Scale)
  $outH = [int][Math]::Round($H * $Scale)

  $bmp = New-Object System.Drawing.Bitmap($outW, $outH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bmp.SetResolution($srcImg.HorizontalResolution, $srcImg.VerticalResolution)

  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $append = [System.Drawing.Drawing2D.MatrixOrder]::Append
  $g.TranslateTransform([float](-$Cx), [float](-$Cy), $append)
  $g.RotateTransform([float]$UnrotateDeg, $append)
  $g.ScaleTransform([float]$Scale, [float]$Scale, $append)
  $g.TranslateTransform([float]($outW / 2.0), [float]($outH / 2.0), $append)

  $rect = New-Object System.Drawing.Rectangle(0, 0, $srcImg.Width, $srcImg.Height)
  $g.DrawImage($srcImg, $rect)
  $g.Dispose()

  $outFile = Join-Path $outDir $Name
  $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Saved $Name ($($outW)x$($outH))"
}

# 1. Hero Polaroid inner photo (tilted CCW in mockup -> unrotate +6.5 deg CW)
Save-CleanCrop -Name "campus-archways-1996.png" -Cx 79 -Cy 128 -W 112 -H 84 -UnrotateDeg 6.5 -Scale 4

# 2. Nuestra Historia - Back/Left Polaroid (Group of students in white polo shirts)
Save-CleanCrop -Name "historia-grupo-1996.png" -Cx 344 -Cy 368 -W 88 -H 78 -UnrotateDeg -5.5 -Scale 4

# 3. Nuestra Historia - Front/Right Polaroid (4 students sitting on grass, tilted CW -> unrotate -7.5 deg CCW)
Save-CleanCrop -Name "historia-jardin-1996.png" -Cx 396 -Cy 420 -W 76 -H 48 -UnrotateDeg -7.5 -Scale 4

# 4. Video Conmemorativo aerial campus photo (inside rounded white frame, above bottom player bar)
Save-CleanCrop -Name "campus-aerial-1996.png" -Cx 152.5 -Cy 533 -W 244 -H 106 -UnrotateDeg 0 -Scale 3
Save-CleanCrop -Name "video-historia-poster.png" -Cx 152.5 -Cy 533 -W 244 -H 106 -UnrotateDeg 0 -Scale 3

# 5. Galeria 1996 - 3 Polaroids on home page
# Left Polaroid (tilted CCW -> unrotate +8.0 deg CW)
Save-CleanCrop -Name "galeria-96-anuario.png" -Cx 226 -Cy 688 -W 66 -H 58 -UnrotateDeg 8.0 -Scale 4
# Center Polaroid (tilted CW -> unrotate -3.0 deg CCW)
Save-CleanCrop -Name "galeria-96-baloncesto.png" -Cx 315 -Cy 693 -W 78 -H 58 -UnrotateDeg -3.0 -Scale 4
# Right Polaroid (tilted CW -> unrotate -9.5 deg CCW)
Save-CleanCrop -Name "galeria-96-cancha.png" -Cx 403 -Cy 695 -W 64 -H 54 -UnrotateDeg -9.5 -Scale 4

# 6. Galeria 1996 - 6 grid photos from top-right interior page preview
Save-CleanCrop -Name "gal96-grid-1.png" -Cx 523 -Cy 106.5 -W 84 -H 37 -UnrotateDeg 0 -Scale 4
Save-CleanCrop -Name "gal96-grid-2.png" -Cx 597 -Cy 106.5 -W 41 -H 37 -UnrotateDeg 0 -Scale 4
Save-CleanCrop -Name "gal96-grid-3.png" -Cx 648.5 -Cy 106.5 -W 42 -H 37 -UnrotateDeg 0 -Scale 4
Save-CleanCrop -Name "gal96-grid-4.png" -Cx 507 -Cy 155.5 -W 53 -H 31 -UnrotateDeg 0 -Scale 4
Save-CleanCrop -Name "gal96-grid-5.png" -Cx 575 -Cy 155.5 -W 60 -H 31 -UnrotateDeg 0 -Scale 4
Save-CleanCrop -Name "gal96-grid-6.png" -Cx 643.5 -Cy 155.5 -W 52 -H 31 -UnrotateDeg 0 -Scale 4

# 7. El Gran Encuentro - Courtyard arches on right side (below torn paper edge)
Save-CleanCrop -Name "encuentro-arcadas.png" -Cx 355 -Cy 871 -W 206 -H 82 -UnrotateDeg 0 -Scale 3

# 8. El Gran Encuentro - Friends embracing at sunset (below red button)
Save-CleanCrop -Name "encuentro-atardecer-amigos.png" -Cx 195 -Cy 953 -W 294 -H 36 -UnrotateDeg 0 -Scale 3

# 9. Galeria 2026 - Photographer camera banner (below navbar)
Save-CleanCrop -Name "galeria-2026-camara.png" -Cx 573.5 -Cy 245 -W 200 -H 68 -UnrotateDeg 0 -Scale 3

# 10. Videos interior page thumbnails (cleanly cropped without top white margin)
Save-CleanCrop -Name "video-thumb-historia.png" -Cx 528 -Cy 370 -W 86 -H 36 -UnrotateDeg 0 -Scale 4
Save-CleanCrop -Name "video-thumb-reencuentro.png" -Cx 626.5 -Cy 370 -W 85 -H 36 -UnrotateDeg 0 -Scale 4

# 11. Nuestro Colegio - Courtyard facade on right side (below navbar at y=598)
Save-CleanCrop -Name "nuestro-colegio-fachada.png" -Cx 644 -Cy 636 -W 62 -H 74 -UnrotateDeg 0 -Scale 4

$srcImg.Dispose()
