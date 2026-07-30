Add-Type -AssemblyName System.Drawing

$root = 'C:\Users\A\Desktop\website'
$generated = 'C:\Users\A\.codex\generated_images\019f2e01-e65e-76d0-bd91-f8ef9ca2bf54'
$outDir = Join-Path $root 'output\recruitment-posters'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$qr = [System.Drawing.Image]::FromFile((Join-Path $root 'assets\photos\recruit-qr-crop.png'))
$logo = [System.Drawing.Image]::FromFile((Join-Path $root 'assets\branding\wtu-logo-official.png'))
$deepGreen = [System.Drawing.Color]::FromArgb(255, 6, 57, 39)

function Add-BrandBar {
    param($Graphics, [int]$Width, [int]$Height)

    $background = New-Object System.Drawing.SolidBrush $deepGreen
    $Graphics.FillRectangle($background, 0, 0, $Width, $Height)
    $background.Dispose()

    $logoHeight = [int]($Height * 0.62)
    $logoWidth = [int]($logo.Width * $logoHeight / $logo.Height)
    $Graphics.DrawImage($logo, 34, [int](($Height - $logoHeight) / 2), $logoWidth, $logoHeight)

    $font = New-Object System.Drawing.Font(
        'Microsoft YaHei',
        [single]($Height * 0.23),
        [System.Drawing.FontStyle]::Regular,
        [System.Drawing.GraphicsUnit]::Pixel
    )
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 255, 255, 255))
    $text = '生物医学工程与健康学院足球队'
    $size = $Graphics.MeasureString($text, $font)
    $Graphics.DrawString($text, $font, $brush, $Width - $size.Width - 34, [single](($Height - $size.Height) / 2))
    $font.Dispose()
    $brush.Dispose()
}

function Add-QR {
    param($Graphics, [int]$X, [int]$Y, [int]$Size)

    $padding = [int]($Size * 0.045)
    $Graphics.FillRectangle(
        [System.Drawing.Brushes]::White,
        $X - $padding,
        $Y - $padding,
        $Size + 2 * $padding,
        $Size + 2 * $padding
    )
    $Graphics.DrawImage($qr, $X, $Y, $Size, $Size)
}

function New-PosterCanvas {
    param([int]$Width, [int]$Height)

    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $bitmap.SetResolution(300, 300)
    return $bitmap
}

# 01 keeps the intentionally tall social-poster composition. It prints cleanly
# on A-series paper with narrow side margins.
$source1 = [System.Drawing.Image]::FromFile((Join-Path $generated 'call_WB2AvNzeSpqsYhqofIFhixVs.png'))
$poster1 = New-PosterCanvas 1440 3035
$graphics1 = [System.Drawing.Graphics]::FromImage($poster1)
$graphics1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics1.DrawImage($source1, 0, 0, 1440, 3035)
Add-BrandBar $graphics1 1440 82
Add-QR $graphics1 765 2150 545
$poster1.Save((Join-Path $outDir '01-matchday-manifesto.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics1.Dispose()
$poster1.Dispose()
$source1.Dispose()

# 02 is the A-series huddle layout.
$source2 = [System.Drawing.Image]::FromFile((Join-Path $generated 'call_lqxnVXJcKvyVnsHE1e4WnMYG.png'))
$poster2 = New-PosterCanvas 2160 3040
$graphics2 = [System.Drawing.Graphics]::FromImage($poster2)
$graphics2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics2.DrawImage($source2, 0, 0, 2160, 3040)
Add-BrandBar $graphics2 2160 82
Add-QR $graphics2 1345 2352 528
$poster2.Save((Join-Path $outDir '02-team-huddle.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics2.Dispose()
$poster2.Dispose()
$source2.Dispose()

# 03 replaces the generated incorrect school-identification area with an
# official WTU masthead.
$source3 = [System.Drawing.Image]::FromFile((Join-Path $generated 'call_dOVGrJYBwQW7gVyIDA6plGmX.png'))
$poster3 = New-PosterCanvas 2160 3040
$graphics3 = [System.Drawing.Graphics]::FromImage($poster3)
$graphics3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics3.DrawImage($source3, 0, 0, 2160, 3040)

$masthead = New-Object System.Drawing.SolidBrush $deepGreen
$graphics3.FillRectangle($masthead, 1540, 0, 620, 1280)
$masthead.Dispose()
$graphics3.DrawImage($logo, 1610, 90, 470, 97)

$fontSmall = New-Object System.Drawing.Font('Microsoft YaHei', 30, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontBig = New-Object System.Drawing.Font('Microsoft YaHei', 62, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontMid = New-Object System.Drawing.Font('Microsoft YaHei', 36, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$graphics3.DrawString('生物医学工程与健康学院', $fontSmall, [System.Drawing.Brushes]::White, 1610, 250)
$graphics3.DrawString('足球队', $fontBig, [System.Drawing.Brushes]::White, 1610, 340)
$graphics3.DrawString('2025-2026  新生招募', $fontMid, [System.Drawing.Brushes]::White, 1610, 455)
$line = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 255, 255, 255)), 3
$graphics3.DrawLine($line, 1610, 540, 2070, 540)
$line.Dispose()
$graphics3.DrawString('训练 / 比赛 / 队史', $fontMid, [System.Drawing.Brushes]::White, 1610, 590)
$fontSmall.Dispose()
$fontBig.Dispose()
$fontMid.Dispose()

$qrPanel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 250, 249, 244))
$graphics3.FillRectangle($qrPanel, 1515, 2315, 600, 700)
$qrPanel.Dispose()
$qrBorder = New-Object System.Drawing.Pen $deepGreen, 5
$graphics3.DrawRectangle($qrBorder, 1515, 2315, 600, 700)
$qrBorder.Dispose()
Add-QR $graphics3 1600 2365 430
$qrTitle = New-Object System.Drawing.Font('Microsoft YaHei', 35, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$qrCaption = New-Object System.Drawing.Font('Microsoft YaHei', 28, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Object System.Drawing.SolidBrush $deepGreen
$graphics3.DrawString('QQ群 913800697', $qrTitle, $textBrush, 1640, 2825)
$graphics3.DrawString('扫码加入球队群', $qrCaption, $textBrush, 1705, 2885)
$qrTitle.Dispose()
$qrCaption.Dispose()
$textBrush.Dispose()
$poster3.Save((Join-Path $outDir '03-campus-football-archive.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics3.Dispose()
$poster3.Dispose()
$source3.Dispose()

$qr.Dispose()
$logo.Dispose()

Get-ChildItem $outDir -Filter '*.png' | Select-Object Name, Length
