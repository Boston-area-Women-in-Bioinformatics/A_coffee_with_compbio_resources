$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$pptxPath  = Join-Path $scriptDir "qc_output\PBMC3K_QC_Presentation.pptx"
$outDir    = Join-Path $scriptDir "qc_output\slide_previews"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$pptApp = New-Object -ComObject "PowerPoint.Application"
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

Start-Sleep -Seconds 2

$prs = $pptApp.Presentations.Open($pptxPath, $false, $false, $true)

Start-Sleep -Seconds 1

for ($i = 1; $i -le $prs.Slides.Count; $i++) {
    $slide   = $prs.Slides.Item($i)
    $outFile = Join-Path $outDir ("slide_{0:D2}.png" -f $i)
    $slide.Export($outFile, "PNG", 1920, 1080)
    Write-Host "Exported slide $i -> $outFile"
}

$prs.Close()
$pptApp.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null
Write-Host "Done."
